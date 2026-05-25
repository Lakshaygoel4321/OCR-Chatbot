# ─────────────────────────────────────────────────────────────────
# test_api.py
# Basic tests for the API endpoints.
# Run with: pytest tests/
# ─────────────────────────────────────────────────────────────────

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "OCR Backend is running" in response.json()["message"]


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_ocr_no_file():
    """Should return 422 when no file is sent"""
    response = client.post("/ocr")
    assert response.status_code == 422


def test_ocr_wrong_format():
    """Should return 415 when a non-image file is sent"""
    response = client.post(
        "/ocr",
        files={"image": ("test.txt", b"hello world", "text/plain")}
    )
    assert response.status_code == 415