"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { getDashboardPath } from "@/lib/auth/role";

export function LandingNavActions() {
  const { status, role } = useSession();
  const isAuthenticated = status === "authenticated";
  const dashboardHref = getDashboardPath(role);
  const dashboardLabel = role === "doctor" ? "Dashboard Dokter" : "Dashboard Pasien";

  if (isAuthenticated) {
    return (
      <Link
        href={dashboardHref}
        className="inline-flex items-center gap-2 rounded-full bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
      >
        {dashboardLabel}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/auth/login"
        className="hidden items-center rounded-full border border-border/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-border hover:bg-card/80 sm:inline-flex"
      >
        Masuk
      </Link>
      <Link
        href="/auth/register"
        className="inline-flex items-center gap-2 rounded-full bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
      >
        Mulai Gratis
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </>
  );
}

export function LandingHeroActions() {
  const { status, role } = useSession();
  const isAuthenticated = status === "authenticated";
  const dashboardHref = getDashboardPath(role);
  const dashboardLabel = role === "doctor" ? "Dashboard Dokter" : "Dashboard Pasien";

  if (isAuthenticated) {
    return (
      <Link
        href={dashboardHref}
        className="inline-flex items-center gap-2 rounded-full border border-border/80 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-border hover:bg-card"
      >
        {dashboardLabel}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    );
  }

  return (
    <Link
      href="/auth/login?redirect=/patient/dashboard"
      className="inline-flex items-center gap-2 rounded-full border border-border/80 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-border hover:bg-card"
    >
      Masuk sebagai pasien
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}
