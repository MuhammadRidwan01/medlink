"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  variant?: "plain" | "patient" | "elevated";
};

export function PageShell({
  title,
  subtitle,
  children,
  className,
  variant = "plain",
}: PageShellProps) {
  const isPatient = variant === "patient";

  const headerContent = (
    <header
      className={cn(
        "space-y-1",
        isPatient && "relative space-y-2 text-balance",
      )}
    >
      <h1 className={cn(isPatient && "text-2xl font-semibold md:text-[28px]")}>
        {title}
      </h1>
      {subtitle ? (
        <p
          className={cn(
            "text-sm text-muted-foreground",
            isPatient && "max-w-3xl text-[15px] leading-relaxed text-muted-foreground/80",
          )}
        >
          {subtitle}
        </p>
      ) : null}
      {isPatient ? (
        <span className="mt-3 inline-flex h-1 w-14 rounded-full bg-gradient-to-r from-primary/70 via-sky-400/70 to-transparent" />
      ) : null}
    </header>
  );

  const content = children ? (
    <div className={cn("space-y-4", isPatient && "space-y-6 pt-2")}>
      {children}
    </div>
  ) : null;

  if (isPatient) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className={cn("relative isolate", className)}
      >
        <div className="patient-panel overflow-hidden px-6 py-6 md:px-8 md:py-8">
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="absolute -left-24 top-6 h-52 w-52 rounded-full bg-primary/12 blur-3xl dark:bg-teal-500/10" />
            <div className="absolute -right-10 bottom-10 h-36 w-36 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/20" />
          </div>
          <div className="relative space-y-6">
            {headerContent}
            {content}
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "space-y-6",
        variant === "elevated" && "rounded-card border border-border/70 bg-card/95 p-6 shadow-lg",
        className,
      )}
    >
      {headerContent}
      {content}
    </motion.section>
  );
}
