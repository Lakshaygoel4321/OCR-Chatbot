# ================================================================
# main.py
# ================================================================
# Entry point of the entire application.
# Run with: uvicorn app.main:app --reload --port 8000
# ================================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.ocr import router as ocr_router
from app.routes.stt import router as stt_router
from app.routes.chat import router as chat_router
from app.core.config import settings

app = FastAPI(
    title="OCR + STT + Chat Backend",
    description=(
        "Image to Text (AWS Textract) | "
        "Audio to Text (AWS Transcribe) | "
        "Conversational AI (Groq Llama 3.3 70B)"
    ),
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all 3 routers
app.include_router(ocr_router, tags=["OCR — Image to Text"])
app.include_router(stt_router, tags=["STT — Audio to Text"])
app.include_router(chat_router, tags=["Chat — Conversational AI"])


@app.get("/")
async def root():
    return {
        "message": "OCR + STT + Chat Backend is running!",
        "docs": "/docs",
        "endpoints": {
            "health":        "GET /health",
            "image_to_text": "POST /ocr",
            "audio_to_text": "POST /stt",
            "chat":          "POST /chat",
            "chat_history":  "GET /chat/{session_id}/history",
            "clear_chat":    "DELETE /chat/{session_id}"
        }
    }