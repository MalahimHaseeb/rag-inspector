"use client";

import { useEffect, useRef, useState } from "react";
import { UploadPanel } from "@/components/upload-panel";
import { ChunkViewer } from "@/components/chunk-viewer";
import { QueryPanel } from "@/components/query-panel";
import { ThemeChanger } from "@/components/theme-changer";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { useTheme } from "next-themes";
import { listDocuments, getDocumentChunks, type Chunk, type DocumentSummary } from "@/lib/api";
import { DocumentList } from "@/components/document-list";

export default function Home() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const queryInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Keyboard shortcuts
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd + Shift + K: Toggle theme
      if (isCtrlOrCmd && e.shiftKey && key === "k") {
        e.preventDefault();
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
      }
      // Ctrl/Cmd + K: Focus query input
      else if (isCtrlOrCmd && key === "k" && !e.shiftKey) {
        e.preventDefault();
        queryInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, theme, setTheme]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold">RAG Inspector</h1>
              <p className="text-sm text-muted-foreground mt-1">
                See exactly what your retrieval pipeline sends the LLM, and why.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeChanger />
              <KeyboardShortcuts />
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <UploadPanel
              onIngested={async (result) => {
                if (result.doc_id) {
                  setActiveDocId(result.doc_id);
                  setChunks(result.chunks);
                }
                await refreshDocuments();
              }}
            />
            {documents.length > 0 && (
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
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <ChunkViewer chunks={chunks} docId={activeDocId} />
            <QueryPanel ref={queryInputRef} />
          </div>
        </div>
      </div>
    </main>
  );
}