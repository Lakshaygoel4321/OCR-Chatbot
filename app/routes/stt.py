# ================================================================
# routes/stt.py
# ================================================================
# Defines the POST /stt endpoint.
# Receives audio file → validates → calls stt_engine → returns JSON
# ================================================================

import time
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from app.services.stt_engine import transcribe_audio
from app.models.schemas import STTResponse
from app.core.config import settings

router = APIRouter()


@router.post("/stt", response_model=STTResponse)
async def stt_endpoint(
    audio: UploadFile = File(...),
    language: str = Query(default=None, description="Language code e.g. en-IN or hi-IN")
):
    """
    Upload an audio file and transcribe it to text using AWS Transcribe.
    Accepts: MP3, WAV, M4A, OGG, FLAC (max 25MB)
    """

    # Read uploaded file bytes
    audio_bytes = await audio.read()

    # Check file is not empty
    if not audio_bytes:
        raise HTTPException(
            status_code=400,
            detail="No audio data received. Please upload a valid audio file."
        )

    # Validate file format
    if audio.content_type not in settings.ALLOWED_AUDIO_FORMATS:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Format '{audio.content_type}' is not supported. "
                f"Please upload: MP3, WAV, M4A, OGG, or FLAC."
            )
        )

    # Validate file size
    file_size_mb = len(audio_bytes) / (1024 * 1024)
    if file_size_mb > settings.MAX_AUDIO_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=(
                f"File size is {file_size_mb:.1f}MB. "
                f"Maximum allowed is {settings.MAX_AUDIO_SIZE_MB}MB."
            )
        )

    # Extract file extension from original filename
    filename = audio.filename or "audio.mp3"
    file_extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else "mp3"

    # Start timer
    start_time = time.time()

    # Run full transcription pipeline
    result = transcribe_audio(
        audio_bytes=audio_bytes,
        file_extension=file_extension,
        language_code=language
    )

    # Calculate total processing time
    processing_time_ms = round((time.time() - start_time) * 1000, 2)

    return STTResponse(
        status="success",
        transcribed_text=result["transcribed_text"],
        language_code=result["language_code"],
        word_count=result["word_count"],
        char_count=result["char_count"],
        processing_time_ms=processing_time_ms,
        job_name=result["job_name"]
    )