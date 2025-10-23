"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { addClinicalOrder, type OrderKind } from "./clinical-store";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (id: string) => void;
};

export function NewOrderDialog({ open, onOpenChange, onCreated }: Props) {
  const [kind, setKind] = useState<OrderKind>("lab");
  const [patient, setPatient] = useState("");
  const [priority, setPriority] = useState<"normal" | "high" | "stat">("normal");
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
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="neworder-backdrop"
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
          <motion.div
            key="neworder-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Tambah order"
            className="fixed inset-0 z-50 grid place-items-center px-4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="w-full max-w-md space-y-4 rounded-card border border-border/60 bg-card p-4 shadow-xl">
              <header className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Order Baru</h3>
                <button
                  ref={firstRef}
                  className="tap-target inline-flex items-center justify-center rounded-button border border-border/60 bg-muted/40 p-2 text-muted-foreground hover:bg-muted/60"
                  onClick={() => onOpenChange(false)}
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>
              <div className="space-y-3">
                <label className="block space-y-1 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipe</span>
                  <select value={kind} onChange={(e) => setKind(e.target.value as OrderKind)} className="tap-target w-full rounded-input border border-border/70 bg-muted/30 px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="lab">Lab</option>
                    <option value="imaging">Imaging</option>
                  </select>
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pasien</span>
                  <input value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Nama pasien" className="tap-target w-full rounded-input border border-border/70 bg-muted/30 px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring" />
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prioritas</span>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as "normal" | "high" | "stat")} className="tap-target w-full rounded-input border border-border/70 bg-muted/30 px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="stat">STAT</option>
                  </select>
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Catatan</span>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="tap-target w-full rounded-input border border-border/70 bg-muted/30 px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring" />
                </label>
              </div>
              <footer className="flex items-center justify-end gap-2">
                <button className="tap-target inline-flex items-center justify-center rounded-button border border-border/70 bg-muted/40 px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => onOpenChange(false)}>
                  Batal
                </button>
                <button
                  className="tap-target inline-flex items-center justify-center rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!patient.trim()}
                  onClick={() => {
                    const id = addClinicalOrder({ kind, patient: patient.trim(), priority, note: note.trim() || undefined });
                    onOpenChange(false);
                    onCreated?.(id);
                  }}
                >
                  Tambah
                </button>
              </footer>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
