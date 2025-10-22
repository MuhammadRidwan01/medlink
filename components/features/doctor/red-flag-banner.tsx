"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";
import { useState, type ComponentType } from "react";
import { cn } from "@/lib/utils";

export type RedFlagSeverity = "warning" | "danger";

type RedFlagBannerProps = {
  visible: boolean;
  severity: RedFlagSeverity;
  title: string;
  message: string;
  onDismiss: () => void;
  className?: string;
};

const severityConfig: Record<
  RedFlagSeverity,
  { container: string; icon: ComponentType<{ className?: string }> }
> = {
  warning: {
    container: "border-warning/40 bg-warning/10 text-warning",
    icon: AlertTriangle,
  },
  danger: {
    container: "border-danger/40 bg-danger text-white",
    icon: ShieldAlert,
  },
};

export function RedFlagBanner({
  visible,
  severity,
  title,
  message,
  onDismiss,
  className,
}: RedFlagBannerProps) {
  const [hasShaken, setHasShaken] = useState(false);
  const Icon = severityConfig[severity].icon;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="doctor-red-flag"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={() => setHasShaken(true)}
          className={cn(
            "relative flex w-full items-start gap-3 rounded-card border px-4 py-3 shadow-sm",
            severityConfig[severity].container,
            !hasShaken && "animate-shake",
            className,
          )}
        >
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide">{title}</p>
            <p className="text-small leading-relaxed">{message}</p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="tap-target rounded-full border border-transparent p-1 text-current/80 transition hover:text-current"
            aria-label="Tutup peringatan"
          >
            <span className="sr-only">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
