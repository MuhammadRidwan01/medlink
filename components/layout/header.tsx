"use client";

import { Bell, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/features/theme/theme-toggle";
import { logoutAction } from "@/app/(auth)/auth/actions";
import { useSession } from "@/hooks/use-session";
import { getDashboardPath } from "@/lib/auth/role";
type HeaderProps = {
  title?: string;
  className?: string;
  onMenuClick?: () => void;
  children?: React.ReactNode;
};

export function Header({ title, className, onMenuClick, children }: HeaderProps) {
  const pathname = usePathname();
  const isDoctorRoute = pathname?.startsWith("/doctor");
  const { status, role } = useSession();
  const isAuthenticated = status === "authenticated";
  const dashboardHref = getDashboardPath(role);
  const onDashboard = pathname === dashboardHref;
  const isAuthRoute = pathname?.startsWith("/auth");
  const showDashboardButton = isAuthenticated && !onDashboard;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur duration-normal ease-out",
        className,
      )}
    >
      {onMenuClick ? (
        <button
          type="button"
          onClick={onMenuClick}
          className="tap-target inline-flex items-center justify-center rounded-button border border-transparent bg-muted/60 text-foreground shadow-sm md:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" />
        </button>
      ) : null}
      <Link href="/" className="flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-button bg-gradient-to-br from-primary/90 to-primary-dark text-white shadow-md">
          {isDoctorRoute ? "DR" : "ML"}
        </span>
        <div className="flex flex-col leading-none">
          <span className="text-tiny uppercase text-muted-foreground">
            MedLink AI
          </span>
          <span className="text-sm font-semibold text-foreground">
            {title ?? (isDoctorRoute ? "Panel Dokter" : "Kesehatan Anda")}
          </span>
        </div>
      </Link>
      <div className="ml-auto flex items-center gap-2">
        {children}
        <ThemeToggle />
        {showDashboardButton ? (
          <Link
            href={dashboardHref}
            className="tap-target inline-flex items-center gap-2 rounded-button border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:border-primary/50 hover:bg-primary/15"
          >
            Dashboard
          </Link>
        ) : null}
        {isAuthenticated ? (
          <>
            <button
              type="button"
              className="interactive tap-target inline-flex items-center justify-center rounded-button border border-transparent bg-card text-muted-foreground shadow-sm transition-shadow hover:text-foreground"
              aria-label="Notifikasi"
            >
              <Bell className="h-5 w-5" />
            </button>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm
                       bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700
                       ring-1 ring-slate-200 dark:ring-slate-700"
                aria-label="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : !isAuthRoute ? (
          <Link
            href="/auth/login"
            className="tap-target inline-flex items-center justify-center rounded-button border border-border/70 bg-card/80 px-3 py-2 text-sm font-semibold text-foreground transition hover:border-border/80 hover:bg-card"
          >
            Masuk
          </Link>
        ) : null}
      </div>
    </header>
  );
}
