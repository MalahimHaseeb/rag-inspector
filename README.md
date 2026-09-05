# RAG Inspector

A debugging and observability tool for RAG pipelines. Upload a document, watch how it gets chunked, run a query, and see exactly what gets retrieved, what prompt actually gets sent to the model, and what comes back, including latency and token usage.

Most RAG demos show you the answer. This shows you the pipeline.

## Architecture

```
Next.js frontend  >  FastAPI backend  >  Chroma (local vector store)
                                       >  OpenAI-compatible LLM client
```

- **Chunking**: fixed size with configurable overlap, offsets tracked per chunk
- **Vector store**: Chroma, running locally and persisted to disk. No external database required
- **Embeddings**: Chroma's default embedding function (all-MiniLM-L6-v2, downloaded once on first run)
- **LLM**: OpenAI SDK / `langchain-openai` interface, with a configurable `base_url`. Works against OpenAI directly or any OpenAI-compatible endpoint

## Features

- Document ingestion with visible chunk boundaries and offsets
- Multi-document store: see everything currently indexed, select a document to inspect its chunks, delete individual documents
- Query with tabbed inspection: **Response** (answer, latency, token usage), **Retrieval** (matched chunks with similarity distance), **Prompt** (the exact system/user prompt sent to the model)
- Clear-on-demand or clear-on-ingest control over the vector store

## Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Fill in `OPENAI_API_KEY` in `.env`. `OPENAI_BASE_URL` defaults to OpenAI's endpoint. Point it at any OpenAI-compatible provider instead if you'd rather.

```bash
uvicorn app.main:app --reload
```

Runs on `http://127.0.0.1:8000`. Interactive API docs at `/docs`.

**Note:** the first `/ingest` call downloads a ~79MB embedding model on first run, which can take a few minutes depending on connection speed. It's cached after that, so every call afterward is fast, including across backend restarts.

### Frontend

```bash
cd frontend
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

```bash
npm run dev
```

Runs on `http://localhost:3000`. Make sure the backend is running first.

## API

| Method | Route | Description |
|---|---|---|
| POST | `/ingest` | Upload a file, get back its chunks |
| POST | `/query` | Run a query against the store, get retrieval + prompt + response |
| GET | `/documents` | List all documents currently in the store |
| GET | `/documents/{doc_id}/chunks` | Get chunks for a specific document |
| DELETE | `/documents/{doc_id}` | Remove a document from the store |
| POST | `/clear` | Wipe the entire store |
| GET | `/health` | Health check |

## Tech stack

FastAPI, Chroma, OpenAI SDK, Next.js, shadcn/ui, Tailwind

## Branching strategy

- `main`: production-ready, protected, only receives merges from `develop` via PR with passing CI
- `develop`: integration branch for completed features
- `feature/*`: one branch per feature, merged into `develop`
- `docs/*`: documentation and cleanup work
- `disaster-recovery`: mirrors the last known-good state of `main` at each tagged release, used as a rollback point if `main` ever needs to be restored

Releases are tagged on `main` following semantic versioning (`v1.0.0`, `v1.1.0`, etc).