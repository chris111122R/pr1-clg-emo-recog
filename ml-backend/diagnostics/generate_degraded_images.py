import os
import json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
import cv2

OUTPUT_DIR = "../eval/degraded_inputs"

def generate_clean_face():
    # Generate a simple synthetic "face"
    img = Image.new("RGB", (224, 224), color=(255, 220, 200))
    draw = ImageDraw.Draw(img)
    # Eyes
    draw.ellipse((60, 60, 90, 90), fill=(0, 0, 0))
    draw.ellipse((134, 60, 164, 90), fill=(0, 0, 0))
    # Mouth (smile)
    draw.arc((60, 100, 164, 160), start=0, end=180, fill=(200, 0, 0), width=5)
    return img

def apply_gaussian_blur(img, radius):
    return img.filter(ImageFilter.GaussianBlur(radius))

def apply_noise(img, severity):
    np_img = np.array(img)
    noise = np.random.normal(0, severity, np_img.shape).astype(np.float32)
    noisy_img = np.clip(np_img.astype(np.float32) + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(noisy_img)

def apply_occlusion(img, percentage):
    img_copy = img.copy()
    draw = ImageDraw.Draw(img_copy)
    w, h = img.size
    # Occlude bottom percentage of the face
    h_occlude = int(h * percentage)
    draw.rectangle((0, h - h_occlude, w, h), fill=(0, 0, 0))
    return img_copy

def apply_jpeg_compression(img, quality):
    path = os.path.join(OUTPUT_DIR, "temp.jpg")
    img.save(path, "JPEG", quality=quality)
    compressed = Image.open(path)
    compressed.load()
    os.remove(path)
    return compressed

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    clean = generate_clean_face()
    
    cases = [
        {"name": "clean", "img": clean, "severity": "none", "type": "clean"},
        
        # Blur
        {"name": "blur_mild", "img": apply_gaussian_blur(clean, 2), "severity": "mild", "type": "blur"},
        {"name": "blur_moderate", "img": apply_gaussian_blur(clean, 5), "severity": "moderate", "type": "blur"},
        {"name": "blur_heavy", "img": apply_gaussian_blur(clean, 10), "severity": "heavy", "type": "blur"},
        
        # Noise
        {"name": "noise_mild", "img": apply_noise(clean, 20), "severity": "mild", "type": "noise"},
        {"name": "noise_moderate", "img": apply_noise(clean, 50), "severity": "moderate", "type": "noise"},
        {"name": "noise_heavy", "img": apply_noise(clean, 100), "severity": "heavy", "type": "noise"},
        
        # Occlusion
        {"name": "occlusion_10", "img": apply_occlusion(clean, 0.1), "severity": "mild", "type": "occlusion"},
        {"name": "occlusion_30", "img": apply_occlusion(clean, 0.3), "severity": "moderate", "type": "occlusion"},
        {"name": "occlusion_50", "img": apply_occlusion(clean, 0.5), "severity": "heavy", "type": "occlusion"},
        
        # JPEG
        {"name": "jpeg_heavy", "img": apply_jpeg_compression(clean, 5), "severity": "heavy", "type": "jpeg"},
        
        # Garbage
        {"name": "garbage_random", "img": Image.fromarray(np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)), "severity": "extreme", "type": "garbage"}
    ]
    
    manifest = []
    
    for case in cases:
        filename = f"{case['name']}.jpg"
        filepath = os.path.join(OUTPUT_DIR, filename)
        case['img'].save(filepath)
        
        manifest.append({
            "filename": filename,
            "name": case["name"],
            "severity": case["severity"],
            "type": case["type"]
        })
        
    with open(os.path.join(OUTPUT_DIR, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=4)
        
    print(f"Generated {len(cases)} images in {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
