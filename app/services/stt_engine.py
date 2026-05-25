# ================================================================
# stt_engine.py
# ================================================================
# Core AWS Transcribe logic.
#
# Flow:
#   1. Upload audio file to S3 bucket
#   2. Start AWS Transcribe job
#   3. Poll every 5 seconds until job is COMPLETED or FAILED
#   4. Download transcript JSON from the result URL
#   5. Extract the transcribed text
#   6. Clean up S3 files (audio + transcript)
#   7. Return structured result
# ================================================================

import uuid
import time
import json
import urllib.request
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import HTTPException
from app.core.config import settings


def get_s3_client():
    """Creates and returns an AWS S3 boto3 client."""
    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


def get_transcribe_client():
    """Creates and returns an AWS Transcribe boto3 client."""
    return boto3.client(
        "transcribe",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


def upload_audio_to_s3(audio_bytes: bytes, file_extension: str, job_name: str) -> str:
    """
    Uploads audio bytes to S3 bucket.

    Parameters:
        audio_bytes    (bytes) : raw audio file bytes
        file_extension (str)   : e.g. "mp3", "wav", "m4a"
        job_name       (str)   : unique job name used as S3 key

    Returns:
        str : S3 URI of the uploaded file
              e.g. "s3://your-bucket/audio/job-name.mp3"
    """
    s3 = get_s3_client()
    s3_key = f"audio/{job_name}.{file_extension}"

    try:
        s3.put_object(
            Bucket=settings.AWS_S3_BUCKET_NAME,
            Key=s3_key,
            Body=audio_bytes
        )
    except NoCredentialsError:
        raise HTTPException(
            status_code=401,
            detail="AWS credentials invalid. Check .env file."
        )
    except ClientError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to upload audio to S3: {e.response['Error']['Code']}"
        )

    s3_uri = f"s3://{settings.AWS_S3_BUCKET_NAME}/{s3_key}"
    return s3_uri


def start_transcribe_job(job_name: str, s3_uri: str, language_code: str) -> None:
    """
    Starts an AWS Transcribe job.

    Parameters:
        job_name      (str) : unique name for this transcription job
        s3_uri        (str) : S3 URI of the uploaded audio file
        language_code (str) : language e.g. "en-IN" or "hi-IN"
    """
    transcribe = get_transcribe_client()

    # Detect audio format from S3 URI for Transcribe MediaFormat field
    extension = s3_uri.split(".")[-1].lower()
    media_format_map = {
        "mp3": "mp3",
        "wav": "wav",
        "m4a": "mp4",
        "mp4": "mp4",
        "ogg": "ogg",
        "flac": "flac",
        "webm": "webm"
    }
    media_format = media_format_map.get(extension, "mp3")

    try:
        transcribe.start_transcription_job(
            TranscriptionJobName=job_name,
            Media={"MediaFileUri": s3_uri},
            MediaFormat=media_format,
            LanguageCode=language_code,
            OutputBucketName=settings.AWS_S3_BUCKET_NAME,
            OutputKey=f"transcripts/{job_name}.json"
        )
    except ClientError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to start Transcribe job: {e.response['Error']['Code']}"
        )


def poll_transcribe_job(job_name: str, timeout_seconds: int = 300) -> str:
    """
    Polls AWS Transcribe every 5 seconds until job is COMPLETED or FAILED.

    Parameters:
        job_name        (str) : the Transcribe job name to check
        timeout_seconds (int) : max wait time before giving up (default 5 mins)

    Returns:
        str : "COMPLETED" when job is done

    Raises:
        HTTPException 502 : if job FAILED or timeout exceeded
    """
    transcribe = get_transcribe_client()
    elapsed = 0

    while elapsed < timeout_seconds:
        try:
            response = transcribe.get_transcription_job(
                TranscriptionJobName=job_name
            )
        except ClientError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Error checking transcription job: {e.response['Error']['Code']}"
            )

        status = response["TranscriptionJob"]["TranscriptionJobStatus"]

        if status == "COMPLETED":
            return "COMPLETED"

        elif status == "FAILED":
            reason = response["TranscriptionJob"].get("FailureReason", "Unknown reason")
            raise HTTPException(
                status_code=502,
                detail=f"Transcription job failed: {reason}"
            )

        # Job still IN_PROGRESS — wait 5 seconds and check again
        time.sleep(5)
        elapsed += 5

    # If we reach here, job took too long
    raise HTTPException(
        status_code=504,
        detail="Transcription timed out. Audio may be too long. Try a shorter clip."
    )


