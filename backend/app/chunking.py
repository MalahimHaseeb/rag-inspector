from app.config import settings

def chunk_text(text: str, chunk_size: int = None, overlap: int = None):
    chunk_size = chunk_size if chunk_size is not None else settings.chunk_size
    overlap = overlap if overlap is not None else settings.chunk_overlap
    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunk_str = text[start:end]
        chunks.append({
            "text": chunk_str,
            "start_offset": start,
            "end_offset": end,
            "length": len(chunk_str)
        })
        if end == text_len:
            break
        start = end - overlap

    return chunks