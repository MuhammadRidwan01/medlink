"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, MessageSquare, CheckCircle2, AlertCircle, History as HistoryIcon, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
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

export default function TriageHistoryPage() {
  const [sessions, setSessions] = useState<TriageSession[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, []);

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
      month: "long",
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
    <PageShell
      title="Riwayat Triage"
      subtitle="Lihat riwayat sesi triage AI Anda"
    >
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border-2 border-dashed border-border bg-muted/30 py-24 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <HistoryIcon className="h-10 w-10 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">Belum Ada Riwayat</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Mulai sesi triage untuk melihat riwayat Anda
          </p>
          <button
            onClick={() => router.push("/patient/triage")}
            className="tap-target rounded-lg bg-primary-gradient px-6 py-3 font-semibold text-white shadow-md hover:shadow-lg"
          >
            Mulai Triage Baru
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session, index) => (
            <motion.button
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => router.push(`/patient/triage?session=${session.id}`)}
              className="tap-target group flex flex-col rounded-xl border-2 border-border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
            >
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {session.status === "active" ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"></div>
                      Aktif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                      Selesai
                    </span>
                  )}
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>

              {/* Risk Badge */}
              <div className="mb-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold",
                    getRiskColor(session.risk_level)
                  )}
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  Risiko {getRiskLabel(session.risk_level)}
                </span>
              </div>

              {/* Symptoms */}
              <div className="mb-4 flex-1">
                <h3 className="mb-1 font-semibold text-foreground">
                  {session.summary?.symptoms?.[0] || "Gejala tidak tercatat"}
                </h3>
                {session.summary?.symptoms?.length > 1 && (
                  <p className="text-sm text-muted-foreground">
                    +{session.summary.symptoms.length - 1} gejala lainnya
                  </p>
                )}
                {session.summary?.duration && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Durasi: {session.summary.duration}
                  </p>
                )}
              </div>

              {/* Footer Meta */}
              <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(session.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {session.messageCount} pesan
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </PageShell>
  );
}
