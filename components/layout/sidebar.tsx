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
};

export function Sidebar({
  items,
  footer,
  className,
  mobileOpen = false,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-72 shrink-0 flex-col gap-4 border-r border-border bg-background px-4 py-6",
        mobileOpen
          ? "fixed inset-y-0 left-0 z-50 flex shadow-xl md:relative md:flex"
          : "hidden md:flex",
        className,
      )}
    >
      <nav className="space-y-1">
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
      {footer ? <div className="mt-auto">{footer}</div> : null}
    </aside>
  );
}
