"use client";

import { FileText, Copy, Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Chunk } from "@/lib/api";

interface ChunkViewerProps {
  chunks: Chunk[];
  docId: string | null;
}

export function ChunkViewer({ chunks, docId }: ChunkViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChunks = useMemo(() => {
    if (!searchTerm.trim()) return chunks;
    const term = searchTerm.toLowerCase();
    return chunks.filter((chunk) => chunk.text.toLowerCase().includes(term));
  }, [chunks, searchTerm]);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  if (!docId || chunks.length === 0) {
    return (
      <Card className="p-5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <h2 className="font-display text-lg">Chunks</h2>
        </div>
        <p className="text-sm text-muted-foreground">Upload a document to see how it was split.</p>
      </Card>
    );
  }

  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg">Chunks</h2>
        <span className="text-sm text-muted-foreground">{filteredChunks.length} / {chunks.length}</span>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search chunks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-8 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground/30 transition"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <ScrollArea className="h-72 pr-3">
        <div className="flex flex-col gap-2">
          {filteredChunks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No chunks match your search
            </div>
          ) : (
            filteredChunks.map((chunk, i) => {
              const originalIndex = chunks.indexOf(chunk);
              return (
                <div key={i} className="border border-border rounded-md p-3 hover:bg-accent/30 transition group">
                  <div className="flex items-center gap-2 mb-1.5 justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {originalIndex}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {chunk.start_offset}:{chunk.end_offset}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(chunk.text)}
                      className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-foreground"
                      title="Copy chunk text"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-mono leading-relaxed line-clamp-3 text-foreground/90">
                    {chunk.text}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}