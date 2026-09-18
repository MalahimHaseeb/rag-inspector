"use client";

import { useState, forwardRef } from "react";
import { Send, Loader2, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runQuery, type QueryResponse } from "@/lib/api";

export const QueryPanel = forwardRef<HTMLTextAreaElement, {}>(function QueryPanelContent(props, ref) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyToClipboard(text: string, id?: string) {
    navigator.clipboard.writeText(text);
    if (id) setCopiedId(id);
    toast.success("Copied to clipboard");
    if (id) setTimeout(() => setCopiedId(null), 2000);
  }

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
        <div className="flex-1 flex flex-col">
          <Textarea
            ref={ref}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask something about the uploaded document (Ctrl+Enter to submit)"
            className="flex-1 min-h-12 resize-vertical"
            disabled={status === "loading"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>
        <Button onClick={handleSubmit} disabled={status === "loading" || !query.trim()} className="flex items-center gap-1.5 self-end">
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
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground font-mono">
              <div className="flex items-center justify-between bg-accent/30 rounded px-2 py-1.5">
                <span>model:</span>
                <span className="font-semibold">{result.model}</span>
              </div>
              <div className="flex items-center justify-between bg-accent/30 rounded px-2 py-1.5">
                <span>latency:</span>
                <span className="font-semibold">{result.latency_ms}ms</span>
              </div>
              <div className="flex items-center justify-between bg-accent/30 rounded px-2 py-1.5">
                <span>prompt:</span>
                <span className="font-semibold">{result.usage.prompt_tokens}</span>
              </div>
              <div className="flex items-center justify-between bg-accent/30 rounded px-2 py-1.5">
                <span>completion:</span>
                <span className="font-semibold">{result.usage.completion_tokens}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="retrieval" className="flex flex-col gap-2 mt-3">
            {result.retrieved_chunks.map((chunk) => (
              <div key={chunk.id} className="border border-border rounded-md p-3 hover:bg-accent/30 transition group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{chunk.id}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {chunk.distance.toFixed(4)}
                    </Badge>
                  </div>
                  <button
                    onClick={() => copyToClipboard(chunk.text, `chunk-${chunk.id}`)}
                    className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-foreground"
                    title="Copy chunk text"
                  >
                    {copiedId === `chunk-${chunk.id}` ? (
                      <Check className="size-3.5 text-green-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-sm font-mono leading-relaxed text-foreground/90 line-clamp-4">{chunk.text}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="prompt" className="flex flex-col gap-3 mt-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-muted-foreground font-semibold">System</p>
                <button
                  onClick={() => copyToClipboard(result.prompt.system, "system-prompt")}
                  className="text-muted-foreground hover:text-foreground transition text-xs flex items-center gap-1"
                >
                  {copiedId === "system-prompt" ? (
                    <><Check className="size-3" /> Copied</>
                  ) : (
                    <><Copy className="size-3" /> Copy</>
                  )}
                </button>
              </div>
              <pre className="text-sm font-mono whitespace-pre-wrap bg-code text-code-foreground rounded-md p-3">
                {result.prompt.system}
              </pre>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-muted-foreground font-semibold">User</p>
                <button
                  onClick={() => copyToClipboard(result.prompt.user, "user-prompt")}
                  className="text-muted-foreground hover:text-foreground transition text-xs flex items-center gap-1"
                >
                  {copiedId === "user-prompt" ? (
                    <><Check className="size-3" /> Copied</>
                  ) : (
                    <><Copy className="size-3" /> Copy</>
                  )}
                </button>
              </div>
              <pre className="text-sm font-mono whitespace-pre-wrap bg-code text-code-foreground rounded-md p-3 max-h-64 overflow-auto">
                {result.prompt.user}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
});