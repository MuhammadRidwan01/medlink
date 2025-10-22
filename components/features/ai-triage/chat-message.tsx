"use client";

import { motion } from "framer-motion";
import { Bot, ShieldAlert, Stethoscope, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "./risk-badge";
import { RiskBadge } from "./risk-badge";

export type MessageAuthor = "ai" | "user" | "doctor";

export type ChatMessageProps = {
  id: string;
  role: MessageAuthor;
  content: string;
  timestamp?: string;
  riskLevel?: RiskLevel;
  redFlag?: string;
  isTyping?: boolean;
};

const roleConfig: Record<
  MessageAuthor,
  { label: string; icon: React.ComponentType<{ className?: string }>; header: string; body: string }
> = {
  ai: {
    label: "MedLink AI",
    icon: Bot,
    header: "bg-gradient-to-r from-primary/90 to-primary-dark text-white",
    body: "bg-primary/5 text-foreground",
  },
  user: {
    label: "Anda",
    icon: User,
    header: "bg-muted text-foreground",
    body: "bg-card text-foreground",
  },
  doctor: {
    label: "Dokter",
    icon: Stethoscope,
    header: "bg-secondary text-white",
    body: "bg-card text-foreground",
  },
};

export function ChatMessage({
  id,
  role,
  content,
  timestamp,
  riskLevel,
  redFlag,
  isTyping,
}: ChatMessageProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <motion.article
      layout
      key={id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "animate-in overflow-hidden rounded-card shadow-sm ring-1 ring-border/60",
        role === "ai" ? "animate-slide-in-from-bottom" : "animate-slide-in-from-bottom",
      )}
    >
      <header
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-sm font-semibold uppercase tracking-wider",
          config.header,
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <Icon className="h-5 w-5" />
        </span>
        <span className="flex-1">{config.label}</span>
        {timestamp ? (
          <span className="text-xs font-medium opacity-80">{timestamp}</span>
        ) : null}
      </header>
      <div className={cn("space-y-3 px-4 py-4 text-body leading-relaxed", config.body)}>
        {riskLevel ? <RiskBadge level={riskLevel} /> : null}
        {redFlag ? (
          <p className="flex items-start gap-2 rounded-card bg-danger/10 p-3 text-small text-danger">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {redFlag}
          </p>
        ) : null}
        <p className={cn("whitespace-pre-wrap", isTyping && "text-muted-foreground/80")}>
          {isTyping ? <TypingIndicator /> : content}
        </p>
      </div>
    </motion.article>
  );
}

function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-2 w-2 rounded-full bg-primary/70 animate-typing-dot" />
      <span
        className="h-2 w-2 rounded-full bg-primary/70 animate-typing-dot"
        style={{ animationDelay: "0.15s" }}
      />
      <span
        className="h-2 w-2 rounded-full bg-primary/70 animate-typing-dot"
        style={{ animationDelay: "0.3s" }}
      />
    </span>
  );
}
