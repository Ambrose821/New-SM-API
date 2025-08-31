""" This is By far the best one so far"""

from jinja2 import Template
from pathlib import Path
from playwright.sync_api import sync_playwright
import re, subprocess

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

def still_to_video(image_bytes, audio_path=None, out_mp4="post.mp4", duration=20):
    # Use ffmpeg directly for robustness
    # - loop the image, trim to duration
    # - if audio provided, loop/trim to duration and mux
    cmd = [
        "ffmpeg", "-nostdin", "-loglevel", "error", "-y",
        "-f", "png_pipe", "-loop", "1", "-t", str(duration),
        "-i", "pipe:0",
    ]
    if audio_path:
        cmd += ["-stream_loop", "-1", "-i", audio_path, "-shortest"]
        cmd += ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "128k", out_mp4]
    else:
        cmd += ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", out_mp4]
    subprocess.run(cmd, check=True,input = image_bytes)

if __name__ == "__main__":
    # >>> Edit your variables here (just like your no-args style) <<<
    bg_url = "https://pixabay.com/get/g5379ab3e42ad4d8311dc8bf1406ebda8a87bac04a677de5a5507a1dfab920647a4b8857f723e8cd2d12224d8d7e20e1c608db5c8fb2645ce1fb842f828a08b83_1280.jpg"
    fg_url = "https://live.staticflickr.com/5810/21134663472_c11bc28666_b.jpg"
    caption = "Trump's Alive? Golf Outing Shuts Down Death Rumors!s"
    highlight = ["TRUMP", "DEATH"]
    category = "Politics"
    brand    = "Urba"
    size     = (1080, 1920)  # or (1080,1080)
    cta_text = "READ CAPTION FOR DETAILS"
    audio    = "audio.mp3"  # or None

    out_png = make_image(bg_url, fg_url, caption, highlight, category, brand, size, cta_text, out_png="post.png")
    # Optional video:
    still_to_video(out_png, audio_path=audio, out_mp4="post.mp4", duration=20)
