"use client";

import { useRef, useState } from "react";
import { UploadCloud, Trash2, Loader2, X, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ingestFile, clearStore, type IngestResponse } from "@/lib/api";

interface UploadPanelProps {
  onIngested: (result: IngestResponse) => void;
}

export function UploadPanel({ onIngested }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [lastResult, setLastResult] = useState<IngestResponse | null>(null);

  const isLoading = status === "loading";

  async function handleFile(file: File) {
    const controller = new AbortController();
    abortRef.current = controller;

    setFileName(file.name);
    setStatus("loading");
    try {
      const result = await ingestFile(file, controller.signal);
      onIngested(result);
      setLastResult(result);
      setStatus("success");
      toast.success(`${result.chunk_count} chunks created`);
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
        toast("Upload cancelled");
      } else {
        setStatus("error");
        toast.error(err instanceof Error ? err.message : "Couldn't reach the backend");
        setTimeout(() => setStatus("idle"), 3000);
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
        className={`border-2 border-dashed rounded-lg py-10 flex flex-col items-center gap-2 text-center transition-all ${
          status === "success"
            ? "border-green-500/30 bg-green-500/5"
            : status === "error"
            ? "border-destructive/30 bg-destructive/5"
            : isLoading
            ? "border-foreground/20 cursor-not-allowed"
            : "border-border cursor-pointer hover:border-foreground/40 hover:bg-accent/20"
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
            <p className="text-sm text-muted-foreground font-medium">Chunking and embedding...</p>
            <p className="text-xs text-muted-foreground">{fileName}</p>
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
        ) : status === "success" ? (
          <>
            <CheckCircle2 className="size-5 text-green-600" />
            <p className="text-sm font-medium">Upload successful</p>
            {lastResult && (
              <Badge variant="secondary" className="text-xs">
                {lastResult.chunk_count} chunks
              </Badge>
            )}
          </>
        ) : status === "error" ? (
          <>
            <AlertCircle className="size-5 text-destructive" />
            <p className="text-sm font-medium text-destructive">Upload failed</p>
            <p className="text-xs text-muted-foreground">Try again or check the backend</p>
          </>
        ) : (
          <>
            <UploadCloud className="size-5 text-muted-foreground" />
            {fileName ? (
              <>
                <p className="text-sm font-medium">{fileName}</p>
                <p className="text-xs text-muted-foreground">Drop to upload</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">Drop a document here</p>
                <p className="text-xs text-muted-foreground">Supports .txt, .md, .pdf, .docx</p>
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}