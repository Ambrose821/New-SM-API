#!/usr/bin/env python3
"""
Social Post / Reel Cover Creator
--------------------------------
Generates a finished social post image (1080x1080 or 1080x1920) or a 20s vertical video
by compositing: background image, optional circular logo/foreground image, caption text,
category tag, and CTA bar. Designed to feel close to the reference style you shared.

Key improvements vs. your script:
- Faster gradient (NumPy) + optional blur/darken of background for readability.
- Consistent safe margins, text wrapping, auto font downscaling to avoid overflow.
- Proper vertical centering for the category tag text.
- Circular logo with border ring & subtle drop shadow.
- Headline highlighting with per-word color + stroke for legibility.
- Rounded CTA button.
- Robust font loading (Anton/Impact-style fallback -> DejaVu -> default).
- Correct MoviePy imports & audio looping with afx.audio_loop.
- CLI args; clean structure; returns hosted-like file paths.

Usage example:
python3 social_post_maker.py \
  --bg_url https://picsum.photos/1600/900 \
  --fg_url https://upload.wikimedia.org/wikipedia/commons/6/64/Pierre_Poilievre_in_2023_%28edited%29.jpg \
  --caption "OPENAI’S CHATGPT TRIED TO GO ROGUE, THEN LIED ABOUT IT" \
  --highlight "CHATGPT,GO ROGUE" \
  --category TECH \
  --brand Urba \
  --size 1080x1920 \
  --video --audio_url https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3

Note: This script fetches remote URLs; ensure you have internet access where it runs.
"""

import argparse
import io
import os
import sys
import math
import requests
import requests
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
from io import BytesIO
import numpy as np
from moviepy import ImageClip, AudioFileClip, CompositeVideoClip
import sys
import os
import tempfile


# -----------------------------
# Utilities
# -----------------------------

def download_asset(url: str, timeout=20) -> BytesIO:
    """Download any file to memory; raise on failure."""
    r = requests.get(url, stream=True, timeout=timeout)
    r.raise_for_status()
    return BytesIO(r.content)


def load_image_from_url(url: str, mode="RGBA") -> Image.Image:
    bio = download_asset(url)
    img = Image.open(bio)
    return img.convert(mode)


def ensure_ratio_crop(im: Image.Image, target_w: int, target_h: int, gravity="center") -> Image.Image:
    """Center-crop to match target aspect ratio, then resize to target size."""
    target_ratio = target_w / target_h
    w, h = im.size
    src_ratio = w / h
    if src_ratio > target_ratio:
        # crop width
        new_w = int(h * target_ratio)
        if gravity == "center":
            left = (w - new_w) // 2
        else:
            left = 0
        im = im.crop((left, 0, left + new_w, h))
    else:
        # crop height
        new_h = int(w / target_ratio)
        if gravity == "center":
            top = (h - new_h) // 2
        else:
            top = 0
        im = im.crop((0, top, w, top + new_h))
    return im.resize((target_w, target_h), Image.Resampling.LANCZOS)


def np_vertical_gradient(width, height, color=(0,0,0), start_alpha=0, end_alpha=220):
    """Create a vertical alpha gradient image (RGBA) quickly using NumPy."""
    gradient = np.linspace(start_alpha, end_alpha, height, dtype=np.uint8)
    alpha = np.repeat(gradient[:, None], width, axis=1)
    rgb = np.zeros((height, width, 3), dtype=np.uint8)
    rgb[..., 0] = color[0]
    rgb[..., 1] = color[1]
    rgb[..., 2] = color[2]
    rgba = np.dstack((rgb, alpha))
    return Image.fromarray(rgba, mode="RGBA")


def rounded_rectangle(draw: ImageDraw.ImageDraw, xy, radius, fill, outline=None, width=1):
    """Draw a rounded rectangle even on older Pillow versions."""
    x1, y1, x2, y2 = xy
    w = x2 - x1
    h = y2 - y1
    r = min(radius, w//2, h//2)
    draw.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width)


