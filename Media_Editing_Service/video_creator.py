#!/usr/bin/env python3
"""
Video Creator Script - Instagram Reel/TikTok Format

Creates a 20-second vertical video (9:16 aspect ratio) from background image, 
foreground image, caption, and audio. Optimized for Instagram Reels and TikTok.
"""

import requests
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import numpy as np
from moviepy import ImageClip, AudioFileClip, CompositeVideoClip
import sys
import os
import tempfile


def download_asset(url, asset_type="image"):
    """Download asset from URL into memory."""
    try:
        print(f"Downloading {asset_type} from: {url}")
        response = requests.get(url, stream=True)
        response.raise_for_status()
        return BytesIO(response.content)
    except requests.exceptions.RequestException as e:
        print(f"Error downloading {asset_type} from {url}: {e}")
        return None


def create_circular_thumbnail(image, size=(180, 180)):
    """Create a circular thumbnail from an image."""
    # Resize image to square
    image = image.resize(size, Image.Resampling.LANCZOS)
    
    # Create a mask for circular cropping
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0) + size, fill=255)
    
    # Apply mask to create circular image
    output = Image.new('RGBA', size, (0, 0, 0, 0))
    output.paste(image, (0, 0))
    output.putalpha(mask)
    
    return output


def create_gradient_overlay(width, height, gradient_height=800):
    """Create a black gradient overlay for the bottom of the image."""
    gradient = Image.new('RGBA', (width, gradient_height), (0, 0, 0, 0))
    
    for y in range(gradient_height):
        # More intense gradient for better text readability
        alpha = int(300 * (y / gradient_height) ** 0.7)
        for x in range(width):
            gradient.putpixel((x, y), (0, 0, 0, alpha))
    
    return gradient


def get_font(size=32, bold=False):
    """Get a readable font, fallback to default if not available."""
    font_paths = []
    
    if bold:
        font_paths = [
            "/System/Library/Fonts/Helvetica.ttc",  # macOS
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",  # Linux Bold
            "C:/Windows/Fonts/arialbd.ttf",  # Windows Bold
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",  # Linux fallback
            "C:/Windows/Fonts/arial.ttf",  # Windows fallback
        ]
    else:
        font_paths = [
            "/System/Library/Fonts/Helvetica.ttc",  # macOS
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",  # Linux
            "C:/Windows/Fonts/arial.ttf",  # Windows
        ]
    
    for font_path in font_paths:
        try:
            if os.path.exists(font_path):
                return ImageFont.truetype(font_path, size)
        except:
            continue
    
    # Fallback to default font
    try:
        return ImageFont.load_default()
    except:
        return ImageFont.load_default()


def wrap_text_advanced(text, font, max_width, highlight_words=None):
    """Wrap text to fit within specified width with word highlighting."""
    if highlight_words is None:
        highlight_words = []
    
    words = text.split()
    lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = font.getbbox(test_line)
        text_width = bbox[2] - bbox[0]
        
        if text_width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(current_line)
                current_line = [word]
            else:
                lines.append([word])  # Single word too long, add anyway
    
    if current_line:
        lines.append(current_line)
    
    return lines


