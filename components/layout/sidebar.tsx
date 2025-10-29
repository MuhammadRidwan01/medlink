"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type SidebarItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

type SidebarProps = {
  items: SidebarItem[];
  footer?: React.ReactNode;
  className?: string;
  mobileOpen?: boolean;
  onNavigate?: () => void;
  variant?: "default" | "floating";
  desktopMode?: "sticky" | "static";
  scrollable?: boolean;
};

export function Sidebar({
  items,
  footer,
  className,
  mobileOpen = false,
  onNavigate,
  variant = "default",
  desktopMode = "sticky",
  scrollable = true,
}: SidebarProps) {
  const pathname = usePathname();

  const baseClass =
    variant === "floating"
      ? "border-0 bg-transparent md:border md:border-white/25 md:bg-white/75 md:shadow-[0_24px_45px_-30px_rgba(15,23,42,0.55)] md:backdrop-blur-lg dark:md:border-slate-700/60 dark:md:bg-slate-900/65"
      : "border-r border-border bg-background";

  const mobileClass =
    variant === "floating"
      ? "bg-white/95 shadow-xl backdrop-blur-xl dark:bg-slate-900/90"
      : "bg-background shadow-xl";

  const desktopPlacementClass =
    desktopMode === "sticky"
      ? "md:sticky md:top-24 md:max-h-[calc(100vh-6rem)] md:overflow-hidden"
      : "md:relative md:self-start";

  return (
    <aside
      className={cn(
        "w-72 shrink-0 px-4 py-6",
        baseClass,
        mobileOpen
          ? cn(
              "fixed inset-y-0 left-0 z-50 flex flex-col overflow-y-auto rounded-r-[28px] md:relative md:flex",
              mobileClass,
            )
          : cn("hidden flex-col md:flex", desktopPlacementClass),
        className,
      )}
    >
      <nav
        className={cn(
          "flex-1 space-y-1 pr-1",
          scrollable ? "overflow-y-auto" : "overflow-visible",
        )}
      >
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname?.startsWith(item.href) && item.href !== "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "interactive tap-target group flex items-center gap-3 rounded-button px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive && "bg-primary/10 text-primary shadow-sm hover:text-primary",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors duration-normal",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="inline-flex h-6 items-center rounded-badge bg-primary/20 px-2 text-tiny font-medium text-primary">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      {footer ? <div className="mt-4 shrink-0 border-t border-border/60 pt-4">{footer}</div> : null}
    </aside>
  );
}
