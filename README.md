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

- Document ingestion (`.txt`, `.md`, `.pdf`, `.docx`) with visible chunk boundaries and offsets
- Multi-document store: see everything currently indexed, select a document to inspect its chunks, delete individual documents
- Query with tabbed inspection: **Response** (answer, groundedness score, latency, token usage), **Retrieval** (matched chunks with similarity distance), **Prompt** (the exact system/user prompt sent to the model)
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
| POST | `/query` | Run a query against the store, get retrieval + prompt + response + grounding |
| GET | `/documents` | List all documents currently in the store |
| GET | `/documents/{doc_id}/chunks` | Get chunks for a specific document |
| DELETE | `/documents/{doc_id}` | Remove a document from the store |
| POST | `/clear` | Wipe the entire store |
| GET | `/health` | Health check |

## Guardrails

Deterministic checks that run outside the model, not prompt instructions asking it to behave:

- **Input validation**: file type allowlist, file size cap (20MB), empty file/query rejection, query length cap, `top_k` bounded to 1-20
- **Output grounding check**: after the model answers, its vocabulary is checked against the retrieved chunks. A low-overlap answer (likely hallucinated or answered from the model's own training data instead of your document) is flagged in the response and surfaced as a badge in the UI, rather than silently passed through

## Testing and evals

```bash
cd backend
pip install -r requirements-dev.txt
pytest -v                  # unit + API tests
python evals/run_eval.py   # retrieval quality against a golden question set
```

Unit tests cover chunking, extraction, guardrails, and the API endpoints (the LLM call is mocked so tests run free and deterministically). The eval script is separate on purpose: it measures whether semantic search actually surfaces the right information for a known set of questions, not just whether the code runs without errors. Both run in CI on every PR.

## Tech stack

FastAPI, Chroma, OpenAI SDK, Next.js, shadcn/ui, Tailwind, pytest

## Branching strategy

- `main`: production-ready, protected, only receives merges from `develop` via PR with passing CI
- `develop`: integration branch for completed features
- `feature/*`: one branch per feature, merged into `develop`
- `docs/*`: documentation and cleanup work
- `disaster-recovery`: mirrors the last known-good state of `main` at each tagged release, used as a rollback point if `main` ever needs to be restored

Releases are tagged on `main` following semantic versioning (`v1.0.0`, `v1.1.0`, etc).