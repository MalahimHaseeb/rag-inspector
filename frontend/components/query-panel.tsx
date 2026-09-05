"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runQuery, type QueryResponse } from "@/lib/api";

export function QueryPanel() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleSubmit() {
    if (!query.trim()) return;
    setStatus("loading");
    try {
      const res = await runQuery(query);
      setResult(res);
      setStatus("idle");
    } catch {
      setStatus("error");
      toast.error("Query failed. Check the backend and that a document is ingested.");
    }
  }

  return (
    <Card className="p-5 flex flex-col gap-4">
      <h2 className="font-display text-lg">Query</h2>

      <div className="flex gap-2">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask something about the uploaded document"
          className="min-h-0 h-10 resize-none"
          disabled={status === "loading"}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button onClick={handleSubmit} disabled={status === "loading"} className="flex items-center gap-1.5">
          {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {status === "loading" ? "Running..." : "Run"}
        </Button>
      </div>

      {result && (
        <Tabs defaultValue="response" className="w-full">
          <TabsList>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="retrieval">Retrieval</TabsTrigger>
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
          </TabsList>

          <TabsContent value="response" className="flex flex-col gap-3 mt-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm leading-relaxed">{result.answer}</p>
              <Badge
                variant={result.grounding.grounded ? "secondary" : "outline"}
                className={`shrink-0 font-mono text-xs ${
                  !result.grounding.grounded ? "border-destructive text-destructive" : ""
                }`}
              >
                {result.grounding.grounded ? "grounded" : "low overlap"} · {(result.grounding.overlap_ratio * 100).toFixed(0)}%
              </Badge>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-mono">
              <span>model: {result.model}</span>
              <span>latency: {result.latency_ms}ms</span>
              <span>prompt tokens: {result.usage.prompt_tokens}</span>
              <span>completion tokens: {result.usage.completion_tokens}</span>
              <span>total tokens: {result.usage.total_tokens}</span>
            </div>
          </TabsContent>

          <TabsContent value="retrieval" className="flex flex-col gap-2 mt-3">
            {result.retrieved_chunks.map((chunk) => (
              <div key={chunk.id} className="border border-border rounded-md p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-muted-foreground">{chunk.id}</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    distance {chunk.distance.toFixed(4)}
                  </Badge>
                </div>
                <p className="text-sm font-mono leading-relaxed text-foreground/90">{chunk.text}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="prompt" className="flex flex-col gap-3 mt-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">System</p>
              <pre className="text-sm font-mono whitespace-pre-wrap bg-code text-code-foreground rounded-md p-3">
                {result.prompt.system}
              </pre>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">User</p>
              <pre className="text-sm font-mono whitespace-pre-wrap bg-code text-code-foreground rounded-md p-3 max-h-64 overflow-auto">
                {result.prompt.user}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
}