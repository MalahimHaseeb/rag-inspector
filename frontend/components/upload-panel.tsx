"use client";

import { useRef, useState } from "react";
import { UploadCloud, Trash2, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { ingestFile, clearStore, type IngestResponse } from "@/lib/api";

interface UploadPanelProps {
  onIngested: (result: IngestResponse) => void;
}

export function UploadPanel({ onIngested }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const isLoading = status === "loading";

  async function handleFile(file: File) {
    const controller = new AbortController();
    abortRef.current = controller;

    setFileName(file.name);
    setStatus("loading");
    try {
      const result = await ingestFile(file, controller.signal);
      onIngested(result);
      setStatus("idle");
      toast.success(`Split into ${result.chunk_count} chunks`);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
        toast("Upload cancelled");
      } else {
        setStatus("error");
        toast.error(err instanceof Error ? err.message : "Couldn't reach the backend");
      }
    } finally {
      abortRef.current = null;
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
  }

  async function handleClear() {
    if (isLoading) return;
    await clearStore();
    setFileName(null);
    onIngested({ doc_id: "", chunk_count: 0, chunks: [], chunk_ids: [] });
    toast.success("Store cleared");
  }

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg">Document</h2>
        <button
          onClick={handleClear}
          disabled={isLoading}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <Trash2 className="size-3.5" />
          Clear store
        </button>
      </div>

      <div
        onClick={() => !isLoading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (isLoading) return;
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        aria-busy={isLoading}
        className={`border border-dashed border-border rounded-lg py-10 flex flex-col items-center gap-2 text-center transition-colors ${
          isLoading ? "cursor-not-allowed" : "cursor-pointer hover:border-foreground/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.md,.pdf,.docx"
          disabled={isLoading}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {isLoading ? (
          <>
            <Loader2 className="size-5 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">Chunking and embedding {fileName}...</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors mt-1"
            >
              <X className="size-3" />
              Cancel
            </button>
          </>
        ) : (
          <>
            <UploadCloud className="size-5 text-muted-foreground" />
            {fileName ? (
              <p className="text-sm">{fileName}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Drop a text file, or click to choose one</p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}