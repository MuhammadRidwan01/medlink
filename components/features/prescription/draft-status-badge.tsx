"use client";

import { cn } from "@/lib/utils";

export type DraftStatus = "draft" | "awaiting_approval" | "approved" | "rejected";

export function DraftStatusBadge({ status }: { status: DraftStatus }) {
  const mapping: Record<DraftStatus, { label: string; className: string }> = {
    draft: { label: "Draft", className: "border-border/70 bg-muted/30 text-muted-foreground" },
    awaiting_approval: {
      label: "Menunggu persetujuan",
      className: "border-warning/30 bg-warning/10 text-warning",
    },
    approved: { label: "Disetujui", className: "border-primary/30 bg-primary/10 text-primary" },
    rejected: { label: "Ditolak", className: "border-danger/30 bg-danger/10 text-danger" },
  };
  const cfg = mapping[status];
  return (
    <span className={cn("rounded-badge px-3 py-1 text-tiny font-semibold uppercase tracking-wide border", cfg.className)}>
      {cfg.label}
    </span>
  );
}

