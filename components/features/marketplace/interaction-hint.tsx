"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketplaceSafetyWarning } from "@/components/features/marketplace/safety";

type InteractionHintProps = {
  warnings: MarketplaceSafetyWarning[];
  className?: string;
};

export function InteractionHint({ warnings, className }: InteractionHintProps) {
  if (!warnings || warnings.length === 0) return null;

  const severity = warnings.some((warning) => warning.severity === "danger")
    ? "danger"
    : warnings.some((warning) => warning.severity === "warning")
      ? "warning"
      : "caution";

  const Icon = severity === "danger" ? ShieldAlert : severity === "warning" ? AlertTriangle : Info;

  const tone = {
    danger: "border-danger/50 bg-danger/10 text-danger",
    warning: "border-warning/50 bg-warning/10 text-warning",
    caution: "border-accent/40 bg-accent/10 text-accent-foreground",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "mt-3 flex gap-3 rounded-card border px-4 py-3 text-sm leading-snug outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        tone[severity],
        className,
      )}
      role="alert"
      tabIndex={0}
      aria-live="polite"
    >
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-background/70 text-current shadow-inner">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-current/90">
          Pengingat keamanan terapi
        </p>
        <ul className="space-y-1">
          {warnings.map((warning) => (
            <li key={warning.id} className="text-sm text-current/90">
              <span className="font-semibold text-current">
                {warning.type === "allergy" ? "Alergi" : "Obat"}: {warning.value}
              </span>
              <span className="ml-1 text-current/80">{warning.message}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
