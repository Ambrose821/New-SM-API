""" This is By far the best one so far"""

import tempfile
from jinja2 import Template
from pathlib import Path
from playwright.sync_api import sync_playwright
import re, subprocess

import boto3
import time

import os
from dotenv import load_dotenv


load_dotenv() # This loads the variables from the .env file

TEMP_DIR = "dev/tempFiles" 

def highlight_words(caption:str, words:list[str]) -> str:
    # wrap matched words in <b> for yellow highlight
    def repl(m): return f"<b>{m.group(0)}</b>"
    for w in words:
        caption = re.sub(rf"(?i)\b{re.escape(w)}\b", repl, caption)
    # simple emoji-safe (browser handles it), keep as HTML text
    return caption

def make_image(bg_url, fg_url, caption, highlight, category, brand,
               size=(1080,1920), cta_text="READ CAPTION FOR DETAILS",
               font_size=None, out_png="post.png"):
    width, height = size
    cap_html = highlight_words(caption, highlight)

    template = Template(Path("post_template.html").read_text(encoding="utf-8"))
    # quick heuristic font sizing
    L = len(caption.strip())
    fs = font_size or (110 if L<=40 else 96 if L<=80 else 84 if L<=120 else 72 if L<=160 else 62)

    html = template.render(
        width=width, height=height,
        bg_url=bg_url, fg_url=fg_url,
        caption_html=cap_html,
        category=category.upper(), brand=brand,
        cta_text=cta_text, font_size=fs
    )
   # Path("out.html").write_text(html, encoding="utf-8")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": width, "height": height, "deviceScaleFactor": 1})
        page.set_content(html, wait_until="load")
        page.wait_for_timeout(250)  # small settle
        png_bytes = page.screenshot(full_page=False)
        
        browser.close()
    return png_bytes




def still_to_video(
    image_bytes: bytes,
    audio_path: str | None = None,
    out_mp4: str = "posted.mp4", 
    duration: int = 20,
    fps: int = 30,
    crf: int = 20,
    preset: str = "medium",
):
    """
    FIXED VERSION: Generate video from image bytes, save to local file.
    This now works correctly with the proper duration.
    """
    # KEY FIX: Use temp file instead of pipe input for -loop 1 to work
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False, dir=TEMP_DIR) as tmp_file:
        tmp_file.write(image_bytes)
        tmp_file.flush()
        tmp_path = tmp_file.name

    try:
        # Use the WORKING pattern from your file-based version
        cmd = [
            "ffmpeg", "-nostdin", "-loglevel", "error", "-y",
            "-loop", "1", "-t", str(duration),  # KEY: -t BEFORE -i for proper duration
            "-i", tmp_path,  # Use temp file instead of pipe
        ]

        if audio_path:
            cmd += ["-stream_loop", "-1", "-i", audio_path, "-shortest"]

        cmd += [
            "-c:v", "libx264", "-crf", str(crf), "-preset", preset,
            "-pix_fmt", "yuv420p", "-r", str(fps),
        ]

        if audio_path:
            cmd += ["-c:a", "aac", "-b:a", "128k"]

        cmd += [out_mp4]

        subprocess.run(cmd, check=True)
        
    finally:
        # Clean up temp file
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

import os, tempfile, subprocess, boto3

def still_to_video_s3(
    image_png_bytes: bytes,
    bucket: str, key: str,
    audio_path: str | None = None,
    duration: int = 20, fps: int = 30, crf: int = 20, preset: str = "medium",
):
    assert isinstance(image_png_bytes, (bytes, bytearray)), "Pass PNG bytes, not a path string."

    # 0) Write the PNG to a temp file (no stdin piping)
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_img:
        tmp_img.write(image_png_bytes)
        tmp_img.flush()
        png_path = tmp_img.name

    # 1) Build ffmpeg command that *reads the file* instead of pipe:0
    cmd = [
        "ffmpeg", "-nostdin", "-loglevel", "error", "-y",
        "-loop", "1", "-t", str(duration),   # -loop applies to the next input
        "-i", png_path,                      # file input (temp png)
    ]
    if audio_path:
        # Repeat audio to match duration; -shortest to stop at video end
        cmd += ["-stream_loop", "-1", "-i", audio_path, "-shortest"]

    cmd += [
        "-r", str(fps),
        "-c:v", "libx264", "-crf", str(crf), "-preset", preset,
        "-pix_fmt", "yuv420p",
    ]
    if audio_path:
        cmd += ["-c:a", "aac", "-b:a", "128k"]

    # Streamable MP4 to stdout (S3 upload_fileobj will consume this)
    cmd += ["-movflags", "+frag_keyframe+empty_moov", "-f", "mp4", "pipe:1"]

    proc = None
    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            bufsize=0,
        )

        s3 = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
            region_name=os.getenv("AWS_DEFAULT_REGION") or os.getenv("AWS_REGION"),
        )

        # 2) Stream ffmpeg stdout directly to S3
        s3.upload_fileobj(
            proc.stdout, Bucket=bucket, Key=key,
            ExtraArgs={"ContentType": "video/mp4"}
        )

        # 3) Finalize: drain stderr and confirm exit code
        err = proc.stderr.read() if proc.stderr else b""
        rc = proc.wait(timeout=120)
        if rc != 0:
            msg = err.decode("utf-8", errors="ignore") or "ffmpeg failed"
            raise RuntimeError(f"ffmpeg exited {rc}: {msg}")

    finally:
        # close pipes
        try:
            if proc and proc.stdout and not proc.stdout.closed:
                proc.stdout.close()
        except Exception:
            pass
        try:
            if proc and proc.stderr and not proc.stderr.closed:
                proc.stderr.close()
        except Exception:
            pass
        # remove temp image
        try:
            os.remove(png_path)
        except Exception:
            pass

    # 4) Return a public-style URL for the object path (works if the object is public or behind a CDN)
    region = os.getenv("AWS_DEFAULT_REGION") or os.getenv("AWS_REGION") or ""
    if region == "" or region == "us-east-1":
        # Legacy/global endpoint for us-east-1
        return f"https://{bucket}.s3.amazonaws.com/{key}"
    else:
        return f"https://{bucket}.s3.{region}.amazonaws.com/{key}"




if __name__ == "__main__":
    # >>> Edit your variables here (just like your no-args style) <<<
    bg_url = "https://pixabay.com/get/g37d01219508d9cc9acc0cdd152863f4e1f4e7388beff6203923bccb1d4aedcf1548ec9a147772865205b1165703e36d501480dad500bb1a48494a4f8a64a5778_1280.jpg"
    fg_url = "https://live.staticflickr.com/5810/21134663472_c11bc28666_b.jpg"
    caption = "Trump's Alive? Golf Outing Shuts Down Death Rumors!"
    highlight = ["TRUMP", "DEATH"]
    category = "Politics"
    brand    = "Urba"
    size     = (1080, 1920)  # or (1080,1080)
    cta_text = "READ CAPTION FOR DETAILS"
    audio    = "audio.mp3"  # or None

    out_png_bytes = make_image(bg_url, fg_url, caption, highlight, category, brand, size, cta_text, out_png="post.png")
    still_to_video(out_png_bytes, audio_path=audio, out_mp4="poooosted.mp4", duration=20)
    out_url = still_to_video_s3(out_png_bytes,"mediaapibucket",f"posts/{time.time()*1000}/post.mp4",audio_path=audio,duration=10,fps=30,crf=20,preset="medium")
    print(out_url)
