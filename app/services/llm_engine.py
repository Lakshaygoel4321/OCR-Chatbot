# ================================================================
# llm_engine.py
# ================================================================
# Core Groq LLM logic + in-memory session/conversation management.
#
# What this file does:
#   1. Creates a Groq client using your API key
#   2. Manages conversation sessions in a Python dictionary
#   3. Each session stores full chat history
#   4. Sends full history to Groq on every message (that's memory!)
#   5. Trims old messages if history gets too long
# ================================================================

import uuid
from groq import Groq
from groq import AuthenticationError, RateLimitError, APIStatusError
from fastapi import HTTPException
from app.core.config import settings


# ── Groq client (created once, reused for all requests) ──────────
groq_client = Groq(api_key=settings.GROQ_API_KEY)

# ── In-memory session store ───────────────────────────────────────
# Key   = session_id (string)
# Value = list of message dicts { "role": ..., "content": ... }
sessions: dict = {}


def get_or_create_session(session_id: str) -> list:
    """
    Returns existing session history OR creates a new one with
    the system prompt as the first message.

    Parameters:
        session_id (str) : unique session identifier

    Returns:
        list : the full message history for this session
    """
    if session_id not in sessions:
        # Start fresh — system prompt is always the first message
        sessions[session_id] = [
            {
                "role": "system",
                "content": settings.CHAT_SYSTEM_PROMPT
            }
        ]
    return sessions[session_id]


def trim_history(session_id: str) -> None:
    """
    Keeps history from growing too large.
    Removes the OLDEST user+assistant message pair when limit is hit.
    Always keeps the system prompt at index 0.

    Parameters:
        session_id (str) : session to trim
    """
    history = sessions.get(session_id, [])

    # history[0] is system prompt — count only actual chat messages
    chat_messages = history[1:]

    if len(chat_messages) > settings.MAX_HISTORY_LENGTH:
        # Remove oldest 2 messages (1 user + 1 assistant = 1 exchange)
        # Keep system prompt at index 0 always
        sessions[session_id] = [history[0]] + chat_messages[2:]


def chat(session_id: str, user_message: str) -> dict:
    """
    Main chat function. Sends user message to Groq with full history.

    Parameters:
        session_id   (str) : unique session identifier
        user_message (str) : the user's message text

    Returns:
        dict with:
            reply         (str) : AI's reply text
            session_id    (str) : same session_id passed in
            model_used    (str) : the Groq model name used
            message_count (int) : total messages in session now
    """

    # Step 1 → Get or create session
    history = get_or_create_session(session_id)

    # Step 2 → Append user message to history
    history.append({
        "role": "user",
        "content": user_message
    })

    # Step 3 → Send full history to Groq
    try:
        response = groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=history,       # entire conversation sent every time
            temperature=0.7,        # 0 = strict/factual, 1 = creative
            max_tokens=1024,        # max length of reply
        )

    except AuthenticationError:
        raise HTTPException(
            status_code=401,
            detail="Groq API key is invalid. Check GROQ_API_KEY in your .env file."
        )
    except RateLimitError:
        raise HTTPException(
            status_code=429,
            detail="Groq rate limit exceeded. Please wait a moment and try again."
        )
    except APIStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Groq API error: {e.message}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Unexpected LLM error: {str(e)}"
        )

    # Step 4 → Extract the reply text
    reply = response.choices[0].message.content.strip()

    # Step 5 → Append AI reply to history
    history.append({
        "role": "assistant",
        "content": reply
    })

    # Step 6 → Trim history if it's getting too long
    trim_history(session_id)

    # Step 7 → Return structured result
    # message_count excludes the system prompt (index 0)
    message_count = len(sessions[session_id]) - 1

    return {
        "reply": reply,
        "session_id": session_id,
        "model_used": settings.GROQ_MODEL,
        "message_count": message_count
    }


def clear_session(session_id: str) -> bool:
    """
    Deletes a session and all its history from memory.

    Parameters:
        session_id (str) : session to delete

    Returns:
        bool : True if session existed and was deleted, False if not found
    """
    if session_id in sessions:
        del sessions[session_id]
        return True
    return False


def get_history(session_id: str) -> list:
    """
    Returns the chat history for a session (excludes system prompt).

    Parameters:
        session_id (str) : session to fetch history for

    Returns:
        list : list of { role, content } dicts (no system prompt)
               empty list if session not found
    """
    if session_id not in sessions:
        return []

    # Skip index 0 (system prompt) — return only real chat messages
    history = sessions[session_id][1:]
    return history