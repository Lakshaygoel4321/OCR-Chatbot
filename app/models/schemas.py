# ================================================================
# schemas.py
# ================================================================
# Defines the exact shape (structure) of all API responses using
# Pydantic models.
#
# Why Pydantic?
#   - Automatically validates all data
#   - Shows clear error if wrong data type is passed
#   - FastAPI uses these to auto-generate the /docs page
# ================================================================

from pydantic import BaseModel
from typing import Optional


# ── One single line of text with its confidence score ────────────
class TextLine(BaseModel):
    text: str           # the actual text content of this line
    confidence: float   # how sure Textract is — range: 0.0 to 100.0


# ── Full success response returned from POST /ocr ─────────────────
class OCRResponse(BaseModel):
    status: str
    extracted_text: str
    confidence: float
    word_count: int
    char_count: int
    line_count: int
    processing_time_ms: float
    lines: list[TextLine]


# ── Error response — returned when something goes wrong ───────────
class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    code: int


# ── Health check response — returned from GET /health ─────────────
class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str


# ── Full success response returned from POST /stt ────────────────
class STTResponse(BaseModel):
    status: str
    transcribed_text: str
    language_code: str
    word_count: int
    char_count: int
    processing_time_ms: float
    job_name: str


# ── NEW: Single message in chat history ──────────────────────────
class ChatMessage(BaseModel):
    role: str       # "user" or "assistant"
    content: str    # the message text


# ── NEW: Request body for POST /chat ─────────────────────────────
class ChatRequest(BaseModel):
    message: str                        # user's message text
    session_id: Optional[str] = None    # optional — auto-generated if not given


# ── NEW: Response from POST /chat ────────────────────────────────
class ChatResponse(BaseModel):
    status: str               # always "success"
    reply: str                # AI's reply text
    session_id: str           # session ID (use this for next message)
    model_used: str           # e.g. "llama-3.3-70b-versatile"
    message_count: int        # total messages in this session so far
    processing_time_ms: float # how long Groq took to reply


# ── NEW: Response from GET /chat/{session_id}/history ────────────
class HistoryResponse(BaseModel):
    session_id: str
    message_count: int
    history: list[ChatMessage]  # all messages excluding system prompt


# ── NEW: Response from DELETE /chat/{session_id} ─────────────────
class ClearResponse(BaseModel):
    status: str
    message: str