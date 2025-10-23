"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

export function MessageComposer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "0px";
    ref.current.style.height = Math.min(ref.current.scrollHeight, 160) + "px";
  }, [text]);
  return (
    <div className="flex items-end gap-2 rounded-card border border-border/60 bg-card p-2 shadow-sm" role="region" aria-label="Tulis pesan">
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={1}
        placeholder="Tulis balasan..."
        className="tap-target block w-full resize-none rounded-input bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground/70"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (text.trim()) {
              onSend(text.trim());
              setText("");
            }
          }
        }}
      />
      <button
        type="button"
        onClick={() => {
          if (!text.trim()) return;
          onSend(text.trim());
          setText("");
        }}
        className="tap-target inline-flex items-center justify-center rounded-button bg-primary-gradient px-3 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg"
        aria-label="Kirim"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}

