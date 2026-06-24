"""
AI Disaster Detection System - Utility Core
File: backend/utils/image_processing.py
Description: Visual verification and pre-processing functions for image classification.
"""

from PIL import Image

def validate_image_file(file_path):
    """
    Verifies that the uploaded file can be opened as an image and is not corrupted.
    """
    try:
        with Image.open(file_path) as img:
            # Trigger lazy load to verify image pixels are healthy
            img.verify()
        return True
    except Exception as e:
        print(f"Raster verification failure on {file_path}: {str(e)}")
        return False

def resize_and_normalize_image(file_path, target_size=(224, 224)):
    """
    Pre-processes PIL images to target sizes (e.g. 224x224 for standard CNNs).
    """
    try:
        with Image.open(file_path) as img:
            # Convert to RGB color spectrum
            if img.mode != "RGB":
                img = img.convert("RGB")
            resized_img = img.resize(target_size)
            return resized_img
    except Exception as e:
        print(f"Failed resize pre-processing: {str(e)}")
        return None
