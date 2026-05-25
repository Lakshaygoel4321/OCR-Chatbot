# ================================================================
# ocr_engine.py
# ================================================================
# STEP 2 of the OCR pipeline.
#
# What this file does:
#   1. Creates an AWS Textract client using your credentials
#   2. Sends the image bytes directly to Textract API
#   3. Receives a list of "Blocks" (Textract's raw response format)
#   4. Filters only LINE blocks (ignores PAGE and WORD blocks)
#   5. Returns a clean list of text lines with confidence scores
#
# About AWS Textract Blocks:
#   "PAGE"  → the entire document page (1 per image)
#   "LINE"  → one full line of text     ← we use this
#   "WORD"  → one single word           ← we skip this
# ================================================================

import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import HTTPException
from app.core.config import settings


def get_textract_client():
    """
    Creates and returns an AWS Textract boto3 client.
    Credentials are loaded from settings (which reads from .env).
    """
    return boto3.client(
        "textract",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


def extract_text(image_bytes: bytes) -> list[dict]:
    """
    Sends image to AWS Textract and returns extracted text lines.

    Parameters:
        image_bytes (bytes) : cleaned image bytes from preprocessor.py

    Returns:
        list[dict] : list of text lines, each dict contains:
                     {
                       "text":       str,   # the line of text
                       "confidence": float  # confidence score 0–100
                     }

    Raises:
        HTTPException 401 : AWS credentials are wrong or missing
        HTTPException 403 : AWS account does not have Textract permission
        HTTPException 400 : image is invalid
        HTTPException 415 : Textract cannot read this image format
        HTTPException 429 : AWS rate limit exceeded
        HTTPException 502 : any other unexpected AWS error
    """

    # ── STEP 1: Create Textract client ────────────────────────────
    client = get_textract_client()

    # ── STEP 2: Send image to Textract ────────────────────────────
    # detect_document_text() is best for general text extraction
    # We pass the image directly as bytes — no need to upload to S3
    try:
        response = client.detect_document_text(
            Document={"Bytes": image_bytes}
        )

    except NoCredentialsError:
        raise HTTPException(
            status_code=401,
            detail=(
                "AWS credentials not found or are invalid. "
                "Please check AWS_ACCESS_KEY_ID and "
                "AWS_SECRET_ACCESS_KEY in your .env file."
            )
        )

    except ClientError as e:
        error_code = e.response["Error"]["Code"]

        if error_code == "InvalidParameterException":
            raise HTTPException(
                status_code=400,
                detail="The image sent to Textract was invalid or malformed."
            )
        elif error_code == "UnsupportedDocumentException":
            raise HTTPException(
                status_code=415,
                detail="AWS Textract could not process this image type."
            )
        elif error_code == "ProvisionedThroughputExceededException":
            raise HTTPException(
                status_code=429,
                detail="AWS Textract rate limit exceeded. Please try again after a moment."
            )
        elif error_code == "AccessDeniedException":
            raise HTTPException(
                status_code=403,
                detail=(
                    "Your AWS account does not have permission to use Textract. "
                    "Enable Textract in your AWS console."
                )
            )
        else:
            raise HTTPException(
                status_code=502,
                detail=f"AWS Textract returned an error: {error_code}"
            )

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Unexpected error while calling Textract: {str(e)}"
        )

    # ── STEP 3: Parse the Textract response ───────────────────────
    blocks = response.get("Blocks", [])
    extracted_lines = []

    for block in blocks:
        # Only process LINE type blocks
        if block.get("BlockType") == "LINE":
            text = block.get("Text", "").strip()
            confidence = round(block.get("Confidence", 0.0), 2)

            # Only add if the line actually has text
            if text:
                extracted_lines.append({
                    "text": text,
                    "confidence": confidence
                })

    return extracted_lines