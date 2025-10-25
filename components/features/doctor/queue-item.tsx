"use client";

import { motion } from "framer-motion";
import { Clock3, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { RiskBadge } from "@/components/features/ai-triage/risk-badge";
import type { RiskLevel } from "@/types/triage";

export type QueueStatus = "waiting" | "in-progress" | "done";

export type QueueEntry = {
  id: string;
  name: string;
  age: number;
  reason: string;
  status: QueueStatus;
  waitTime: string;
  lastInteraction: string;
  riskLevel: RiskLevel;
  notes?: string;
};

type QueueItemProps = {
  item: QueueEntry;
  isActive: boolean;
  onSelect: (id: string) => void;
};

const statusConfig: Record<
  QueueStatus,
  {
    label: string;
    badgeClass: string;
  }
> = {
  waiting: {
    label: "Menunggu",
    badgeClass: "bg-muted text-muted-foreground border border-border/60",
  },
  "in-progress": {
    label: "Sedang berjalan",
    badgeClass: "bg-primary/10 text-primary border border-primary/20",
  },
  done: {
    label: "Selesai",
    badgeClass: "bg-success/10 text-success border border-success/30",
  },
};

export function QueueItem({ item, isActive, onSelect }: QueueItemProps) {
  const status = statusConfig[item.status];

  return (
    <motion.button
      layout
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(item.id)}
      className={cn(
        "tap-target w-full rounded-card border border-border/70 bg-card p-4 text-left shadow-sm transition-all duration-normal ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "hover:shadow-md hover:border-primary/30",
        isActive && "border-primary/50 shadow-lg ring-1 ring-primary/40 hover:border-primary/50",
      )}
      aria-pressed={isActive}
      aria-label={`Pilih pasien ${item.name}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserRound className="h-4 w-4 text-primary" />
            <span>{item.name}</span>
            <span className="text-muted-foreground">· {item.age} th</span>
          </div>
          <p className="text-small text-muted-foreground">{item.reason}</p>
        </div>
        <span
          className={cn(
            "rounded-badge px-2.5 py-1 text-tiny font-semibold uppercase tracking-wide transition-all duration-fast ease-out",
            status.badgeClass,
          )}
        >
          {status.label}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RiskBadge level={item.riskLevel} />
        {item.notes ? <span className="text-tiny text-muted-foreground">{item.notes}</span> : null}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-3.5 w-3.5 text-primary" />
          Antri {item.waitTime}
        </span>
        <span>Diperbarui {item.lastInteraction}</span>
      </div>
    </motion.button>
  );
}
