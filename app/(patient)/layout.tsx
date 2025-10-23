"use client";

import { Suspense, useState } from "react";
import {
  Bell,
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

export default function PatientLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fallback = (
    <div className="relative flex min-h-screen flex-col bg-muted/40 md:bg-background">
      <div className="h-[68px] w-full bg-muted/50 md:h-[72px]" />
      <div className="flex flex-1 gap-0 md:gap-6">
        <div className="hidden w-72 md:block">
          <div className="h-full rounded-r-card bg-muted/40" />
        </div>
        <main className="relative flex-1 px-4 pb-28 pt-4 md:px-8 md:pb-16 md:pt-8">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <SessionSkeleton />
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback}>
      <SessionGate allowedRoles={["patient"]} fallback={fallback}>
      <div className="relative flex min-h-screen flex-col bg-muted/40 md:bg-background">
        <Header
          title="Perawatan Pasien"
          onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
          className="md:sticky"
        />
        <div className="flex flex-1 gap-0 md:gap-6">
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
          />
          <main className="relative flex-1 px-4 pb-28 pt-4 md:px-8 md:pb-16 md:pt-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
              {children}
            </div>
          </main>
        </div>
        <BottomNav items={patientNav} />
        <Fab href="/patient/triage" />
      </div>
      </SessionGate>
    </Suspense>
  );
}
