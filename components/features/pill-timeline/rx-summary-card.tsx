"use client";

import { motion } from "framer-motion";
import { Pill, Target } from "lucide-react";

type RxSummaryCardProps = {
  name: string;
  description: string;
  adherence: number;
  nextDoseLabel: string;
  nextDoseTime: string;
  onOpenTimeline?: () => void;
};

export function RxSummaryCard({
  name,
  description,
  adherence,
  nextDoseLabel,
  nextDoseTime,
  onOpenTimeline,
}: RxSummaryCardProps) {
  const adherencePercent = Math.round(adherence * 100);
  const adherenceColor =
    adherencePercent >= 90
      ? "bg-success/10 text-success border-success/30"
      : adherencePercent >= 70
        ? "bg-warning/10 text-warning border-warning/30"
        : "bg-danger/10 text-danger border-danger/30";

  return (
    <motion.article
      layout
      className="card-surface flex flex-col justify-between gap-4 border border-border/60 p-4 shadow-md"
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="rounded-card bg-primary/10 p-2 text-primary">
          <Pill className="h-5 w-5" aria-hidden="true" />
        </span>
      </header>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
          <span>Adherence</span>
          <span>{adherencePercent}%</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            layout
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${adherencePercent}%` }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-card border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Dosis berikutnya</p>
            <p>{nextDoseLabel} • {nextDoseTime}</p>
          </div>
        </div>
        <span className={`rounded-badge border px-3 py-1 text-tiny font-semibold uppercase tracking-wide ${adherenceColor}`}>
          {adherencePercent >= 90 ? "Baik" : adherencePercent >= 70 ? "Perlu fokus" : "Butuh perhatian"}
        </span>
      </div>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onOpenTimeline}
        className="tap-target inline-flex items-center justify-center rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-fast ease-out hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Lihat Jadwal
      </motion.button>
    </motion.article>
  );
}