def get_font(size=48, weight="bold"):
    """
    Try a sequence of good, bold display fonts (Anton/Impact-like).
    Falls back to DejaVu then default.
    """
    candidates = []
    # Custom local path override via ENV
    if os.getenv("SOCIAL_FONT_PATH"):
        candidates.append(os.getenv("SOCIAL_FONT_PATH"))
    # Common impactful fonts
    candidates += [
        "fonts/Anton-Regular.ttf",
        "/usr/share/fonts/truetype/impact.ttf",
        "/System/Library/Fonts/Supplemental/Impact.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for p in candidates:
        try:
            if os.path.exists(p):
                return ImageFont.truetype(p, size=size)
        except Exception:
            continue
    return ImageFont.load_default()


def measure_text(font: ImageFont.FreeTypeFont, text: str):
    bbox = font.getbbox(text)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def auto_downscale_font(font_name_size_tuple, text: str, max_width: int, min_size: int=36):
    """Decrease font size until text fits the given width or min_size."""
    name, size = font_name_size_tuple
    size_cur = size
    while size_cur >= min_size:
        font = get_font(size_cur)
        w, _ = measure_text(font, text)
        if w <= max_width:
            return font
        size_cur -= 2
    return get_font(min_size)


def draw_text_with_highlights(im: Image.Image, xy, text, base_font, color=(255,255,255,255),
                              highlight_words=None, highlight_color=(255, 230, 0, 255),
                              stroke_width=3, stroke_fill=(0,0,0,220), max_width=None, line_spacing=8):
    """
    Draw multi-line text with per-word highlights and stroke.
    Wraps lines to max_width.
    """
    if highlight_words is None:
        highlight_words = []
    hw_lower = [h.lower() for h in highlight_words]

    draw = ImageDraw.Draw(im)
    words = text.split()
    lines = []
    cur = []
    for w in words:
        test = " ".join(cur + [w])
        w_px, _ = measure_text(base_font, test)
        if max_width is not None and w_px > max_width and cur:
            lines.append(cur)
            cur = [w]
        else:
            cur.append(w)
    if cur:
        lines.append(cur)

    x, y = xy
    ascent, descent = base_font.getmetrics()
    line_h = ascent + descent + line_spacing

    for line_words in lines:
        line_text = " ".join(line_words)
        # left align (for center, compute total line width and shift x)
        current_x = x
        for w in line_words:
            ww, hh = measure_text(base_font, w)
            lower_w = w.lower().strip(",.!?:;")
            use_highlight = any(h in lower_w for h in hw_lower)
            # stroke first
            if stroke_width > 0:
                draw.text((current_x, y), w, font=base_font, fill=stroke_fill, stroke_width=stroke_width, stroke_fill=stroke_fill)
            # then main fill
            draw.text((current_x, y), w, font=base_font, fill=highlight_color if use_highlight else color, stroke_width=0)
            # space
            s_w, _ = measure_text(base_font, " ")
            current_x += ww + s_w
        y += line_h

    total_height = len(lines) * line_h
    return total_height


def make_circular_thumb(img: Image.Image, size=(420,420), border=10, border_color=(247, 255, 160, 255), shadow=True):
    img = img.resize(size, Image.Resampling.LANCZOS)
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((0,0,size[0],size[1]), fill=255)
    circle = Image.new("RGBA", size, (0,0,0,0))
    circle.paste(img, (0,0), mask)
    # border ring
    if border > 0:
        ring = Image.new("RGBA", (size[0]+2*border, size[1]+2*border), (0,0,0,0))
        ring_mask = Image.new("L", (size[0]+2*border, size[1]+2*border), 0)
        d2 = ImageDraw.Draw(ring_mask)
        d2.ellipse((0,0,size[0]+2*border,size[1]+2*border), fill=255)
        d2.ellipse((border,border,size[0]+border,size[1]+border), fill=0)
        ImageDraw.Draw(ring)
        ring.paste(border_color, (0,0), ring_mask)
        ring.paste(circle, (border,border), circle)
        circle = ring
    # shadow
    if shadow:
        sh = circle.copy().filter(ImageFilter.GaussianBlur(8))
        return circle, sh
    return circle, None


def compose_post(bg_url, fg_url, caption, category="TECH", brand="Urba",
                 size="1080x1920", highlight_words=None, add_blur=True,
                 cta_text="READ CAPTION FOR DETAILS"):
    if highlight_words is None:
        highlight_words = []

    W, H = map(int, size.lower().split("x"))
    # Load images
    bg = load_image_from_url(bg_url)
    fg = load_image_from_url(fg_url)

    # Fit background and optionally darken/blur a bit for readability
    bg = ensure_ratio_crop(bg, W, H)
    if add_blur:
        bg = bg.filter(ImageFilter.GaussianBlur(2))
    # subtle darken
    darken = Image.new("RGBA", (W,H), (0,0,0,90))
    bg = Image.alpha_composite(bg, darken)

    canvas = Image.new("RGBA", (W,H), (0,0,0,255))
    canvas.paste(bg, (0,0))

    # Safe margins
    M = 40

    # Circular logo (top-right)
    circle, shadow = make_circular_thumb(fg, size=(420,420), border=14)
    cx = W - circle.width - M
    cy = M + 40
    if shadow is not None:
        canvas.paste(shadow, (cx+8, cy+10), shadow)
    canvas.paste(circle, (cx, cy), circle)

    draw = ImageDraw.Draw(canvas)

    # Category pill (top-left)
    cat_font = get_font(40)
    cat_text = category.upper()
    cw, ch = measure_text(cat_font, cat_text)
    pad_x, pad_y = 22, 14
    cat_rect = (M, M, M + cw + 2*pad_x, M + ch + 2*pad_y)
    rounded_rectangle(draw, cat_rect, radius=12, fill=(255,255,255,255))
    # vertically center
    draw.text((M+pad_x, M+pad_y-4), cat_text, font=cat_font, fill=(0,0,0,255))

    # Brand (top-right above circle)
    brand_font = get_font(34)
    bw, bh = measure_text(brand_font, brand)
    draw.text((W - bw - M, M), brand, font=brand_font, fill=(255,255,255,230))

    # Bottom gradient for text
    grad_h = int(H * 0.42)
    gradient = np_vertical_gradient(W, grad_h, color=(0,0,0), start_alpha=0, end_alpha=235)
    canvas.paste(gradient, (0, H - grad_h), gradient)

    # Headline / caption
    # Choose initial font size dynamically by caption length
    L = len(caption.strip())
    if L <= 40: base_size = 110
    elif L <= 80: base_size = 96
    elif L <= 120: base_size = 84
    elif L <= 160: base_size = 72
    else: base_size = 62

    font = get_font(base_size)
    text_left = M
    text_right = W - M
    max_text_width = text_right - text_left
    # If single-line too wide, auto downscale
    font = auto_downscale_font(("display", base_size), caption, max_text_width, min_size=44)

    # Start y roughly mid of gradient
    text_top = H - grad_h + M
    total_h = draw_text_with_highlights(
        canvas,
        (text_left, text_top),
        caption,
        base_font=font,
        color=(255,255,255,255),
        highlight_words=highlight_words,
        highlight_color=(255, 255, 0, 255),
        stroke_width=3,
        stroke_fill=(0,0,0,220),
        max_width=max_text_width,
        line_spacing=10
    )

    # CTA button
    cta_font = get_font(34)
    ctw, cth = measure_text(cta_font, cta_text)
    btn_pad_x, btn_pad_y = 26, 18
    btn_w = ctw + 2*btn_pad_x
    btn_h = cth + 2*btn_pad_y
    btn_x = (W - btn_w)//2
    btn_y = H - btn_h - M
    rounded_rectangle(draw, (btn_x, btn_y, btn_x+btn_w, btn_y+btn_h), radius=14,
                      fill=(255,255,255,255))
    draw.text((btn_x+btn_pad_x, btn_y+btn_pad_y-4), cta_text, font=cta_font, fill=(0,0,0,255))

    return canvas


def save_image(im: Image.Image, path: str):

    im.convert("RGB").save(path, quality=95, optimize=True)
    return path


def build_video_from_image(pil_image: Image.Image, audio_url: str=None, duration=20, fps=30, out_path="vertical_output.mp4"):
    frame = np.array(pil_image.convert("RGB"))
    clip = ImageClip(frame).with_duration(duration)

    if audio_url:
        try:
            bio = download_asset(audio_url)
            with open("temp_audio.mp3", "wb") as f:
                f.write(bio.read())
            audio = AudioFileClip("temp_audio.mp3")
            # Loop to match duration
            if audio.duration < duration:
                audio = audio_loop(audio, duration=duration)
            else:
                audio = audio.with_duration(duration)
            clip = clip.with_audio(audio)
        except Exception as e:
            print(f"[WARN] Audio failed: {e}. Continuing without audio.")

    clip.write_videofile(out_path, fps=fps, codec="libx264", audio_codec="aac", bitrate="4000k")
    clip.close()
    return out_path


def main():
    """Main function to orchestrate the video creation process."""
    print("Video Creator Script - Instagram Reel/TikTok Format")
    print("==================================================")
    bg_url = 'https://pixabay.com/get/gcf2d9069e1a084627ba85aa65fdfcf310fb26ab9d43db8a5f0aa30f131ce6f2fdc0cfd25185a5a15e05ae76e16fa58ace948f6d3153bc552a571ff46e9733297_1280.jpg'
    fg_url = 'https://upload.wikimedia.org/wikipedia/commons/6/64/Pierre_Poilievre_in_2023_%28edited%29.jpg'
    caption = "Is electoral reform the answer to crowded ballots? 🤔 Alberta by-election sparks debate!"
    highlight_words = ['Musk','Political','Washington']
    category_text = "TECH"
    audio_url = 'https://mediaapibucket.s3.us-east-1.amazonaws.com/SoundHelix-Song-1.mp3'
   
    print(f"Background URL: {bg_url}")
    print(f"Foreground URL: {fg_url}")
    print(f"Caption: {caption}")
    print(f"Audio URL: {audio_url if audio_url else 'None'}")
    print(f"Output format: 1080x1920 (9:16 vertical)")
    print()
    


    post = compose_post(
        bg_url,
        fg_url,
        caption,
        category_text,
        brand = "shuffle",
        size ="1080x1920",
        highlight_words=highlight_words
    )

    save_image(post, "output.png")
    print(f"[OK] Image saved -> output.png")


    video_path = 'outputVid.mp4'
    build_video_from_image(post, audio_url=audio_url, out_path=video_path)
    print(f"[OK] Video saved -> {video_path}")


if __name__ == "__main__":
    main()
