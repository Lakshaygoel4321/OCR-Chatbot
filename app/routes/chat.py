# ================================================================
# routes/chat.py
# ================================================================
# Defines all 3 chat API endpoints:
#   POST   /chat                       → send message, get reply
#   GET    /chat/{session_id}/history  → view conversation history
#   DELETE /chat/{session_id}          → clear conversation history
# ================================================================

import time
import uuid
from fastapi import APIRouter, HTTPException
from app.services.llm_engine import chat, clear_session, get_history
from app.models.schemas import (
    ChatRequest, ChatResponse,
    HistoryResponse, ClearResponse, ChatMessage
)

router = APIRouter()


# ── POST /chat ────────────────────────────────────────────────────
@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Send a message to the AI bot and get a reply.
    Pass the same session_id in every request to maintain memory.
    If session_id is not provided, a new one is auto-generated.
    """

    # Validate message is not empty
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )

    # Auto-generate session_id if user didn't provide one
    session_id = request.session_id or str(uuid.uuid4())

    # Start timer
    start_time = time.time()

    # Call Groq LLM with full conversation history
    result = chat(
        session_id=session_id,
        user_message=request.message.strip()
    )

    processing_time_ms = round((time.time() - start_time) * 1000, 2)

    return ChatResponse(
        status="success",
        reply=result["reply"],
        session_id=result["session_id"],
        model_used=result["model_used"],
        message_count=result["message_count"],
        processing_time_ms=processing_time_ms
    )


# ── GET /chat/{session_id}/history ────────────────────────────────
@router.get("/chat/{session_id}/history", response_model=HistoryResponse)
async def get_history_endpoint(session_id: str):
    """
    Returns the full conversation history for a given session.
    System prompt is excluded — only actual user/assistant messages.
    """
    history = get_history(session_id)

    return HistoryResponse(
        session_id=session_id,
        message_count=len(history),
        history=[ChatMessage(**msg) for msg in history]
    )


# ── DELETE /chat/{session_id} ─────────────────────────────────────
@router.delete("/chat/{session_id}", response_model=ClearResponse)
async def clear_chat_endpoint(session_id: str):
    """
    Clears all conversation history for a given session.
    After this, the next message starts a completely fresh conversation.
    """
    deleted = clear_session(session_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=f"Session '{session_id}' not found. Nothing to clear."
        )

    return ClearResponse(
        status="success",
        message=f"Conversation history cleared for session: {session_id}"
    )