"use client";

import { motion } from "framer-motion";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type InteractionHintProps = {
  conflicts: string[];
};

export function InteractionHint({ conflicts }: InteractionHintProps) {
  if (!conflicts.length) return null;

  const severity = conflicts.includes("danger") ? "danger" : "warning";
  const Icon = severity === "danger" ? ShieldAlert : AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "mt-2 flex items-start gap-2 rounded-card border px-3 py-2 text-xs leading-snug",
        severity === "danger"
          ? "border-danger/40 bg-danger/10 text-danger"
          : "border-warning/40 bg-warning/10 text-warning",
      )}
      role="status"
      aria-live="polite"
    >
      <Icon className="mt-0.5 h-4 w-4" aria-hidden="true" />
      <div>
        <p className="font-semibold uppercase tracking-wide">Perhatian interaksi</p>
        <p>{
          severity === "danger"
            ? "Produk ini mungkin bertentangan dengan alergi atau obat aktif Anda. Konsultasikan sebelum melanjutkan."
            : "Ada catatan interaksi ringan. Pastikan dokter mengetahui penggunaan produk ini."
        }</p>
      </div>
    </motion.div>
  );
}
