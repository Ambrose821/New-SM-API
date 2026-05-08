# Media Editing Service

This service is a FastAPI app that turns a rendered HTML post template into a PNG screenshot, encodes that PNG into an MP4 video with ffmpeg, uploads both outputs to S3, and returns their public URLs.

The core file is `api.py`. The visual template is `post_template.html`. The Docker image installs Python dependencies, Chromium through Playwright, Chromium system libraries, and ffmpeg.

## What The Service Does

The main endpoint is:

```http
POST /render
```

It accepts a JSON body shaped like `RenderReq`:

```json
{
  "bg_url": "https://example.com/background.jpg",
  "fg_url": null,
  "caption": "Some caption text",
  "highlight": ["caption"],
  "category": "tech",
  "brand": "BrandA",
  "width": 1080,
  "height": 1920,
  "duration": 20,
  "fps": 30,
  "audio_path": null,
  "s3_bucket": "mediaapibucket",
  "s3_key": "posts/123/post.mp4",
  "encoder": null,
  "preset": "medium"
}
```

It returns:

```json
{
  "thumbnail": "https://bucket.s3.region.amazonaws.com/posts/123/post.mp4thumbnail",
  "video": "https://bucket.s3.region.amazonaws.com/posts/123/post.mp4"
}
```

## Runtime Dependencies

The service needs:

- Python 3.11
- FastAPI and Uvicorn
- Playwright
- Chromium browser binaries
- Linux system libraries required by Chromium
- ffmpeg
- AWS credentials with permission to upload to the target S3 bucket

The Dockerfile handles the container dependencies:

```dockerfile
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN playwright install --with-deps chromium
```

`ffmpeg` is required because `encode_and_upload()` shells out to ffmpeg. `playwright install --with-deps chromium` installs Chromium and the OS packages Chromium needs to run in a Linux container.

## Startup Flow

When Uvicorn starts the app, FastAPI runs `_startup()`:

```python
@app.on_event("startup")
async def _startup():
    global browser_pool
    if not FFMPEG_PATH:
        _print("[Preflight] ffmpeg not found on PATH. Install ffmpeg and retry.")
    browser_pool = BrowserPool(BROWSER_POOL)
    await browser_pool.start()
    _print("[Startup] completed")
```

The important behavior:

1. It checks whether `ffmpeg` exists on `PATH`.
2. It creates a `BrowserPool`.
3. It launches `BROWSER_POOL` Chromium browser instances.
4. Each Chromium browser gets one persistent browser context with a fixed viewport of `1080x1920`.

This warming step avoids launching Chromium from scratch for every request.

## Request Lifecycle

Each `/render` request goes through this path:

```text
POST /render
  -> acquire async semaphore
  -> render HTML with Jinja
  -> lease a Playwright page from BrowserPool
  -> load HTML into Chromium
  -> wait for page/network
  -> screenshot page into PNG bytes
  -> run ffmpeg in a background thread
  -> stream ffmpeg stdout directly to S3 as MP4
  -> upload PNG bytes to S3 as thumbnail
  -> return S3 URLs
```

In code:

```python
@app.post("/render")
async def render(req: RenderReq):
    async with sem:
        png = await render_png_bytes(req)
        urls = await asyncio.to_thread(encode_and_upload, png, req)
        return urls
```

The request is asynchronous while using Playwright, then switches to a background thread for ffmpeg and blocking S3 upload work.

## HTML Rendering

`render_png_bytes()` prepares the template:

```python
html = template.render(
    width=req.width,
    height=req.height,
    bg_url=req.bg_url,
    fg_url=req.fg_url,
    caption_html=cap_html,
    category=req.category.upper(),
    brand=req.brand,
    cta_text="READ CAPTION FOR DETAILS",
    font_size=fs,
)
```

The caption is processed first:

```python
cap_html = highlight_words(req.caption, req.highlight or [])
```

`highlight_words()` wraps matching words in `<b>...</b>`, and the CSS makes bold text yellow.

The font size is chosen based on caption length:

```python
fs = 110 if L <= 40 else 96 if L <= 80 else 84 if L <= 120 else 72 if L <= 160 else 62
```

Then Playwright loads the HTML:

```python
await page.set_content(html, wait_until="domcontentloaded")
await page.wait_for_load_state("networkidle")
return await page.screenshot(full_page=False)
```

This means the service depends on Chromium being stable and on external image/font URLs loading successfully.

## Browser Pool

The browser pool is a queue of pre-launched Chromium browser/context pairs:

```python
self._contexts = asyncio.Queue()
```

At startup:

```python
for _ in range(self.size):
    browser = await self._pw.chromium.launch(...)
    ctx = await browser.new_context(...)
    await self._contexts.put((browser, ctx))
```

When a render needs a page:

```python
async with (await browser_pool.lease_page()) as page:
    ...
```

The lease does this:

