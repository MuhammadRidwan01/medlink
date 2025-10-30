"use client";

import { Suspense, useState } from "react";
import {
  Bell,
  History,
  LayoutDashboard,
  MessageSquare,
  Package,
  Pill,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Fab } from "@/components/layout/fab";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { SessionGate } from "@/components/layout/session-gate";
import { SessionSkeleton } from "@/components/layout/session-skeleton";
import type { SidebarItem } from "@/components/layout/sidebar";

const patientNav = [
  {
    href: "/patient/dashboard",
    label: "Beranda",
    icon: LayoutDashboard,
  },
  {
    href: "/patient/inbox",
    label: "Inbox",
    icon: MessageSquare,
  },
  {
    href: "/patient/notifications",
    label: "Notifikasi",
    icon: Bell,
  },
  {
    href: "/patient/triage/history",
    label: "Riwayat Triage",
    icon: History,
  },
  {
    href: "/patient/prescriptions",
    label: "Resep",
    icon: Pill,
  },
  {
    href: "/patient/orders",
    label: "Pesanan",
    icon: Package,
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    icon: ShoppingBag,
  },
  {
    href: "/patient/profile",
    label: "Profil",
    icon: UserRound,
  },
] satisfies SidebarItem[];

function PatientBackgroundCanvas() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="patient-grid h-full w-full" />
      <div className="patient-spotlight" />
      <div className="absolute -top-32 left-[12%] h-[420px] w-[420px] rounded-full bg-cyan-200/25 blur-3xl dark:bg-sky-500/20" />
      <div className="absolute -bottom-24 right-[8%] h-[360px] w-[360px] rounded-full bg-teal-300/20 blur-3xl dark:bg-emerald-400/20" />
      <div className="absolute top-[38%] left-1/2 h-[220px] w-[420px] -translate-x-1/2 rounded-full bg-white/40 blur-3xl dark:bg-slate-500/20" />
    </div>
  );
}

export default function PatientLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fallback = (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden md:overflow-visible patient-aurora">
      <PatientBackgroundCanvas />
      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="px-4 pb-4 pt-6 md:px-12 md:pb-8">
          <div className="h-16 rounded-[28px] border border-white/30 bg-white/60 shadow-[0_18px_32px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/65 md:h-[72px]" />
        </div>
        <div className="flex flex-1 gap-0 md:gap-8 md:px-10 lg:px-16">
          <div className="hidden w-72 md:block">
            <div className="patient-panel h-full rounded-[28px]" />
          </div>
          <main className="relative flex-1 px-4 pb-28 pt-4 md:px-0 md:pb-16 md:pt-0">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
              <SessionSkeleton />
            </div>
          </main>
        </div>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback}>
      <SessionGate allowedRoles={["patient"]} fallback={fallback}>
        <div className="relative isolate flex min-h-screen flex-col overflow-hidden md:overflow-visible patient-aurora">
          <PatientBackgroundCanvas />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Header
              title="Perawatan Pasien"
              onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
              className="md:px-12 md:py-4"
              variant="glass"
            />
            <div className="flex flex-1 gap-0 md:gap-10 md:px-10 lg:px-16">
              {isSidebarOpen ? (
                <div
                  role="presentation"
                  className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity md:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
              ) : null}
              <Sidebar
                items={patientNav}
                mobileOpen={isSidebarOpen}
                onNavigate={() => setIsSidebarOpen(false)}
                variant="floating"
              />
              <main className="relative flex-1 px-4 pt-6 md:px-0  md:pt-8">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
                  {children}
                </div>
              </main>
            </div>
            <BottomNav items={patientNav} />
            <Fab href="/patient/triage" />
          </div>
        </div>
      </SessionGate>
    </Suspense>
  );
}
