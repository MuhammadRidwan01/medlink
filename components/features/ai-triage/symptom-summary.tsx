"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Clock, ListTodo, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RiskBadge } from "./risk-badge";
import type { TriageSummary } from "@/types/triage";
import { formatTriageTimestamp } from "@/types/triage";

type SymptomSummaryProps = {
  summary: TriageSummary;
  className?: string;
  loading?: boolean;
};

type ChangeMap = {
  symptoms: boolean;
  duration: boolean;
  riskLevel: boolean;
  redFlags: boolean;
};

const INITIAL_CHANGE_STATE: ChangeMap = {
  symptoms: false,
  duration: false,
  riskLevel: false,
  redFlags: false,
};

export function SymptomSummary({ summary, className, loading }: SymptomSummaryProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [changes, setChanges] = useState<ChangeMap>(INITIAL_CHANGE_STATE);
  const previousRef = useRef(summary);
  const isEmergency = summary.riskLevel === "emergency" || summary.recommendation?.type === "emergency";

  useEffect(() => {
    if (!previousRef.current) {
      previousRef.current = summary;
      return;
    }
    const prev = previousRef.current;
    const nextChanges: ChangeMap = {
      symptoms: prev.symptoms.join("|") !== summary.symptoms.join("|"),
      duration: prev.duration !== summary.duration,
      riskLevel: prev.riskLevel !== summary.riskLevel,
      redFlags: prev.redFlags.join("|") !== summary.redFlags.join("|"),
    };
    setChanges(nextChanges);
    previousRef.current = summary;
    const timeout = setTimeout(() => setChanges(INITIAL_CHANGE_STATE), 220);
    return () => clearTimeout(timeout);
  }, [summary]);

  const summaryContent = (
    <div
      className={[
        "card-surface relative space-y-4 overflow-hidden p-5",
        isEmergency
          ? "border-danger/50 bg-gradient-to-br from-rose-950/60 via-card to-card shadow-[0_30px_80px_-35px_rgba(248,113,113,0.85)] ring-1 ring-danger/30"
          : "",
      ].join(" ")}
    >
      {isEmergency ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.15),transparent_60%)] pointer-events-none" aria-hidden />
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-small text-muted-foreground">Ringkasan Gejala</p>
          <p className="text-tiny text-muted-foreground">
            Diperbarui {formatTriageTimestamp(summary.updatedAt)}
          </p>
        </div>
        <RiskBadge level={summary.riskLevel} />
      </div>
      {isEmergency ? (
        <div className="rounded-card border border-danger/40 bg-danger/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-danger">
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Darurat — segera cari bantuan langsung.
          </span>
        </div>
      ) : null}
      {summary.severity ? (
        <motion.section
          animate={changes.riskLevel ? { backgroundColor: "rgba(20,184,166,0.08)" } : { backgroundColor: "rgba(255,255,255,0)" }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          className="rounded-card border border-border/60 bg-card p-3 text-small text-muted-foreground"
        >
          <span className="font-semibold text-foreground">Keparahan:</span> {summary.severity}
        </motion.section>
      ) : null}
      <section>
        <header className="mb-2 flex items-center gap-2 text-small font-semibold text-foreground">
          <ListTodo className="h-4 w-4 text-primary" />
          Gejala utama
        </header>
        <motion.ul
          animate={changes.symptoms ? { backgroundColor: "rgba(20,184,166,0.08)" } : { backgroundColor: "rgba(255,255,255,0)" }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          className="space-y-1 rounded-card px-2 py-2 text-small text-muted-foreground"
        >
          {summary.symptoms.map((symptom) => (
            <li key={symptom}>• {symptom}</li>
          ))}
        </motion.ul>
      </section>
      <motion.section
        animate={changes.duration ? { backgroundColor: "rgba(20,184,166,0.1)" } : { backgroundColor: "rgba(20,184,166,0.04)" }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        className="flex items-center gap-2 rounded-card bg-primary/10 p-3 text-small text-primary"
      >
        <Clock className="h-4 w-4" />
        Durasi: {summary.duration}
      </motion.section>
      {summary.redFlags.length > 0 ? (
        <motion.section
          animate={changes.redFlags ? { boxShadow: "0 0 0 2px rgba(239,68,68,0.25)" } : { boxShadow: "0 0 0 0 rgba(0,0,0,0)" }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          className="space-y-2 rounded-card border border-danger/20 bg-danger/5 p-3"
        >
          <header className="flex items-center gap-2 text-small font-semibold text-danger">
            <AlertTriangle className="h-4 w-4" />
            Red flag terdeteksi
          </header>
          <ul className="space-y-1 text-small text-danger">
            {summary.redFlags.map((flag) => (
              <li key={flag}>• {flag}</li>
            ))}
          </ul>
        </motion.section>
      ) : null}
      {summary.recommendation ? (
        <motion.section
          animate={{ opacity: 1 }}
          initial={{ opacity: 0.95 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          className={[
            "space-y-2 rounded-card p-3",
            summary.recommendation.type === "emergency"
              ? "border border-danger/40 bg-danger/10 text-danger"
              : "border border-primary/30 bg-primary/5 text-primary",
          ].join(" ")}
        >
          <header className="text-small font-semibold">
            Rekomendasi {summary.recommendation.type === "emergency" ? "darurat" : ""}
          </header>
          {summary.recommendation.type ? (
            <p className="text-small text-foreground">Tipe: {summary.recommendation.type}</p>
          ) : null}
          {summary.recommendation.urgency ? (
            <p className="text-small text-foreground">Urgensi: {summary.recommendation.urgency}</p>
          ) : null}
          {summary.recommendation.reason ? (
            <p className="text-small text-muted-foreground">Alasan: {summary.recommendation.reason}</p>
          ) : null}
          {Array.isArray(summary.recommendation.otcSuggestions) && summary.recommendation.otcSuggestions.length ? (
            <ul className="space-y-1 text-small text-muted-foreground">
              {summary.recommendation.otcSuggestions.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          ) : null}
        </motion.section>
      ) : null}
    </div>
  );

  if (loading) {
    return (
      <div className={className}>
        <div className="hidden space-y-4 rounded-card border border-border/60 bg-card p-5 shadow-sm lg:block">
          <div className="h-4 w-32 animate-pulse rounded bg-muted/60" />
          <div className="h-3 w-full animate-pulse rounded bg-muted/50" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-muted/50" />
          <div className="h-20 w-full animate-pulse rounded bg-muted/40" />
        </div>
        <div className="lg:hidden">
          <div className="h-12 w-full animate-pulse rounded-button bg-muted/40" />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="sticky top-24 hidden lg:block">{summaryContent}</div>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          className="interactive tap-target flex w-full items-center justify-between rounded-button border border-primary/30 bg-primary/5 px-4 py-3 text-small font-semibold text-primary shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Ringkasan Gejala
          <RiskBadge level={summary.riskLevel} />
        </button>
        <AnimatePresence>
          {isSheetOpen ? (
            <>
              <motion.div
                aria-hidden
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => setIsSheetOpen(false)}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                className="safe-area-bottom fixed inset-x-0 bottom-0 z-50 rounded-t-card bg-background shadow-xl"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="flex items-center justify-between px-5 pb-2 pt-4">
                  <p className="text-small font-semibold text-muted-foreground">
                    Ringkasan Gejala
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSheetOpen(false)}
                    className="tap-target rounded-full bg-muted p-2 text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label="Tutup ringkasan"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 pb-6">
                  {summaryContent}
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
