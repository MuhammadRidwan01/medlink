"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, FileText } from "lucide-react";
import type { TriageSummary } from "@/types/triage";

type AppointmentBubbleProps = {
  summary: TriageSummary;
  onClose: () => void;
};

export function AppointmentBubble({ summary }: AppointmentBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex w-full max-w-2xl flex-col gap-2"
    >
      <div className="rounded-card border border-warning/20 bg-gradient-to-br from-warning/5 to-background p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/10">
            <Calendar className="h-4 w-4 text-warning" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground">
              Konsultasi Dokter Diperlukan
            </h4>
            <p className="text-xs text-muted-foreground">
              Kondisi Anda memerlukan pemeriksaan lebih lanjut
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-border/50 bg-background/50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h5 className="text-sm font-semibold text-foreground">
                Ringkasan Kondisi
              </h5>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                <span className="font-semibold">Gejala:</span>{" "}
                {summary.symptoms.join(", ")}
              </p>
              <p>
                <span className="font-semibold">Durasi:</span> {summary.duration}
              </p>
              <p>
                <span className="font-semibold">Tingkat Risiko:</span>{" "}
                <span className="capitalize">{summary.riskLevel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-warning">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              {summary.recommendation?.urgency === "immediate"
                ? "Segera konsultasi dengan dokter dalam beberapa jam"
                : summary.recommendation?.urgency === "within_24h"
                  ? "Disarankan konsultasi dalam 24 jam"
                  : "Konsultasi dalam beberapa hari"}
            </p>
          </div>
        </div>

        <button className="tap-target mt-4 w-full rounded-button bg-primary-gradient px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:shadow-lg">
          Buat Appointment dengan Dokter
        </button>
      </div>
    </motion.div>
  );
}
