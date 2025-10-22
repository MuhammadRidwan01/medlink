"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function PageShell({
  title,
  subtitle,
  children,
  className,
}: PageShellProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className={cn("space-y-6", className)}
    >
      <header className="space-y-1">
        <h1>{title}</h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </header>
      {children ? <div className="space-y-4">{children}</div> : null}
    </motion.section>
  );
}

