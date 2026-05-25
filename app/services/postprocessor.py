# ================================================================
# postprocessor.py
# ================================================================
# STEP 3 of the OCR pipeline.
#
# What this file does:
#   1. Removes any empty or blank lines
#   2. Joins all lines into one complete text string
#   3. Counts words, characters, and lines
#   4. Calculates the average confidence score
#   5. Returns a clean dictionary ready for the API response
# ================================================================


def process_ocr_result(raw_lines: list[dict]) -> dict:
    """
    Cleans and structures the raw OCR output from Textract.

    Parameters:
        raw_lines (list[dict]) : output from ocr_engine.extract_text()
                                 Each dict has:
                                   "text"       (str)
                                   "confidence" (float)

    Returns:
        dict with keys:
            extracted_text  (str)        : full text joined by newlines
            confidence      (float)      : average confidence score (0–100)
            word_count      (int)        : total words in the extracted text
            char_count      (int)        : total characters in the text
            line_count      (int)        : total number of text lines found
            lines           (list[dict]) : each line with text + confidence
    """

    # ── STEP 1: Filter out empty lines ───────────────────────────
    valid_lines = [
        line for line in raw_lines
        if line.get("text", "").strip() != ""
    ]

    # ── STEP 2: Handle case where NO text was found ───────────────
    if not valid_lines:
        return {
            "extracted_text": "",
            "confidence": 0.0,
            "word_count": 0,
            "char_count": 0,
            "line_count": 0,
            "lines": []
        }

    # ── STEP 3: Join all lines into a single full text string ─────
    full_text = "\n".join(line["text"] for line in valid_lines)

    # ── STEP 4: Calculate statistics ─────────────────────────────
    word_count = len(full_text.split())   # split on whitespace
    char_count = len(full_text)           # includes spaces + newlines
    line_count = len(valid_lines)

    # ── STEP 5: Calculate average confidence ──────────────────────
    total_confidence = sum(line["confidence"] for line in valid_lines)
    avg_confidence = round(total_confidence / line_count, 2)

    # ── STEP 6: Build clean lines list ───────────────────────────
    structured_lines = [
        {
            "text": line["text"],
            "confidence": line["confidence"]
        }
        for line in valid_lines
    ]

    # ── STEP 7: Return the final structured result ────────────────
    return {
        "extracted_text": full_text,
        "confidence": avg_confidence,
        "word_count": word_count,
        "char_count": char_count,
        "line_count": line_count,
        "lines": structured_lines
    }