"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  mode: "approve" | "reject";
  onClose: () => void;
  onConfirm: (note?: string) => void;
};

export function ApproveRejectDialog({ open, mode, onClose, onConfirm }: Props) {
  const [note, setNote] = useState("");
  const firstRef = useRef<HTMLButtonElement | null>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      prevFocus.current = document.activeElement as HTMLElement;
      setTimeout(() => firstRef.current?.focus(), 0);
    } else {
      prevFocus.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="rxdlg-backdrop"
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="rxdlg-panel"
            role="dialog"
            aria-modal="true"
            aria-label={mode === "approve" ? "Konfirmasi persetujuan" : "Konfirmasi penolakan"}
            className="fixed inset-0 z-50 grid place-items-center px-4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="w-full max-w-sm rounded-card border border-border/60 bg-card p-4 shadow-xl">
              <h3 className="text-sm font-semibold text-foreground">
                {mode === "approve" ? "Setujui resep ini?" : "Tolak resep ini?"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {mode === "approve"
                  ? "Anda dapat menambahkan catatan opsional."
                  : "Berikan alasan singkat penolakan (opsional)."}
              </p>
              <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Catatan
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 w-full rounded-input border border-border/70 bg-muted/30 px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                  rows={3}
                />
              </label>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  ref={firstRef}
                  className="tap-target inline-flex items-center justify-center rounded-button border border-border/70 bg-muted/40 px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={onClose}
                >
                  Batal
                </button>
                <button
                  className="tap-target inline-flex items-center justify-center rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => onConfirm(note.trim() || undefined)}
                >
                  {mode === "approve" ? "Setujui" : "Tolak"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

