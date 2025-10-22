"use client";

import { useState } from "react";
import { ClipboardList, LayoutDashboard, Users, Video } from "lucide-react";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Fab } from "@/components/layout/fab";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { SessionGate } from "@/components/layout/session-gate";
import { SessionSkeleton } from "@/components/layout/session-skeleton";

const doctorNav = [
  {
    href: "/(doctor)/dashboard",
    label: "Ringkasan",
    icon: LayoutDashboard,
  },
  {
    href: "/(doctor)/queue",
    label: "Antrian",
    icon: ClipboardList,
  },
  {
    href: "/(doctor)/consultation",
    label: "Konsultasi",
    icon: Video,
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    icon: Users,
  },
] as const;

export default function DoctorLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fallback = (
    <div className="relative flex min-h-screen flex-col bg-muted/40 md:bg-background">
      <div className="h-[68px] w-full bg-muted/50 md:h-[72px]" />
      <div className="flex flex-1 gap-0 md:gap-6">
        <div className="hidden w-72 md:block">
          <div className="h-full rounded-r-card bg-muted/40" />
        </div>
        <main className="relative flex-1 px-4 pb-28 pt-4 md:px-8 md:pb-16 md:pt-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <SessionSkeleton />
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <SessionGate allowedRoles={["doctor"]} fallback={fallback}>
      <div className="relative flex min-h-screen flex-col bg-muted/40 md:bg-background">
        <Header
          title="Panel Dokter"
          onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
        />
        <div className="flex flex-1 gap-0 md:gap-6">
          {isSidebarOpen ? (
            <div
              role="presentation"
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          ) : null}
          <Sidebar
            items={doctorNav}
            mobileOpen={isSidebarOpen}
            onNavigate={() => setIsSidebarOpen(false)}
          />
          <main className="relative flex-1 px-4 pb-28 pt-4 md:px-8 md:pb-16 md:pt-8">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
              {children}
            </div>
          </main>
        </div>
        <BottomNav items={doctorNav} />
        <Fab href="/(doctor)/queue" label="Lihat Antrian" />
      </div>
    </SessionGate>
  );
}
