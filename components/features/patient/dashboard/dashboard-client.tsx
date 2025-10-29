"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, cubicBezier } from "framer-motion";
import type { EasingFunction, Transition } from "framer-motion";
import {
  ActivitySquare,
  CalendarCheck2,
  Pill,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PrescriptionStatusCard } from "./prescription-status-card";

type DashboardData = {
  stats: {
    pendingPrescriptions: number;
    approvedPrescriptions: number;
    upcomingAppointments: number;
    completedTriage: number;
  };
  prescriptions: any[];
  appointments: any[];
  triageSessions: any[];
  highlights: {
    nextAppointment: any;
    latestTriage: any;
  };
};

type HighlightCard = {
  key: string;
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
  caption: string;
  tone?: "accent" | "neutral";
};

type QuickAction = {
  key: string;
  href: string;
  icon: LucideIcon;
  label: string;
  description: string;
};

const cardEase: EasingFunction = cubicBezier(0.4, 0, 0.2, 1);

const cardTransition: Transition = {
  duration: 0.18,
  ease: cardEase,
};

const cardMotion = {
  whileHover: { y: -6 },
  whileTap: { y: -2 },
  transition: cardTransition,
};

function formatRelativeTime(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const rtf = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}

export function PatientDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/patient/dashboard", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const highlightCards: HighlightCard[] = data
    ? [
        {
          key: "prescriptions",
          href: "/patient/prescriptions",
          icon: Pill,
          label: "Resep Aktif",
          value: String(data.stats.approvedPrescriptions),
          caption: data.stats.pendingPrescriptions > 0
            ? `${data.stats.pendingPrescriptions} menunggu approval`
            : "Semua resep disetujui",
          tone: data.stats.pendingPrescriptions > 0 ? "accent" : "neutral",
        },
        {
          key: "appointments",
          href: "/patient/appointments",
          icon: CalendarCheck2,
          label: "Appointment",
          value: String(data.stats.upcomingAppointments),
          caption: data.highlights.nextAppointment
            ? formatRelativeTime(data.highlights.nextAppointment.starts_at)
            : "Tidak ada appointment",
        },
        {
          key: "triage",
          href: "/patient/triage",
          icon: ActivitySquare,
          label: "Triage Selesai",
          value: String(data.stats.completedTriage),
          caption: data.highlights.latestTriage
            ? formatRelativeTime(data.highlights.latestTriage.created_at)
            : "Belum ada triage",
        },
      ]
    : [];

  const quickActions: QuickAction[] = [
    {
      key: "triage",
      href: "/patient/triage",
      icon: ActivitySquare,
      label: "Mulai Triage",
      description: "Konsultasi AI untuk gejala Anda",
    },
    {
      key: "appointment",
      href: "/patient/appointments",
      icon: CalendarCheck2,
      label: "Buat Appointment",
      description: "Jadwalkan konsultasi dengan dokter",
    },
  ];

  if (error) {
    return (
      <PageShell title="Dashboard" subtitle="Ringkasan kesehatan Anda">
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-card border border-danger/20 bg-danger/5 p-8">
          <AlertTriangle className="h-12 w-12 text-danger" />
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Gagal Memuat Dashboard
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => fetchDashboard()}
              className="tap-target rounded-button bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-md"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Dashboard" subtitle="Ringkasan kesehatan Anda">
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <p className="text-sm text-muted-foreground">
                Memuat dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Refresh Button */}
            <div className="flex justify-end">
              <button
                onClick={() => fetchDashboard(true)}
                disabled={isRefreshing}
                className="tap-target flex items-center gap-2 rounded-button border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
            </div>

            {/* Highlight Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {highlightCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link key={card.key} href={card.href}>
                    <motion.div
                      {...cardMotion}
                      className="group relative overflow-hidden rounded-card border border-border bg-card p-4 shadow-sm hover:shadow-md"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <div className="mb-1 text-xs font-medium text-muted-foreground">
                        {card.label}
                      </div>
                      <div className="mb-2 text-2xl font-bold text-foreground">
                        {card.value}
                      </div>
                      <div
                        className={`text-xs ${
                          card.tone === "accent"
                            ? "text-warning"
                            : "text-muted-foreground"
                        }`}
                      >
                        {card.caption}
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Aksi Cepat
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.key} href={action.href}>
                      <motion.div
                        {...cardMotion}
                        className="group flex items-center gap-4 rounded-card border border-border bg-card p-4 shadow-sm hover:shadow-md"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 font-semibold text-foreground">
                            {action.label}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {action.description}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Prescriptions Section */}
            {data.prescriptions.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Resep Terbaru
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {data.prescriptions.length} resep
                    </p>
                  </div>
                  <Link
                    href="/patient/prescriptions"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Lihat Semua
                  </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {data.prescriptions.slice(0, 4).map((prescription) => (
                      <PrescriptionStatusCard
                        key={prescription.id}
                        prescription={prescription}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Empty State */}
            {data.prescriptions.length === 0 && (
              <div className="rounded-card border border-border/50 bg-muted/30 p-8 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Pill className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Belum Ada Resep
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Mulai triage untuk mendapatkan rekomendasi obat
                </p>
                <Link
                  href="/patient/triage"
                  className="tap-target inline-flex items-center gap-2 rounded-button bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-md"
                >
                  <ActivitySquare className="h-4 w-4" />
                  <span>Mulai Triage</span>
                </Link>
              </div>
            )}

            {/* Pending Prescriptions Alert */}
            {data.stats.pendingPrescriptions > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-card border border-warning/20 bg-warning/5 p-4"
              >
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                  <div>
                    <h4 className="font-semibold text-warning">
                      {data.stats.pendingPrescriptions} Resep Menunggu Approval
                    </h4>
                    <p className="text-sm text-warning/80">
                      Dokter sedang meninjau resep Anda. Estimasi waktu review: 1-24 jam
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </PageShell>
  );
}
