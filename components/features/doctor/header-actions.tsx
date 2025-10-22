"use client";

import { motion } from "framer-motion";
import { FileText, PlayCircle, Square } from "lucide-react";

type DraftProgress = "idle" | "draft" | "awaiting_approval";

type HeaderActionsProps = {
  isActive: boolean;
  onToggle: () => void;
  onCreateDraft: () => void;
  draftStatus?: DraftProgress;
};

export function HeaderActions({ isActive, onToggle, onCreateDraft, draftStatus = "idle" }: HeaderActionsProps) {
  const draftLabel =
    draftStatus === "awaiting_approval"
      ? "Menunggu persetujuan"
      : draftStatus === "draft"
        ? "Draf siap"
        : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border/60 bg-card px-4 py-3 shadow-sm">
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-foreground">Konsultasi</p>
        <p className="text-xs text-muted-foreground">
          {isActive
            ? "Sedang berjalan - catatan dan tindakan akan disinkronkan"
            : "Mulai sesi untuk membuka catatan dokter dan pesan pasien"}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onCreateDraft}
          className="tap-target inline-flex items-center gap-2 rounded-button border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-all duration-fast ease-out hover:border-primary/40 hover:bg-primary/20"
        >
          <FileText className="h-4 w-4" />
          Buat Draf Resep
        </motion.button>
        {draftLabel ? (
          <span className="rounded-badge border border-warning/40 bg-warning/10 px-3 py-1 text-tiny font-semibold uppercase tracking-wide text-warning">
            {draftLabel}
          </span>
        ) : null}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onToggle}
          className="tap-target inline-flex items-center gap-2 rounded-button bg-primary-gradient px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-fast ease-out hover:shadow-lg"
        >
          {isActive ? (
            <>
              <Square className="h-4 w-4" />
              Akhiri Konsultasi
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              Mulai Konsultasi
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
