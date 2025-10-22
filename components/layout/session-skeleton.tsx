"use client";

import { motion } from "framer-motion";

export function SessionSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6 md:px-8">
      <motion.div
        aria-hidden
        className="h-10 w-48 animate-pulse rounded-card bg-muted/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-card bg-muted/60 shadow-inner"
          />
        ))}
      </div>
      <div className="h-[420px] animate-pulse rounded-card bg-muted/60" />
    </div>
  );
}

