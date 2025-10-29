"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, MessageSquare, CheckCircle2, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types/triage";

type TriageSession = {
  id: string;
  status: "active" | "completed";
  summary: {
    riskLevel: RiskLevel;
    symptoms: string[];
    duration: string;
  };
  risk_level: RiskLevel;
  created_at: string;
  updated_at: string;
  messageCount: number;
};

type HistoryDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  currentSessionId?: string | null;
};

export function HistoryDrawer({ isOpen, onClose, onSelectSession, currentSessionId }: HistoryDrawerProps) {
  const [sessions, setSessions] = useState<TriageSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/triage/sessions");
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Failed to load session history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      case "moderate":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "emergency":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskLabel = (risk: RiskLevel) => {
    switch (risk) {
      case "low":
        return "Rendah";
      case "moderate":
        return "Sedang";
      case "high":
        return "Tinggi";
      case "emergency":
        return "Darurat";
      default:
        return "Unknown";
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border bg-background shadow-2xl sm:max-w-lg"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 to-background px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Riwayat Triage</h2>
                    <p className="text-xs text-muted-foreground">
                      {sessions.length} sesi ditemukan
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="tap-target rounded-full p-2 hover:bg-muted"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <History className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Belum ada riwayat</p>
                    <p className="text-xs text-muted-foreground">
                      Mulai sesi triage untuk melihat riwayat
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <motion.button
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => {
                          onSelectSession(session.id);
                          onClose();
                        }}
                        className={cn(
                          "tap-target w-full rounded-xl border-2 bg-card p-4 text-left shadow-sm transition-all hover:shadow-md",
                          currentSessionId === session.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            {/* Status & Risk */}
                            <div className="flex items-center gap-2">
                              {session.status === "active" ? (
                                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"></div>
                                  Aktif
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Selesai
                                </span>
                              )}
                              <span
                                className={cn(
                                  "rounded-full border px-2 py-0.5 text-xs font-medium",
                                  getRiskColor(session.risk_level)
                                )}
                              >
                                {getRiskLabel(session.risk_level)}
                              </span>
                            </div>

                            {/* Symptoms */}
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-foreground">
                                {session.summary?.symptoms?.[0] || "Gejala tidak tercatat"}
                              </p>
                              {session.summary?.symptoms?.length > 1 && (
                                <p className="text-xs text-muted-foreground">
                                  +{session.summary.symptoms.length - 1} gejala lainnya
                                </p>
                              )}
                            </div>

                            {/* Meta */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(session.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {session.messageCount} pesan
                              </span>
                            </div>
                          </div>

                          {/* Current indicator */}
                          {currentSessionId === session.id && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border bg-muted/30 px-6 py-4">
                <button
                  onClick={onClose}
                  className="tap-target w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
