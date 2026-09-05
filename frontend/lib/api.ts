const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface Chunk {
  text: string;
  start_offset: number;
  end_offset: number;
  length: number;
}

export interface RetrievedChunk {
  id: string;
  text: string;
  metadata: Record<string, unknown>;
  distance: number;
}

export interface IngestResponse {
  doc_id: string;
  chunk_count: number;
  chunks: Chunk[];
  chunk_ids: string[];
}

export interface QueryResponse {
  retrieved_chunks: RetrievedChunk[];
  prompt: { system: string; user: string };
  answer: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  latency_ms: number;
  model: string;
}

export async function ingestFile(file: File, signal?: AbortSignal): Promise<IngestResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/ingest`, { method: "POST", body: formData, signal });
  if (!res.ok) throw new Error("Ingest failed");
  return res.json();
}

export async function runQuery(query: string, topK: number = 4): Promise<QueryResponse> {
  const res = await fetch(`${API_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k: topK }),
  });
  if (!res.ok) throw new Error("Query failed");
  return res.json();
}

export interface DocumentSummary {
  doc_id: string;
  chunk_count: number;
}

export async function listDocuments(): Promise<DocumentSummary[]> {
  const res = await fetch(`${API_URL}/documents`);
  if (!res.ok) throw new Error("Failed to list documents");
  const data = await res.json();
  return data.documents;
}

export async function getDocumentChunks(docId: string): Promise<Chunk[]> {
  const res = await fetch(`${API_URL}/documents/${docId}/chunks`);
  if (!res.ok) throw new Error("Failed to fetch chunks");
  const data = await res.json();
  return data.chunks;
}

export async function deleteDocument(docId: string): Promise<void> {
  await fetch(`${API_URL}/documents/${docId}`, { method: "DELETE" });
}

export async function clearStore(): Promise<void> {
  await fetch(`${API_URL}/clear`, { method: "POST" });
}