def get_transcript_text(job_name: str) -> str:
    """
    Downloads the transcript JSON from S3 and extracts the text.

    Parameters:
        job_name (str) : the completed Transcribe job name

    Returns:
        str : the full transcribed text
    """
    s3 = get_s3_client()
    transcript_key = f"transcripts/{job_name}.json"

    try:
        response = s3.get_object(
            Bucket=settings.AWS_S3_BUCKET_NAME,
            Key=transcript_key
        )
        transcript_json = json.loads(response["Body"].read().decode("utf-8"))
    except ClientError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to download transcript: {e.response['Error']['Code']}"
        )

    # Navigate the Transcribe JSON structure to get the text
    # Structure: results → transcripts → [0] → transcript
    try:
        text = transcript_json["results"]["transcripts"][0]["transcript"]
    except (KeyError, IndexError):
        text = ""

    return text.strip()


def cleanup_s3_files(job_name: str, file_extension: str) -> None:
    """
    Deletes the uploaded audio and transcript files from S3.
    Called after transcription is done — keeps S3 bucket clean.

    Parameters:
        job_name       (str) : the job name used as file identifier
        file_extension (str) : audio file extension e.g. "mp3"
    """
    s3 = get_s3_client()

    keys_to_delete = [
        f"audio/{job_name}.{file_extension}",
        f"transcripts/{job_name}.json"
    ]

    for key in keys_to_delete:
        try:
            s3.delete_object(
                Bucket=settings.AWS_S3_BUCKET_NAME,
                Key=key
            )
        except ClientError:
            pass  # if cleanup fails, it's not critical — don't crash the response


def transcribe_audio(audio_bytes: bytes, file_extension: str, language_code: str = None) -> dict:
    """
    Master function — runs the full transcription pipeline.

    Parameters:
        audio_bytes    (bytes) : raw audio file bytes
        file_extension (str)   : file extension e.g. "mp3", "wav"
        language_code  (str)   : language code, defaults to config setting

    Returns:
        dict with:
            transcribed_text (str)  : full transcript
            language_code    (str)  : language used
            word_count       (int)  : number of words
            char_count       (int)  : number of characters
            job_name         (str)  : AWS job name used
    """
    # Use default language from config if not provided
    if not language_code:
        language_code = settings.AWS_TRANSCRIBE_LANGUAGE

    # Generate a unique job name using timestamp + random ID
    job_name = f"ocr-stt-{int(time.time())}-{uuid.uuid4().hex[:8]}"

    # Step 1 → Upload audio to S3
    s3_uri = upload_audio_to_s3(audio_bytes, file_extension, job_name)

    # Step 2 → Start Transcribe job
    start_transcribe_job(job_name, s3_uri, language_code)

    # Step 3 → Wait for job to complete
    poll_transcribe_job(job_name)

    # Step 4 → Get the transcribed text
    transcribed_text = get_transcript_text(job_name)

    # Step 5 → Clean up S3 files
    cleanup_s3_files(job_name, file_extension)

    # Step 6 → Calculate stats
    word_count = len(transcribed_text.split()) if transcribed_text else 0
    char_count = len(transcribed_text)

    return {
        "transcribed_text": transcribed_text,
        "language_code": language_code,
        "word_count": word_count,
        "char_count": char_count,
        "job_name": job_name
    }