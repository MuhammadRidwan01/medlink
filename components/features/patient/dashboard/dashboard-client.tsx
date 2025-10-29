"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  LogOut,
  RefreshCcw,
  Home,
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
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSessionInvalid, setIsSessionInvalid] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);

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
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        setIsSessionInvalid(true);
        setError("Sesi Anda telah berakhir. Silakan refresh atau login kembali.");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Handle other HTTP errors
      if (!response.ok) {
        throw new Error(`Gagal memuat data: ${response.statusText}`);
      }

      // Parse response
      const dashboardData = await response.json();
      
      // Handle API error responses (even with 200 status)
      if (dashboardData?.error) {
        if (dashboardData.error === "Unauthorized") {
          setIsSessionInvalid(true);
          setError("Sesi Anda telah berakhir. Silakan refresh atau login kembali.");
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }
        throw new Error(dashboardData.error);
      }
      
      // Validate data structure
      if (!dashboardData || typeof dashboardData !== 'object') {
        throw new Error("Data tidak valid dari server");
      }
      
      setData(dashboardData);
      setIsSessionInvalid(false);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui";
      
      if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
        setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Auto-redirect countdown for session invalid
  useEffect(() => {
    if (isSessionInvalid && redirectCountdown === 0) {
      setRedirectCountdown(10); // Start 10 second countdown
    }
  }, [isSessionInvalid, redirectCountdown]);

  useEffect(() => {
    if (redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0 && isSessionInvalid) {
      // Auto-redirect when countdown reaches 0
      router.push("/auth/login?redirect=/patient/dashboard");
    }
  }, [redirectCountdown, isSessionInvalid, router]);

  const handleRefreshSession = useCallback(async () => {
    try {
      // Try to refresh the session by calling auth refresh
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        cache: "no-store",
      });

      if (response.ok) {
        // Session refreshed successfully, retry dashboard fetch
        setIsSessionInvalid(false);
        setError(null);
        setRedirectCountdown(0); // Reset countdown
        await fetchDashboard(false);
      } else {
        // Refresh failed, redirect to login
        router.push("/auth/login?redirect=/patient/dashboard");
      }
    } catch (err) {
      console.error("Session refresh failed:", err);
      router.push("/auth/login?redirect=/patient/dashboard");
    }
  }, [fetchDashboard, router]);

  const handleLogout = useCallback(async () => {
    setRedirectCountdown(0); // Cancel countdown
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      router.push("/auth/login");
    }
  }, [router]);

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

  return (
    <PageShell title="Dashboard" subtitle="Ringkasan kesehatan Anda">
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && !error && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <p className="text-sm text-muted-foreground">
                Memuat dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[400px] items-center justify-center"
          >
            <div className="w-full max-w-md text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
                <AlertTriangle className="h-8 w-8 text-danger" />
              </div>
              
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {isSessionInvalid ? "Sesi Berakhir" : "Terjadi Kesalahan"}
              </h3>
              
              <p className="mb-6 text-sm text-muted-foreground">
                {error}
                {redirectCountdown > 0 && (
                  <span className="block mt-2 text-warning">
                    Auto-redirect ke halaman login dalam {redirectCountdown} detik...
                  </span>
                )}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                {isSessionInvalid ? (
                  <>
                    <button
                      onClick={handleRefreshSession}
                      className="tap-target flex items-center justify-center gap-2 rounded-button bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-md"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      <span>Refresh Sesi</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="tap-target flex items-center justify-center gap-2 rounded-button border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Login Ulang</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => fetchDashboard(true)}
                      disabled={isRefreshing}
                      className="tap-target flex items-center justify-center gap-2 rounded-button bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-md disabled:opacity-60"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                      <span>Coba Lagi</span>
                    </button>
                    
                    <Link
                      href="/patient/triage"
                      className="tap-target flex items-center justify-center gap-2 rounded-button border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                    >
                      <Home className="h-4 w-4" />
                      <span>Halaman Utama</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Additional Help for Session Issues */}
              {isSessionInvalid && (
                <div className="mt-6 rounded-lg bg-muted/30 p-4 text-left">
                  <h4 className="mb-2 text-sm font-semibold text-foreground">
                    💡 Tips:
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Klik "Refresh Sesi" untuk memperbarui sesi Anda</li>
                    <li>• Jika masih gagal, klik "Login Ulang"</li>
                    <li>• Pastikan koneksi internet Anda stabil</li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Dashboard Content */}
        {!isLoading && !error && data && (
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
