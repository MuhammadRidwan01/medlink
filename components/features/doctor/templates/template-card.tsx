"use client";

import { motion } from "framer-motion";
import { Bookmark, BookOpen } from "lucide-react";
import type { NoteTemplate } from "./mock-data";

type TemplateCardProps = {
  template: NoteTemplate;
  onSelect: (template: NoteTemplate) => void;
};

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(template)}
      className="tap-target flex h-full flex-col items-start justify-between rounded-card border border-border/60 bg-card p-4 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="space-y-2">
        <span className="inline-flex items-center gap-2 rounded-badge border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
          <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
          {template.specialty}
        </span>
        <h3 className="text-base font-semibold text-foreground">{template.title}</h3>
        <p className="text-xs text-muted-foreground">
          {template.content.cc.slice(0, 80)}
          {template.content.cc.length > 80 ? "…" : ""}
        </p>
      </div>
      <div className="mt-4 flex w-full items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-badge border border-border/50 bg-muted/40 px-2 py-1 uppercase tracking-wide"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          Gunakan
        </span>
      </div>
    </motion.button>
  );
}
