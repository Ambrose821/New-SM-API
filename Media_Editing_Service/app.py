from PIL import Image, ImageDraw, ImageFont, ImageFilter

import io
import requests
from io import BytesIO

def create_instagram_post(image, headline, output_path=None, format="square"):
    """
    Create an Instagram post with a black gradient overlay and headline text.
    
    Args:
        image: PIL Image object or path to image file
        headline: Text to display on the gradient
        output_path: Path to save the output image (if None, returns the image)
        format: "square" (1:1) or "portrait" (4:5) Instagram format
    
    Returns:
        PIL Image object if output_path is None, otherwise saves to file
    """
    # Load image if path is provided
    if isinstance(image, str):
        if image.startswith(('http://', 'https://')):
            response = requests.get(image)
            image = Image.open(BytesIO(response.content))
        else:
            image = Image.open(image)
    
    # Determine target dimensions based on format
    if format == "square":
        target_size = (1080, 1080)  # Instagram square size
    else:  # portrait
        target_size = (1080, 1350)  # Instagram portrait size (4:5 ratio)
    
    # Resize and crop to fit Instagram dimensions
    img_ratio = image.width / image.height
    target_ratio = target_size[0] / target_size[1]
    
    if img_ratio > target_ratio:  # Image is wider than target
        new_width = int(target_ratio * image.height)
        left = (image.width - new_width) // 2
        image = image.crop((left, 0, left + new_width, image.height))
    else:  # Image is taller than target
        new_height = int(image.width / target_ratio)
        top = (image.height - new_height) // 2
        image = image.crop((0, top, image.width, top + new_height))
    
    # Resize to target dimensions
    image = image.resize(target_size, Image.LANCZOS)
    
    # Create gradient overlay
    gradient_height = int(target_size[1] * 0.4)  # Gradient covers 40% of image height
    gradient = Image.new('RGBA', (target_size[0], gradient_height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(gradient)
    
    # Draw gradient from bottom (black) to top (transparent)
    for y in range(gradient_height):
        # Calculate alpha value (0 at top, 180 at bottom)
        alpha = int(180 * (1 - y / gradient_height))
        draw.line([(0, y), (target_size[0], y)], fill=(0, 0, 0, alpha))
    
    # Convert original image to RGBA if it's not already
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    
    # Create a new transparent image for the final composition
    final_image = Image.new('RGBA', target_size, (0, 0, 0, 0))
    
    # Paste the original image
    final_image.paste(image, (0, 0))
    
    # Paste the gradient at the bottom
    final_image.paste(gradient, (0, target_size[1] - gradient_height), mask=gradient)
    
    # Add headline text
    draw = ImageDraw.Draw(final_image)
    
    # Calculate font size based on image dimensions
    font_size = int(target_size[0] * 0.05)  # 5% of image width
    
    # Try to load a nice font, fall back to default if not available
    try:
        font = ImageFont.truetype("Arial.ttf", font_size)
    except IOError:
        font = ImageFont.load_default()
    
    # Wrap text if it's too long
    max_width = int(target_size[0] * 0.9)  # 90% of image width
    words = headline.split()
    lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        text_width = draw.textlength(test_line, font=font)
        
        if text_width <= max_width:
            current_line.append(word)
        else:
            lines.append(' '.join(current_line))
            current_line = [word]
    
    if current_line:
        lines.append(' '.join(current_line))
    
    wrapped_text = '\n'.join(lines)
    
    # Calculate text position (centered horizontally, near bottom but above gradient)
    text_y = target_size[1] - gradient_height + int(gradient_height * 0.3)
    
    # Add text shadow for better readability
    shadow_offset = int(font_size * 0.05)
    for line_idx, line in enumerate(lines):
        line_y = text_y + line_idx * (font_size + 10)
        text_width = draw.textlength(line, font=font)
        text_x = (target_size[0] - text_width) // 2
        
        # Draw shadow
        draw.text((text_x + shadow_offset, line_y + shadow_offset), line, font=font, fill=(0, 0, 0, 180))
        # Draw text
        draw.text((text_x, line_y), line, font=font, fill=(255, 255, 255, 255))
    
    # Convert back to RGB for saving
    final_image = final_image.convert('RGB')
    
    # Save or return
    if output_path:
        final_image.save(output_path, quality=95)
     
    
    return final_image

# Example usage with a placeholder image
def demo():
    # Use a placeholder image URL
    image_url = "https://picsum.photos/1200/800"
    headline = "Your Amazing Headline Text Goes Here"
    
    # Create both square and portrait versions
    square_img = create_instagram_post(image_url, headline, "instagram_square.jpg", format="square")
    portrait_img = create_instagram_post(image_url, headline, format="portrait")
    
    # Display the images
    print("Created Instagram posts with gradient overlay and headline text")
    
    # Save to BytesIO to display
    square_buffer = BytesIO()
    portrait_buffer = BytesIO()
    square_img.save(square_buffer, format="JPEG")
    portrait_img.save(portrait_buffer, format="JPEG")
    
    # Display image dimensions
    print(f"Square format dimensions: {square_img.width}x{square_img.height}")
    print(f"Portrait format dimensions: {portrait_img.width}x{portrait_img.height}")
    
    # Return the images (in a real scenario, you'd save these to files)
    return square_img, portrait_img

# Run the demo
square_img, portrait_img = demo()

# Display the images (this would work in a notebook environment)
# In this environment, we'll just show the dimensions
print("\nImages created successfully!")