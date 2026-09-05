import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Chunk } from "@/lib/api";

interface ChunkViewerProps {
  chunks: Chunk[];
  docId: string | null;
}

export function ChunkViewer({ chunks, docId }: ChunkViewerProps) {
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
        <span className="text-sm text-muted-foreground">{chunks.length} total</span>
      </div>
      <ScrollArea className="h-72 pr-3">
        <div className="flex flex-col gap-2">
          {chunks.map((chunk, i) => (
            <div key={i} className="border border-border rounded-md p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="secondary" className="font-mono text-xs">
                  {i}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {chunk.start_offset}:{chunk.end_offset}
                </span>
              </div>
              <p className="text-sm font-mono leading-relaxed line-clamp-3 text-foreground/90">
                {chunk.text}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}