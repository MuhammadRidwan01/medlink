"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ChatMessage,
  type ChatMessageProps,
} from "@/components/features/ai-triage/chat-message";

type MessagesPaneProps = {
  messages: ChatMessageProps[];
  sessionActive: boolean;
  active: boolean;
};

export function MessagesPane({ messages, sessionActive, active }: MessagesPaneProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  // Keep scroll pinned to latest when activated or new messages arrive
  useEffect(() => {
    if (!active || !listRef.current) return;
    const el = listRef.current;
    el.scrollTop = el.scrollHeight;
  }, [active, messages.length]);

  return (
    <motion.div
      key="messages-pane"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="flex h-full flex-col gap-4 p-4"
    >
      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto pr-1"
        aria-live="polite"
      >
        {/* System chips for session lifecycle */}
        <div className="sticky top-0 z-10 flex justify-center pt-1">
          <span
            className={cn(
              "rounded-badge border px-3 py-1 text-tiny font-semibold uppercase tracking-wide",
              sessionActive
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border/60 bg-muted/40 text-muted-foreground",
            )}
            role="status"
          >
            {sessionActive ? "Sesi dimulai" : "Sesi diakhiri"}
          </span>
        </div>

        {messages.map((m) => (
          <ChatMessage key={m.id} {...m} />
        ))}
      </div>

      <div className="rounded-card border border-dashed border-border/70 p-3 text-sm text-muted-foreground">
        Input pesan dan catatan akan tersedia setelah integrasi realtime.
      </div>
    </motion.div>
  );
}

