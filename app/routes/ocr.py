# ─────────────────────────────────────────────────────────────────
# routes/ocr.py
# Defines all API endpoints.
# FastAPI receives HTTP requests here, calls the 3 service files,
# and returns the final JSON response back to the client.
# ─────────────────────────────────────────────────────────────────

import time
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.preprocessor import validate_and_preprocess
from app.services.ocr_engine import extract_text
from app.services.postprocessor import process_ocr_result
from app.models.schemas import OCRResponse, HealthResponse, TextLine
from app.core.config import settings

router = APIRouter()


# ── POST /ocr ─────────────────────────────────────────────────────
@router.post("/ocr", response_model=OCRResponse)
async def ocr_endpoint(image: UploadFile = File(...)):
    """
    Upload an image and extract all text using AWS Textract.
    Accepts: JPG, PNG, WebP, BMP, TIFF (max 10MB)
    """

    # Read uploaded file bytes
    file_bytes = await image.read()

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="No image data received. Please upload a valid image."
        )

    # Start timer
    start_time = time.time()

    # Step 1 → Preprocess
    processed_bytes = validate_and_preprocess(file_bytes, image.content_type)

    # Step 2 → Extract text via AWS Textract
    raw_lines = extract_text(processed_bytes)

    # Step 3 → Structure the output
    result = process_ocr_result(raw_lines)

    # Calculate total time taken
    processing_time_ms = round((time.time() - start_time) * 1000, 2)

    return OCRResponse(
        status="success",
        extracted_text=result["extracted_text"],
        confidence=result["confidence"],
        word_count=result["word_count"],
        char_count=result["char_count"],
        line_count=result["line_count"],
        processing_time_ms=processing_time_ms,
        lines=[TextLine(**line) for line in result["lines"]]
    )


# ── GET /health ───────────────────────────────────────────────────
@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check if the server is running."""
    return HealthResponse(
        status="ok",
        service="OCR Backend — AWS Textract",
        version=settings.APP_VERSION,
        environment=settings.APP_ENV
    )