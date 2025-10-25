"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { Bot, ShieldAlert, Stethoscope, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { RiskBadge } from "./risk-badge";
import type { RiskLevel } from "@/types/triage";

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

type ParsedBlock =
  | { type: "paragraph"; content: string }
  | { type: "list"; items: string[] }
  | { type: "code"; language: string; content: string };

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
      className="overflow-hidden rounded-card shadow-sm ring-1 ring-border/60"
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
        <div className={cn("space-y-3", isTyping && "text-muted-foreground/80")}>
          {isTyping ? <TypingIndicator /> : renderMessageContent(content)}
        </div>
      </div>
    </motion.article>
  );
}

function renderMessageContent(content: string) {
  const blocks = parseMarkdownBlocks(content);
  return blocks.map((block, index) => {
    if (block.type === "paragraph") {
      return (
        <p key={`p-${index}`} className="whitespace-pre-wrap text-sm text-foreground">
          {renderInline(block.content)}
        </p>
      );
    }
    if (block.type === "list") {
      return (
        <ul key={`list-${index}`} className="space-y-1 text-sm text-foreground">
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" aria-hidden="true" />
              <span className="flex-1">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <div
        key={`code-${index}`}
        className="rounded-card border border-border/60 bg-muted/40 text-xs"
        role="group"
        aria-label={`Blok kode ${block.language || "umum"}`}
      >
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>{block.language || "Snippet"}</span>
        </div>
        <pre className="overflow-x-auto px-3 py-3 text-[12px] leading-relaxed text-muted-foreground">
          <code>{block.content}</code>
        </pre>
      </div>
    );
  });
}

function parseMarkdownBlocks(text: string): ParsedBlock[] {
  const lines = text.split(/\r?\n/);
  const blocks: ParsedBlock[] = [];
  let buffer: string[] = [];
  let listBuffer: string[] = [];
  let inCode = false;
  let codeLang = "";
  let codeBuffer: string[] = [];

  const flushParagraph = () => {
    if (buffer.length) {
      blocks.push({ type: "paragraph", content: buffer.join("\n").trim() });
      buffer = [];
    }
  };

  const flushList = () => {
    if (listBuffer.length) {
      blocks.push({ type: "list", items: [...listBuffer] });
      listBuffer = [];
    }
  };

  const flushCode = () => {
    if (codeBuffer.length) {
      blocks.push({ type: "code", language: codeLang, content: codeBuffer.join("\n") });
      codeBuffer = [];
      codeLang = "";
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    const listMatch = line.trim().match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      listBuffer.push(listMatch[1]);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    if (listBuffer.length) {
      flushList();
    }
    buffer.push(line);
  }

  flushParagraph();
  flushList();
  if (inCode) {
    flushCode();
  }

  return blocks;
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-muted/60 px-1 py-0.5 font-mono text-[12px] text-muted-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
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
