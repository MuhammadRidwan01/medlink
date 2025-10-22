"use client";

import { motion } from "framer-motion";
import { AlarmCheck, AlarmClock, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export type DoseStatus = "due" | "soon" | "taken" | "missed";

type DoseNodeProps = {
  id: string;
  label: string;
  time: string;
  medication: string;
  strength: string;
  status: DoseStatus;
  isNext: boolean;
  onClick?: () => void;
};

const statusConfig: Record<
  DoseStatus,
  {
    container: string;
    badge: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
  }
> = {
  due: {
    container: "border-primary/40 bg-primary/5 text-primary",
    badge: "bg-primary text-primary-foreground",
    label: "Jadwalkan",
    icon: AlarmClock,
  },
  soon: {
    container: "border-warning/40 bg-warning/10 text-warning",
    badge: "bg-warning text-white",
    label: "Segera",
    icon: AlarmCheck,
  },
  taken: {
    container: "border-success/40 bg-success/10 text-success",
    badge: "bg-success text-white",
    label: "Diambil",
    icon: CheckCircle2,
  },
  missed: {
    container: "border-danger/40 bg-danger/10 text-danger",
    badge: "bg-danger text-white",
    label: "Terlewat",
    icon: XCircle,
  },
};

const nextBadgeClass =
  "absolute -top-3 left-1/2 -translate-x-1/2 rounded-badge border border-accent/40 bg-accent/10 px-2 py-1 text-tiny font-semibold uppercase tracking-wide text-accent";

export function DoseNode({
  id,
  label,
  time,
  medication,
  strength,
  status,
  isNext,
  onClick,
}: DoseNodeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.button
      layoutId={`dose-${id}`}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "tap-target relative flex min-w-[180px] flex-col gap-3 rounded-card border px-4 py-3 text-left shadow-sm transition-all duration-fast ease-out hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        config.container,
      )}
      aria-label={`${medication} ${strength} ${label} pukul ${time} status ${config.label}`}
    >
      {isNext ? (
        <motion.span
          layoutId="dose-next-badge"
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          className={nextBadgeClass}
        >
          Selanjutnya
        </motion.span>
      ) : null}
      <header className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
        <span>{label}</span>
        <span className="inline-flex items-center gap-1 rounded-badge px-2 py-1 text-tiny text-xs leading-none shadow-sm">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {time}
        </span>
      </header>
      <div className="space-y-1">
        <p className="text-sm font-semibold">{medication}</p>
        <p className="text-xs text-muted-foreground">{strength}</p>
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-badge px-2 py-1 text-tiny shadow-sm",
            config.badge,
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {config.label}
        </span>
      </div>
    </motion.button>
  );
}
