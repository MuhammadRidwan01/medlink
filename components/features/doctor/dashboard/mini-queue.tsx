"use client";

import { motion } from "framer-motion";
import { Clock3, PlayCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QueueEntry } from "../queue-item";

type MiniQueueProps = {
  queue: QueueEntry[];
};

const statusIcon: Record<QueueEntry["status"], typeof Clock3> = {
  waiting: Clock3,
  "in-progress": PlayCircle,
  done: CheckCircle2,
};

export function MiniQueue({ queue }: MiniQueueProps) {
  return (
    <section className="rounded-card border border-border/60 bg-card p-4 shadow-sm">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Antrean hari ini</h2>
          <p className="text-xs text-muted-foreground">
            Status real-time, konsisten dengan workspace konsultasi.
          </p>
        </div>
        <span className="rounded-badge border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {queue.length} pasien
        </span>
      </header>

      <ul className="mt-4 space-y-3">
        {queue.slice(0, 5).map((entry, index) => {
          const Icon = statusIcon[entry.status];
          return (
            <motion.li
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1], delay: index * 0.02 }}
              className="flex items-center justify-between gap-3 rounded-card border border-border/60 bg-muted/30 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border",
                    entry.status === "waiting"
                      ? "border-warning/30 bg-warning/10 text-warning"
                      : entry.status === "in-progress"
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-success/30 bg-success/10 text-success",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.reason} • {entry.waitTime} tunggu
                  </p>
                </div>
              </div>
              <span className="rounded-badge border border-border/40 bg-card/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {entry.status === "waiting"
                  ? "Menunggu"
                  : entry.status === "in-progress"
                    ? "Berjalan"
                    : "Selesai"}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
