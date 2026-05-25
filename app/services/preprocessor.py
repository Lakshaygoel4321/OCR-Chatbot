# ================================================================
# preprocessor.py
# ================================================================
# STEP 1 of the OCR pipeline.
#
# What this file does:
#   1. Validates the image format (JPG, PNG, WebP, BMP, TIFF only)
#   2. Validates the file size (max 10MB)
#   3. Opens the image using Pillow library
#   4. Converts image to RGB mode (required for Textract)
#   5. Resizes image if it is too large (max 4096 x 4096 pixels)
#   6. Returns clean image bytes ready to send to Textract
# ================================================================

import io
from PIL import Image
from fastapi import HTTPException
from app.core.config import settings

# Maximum pixel size we allow before resizing
MAX_DIMENSION = 4096


def validate_and_preprocess(file_bytes: bytes, content_type: str) -> bytes:
    """
    Validates and preprocesses an uploaded image.

    Parameters:
        file_bytes   (bytes) : raw bytes of the uploaded file
        content_type (str)   : MIME type like "image/jpeg" or "image/png"

    Returns:
        bytes : processed image bytes in JPEG format, ready for Textract

    Raises:
        HTTPException 415 : unsupported file format
        HTTPException 413 : file is too large
        HTTPException 400 : file is corrupted or unreadable
    """

    # ── STEP 1: Validate file format ─────────────────────────────
    if content_type not in settings.ALLOWED_FORMATS:
        raise HTTPException(
            status_code=415,
            detail=(
                f"File format '{content_type}' is not supported. "
                f"Please upload a JPG, PNG, WebP, BMP, or TIFF image."
            )
        )

    # ── STEP 2: Validate file size ────────────────────────────────
    file_size_mb = len(file_bytes) / (1024 * 1024)  # bytes → MB
    if file_size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=(
                f"File size is {file_size_mb:.1f}MB which exceeds the "
                f"{settings.MAX_FILE_SIZE_MB}MB maximum limit."
            )
        )

    # ── STEP 3: Open image with Pillow ────────────────────────────
    try:
        image = Image.open(io.BytesIO(file_bytes))
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not open the image. The file may be corrupted or invalid."
        )

    # ── STEP 4: Convert to RGB ────────────────────────────────────
    # PNG files are often RGBA (4 channels — Red, Green, Blue, Alpha)
    # Grayscale images are mode "L" (1 channel)
    # Textract works best with standard RGB (3 channels)
    if image.mode != "RGB":
        image = image.convert("RGB")

    # ── STEP 5: Resize if image dimensions are too large ──────────
    width, height = image.size
    if width > MAX_DIMENSION or height > MAX_DIMENSION:
        # thumbnail() resizes while KEEPING the original aspect ratio
        # e.g. 8000x4000 becomes 4096x2048 — not stretched
        image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)

    # ── STEP 6: Convert processed image back to bytes ─────────────
    output_buffer = io.BytesIO()
    image.save(output_buffer, format="JPEG", quality=95)
    processed_bytes = output_buffer.getvalue()

    return processed_bytes