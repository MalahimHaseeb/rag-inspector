"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error for debugging
    console.error("Error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 border-destructive/30 bg-destructive/5">
        <div className="flex flex-col gap-4 items-center text-center">
          <AlertCircle className="size-12 text-destructive" />
          <div>
            <h2 className="font-display text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </div>
          <div className="flex gap-2 w-full">
            <Button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </div>
          <details className="w-full text-left">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              Error details
            </summary>
            <pre className="mt-2 text-xs bg-background rounded p-2 max-h-32 overflow-auto font-mono">
              {error.stack}
            </pre>
          </details>
        </div>
      </Card>
    </div>
  );
}
