"use client";

import { cn } from "@/lib/utils";
import type { SlotStatus } from "./store";

export function SlotChip({ status, label }: { status: SlotStatus; label: string }) {
  const cls = status === "open" ? "border-primary/30 bg-primary/10 text-primary" : status === "booked" ? "border-success/30 bg-success/10 text-success" : "border-border/60 bg-muted/30 text-muted-foreground";
  return <span className={cn("rounded-badge border px-2 py-0.5 text-tiny font-semibold uppercase tracking-wide", cls)}>{label}</span>;
}

