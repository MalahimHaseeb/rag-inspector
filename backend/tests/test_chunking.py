from app.chunking import chunk_text

def test_chunk_text_basic():
    text = "a" * 1000
    chunks = chunk_text(text, chunk_size=200, overlap=0)
    assert len(chunks) == 5
    assert chunks[0]["start_offset"] == 0
    assert chunks[0]["end_offset"] == 200

def test_chunk_text_overlap():
    text = "a" * 1000
    chunks = chunk_text(text, chunk_size=200, overlap=50)
    assert chunks[1]["start_offset"] == 150

def test_chunk_text_short_input():
    text = "hello world"
    chunks = chunk_text(text, chunk_size=500, overlap=50)
    assert len(chunks) == 1
    assert chunks[0]["text"] == text

def test_chunk_text_empty_input():
    chunks = chunk_text("", chunk_size=500, overlap=50)
    assert chunks == []

def test_chunk_offsets_reconstruct_original():
    text = "The quick brown fox jumps over the lazy dog." * 10
    chunks = chunk_text(text, chunk_size=50, overlap=10)
    for c in chunks:
        assert text[c["start_offset"]:c["end_offset"]] == c["text"]