1. Waits until a browser/context pair is available.
2. Creates a new page in that context.
3. Installs a route filter to block analytics URLs.
4. Gives the page to the render.
5. Closes the page.
6. Returns the browser/context pair to the queue.

Implication: `BROWSER_POOL` controls how many Playwright pages can actively render at once per Uvicorn worker process. If the pool size is `1`, only one request at a time can be inside the browser screenshot section for that worker.

## ffmpeg Encoding

After the screenshot is captured, `encode_and_upload()` writes the PNG to a temporary file:

```python
with tempfile.NamedTemporaryFile(suffix=".png", delete=False, dir=TMP_DIR) as tmp:
    tmp.write(image_bytes)
    png_path = tmp.name
```

`TMP_DIR` prefers `/dev/shm`:

```python
TMP_DIR = "/dev/shm" if os.path.exists("/dev/shm") else None
```

That can be faster because `/dev/shm` is memory-backed, but it also consumes shared memory. In small containers, `/dev/shm` can become a stability issue for Chromium or temp files.

The ffmpeg command creates a video from one static image:

```text
ffmpeg
  -nostdin
  -loglevel error
  -y
  -loop 1
  -t <duration>
  -i <png_path>
  -r <fps>
  -c:v <encoder>
  -preset <preset>
  -tune stillimage
  -pix_fmt yuv420p
  -movflags +frag_keyframe+empty_moov
  -f mp4
  pipe:1
```

If `audio_path` is present, ffmpeg also loops the audio and stops at the video duration.

The service does not write the final video to disk. Instead, ffmpeg writes MP4 bytes to stdout, and boto3 streams stdout directly into S3:

```python
s3.upload_fileobj(proc.stdout, Bucket=req.s3_bucket, Key=req.s3_key, ...)
```

This is memory efficient for the MP4 output because the full video is not held in RAM.

## S3 Uploads

The service creates one boto3 S3 client at import time:

```python
s3 = boto3.client(...)
```

The video upload streams ffmpeg stdout directly to S3. The thumbnail upload wraps PNG bytes in `BytesIO`:

```python
file_obj = BytesIO(bytes)
s3.upload_fileobj(file_obj, Bucket=bucket, Key=s3_key, ...)
```

Transfer settings are:

```python
S3_CFG = TransferConfig(
    multipart_threshold=8*1024*1024,
    multipart_chunksize=8*1024*1024,
    max_concurrency=8,
    use_threads=True
)
```

Important implication: boto3 can create its own upload threads. This is separate from Uvicorn workers, Playwright browsers, and Python thread offloading.

## Async, Threads, Processes, And Concurrency

There are several concurrency layers. They multiply.

### 1. Uvicorn Worker Processes

The Dockerfile currently starts:

```dockerfile
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--loop", "uvloop"]
```

`--workers 2` means two separate OS processes.

Each worker process has its own:

- FastAPI app instance
- event loop
- semaphore
- browser pool
- Chromium browsers
- thread pool/executor objects
- S3 client

So if `BROWSER_POOL=2` and `--workers=2`, the container starts up to four Chromium browser instances total.

Formula:

```text
total Chromium browsers = uvicorn workers * BROWSER_POOL
```

### 2. FastAPI Async Event Loop

The endpoint is `async`, so while one request waits on network/browser operations, the event loop can keep servicing other requests.

Async does not make CPU-heavy work cheaper. It only avoids blocking the event loop while waiting.

### 3. Semaphore Backpressure

The global semaphore is:

```python
sem = asyncio.Semaphore(max(1, RENDER_WORKERS))
```

And the endpoint uses:

```python
async with sem:
    ...
```

This limits how many `/render` requests can run at once per Uvicorn worker process.

If `RENDER_WORKERS=4` and `--workers=2`, up to eight requests can be inside the render path at once:

```text
max active render requests = uvicorn workers * RENDER_WORKERS
```

This is only per process. It does not coordinate globally across all Uvicorn workers.

### 4. Browser Pool Queue

The browser pool can be smaller than the semaphore. For example:

```text
RENDER_WORKERS=4
BROWSER_POOL=2
```

In one process, up to four requests may enter `/render`, but only two can use Chromium at the same time. The others will wait for a browser/context lease.

This can be useful, but remember that once requests finish screenshotting, they move to ffmpeg. So a request can release Chromium and still consume CPU/memory in ffmpeg.

### 5. ffmpeg Subprocesses

Each active request eventually starts one ffmpeg process:

```python
proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=0)
```

ffmpeg is an external OS process, not a Python thread. It can use substantial CPU and memory. Multiple ffmpeg processes at once can overwhelm a container quickly.

### 6. Python Thread Offload

The code uses:

```python
urls = await asyncio.to_thread(encode_and_upload, png, req)
```

This moves the blocking ffmpeg/S3 function off the async event loop so other async work can continue.

However, `asyncio.to_thread()` uses Python's default executor, not the `executor = ThreadPoolExecutor(max_workers=RENDER_WORKERS)` object created near the top. That custom `executor` is currently only shut down on app shutdown; it is not used to run `encode_and_upload()`.

