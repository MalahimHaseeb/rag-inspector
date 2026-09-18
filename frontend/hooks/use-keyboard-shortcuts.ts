import { useEffect } from "react";

interface KeyboardShortcutConfig {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcutConfig) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      // Format the key combination
      const keyCombo = ctrl ? `ctrl+${key}` : key;

      if (shortcuts[keyCombo]) {
        e.preventDefault();
        shortcuts[keyCombo]();
      } else if (shortcuts[key]) {
        // Check if we're in an input/textarea
        const target = e.target as HTMLElement;
        const isInputTarget =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.contentEditable === "true";

        // Only trigger non-ctrl shortcuts if not in input
        if (!isInputTarget) {
          e.preventDefault();
          shortcuts[key]();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
