import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from app.main import app
from app.vectorstore import clear_collection

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_store():
    clear_collection()
    yield
    clear_collection()

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}

def test_ingest_txt():
    files = {"file": ("test.txt", b"The quick brown fox jumps over the lazy dog.", "text/plain")}
    res = client.post("/ingest", files=files)
    assert res.status_code == 200
    body = res.json()
    assert body["chunk_count"] >= 1
    assert "doc_id" in body

def test_ingest_unsupported_type():
    files = {"file": ("image.png", b"binarydata", "image/png")}
    res = client.post("/ingest", files=files)
    assert res.status_code == 400

def test_ingest_empty_file():
    files = {"file": ("empty.txt", b"   ", "text/plain")}
    res = client.post("/ingest", files=files)
    assert res.status_code == 400

def test_list_documents_after_ingest():
    files = {"file": ("test.txt", b"some content here for testing", "text/plain")}
    client.post("/ingest", files=files)
    res = client.get("/documents")
    assert res.status_code == 200
    assert len(res.json()["documents"]) >= 1

def test_delete_document():
    files = {"file": ("test.txt", b"content to delete", "text/plain")}
    ingest_res = client.post("/ingest", files=files)
    doc_id = ingest_res.json()["doc_id"]
    del_res = client.delete(f"/documents/{doc_id}")
    assert del_res.status_code == 200
    chunks_res = client.get(f"/documents/{doc_id}/chunks")
    assert chunks_res.json()["chunks"] == []

def test_query_with_mocked_llm():
    files = {"file": ("test.txt", b"Paris is the capital of France.", "text/plain")}
    client.post("/ingest", files=files)

    fake_result = {
        "answer": "Paris",
        "prompt": {"system": "sys", "user": "user"},
        "usage": {"prompt_tokens": 10, "completion_tokens": 2, "total_tokens": 12},
        "latency_ms": 5.0,
        "model": "test-model"
    }
    with patch("app.main.generate_answer", return_value=fake_result):
        res = client.post("/query", json={"query": "What is the capital of France?", "top_k": 2})
    assert res.status_code == 200
    assert res.json()["answer"] == "Paris"