If you want the thread count to be explicitly controlled by `RENDER_WORKERS`, use:

```python
loop = asyncio.get_running_loop()
urls = await loop.run_in_executor(executor, encode_and_upload, png, req)
```

The semaphore still limits render concurrency, so the current code is not unbounded at the request level. But the named executor is misleading because it is not the thing doing the work.

### 7. boto3 Upload Threads

The S3 transfer config has:

```python
max_concurrency=8
use_threads=True
```

That means each multipart upload may use multiple threads internally. If several renders are uploading at once, S3 upload threads can add more concurrency than expected.

## Concurrency Example

With the current Dockerfile defaults:

```text
uvicorn workers = 2
RENDER_WORKERS = 4
BROWSER_POOL = 2
S3 max_concurrency = 8
```

Possible maximums:

```text
active render requests: 2 * 4 = 8
Chromium browser instances: 2 * 2 = 4
simultaneous browser page renders: up to 4
simultaneous ffmpeg processes: up to 8
S3 upload worker threads: potentially many, depending on concurrent uploads
```

This can be too high for an 8 GB container, especially because Chromium and ffmpeg are both memory-heavy.

Safer starting point:

```text
uvicorn workers = 1
RENDER_WORKERS = 1
BROWSER_POOL = 1
```

Then increase slowly after observing memory and CPU.

## Recommended Production Tuning

For a small or medium container:

```env
RENDER_WORKERS=1
BROWSER_POOL=1
```

Run one Uvicorn worker:

```bash
uvicorn api:app --host 0.0.0.0 --port 8000 --workers 1 --loop uvloop
```

For a larger container after testing:

```env
RENDER_WORKERS=2
BROWSER_POOL=1
```

Only raise `BROWSER_POOL` if Chromium screenshotting is the bottleneck and memory is stable.

Only raise Uvicorn workers if you understand that every worker duplicates the browser pool and semaphore. Workers are useful for CPU isolation and crash recovery, but expensive here because each process launches browsers.

## Why Page Crashes And ffmpeg Exit -9 Happen

Common failure:

```text
Page.set_content: Page crashed
```

This usually means Chromium crashed. Common causes:

- Container memory pressure
- Too many Chromium instances
- Too many concurrent renders
- Insufficient `/dev/shm`
- Large external images or slow/unstable external resources

Common failure:

```text
ffmpeg exited -9
```

Exit code `-9` means the process was killed with `SIGKILL`. In containers, this is commonly an out-of-memory kill.

If both happen close together, the service is probably under resource pressure. Reduce concurrency before changing rendering logic.

## Docker Runtime Settings

Memory limits are not set in the Dockerfile. They are set by the platform running the container.

For local Docker:

```bash
docker run --memory=4g --shm-size=1g ...
```

For Docker Compose:

```yaml
services:
  media-editing-service:
    mem_limit: 4g
    shm_size: "1gb"
    environment:
      RENDER_WORKERS: "1"
      BROWSER_POOL: "1"
```

On platforms such as Railway, the container can use up to the service memory limit for a replica, but concurrency still needs to be controlled.

## Rebuilding This From Scratch

To recreate this service from scratch:

1. Create a FastAPI app.
2. Define a Pydantic request model with image URLs, caption details, render dimensions, video duration, S3 bucket, and S3 key.
3. Create a Jinja HTML template for the post layout.
4. On startup, launch Playwright and pre-create a small browser pool.
5. For each request, acquire a semaphore to limit total active renders.
6. Render the Jinja template into HTML.
7. Lease a browser page from the pool.
8. Set the HTML content and wait for the page to load.
9. Screenshot the page into PNG bytes.
10. Offload blocking video encoding and S3 upload to a background thread.
11. Use ffmpeg to loop the PNG into an MP4.
12. Stream ffmpeg stdout into S3.
13. Upload the PNG thumbnail to S3.
14. Return both URLs.
15. Tune concurrency by controlling Uvicorn workers, semaphore size, browser pool size, and S3 upload concurrency.

## Known Implementation Notes

There are a few details worth knowing if you continue evolving this service:

- `executor = ThreadPoolExecutor(max_workers=RENDER_WORKERS)` is currently not used by `asyncio.to_thread()`.
- `S3_CFG.max_concurrency=8` can create extra upload threads under load.
- `TMP_DIR=/dev/shm` is fast but can compete with Chromium for shared memory.
- The Dockerfile uses `--workers 2`, which doubles browser pools and active request capacity.
- `post_template.html` checks `{% if fg_rul %}`. That appears to be a typo; the template variable passed from Python is `fg_url`. As written, the foreground avatar block will not render.
- The `video_url` construction has an `if region in ("", "us-east-1")` branch, but then immediately assigns the regional URL afterward. If `region` is empty, that can produce an odd URL. The thumbnail helper handles this more cleanly.

