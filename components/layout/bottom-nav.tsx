"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SidebarItem } from "./sidebar";
import { ThemeToggle } from "@/components/features/theme/theme-toggle";

type BottomNavProps = {
  items: SidebarItem[];
  className?: string;
};

export function BottomNav({ items, className }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "safe-area-bottom fixed inset-x-0 bottom-4 z-50 mx-auto flex w-full max-w-md items-center justify-between gap-2 rounded-card border border-border/70 bg-background/95 px-2 py-2 shadow-lg backdrop-blur md:hidden",
        className,
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
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "interactive tap-target flex min-w-0 flex-1 flex-col items-center justify-center rounded-button px-2 py-2 text-center text-tiny font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon
              className={cn(
                "mb-1 h-5 w-5",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
      <div className="ml-1">
        <ThemeToggle className="px-2 py-2" />
      </div>
    </motion.nav>
  );
}

