"use client";

import { useEffect, useState } from "react";
import { UploadPanel } from "@/components/upload-panel";
import { ChunkViewer } from "@/components/chunk-viewer";
import { QueryPanel } from "@/components/query-panel";
import { listDocuments, getDocumentChunks, type Chunk, type DocumentSummary } from "@/lib/api";
import { DocumentList } from "@/components/document-list";

export default function Home() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);

  async function refreshDocuments() {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
      return docs;
    } catch {
      return [];
    }
  }

  async function selectDocument(docId: string) {
    setActiveDocId(docId);
    const docChunks = await getDocumentChunks(docId);
    setChunks(docChunks);
  }

  useEffect(() => {
    refreshDocuments().then((docs) => {
      if (docs.length > 0) selectDocument(docs[0].doc_id);
    });
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
        <div>
          <h1 className="font-display text-2xl">RAG Inspector</h1>
          <p className="text-sm text-muted-foreground mt-1">
            See exactly what your retrieval pipeline sends the model, and why.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-6">
            <UploadPanel
              onIngested={async (result) => {
                if (result.doc_id) {
                  setActiveDocId(result.doc_id);
                  setChunks(result.chunks);
                }
                await refreshDocuments();
              }}
            />
            <DocumentList
              documents={documents}
              activeDocId={activeDocId}
              onSelect={selectDocument}
              onDeleted={async (docId) => {
                if (docId === activeDocId) {
                  setActiveDocId(null);
                  setChunks([]);
                }
                await refreshDocuments();
              }}
            />
            <ChunkViewer chunks={chunks} docId={activeDocId} />
          </div>

          <QueryPanel />
        </div>
      </div>
    </main>
  );
}