def process_images(bg_url, fg_url, caption):
    """Process and combine images with caption for vertical video."""
    # Download images
    bg_data = download_asset(bg_url, "background image")
    fg_data = download_asset(fg_url, "foreground image")
    
    if not bg_data or not fg_data:
        print("Failed to download required images")
        return None
    
    # Load images
    try:
        bg_image = Image.open(bg_data).convert('RGBA')
        fg_image = Image.open(fg_data).convert('RGBA')
    except Exception as e:
        print(f"Error loading images: {e}")
        return None
    
    # Set target dimensions for vertical video (9:16 aspect ratio)
    target_width, target_height = 1080, 1920  # Instagram Reel/TikTok dimensions
    
    # Resize and crop background to fit vertical format
    bg_aspect = bg_image.width / bg_image.height
    target_aspect = target_width / target_height
    
    if bg_aspect > target_aspect:
        # Background is wider, crop sides
        new_height = bg_image.height
        new_width = int(new_height * target_aspect)
        left = (bg_image.width - new_width) // 2
        bg_image = bg_image.crop((left, 0, left + new_width, new_height))
    else:
        # Background is taller, crop top/bottom
        new_width = bg_image.width
        new_height = int(new_width / target_aspect)
        top = (bg_image.height - new_height) // 2
        bg_image = bg_image.crop((0, top, new_width, top + new_height))
    
    # Resize to target dimensions
    bg_image = bg_image.resize((target_width, target_height), Image.Resampling.LANCZOS)
    
    # Create circular thumbnail from foreground (larger for vertical format)
    thumbnail = create_circular_thumbnail(fg_image, (500, 500))
    
    # Create final composition
    final_image = Image.new('RGBA', (target_width, target_height), (0, 0, 0, 255))
    final_image.paste(bg_image, (0, 0))
    
    # Position thumbnail in upper right area
    thumb_x = target_width - thumbnail.width - 40
    thumb_y = 120  # Higher up in vertical format
    final_image.paste(thumbnail, (thumb_x, thumb_y), thumbnail)
    
    # Add gradient overlay at bottom (larger for vertical format)
    gradient_height = 800
    gradient = create_gradient_overlay(target_width, gradient_height)
    gradient_y = target_height - gradient_height
    # 🔧 Force exact bottom placement
    final_image.paste(gradient, (0, target_height - gradient.size[1]), gradient)
    
    # Add category tag in upper left
    draw = ImageDraw.Draw(final_image)
    
    # Category tag (like "TECH" in the example)
    category_font = get_font(32, bold=True)
    category_text = "TECH"
    category_padding = 20
    
    # Calculate category box size
    category_bbox = category_font.getbbox(category_text)
    category_width = category_bbox[2] - category_bbox[0] + category_padding * 2
    category_height = category_bbox[3] - category_bbox[1] + category_padding
    
    # Draw category background
    category_rect = [40, 40, 40 + category_width, 40 + category_height]
    draw.rectangle(category_rect, fill=(255, 255, 255, 255))
    
    # Draw category text
    category_x = 40 + category_padding
    category_y = 40 + category_padding // 2
    draw.text((category_x, category_y), category_text, font=category_font, fill=(0, 0, 0, 255))
    
    # Add brand name in upper right
    brand_font = get_font(28, bold=False)
    brand_text = "Urba"
    brand_bbox = brand_font.getbbox(brand_text)
    brand_width = brand_bbox[2] - brand_bbox[0]
    brand_x = target_width - brand_width - 40
    brand_y = 50
    draw.text((brand_x, brand_y), brand_text, font=brand_font, fill=(255, 255, 255, 255))
    
    # Process caption with highlighting
    main_font = get_font(84, bold=True)
    
    # Define highlight words (you can customize this)
    highlight_words = ["CHATGPT", "ROGUE", "LIED"]
    
    # Wrap text to fit width with padding
    max_text_width = target_width - 80  # 40px padding on each side
    text_lines = wrap_text_advanced(caption, main_font, max_text_width, highlight_words)
    
    # Calculate total text height
    line_height = main_font.getbbox('Ay')[3] - main_font.getbbox('Ay')[1] + 12  # Add line spacing
    total_text_height = len(text_lines) * line_height
    
    # Position text in center of gradient area
    text_start_y = gradient_y + (gradient_height - total_text_height) // 2
    
    # Draw each line with word-by-word highlighting
    for i, line_words in enumerate(text_lines):
        line_y = text_start_y + i * line_height
        
        # Calculate total line width to center it
        line_text = ' '.join(line_words)
        line_bbox = main_font.getbbox(line_text)
        line_width = line_bbox[2] - line_bbox[0]
        
        line_start_x = 40
        # line_start_x = (target_width - line_width) // 2  <-- THIS IS TEXT ALIGN CENTER
        
        # Draw words individually with highlighting
        current_x = line_start_x
        for word in line_words:
            word_bbox = main_font.getbbox(word)
            word_width = word_bbox[2] - word_bbox[0]
            
            # Check if word should be highlighted
            is_highlighted = any(highlight.lower() in word.lower() for highlight in highlight_words)
            
            # Draw shadow
            shadow_offset = 3
            draw.text((current_x + shadow_offset, line_y + shadow_offset), word, 
                     font=main_font, fill=(0, 0, 0, 220))
            
            # Draw main text with appropriate color
            if is_highlighted:
                draw.text((current_x, line_y), word, font=main_font, fill=(255, 255, 0, 255))  # Yellow highlight
            else:
                draw.text((current_x, line_y), word, font=main_font, fill=(255, 255, 255, 255))  # White text
            
            # Move to next word position
            space_width = main_font.getbbox(' ')[2] - main_font.getbbox(' ')[0]
            current_x += word_width + space_width
    
    # Add bottom call-to-action
    cta_font = get_font(24, bold=True)
    cta_text = "READ CAPTION FOR DETAILS"
    cta_bbox = cta_font.getbbox(cta_text)
    cta_width = cta_bbox[2] - cta_bbox[0]
    cta_height = cta_bbox[3] - cta_bbox[1]
    
    # Position CTA at bottom
    cta_x = (target_width - cta_width) // 2
    cta_y = target_height - 120
    
    # Draw CTA background
    cta_padding = 15
    cta_rect = [cta_x - cta_padding, cta_y - cta_padding // 2, 
                cta_x + cta_width + cta_padding, cta_y + cta_height + cta_padding // 2]
    draw.rectangle(cta_rect, fill=(255, 255, 255, 255))
    
    # Draw CTA text
    draw.text((cta_x, cta_y), cta_text, font=cta_font, fill=(0, 0, 0, 255))
    
    return final_image


def create_video(image, audio_url=None, duration=20):
    """Create video from image and optional audio."""
    # Convert PIL image to numpy array for moviepy
    img_array = np.array(image.convert('RGB'))
    
    # Create image clip
    image_clip = ImageClip(img_array, duration=duration)
    
    # Handle audio if provided
    if audio_url:
        audio_data = download_asset(audio_url, "audio file")
        if audio_data:
            try:
                # Create temporary file for audio (moviepy requirement)
                with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_audio:
                    temp_audio.write(audio_data.read())
                    temp_audio_path = temp_audio.name
                
                # Load audio clip
                audio_clip = AudioFileClip(temp_audio_path)
                
                # Adjust audio to match video duration
                if audio_clip.duration > duration:
                    audio_clip = audio_clip.subclip(0, duration)
                elif audio_clip.duration < duration:
                    # Loop audio to fill duration
                    loops_needed = int(duration / audio_clip.duration) + 1
                    audio_clip = audio_clip.loop(loops_needed).subclip(0, duration)
                
                # Combine video and audio
                final_clip = image_clip.set_audio(audio_clip)
                
                # Clean up temporary file
                os.unlink(temp_audio_path)
                
                return final_clip
                
            except Exception as e:
                print(f"Error processing audio: {e}")
                print("Continuing without audio...")
                # Clean up temporary file if it exists
                try:
                    os.unlink(temp_audio_path)
                except:
                    pass
    
    # Return video without audio
    return image_clip


def main():
    """Main function to orchestrate the video creation process."""
    print("Video Creator Script - Instagram Reel/TikTok Format")
    print("==================================================")
    bg_url = 'https://pixabay.com/get/gaa81732f0909575c2ce195dad4ad4347c90ef2c9a0f95431e09921fbf0719f32bfc1e4de99689b1aef28a837ff9ed3dd14fda159aa448032423654a3a9eb10ff_1280.jpg'
    fg_url = 'https://live.staticflickr.com/192/470562794_2472fada41_b.jpg'
    caption = "Poilievre's protest crackdown: Necessary reform or stifling dissent"
    audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
   
    print(f"Background URL: {bg_url}")
    print(f"Foreground URL: {fg_url}")
    print(f"Caption: {caption}")
    print(f"Audio URL: {audio_url if audio_url else 'None'}")
    print(f"Output format: 1080x1920 (9:16 vertical)")
    print()
    
    # Process images
    print("Processing images...")
    final_image = process_images(bg_url, fg_url, caption)
    
    if final_image is None:
        print("Failed to process images")
        return
    
    print("Images processed successfully!")
    
    # Create video
    print("Creating video...")
    video_clip = create_video(final_image, audio_url)
    
    if video_clip is None:
        print("Failed to create video")
        return
    
    # Save final video
    output_path = "vertical_output.mp4"
    print(f"Saving video to {output_path}...")
    
    try:
        video_clip.write_videofile(
            output_path,
            fps=30,  # Higher fps for smoother playback on mobile
            codec='libx264',
            audio_codec='aac' if audio_url else None,
            logger=None,
            bitrate='4000k'  # Higher bitrate for better quality
        )
        print(f"Video saved successfully as {output_path}")
        
    except Exception as e:
        print(f"Error saving video: {e}")
        return
    
    finally:
        # Clean up
        video_clip.close()
    
    print("Process completed!")
    print("Video is ready for Instagram Reels and TikTok!")


if __name__ == "__main__":
    main()