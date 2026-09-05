"use client";

import { Trash2, FileStack } from "lucide-react";
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
  if (documents.length === 0) return null;

  async function handleDelete(docId: string, e: React.MouseEvent) {
    e.stopPropagation();
    await deleteDocument(docId);
    onDeleted(docId);
    toast.success("Document removed");
  }

  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <FileStack className="size-4 text-muted-foreground" />
        <h2 className="font-display text-lg">In store</h2>
      </div>
      <div className="flex flex-col gap-1.5">
        {documents.map((doc) => (
          <div
            key={doc.doc_id}
            onClick={() => onSelect(doc.doc_id)}
            className={`flex items-center justify-between rounded-md px-3 py-2 cursor-pointer transition-colors border ${
              activeDocId === doc.doc_id
                ? "border-foreground/30 bg-accent"
                : "border-border hover:bg-accent/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">{doc.doc_id}</span>
              <Badge variant="secondary" className="text-xs">
                {doc.chunk_count} chunks
              </Badge>
            </div>
            <button
              onClick={(e) => handleDelete(doc.doc_id, e)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}