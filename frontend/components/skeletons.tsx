"use client";

import { Card } from "@/components/ui/card";

export function ChunkSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border border-border rounded-md p-3 animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-12 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
          <div className="space-y-1">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DocumentListSkeleton() {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="h-6 bg-muted rounded w-32 animate-pulse" />
      <div className="space-y-1.5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-md px-3 py-2 bg-muted/50 animate-pulse">
            <div className="h-4 bg-muted rounded w-40 flex-1" />
            <div className="h-4 bg-muted rounded w-12" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function QueryResultSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-20 bg-muted rounded p-3" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 bg-muted rounded flex-1" />
        ))}
      </div>
    </div>
  );
}
