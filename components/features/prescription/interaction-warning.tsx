"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type InteractionSeverity = "low" | "moderate" | "high";

type InteractionWarningProps = {
  severity: InteractionSeverity;
  title: string;
  message: string;
  recommendation?: string;
};

const severityConfig: Record<
  InteractionSeverity,
  {
    container: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  low: {
    container: "border-accent/30 bg-accent/10 text-accent",
    icon: Sparkles,
  },
  moderate: {
    container: "border-warning/40 bg-warning/10 text-warning",
    icon: AlertTriangle,
  },
  high: {
    container: "border-danger/40 bg-danger text-white",
    icon: ShieldAlert,
  },
};

export function InteractionWarning({
  severity,
  title,
  message,
  recommendation,
}: InteractionWarningProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "rounded-card border px-4 py-3 shadow-sm",
        config.container,
      )}
    >
      <header className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-current">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold uppercase tracking-wide">
            {title}
          </p>
          <p className="text-small leading-relaxed">{message}</p>
          {recommendation ? (
            <p className="text-xs font-medium text-current/90">
              Rekomendasi: {recommendation}
            </p>
          ) : null}
        </div>
      </header>
    </motion.article>
  );
}
