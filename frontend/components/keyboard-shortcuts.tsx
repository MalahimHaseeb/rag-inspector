"use client";

import { useState, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-foreground transition p-2"
        title="Keyboard shortcuts"
      >
        <HelpCircle className="size-5" />
      </button>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={() => setIsOpen(false)}
    >
      <Card 
        className="w-full max-w-sm p-6 max-h-96 overflow-y-auto"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">Keyboard Shortcuts</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Submit query</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl/Cmd + Enter</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Focus query input</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl/Cmd + K</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Toggle theme</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl/Cmd + Shift + K</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Close this dialog</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Esc</kbd>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
