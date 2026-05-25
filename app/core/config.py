# ================================================================
# config.py
# ================================================================
# This file reads your .env file and makes all settings available
# as a single `settings` object across the entire project.
#
# Usage in any other file:
#   from app.core.config import settings
#   print(settings.AWS_REGION)
# ================================================================

from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()  # automatically reads .env file from project root


class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"   # ignores unknown .env vars like VITE_API_BASE_URL
    )

    # ── AWS Credentials ──────────────────────────────────────────
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str = "us-east-1"

    # ── App Settings ─────────────────────────────────────────────
    APP_ENV: str = "development"
    APP_VERSION: str = "1.0.0"
    MAX_FILE_SIZE_MB: int = 10

    # ── Allowed Image Formats (MIME types) ───────────────────────
    ALLOWED_FORMATS: list[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/bmp",
        "image/tiff"
    ]

    # ── AWS Transcribe + S3 Settings ─────────────────────────────
    AWS_S3_BUCKET_NAME: str = "ocr-backend-audio-bucket"
    AWS_TRANSCRIBE_LANGUAGE: str = "en-IN"
    MAX_AUDIO_SIZE_MB: int = 25

    # ── Allowed Audio Formats (MIME types) ───────────────────────
    ALLOWED_AUDIO_FORMATS: list[str] = [
        "audio/mpeg",       # MP3
        "audio/wav",        # WAV
        "audio/x-wav",      # WAV (alternate)
        "audio/mp4",        # M4A
        "audio/ogg",        # OGG
        "audio/flac",       # FLAC
        "audio/x-flac",     # FLAC (alternate)
        "video/mp4",        # MP4
        "audio/webm"        # WEBM
    ]

    # ── Groq LLM Settings ─────────────────────────────────────────
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    MAX_HISTORY_LENGTH: int = 20
    CHAT_SYSTEM_PROMPT: str = (
        "You are a helpful, intelligent AI assistant. "
        "You give clear, concise, and accurate answers. "
        "You remember the full conversation context. "
        "If you don't know something, say so honestly. "
        "Keep answers short unless the user asks for detail."
    )


# Single global instance — import `settings` anywhere in the project
settings = Settings()