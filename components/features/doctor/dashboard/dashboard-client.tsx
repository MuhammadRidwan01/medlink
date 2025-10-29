"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { KpiCards } from "./kpi-cards";
import { PrescriptionApprovalCard } from "./prescription-approval-card";
import type { DoctorKpi } from "./mock-data";

// Export types for external use

type DashboardData = {
  kpis: {
    activeAppointments: number;
    completedToday: number;
    pendingApprovals: number;
    urgentCases: number;
  };
  triageQueue: any[];
  pendingPrescriptions: any[];
  appointments: any[];
  recentNotes: any[];
};

export function DoctorDashboardClient() {
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
      const response = await fetch("/api/doctor/dashboard", {
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

  const handleApprove = async (prescriptionId: string) => {
    try {
      const response = await fetch(
        `/api/doctor/prescriptions/${prescriptionId}/approve`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve prescription");
      }

      // Refresh dashboard data
      await fetchDashboard(true);
    } catch (err) {
      console.error("Approve error:", err);
      throw err;
    }
  };

  const handleReject = async (prescriptionId: string, reason: string) => {
    try {
      const response = await fetch(
        `/api/doctor/prescriptions/${prescriptionId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject prescription");
      }

      // Refresh dashboard data
      await fetchDashboard(true);
    } catch (err) {
      console.error("Reject error:", err);
      throw err;
    }
  };

  const kpiItems: DoctorKpi[] = data
    ? [
        {
          label: "Appointment Hari Ini",
          value: data.kpis.activeAppointments,
          suffix: "pasien",
        },
        {
          label: "Selesai Hari Ini",
          value: data.kpis.completedToday,
          suffix: "pasien",
        },
        {
          label: "Pending Approval",
          value: data.kpis.pendingApprovals,
          suffix: "resep",
        },
        {
          label: "Kasus Urgent",
          value: data.kpis.urgentCases,
          suffix: "pasien",
        },
      ]
    : [];

  if (error) {
    return (
      <PageShell
        title="Ringkasan Klinik"
        subtitle="Monitor metrik utama dan approval resep"
      >
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
    <PageShell
      title="Ringkasan Klinik"
      subtitle="Monitor metrik utama dan approval resep"
    >
      <div className="space-y-6">
        {/* Refresh Button */}
        {!isLoading && data && (
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
        )}
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
            {/* KPI Cards */}
            <KpiCards items={kpiItems} />

            {/* Pending Prescriptions */}
            {data.pendingPrescriptions.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Resep Menunggu Approval
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {data.pendingPrescriptions.length} resep perlu ditinjau
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {data.pendingPrescriptions.map((prescription) => (
                      <PrescriptionApprovalCard
                        key={prescription.id}
                        prescription={prescription}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Empty State */}
            {data.pendingPrescriptions.length === 0 && (
              <div className="rounded-card border border-border/50 bg-muted/30 p-8 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <svg
                    className="h-8 w-8 text-success"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Semua Resep Sudah Ditinjau
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tidak ada resep yang menunggu approval saat ini
                </p>
              </div>
            )}

            {/* Urgent Cases Alert */}
            {data.kpis.urgentCases > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-card border border-danger/20 bg-danger/5 p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                  <div>
                    <h4 className="font-semibold text-danger">
                      {data.kpis.urgentCases} Kasus Urgent
                    </h4>
                    <p className="text-sm text-danger/80">
                      Ada pasien dengan kondisi darurat yang memerlukan perhatian
                      segera
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
