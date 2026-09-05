from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid

from app.chunking import chunk_text
from app.vectorstore import add_chunks, query_chunks, clear_collection
from app.llm import generate_answer

app = FastAPI(title="RAG Inspector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    top_k: int = 4

@app.post("/ingest")
async def ingest(file: UploadFile = File(...), clear_existing: bool = True):
    if clear_existing:
        clear_collection()
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    doc_id = str(uuid.uuid4())[:8]
    chunks = chunk_text(text)
    chunk_ids = add_chunks(doc_id, chunks)
    return {
        "doc_id": doc_id,
        "chunk_count": len(chunks),
        "chunks": chunks,
        "chunk_ids": chunk_ids
    }

@app.post("/clear")
async def clear():
    clear_collection()
    return {"status": "cleared"}

@app.post("/query")
async def query(request: QueryRequest):
    retrieved_chunks = query_chunks(request.query, request.top_k)
    result = generate_answer(request.query, retrieved_chunks)
    return {
        "retrieved_chunks": retrieved_chunks,
        "prompt": result["prompt"],
        "answer": result["answer"],
        "usage": result["usage"],
        "latency_ms": result["latency_ms"],
        "model": result["model"]
    }

@app.get("/health")
async def health():
    return {"status": "ok"}