"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "./store";

const statusConfig: Record<
  Extract<PaymentStatus, "pending" | "success" | "failed">,
  {
    icon: typeof Clock;
    label: string;
    badgeClass: string;
    description: string;
  }
> = {
  pending: {
    icon: Clock,
    label: "Menunggu pembayaran",
    badgeClass: "border-warning/40 bg-warning/10 text-warning",
    description: "Mohon selesaikan pembayaran di kanal yang dipilih.",
  },
  success: {
    icon: CheckCircle2,
    label: "Pembayaran berhasil",
    badgeClass: "border-success/40 bg-success/10 text-success",
    description: "Kami menerima pembayaran Anda. Pesanan segera diproses.",
  },
  failed: {
    icon: XCircle,
    label: "Pembayaran gagal",
    badgeClass: "border-destructive/40 bg-destructive/10 text-destructive",
    description: "Terjadi kendala pada kanal pembayaran. Coba lagi dalam beberapa saat.",
  },
};

type PaymentStatusIndicatorProps = {
  status: Extract<PaymentStatus, "pending" | "success" | "failed">;
  detail?: string;
  className?: string;
};

export function PaymentStatusIndicator({ status, detail, className }: PaymentStatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-card border border-border/60 bg-muted/30 p-4",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-button border bg-card text-foreground",
          config.badgeClass,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="space-y-1 text-sm">
        <p className="font-semibold text-foreground">{config.label}</p>
        <p className="text-muted-foreground">{detail ?? config.description}</p>
        <AnimatePresence>
          {status === "pending" ? (
            <motion.div
              key="pending-dots"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center gap-1"
              aria-label="Menunggu konfirmasi pembayaran"
            >
              {[0, 1, 2].map((index) => (
                <motion.span
                  // biome-ignore lint/suspicious/noArrayIndexKey: deterministic sequence
                  key={index}
                  className="inline-block h-1.5 w-1.5 rounded-full bg-warning"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
