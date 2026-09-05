from fastapi import HTTPException

MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024
MAX_QUERY_LENGTH = 2000
MAX_TOP_K = 20
ALLOWED_EXTENSIONS = {"txt", "md", "pdf", "docx"}
GROUNDING_MIN_OVERLAP = 0.15

def validate_top_k(top_k: int):
    if top_k < 1:
        raise HTTPException(status_code=400, detail="top_k must be at least 1")
    if top_k > MAX_TOP_K:
        raise HTTPException(status_code=400, detail=f"top_k exceeds max of {MAX_TOP_K}")

def check_grounding(answer: str, retrieved_chunks: list) -> dict:
    context_text = " ".join(c["text"] for c in retrieved_chunks).lower()
    context_words = set(w for w in context_text.split() if len(w) > 4)

    answer_words = set(w.strip(".,!?") for w in answer.lower().split() if len(w) > 4)
    if not answer_words:
        return {"grounded": True, "overlap_ratio": 1.0}

    overlap = answer_words & context_words
    ratio = len(overlap) / len(answer_words)
    return {"grounded": ratio >= GROUNDING_MIN_OVERLAP, "overlap_ratio": round(ratio, 3)}

def validate_file(filename: str, content: bytes):
    if not filename or "." not in filename:
        raise HTTPException(status_code=400, detail="File must have an extension")

    ext = filename.lower().rsplit(".", 1)[-1]
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: .{ext}")

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"File exceeds {MAX_FILE_SIZE_BYTES // (1024*1024)}MB limit")

def validate_query(query: str):
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    if len(query) > MAX_QUERY_LENGTH:
        raise HTTPException(status_code=400, detail=f"Query exceeds {MAX_QUERY_LENGTH} character limit")