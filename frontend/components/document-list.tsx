"use client";

import { Trash2, FileStack, Copy, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteDocument, type DocumentSummary } from "@/lib/api";

interface DocumentListProps {
  documents: DocumentSummary[];
  activeDocId: string | null;
  onSelect: (docId: string) => void;
  onDeleted: (docId: string) => void;
}

export function DocumentList({ documents, activeDocId, onSelect, onDeleted }: DocumentListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (documents.length === 0) return null;

  function copyToClipboard(docId: string) {
    navigator.clipboard.writeText(docId);
    setCopiedId(docId);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleDelete(docId: string, e: React.MouseEvent) {
    e.stopPropagation();
    await deleteDocument(docId);
    onDeleted(docId);
    toast.success("Document removed");
  }

  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileStack className="size-4 text-muted-foreground" />
          <h2 className="font-display text-lg">Documents</h2>
          <Badge variant="secondary" className="text-xs">{documents.length}</Badge>
        </div>
      </div>
      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {documents.map((doc) => (
          <div
            key={doc.doc_id}
            onClick={() => onSelect(doc.doc_id)}
            className={`group flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-all border ${
              activeDocId === doc.doc_id
                ? "border-foreground/30 bg-accent font-semibold"
                : "border-border hover:border-foreground/20 hover:bg-accent/40"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-xs font-mono text-muted-foreground truncate">{doc.doc_id}</span>
              <Badge variant="outline" className="text-xs shrink-0">
                {doc.chunk_count}
              </Badge>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(doc.doc_id);
                }}
                className="text-muted-foreground hover:text-foreground transition p-1"
                title="Copy document ID"
              >
                {copiedId === doc.doc_id ? (
                  <Check className="size-3.5 text-green-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
              <button
                onClick={(e) => handleDelete(doc.doc_id, e)}
                className="text-muted-foreground hover:text-destructive transition p-1"
                title="Delete document"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}