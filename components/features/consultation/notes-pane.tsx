"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { NOTE_TEMPLATES } from "@/components/features/doctor/templates/mock-data";
import { cn } from "@/lib/utils";

type SnapshotPrefill = {
  cc?: string;
  hpi?: string;
  redFlags?: string[];
};

type NotesPaneProps = {
  snapshot?: SnapshotPrefill;
};

export function NotesPane({ snapshot }: NotesPaneProps) {
  const [cc, setCc] = useState("");
  const [hpi, setHpi] = useState("");
  const [ros, setRos] = useState("");
  const [pe, setPe] = useState("");
  const [plan, setPlan] = useState("");
  const [dirty, setDirty] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const hasPrefilled = useRef(false);
  const { toast } = useToast();

  // Prefill CC/HPI once from snapshot
  useEffect(() => {
    if (hasPrefilled.current) return;
    if (snapshot) {
      if (snapshot.cc && !cc) setCc(snapshot.cc);
      if (snapshot.hpi && !hpi) setHpi(snapshot.hpi);
      hasPrefilled.current = true;
    }
  }, [snapshot, cc, hpi]);

  // Autosave every 1.5s when dirty
  useEffect(() => {
    if (!dirty) return;
    const t = window.setTimeout(() => {
      setDirty(false);
      toast({ title: "Catatan disimpan", description: "Autosave berjalan." });
    }, 1500);
    return () => window.clearTimeout(t);
  }, [dirty, toast]);

  const applyTemplate = (content: {
    cc: string;
    hpi: string;
    ros: string;
    pe: string;
    plan: string;
  }) => {
    setCc((prev) => (prev ? prev + "\n\n" : "") + content.cc);
    setHpi((prev) => (prev ? prev + "\n\n" : "") + content.hpi);
    setRos((prev) => (prev ? prev + "\n\n" : "") + content.ros);
    setPe((prev) => (prev ? prev + "\n\n" : "") + content.pe);
    setPlan((prev) => (prev ? prev + "\n\n" : "") + content.plan);
    setDirty(true);
    setPickerOpen(false);
  };

  // Lightweight markdown helpers: continue lists with Enter; Ctrl+1/2/3 adds #/##/###
  const handleKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (ev.ctrlKey) {
      if (ev.key === "1") wrapLineWith(ev.currentTarget, "# ");
      if (ev.key === "2") wrapLineWith(ev.currentTarget, "## ");
      if (ev.key === "3") wrapLineWith(ev.currentTarget, "### ");
    }
    if (ev.key === "Enter") {
      const { selectionStart } = ev.currentTarget;
      const value = ev.currentTarget.value;
      const start = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const line = value.slice(start, selectionStart);
      const match = line.match(/^([-*] |\d+\. )/);
      if (match) {
        ev.preventDefault();
        const insert = "\n" + match[1];
        insertText(ev.currentTarget, insert);
      }
    }
  };

  return (
    <motion.div
      key="notes-pane"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="flex h-full flex-col gap-4 p-4"
    >
      {/* Snapshot red flags display if any */}
      {snapshot?.redFlags?.length ? (
        <div className="rounded-card border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          <span className="font-semibold">Red flags:</span> {snapshot.redFlags.join(" • ")}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">Catatan Konsultasi</p>
          <p className="text-xs text-muted-foreground">Markdown ringan didukung: daftar, header</p>
        </div>
        <button
          type="button"
          className="tap-target inline-flex items-center gap-2 rounded-button border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setPickerOpen((v) => !v)}
          aria-expanded={pickerOpen}
          aria-controls="template-picker"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Quick insert
        </button>
      </div>

      <AnimatePresence>
        {pickerOpen ? (
          <motion.div
            id="template-picker"
            key="template-picker"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="rounded-card border border-border/60 bg-card p-3 shadow-lg"
            role="dialog"
            aria-label="Pilih template catatan"
          >
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Template</div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {NOTE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyTemplate(tpl.content)}
                  className="tap-target rounded-card border border-border/60 bg-background p-3 text-left text-sm font-semibold text-foreground transition hover:border-primary/30 hover:shadow"
                >
                  <div>{tpl.title}</div>
                  <div className="mt-0.5 text-xs font-normal text-muted-foreground">{tpl.tags.join(" • ")}</div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field
          id="cc"
          label="CC"
          placeholder="Keluhan utama pasien"
          value={cc}
          onChange={(v) => {
            setCc(v);
            setDirty(true);
          }}
          onKeyDown={handleKeyDown}
        />
        <Field
          id="hpi"
          label="HPI"
          placeholder="Riwayat penyakit sekarang"
          value={hpi}
          onChange={(v) => {
            setHpi(v);
            setDirty(true);
          }}
          onKeyDown={handleKeyDown}
        />
        <Field
          id="ros"
          label="ROS"
          placeholder="Review of systems"
          value={ros}
          onChange={(v) => {
            setRos(v);
            setDirty(true);
          }}
          onKeyDown={handleKeyDown}
        />
        <Field
          id="pe"
          label="PE"
          placeholder="Pemeriksaan fisik"
          value={pe}
          onChange={(v) => {
            setPe(v);
            setDirty(true);
          }}
          onKeyDown={handleKeyDown}
        />
        <div className="md:col-span-2">
          <Field
            id="plan"
            label="Plan"
            placeholder="Rencana tindak lanjut dan terapi"
            value={plan}
            onChange={(v) => {
              setPlan(v);
              setDirty(true);
            }}
            onKeyDown={handleKeyDown}
            rows={5}
          />
        </div>
      </div>
    </motion.div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  onKeyDown,
  rows = 4,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onKeyDown?: (ev: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}) {
  return (
    <label className="space-y-2" htmlFor={id}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        rows={rows}
        className={cn(
          "tap-target w-full resize-y rounded-input border border-border/70 bg-muted/30 px-3 py-2 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground/70",
          "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring",
        )}
        placeholder={placeholder}
        aria-label={label}
      />
    </label>
  );
}

function wrapLineWith(el: HTMLTextAreaElement, prefix: string) {
  const { selectionStart } = el;
  const value = el.value;
  const start = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const before = value.slice(0, start);
  const after = value.slice(start);
  el.value = before + prefix + after;
  const pos = start + prefix.length;
  el.selectionStart = el.selectionEnd = pos;
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

function insertText(el: HTMLTextAreaElement, insert: string) {
  const { selectionStart, selectionEnd, value } = el;
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);
  el.value = before + insert + after;
  const pos = before.length + insert.length;
  el.selectionStart = el.selectionEnd = pos;
  el.dispatchEvent(new Event("input", { bubbles: true }));
}
