# app_fastapi.py
import os, re, tempfile, subprocess, asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from jinja2 import Environment, FileSystemLoader, select_autoescape
from playwright.async_api import async_playwright
import boto3
from boto3.s3.transfer import TransferConfig
from dotenv import load_dotenv


#--- Run with uvicorn api:app --host 0.0.0.0 --port 8000 --workers 2 --loop uvloop ##
# ---- Tunables ----
RENDER_WORKERS = int(os.getenv("RENDER_WORKERS", "4"))
BROWSER_POOL   = int(os.getenv("BROWSER_POOL", "2"))
FFMPEG_ENCODER = os.getenv("FFMPEG_ENCODER", "libx264")
TEMPLATES_DIR  = os.getenv("TEMPLATES_DIR", ".")
TMP_DIR        = "/dev/shm" if os.path.exists("/dev/shm") else None

# ---- Globals ----
app = FastAPI()
executor = ThreadPoolExecutor(max_workers=RENDER_WORKERS)
sem = asyncio.Semaphore(max(1, RENDER_WORKERS))  # simple global backpressure
load_dotenv() 
jinja = Environment(loader=FileSystemLoader(TEMPLATES_DIR),
                    autoescape=select_autoescape(["html"]))
template = jinja.get_template("post_template.html")

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_DEFAULT_REGION") or os.getenv("AWS_REGION"),
)
S3_CFG = TransferConfig(
    multipart_threshold=8*1024*1024,
    multipart_chunksize=8*1024*1024,
    max_concurrency=8,
    use_threads=True
)

# ---- Browser pool ----
class BrowserPool:
    def __init__(self, size:int):
        self.size = size
        self._pw = None
        self._contexts = asyncio.Queue()

    async def start(self):
        self._pw = await async_playwright().start()
        for _ in range(self.size):
            browser = await self._pw.chromium.launch(
                headless=True,
                args=["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"]
            )
            ctx = await browser.new_context(viewport={"width":1080,"height":1920,"deviceScaleFactor":1})
            await self._contexts.put((browser, ctx))

    async def stop(self):
        while not self._contexts.empty():
            browser, ctx = await self._contexts.get()
            await ctx.close(); await browser.close()
        if self._pw: await self._pw.stop()

    async def lease_page(self):
        pool = self
        class _Lease:
            async def __aenter__(self):
                self.browser, self.ctx = await pool._contexts.get()
                self.page = await self.ctx.new_page()
                await self.page.route("**/*", self._filter)
                return self.page
            async def _filter(self, route, req):
                u = req.url.lower()
                if any(x in u for x in ["google-analytics","gtm.js" ]):
                    return await route.abort()
                return await route.continue_()
            async def __aexit__(self, exc_type, exc, tb):
                await self.page.close()
                await pool._contexts.put((self.browser, self.ctx))
        return _Lease()

browser_pool: BrowserPool | None = None

# ---- Lifespan: warm Chromium once per worker ----
@app.on_event("startup")
async def _startup():
    global browser_pool
    browser_pool = BrowserPool(BROWSER_POOL)
    await browser_pool.start()

@app.on_event("shutdown")
async def _shutdown():
    if browser_pool:
        await browser_pool.stop()
    executor.shutdown(wait=False, cancel_futures=True)

# ---- Models ----
class RenderReq(BaseModel):
    bg_url: str
    fg_url: str
    caption: str
    highlight: list[str] = []
    category: str
    brand: str
    width: int = 1080
    height: int = 1920
    duration: int = 20
    fps: int = 30
    audio_path: str | None = None
    s3_bucket: str
    s3_key: str
    encoder: str | None = None
    preset: str = "medium"
    font_size: int | None = None

def highlight_words(caption:str, words:list[str]) -> str:
    def repl(m): return f"<b>{m.group(0)}</b>"
    for w in words or []:
        caption = re.sub(rf"(?i)\b{re.escape(w)}\b", repl, caption)
    return caption

async def render_png_bytes(req: RenderReq) -> bytes:
    cap_html = highlight_words(req.caption, req.highlight or [])
    html = template.render(
        width=req.width, height=req.height,
        bg_url=req.bg_url, fg_url=req.fg_url,
        caption_html=cap_html,
        category=req.category.upper(), brand=req.brand,
        cta_text="READ CAPTION FOR DETAILS",
        font_size=req.font_size or 96,
    )
    async with (await browser_pool.lease_page()) as page:  # type: ignore
        await page.set_content(html, wait_until="domcontentloaded")
        await page.wait_for_load_state("networkidle")
        return await page.screenshot(full_page=False)

def encode_and_upload(image_bytes: bytes, req: RenderReq) -> str:
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False, dir=TMP_DIR) as tmp:
        tmp.write(image_bytes); tmp.flush(); png_path = tmp.name
    cmd = [
        "ffmpeg","-nostdin","-loglevel","error","-y",
        "-loop","1","-t", str(req.duration), "-i", png_path
    ]
    if req.audio_path:
        cmd += ["-stream_loop","-1","-i", req.audio_path, "-shortest"]
    cmd += [
        "-r", str(req.fps),
        "-c:v", (req.encoder or FFMPEG_ENCODER), "-preset", req.preset, "-tune","stillimage",
        "-pix_fmt","yuv420p"
    ]
    if req.audio_path:
        cmd += ["-c:a","aac","-b:a","128k"]
    cmd += ["-movflags","+frag_keyframe+empty_moov","-f","mp4","pipe:1"]

    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=0)
    try:
        s3.upload_fileobj(proc.stdout, Bucket=req.s3_bucket, Key=req.s3_key,
                          ExtraArgs={"ContentType":"video/mp4"}, Config=S3_CFG)
        err = proc.stderr.read() if proc.stderr else b""
        rc = proc.wait(timeout=max(30, req.duration + 15))
        if rc != 0:
            raise RuntimeError(f"ffmpeg exited {rc}: {err.decode(errors='ignore')}")
    finally:
        try:
            if proc.stdout and not proc.stdout.closed: proc.stdout.close()
            if proc.stderr and not proc.stderr.closed: proc.stderr.close()
        except: pass
        try: os.remove(png_path)
        except: pass

    region = os.getenv("AWS_DEFAULT_REGION") or os.getenv("AWS_REGION") or ""
    if region in ("","us-east-1"):
        return f"https://{req.s3_bucket}.s3.amazonaws.com/{req.s3_key}"
    return f"https://{req.s3_bucket}.s3.{region}.amazonaws.com/{req.s3_key}"

@app.get("/healthz")
async def healthz(): return {"ok": True}

@app.post("/render")
async def render(req: RenderReq):
    # global backpressure: prevent too many concurrent jobs
    async with sem:
        try:
            png = await render_png_bytes(req)
            # Offload blocking encode/upload onto a thread without blocking the loop
            url = await asyncio.to_thread(encode_and_upload, png, req)
            return {"url": url}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
