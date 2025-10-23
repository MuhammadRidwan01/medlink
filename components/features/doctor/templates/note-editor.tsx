"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, cubicBezier, motion } from "framer-motion";
import { Save, StickyNote, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { NoteTemplate } from "./mock-data";

type SectionKey = "cc" | "hpi" | "ros" | "pe" | "plan";

const SECTION_LABELS: Record<SectionKey, string> = {
  cc: "Chief Complaint",
  hpi: "History of Present Illness",
  ros: "Review of Systems",
  pe: "Physical Examination",
  plan: "Assessment & Plan",
};

type NoteEditorProps = {
  template: NoteTemplate | null;
  onClose: () => void;
  onSaveDraft?: (template: NoteTemplate, content: Record<SectionKey, string>) => void;
};

export function NoteEditor({ template, onClose, onSaveDraft }: NoteEditorProps) {
  const standardEase = cubicBezier(0.2, 0.8, 0.2, 1);
  const { toast } = useToast();
  const [content, setContent] = useState<Record<SectionKey, string>>({
    cc: "",
    hpi: "",
    ros: "",
    pe: "",
    plan: "",
  });

  useEffect(() => {
    if (template) {
      setContent({
        cc: template.content.cc,
        hpi: template.content.hpi,
        ros: template.content.ros,
        pe: template.content.pe,
        plan: template.content.plan,
      });
      const timeout = setTimeout(() => {
        document.getElementById("note-editor-cc")?.focus();
      }, 120);
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        clearTimeout(timeout);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [template, onClose]);

  if (!template) {
    return null;
  }

  const handleSave = () => {
    onSaveDraft?.(template, content);
    toast({
      title: "Template disimpan",
      description: `${template.title} tersimpan sebagai draft.`,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        key="note-editor-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16, ease: standardEase }}
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        key={template.id}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.16, ease: standardEase }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-3xl border-l border-border/60 bg-background shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={`Editor catatan untuk ${template.title}`}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-start justify-between border-b border-border/60 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Template catatan
              </p>
              <h2 className="text-lg font-semibold text-foreground">{template.title}</h2>
              <p className="text-xs text-muted-foreground">{template.specialty}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="tap-target rounded-full border border-border/60 bg-muted/40 p-2 text-muted-foreground transition duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:bg-muted/60"
              aria-label="Tutup editor catatan"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            {Object.entries(SECTION_LABELS).map(([key, label]) => {
              const sectionKey = key as SectionKey;
              return (
                <section
                  key={sectionKey}
                  className="space-y-2 rounded-card border border-border/60 bg-card p-4 shadow-sm"
                >
                  <header className="flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-primary" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-foreground">{label}</h3>
                  </header>
                  <textarea
                    id={sectionKey === "cc" ? "note-editor-cc" : undefined}
                    value={content[sectionKey]}
                    onChange={(event) =>
                      setContent((prev) => ({ ...prev, [sectionKey]: event.target.value }))
                    }
                    className="tap-target min-h-[120px] w-full rounded-card border border-border/60 bg-muted/20 px-3 py-2 text-sm text-foreground outline-none transition duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={label}
                  />
                </section>
              );
            })}
          </div>

          <footer className="safe-area-bottom flex items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-6 py-4">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-badge border border-primary/30 bg-primary/10 px-3 py-1 font-semibold text-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="tap-target inline-flex items-center gap-2 rounded-button bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-lg transition duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:shadow-xl active:scale-[0.98]"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Simpan sebagai draft
            </button>
          </footer>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
