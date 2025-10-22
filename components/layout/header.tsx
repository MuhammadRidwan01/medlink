"use client";

import { Bell, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type HeaderProps = {
  title?: string;
  className?: string;
  onMenuClick?: () => void;
  children?: React.ReactNode;
};

export function Header({ title, className, onMenuClick, children }: HeaderProps) {
  const pathname = usePathname();
  const isDoctorRoute = pathname?.startsWith("/doctor");

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
        <button
          type="button"
          className="interactive tap-target inline-flex items-center justify-center rounded-button border border-transparent bg-card text-muted-foreground shadow-sm transition-shadow hover:text-foreground"
          aria-label="Notifikasi"
        >
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
