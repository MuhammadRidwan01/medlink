"use client";
"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Package,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus, OrderTimelineEntry } from "./data";

const ICONS: Record<OrderStatus, typeof Clock3> = {
  placed: Clock3,
  paid: CheckCircle2,
  packed: Package,
  shipped: Truck,
  delivered: PackageCheck,
  canceled: XCircle,
};

type MilestoneNodeProps = {
  entry: OrderTimelineEntry;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isLast: boolean;
};

export function MilestoneNode({
  entry,
  index,
  isActive,
  isCompleted,
  isLast,
}: MilestoneNodeProps) {
  const Icon = ICONS[entry.status];

  return (
    <motion.li
      layout
      className="relative flex w-full flex-col gap-3 lg:flex-1"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1], delay: index * 0.05 }}
    >
      <div className="flex items-start gap-3 lg:flex-col lg:items-center lg:gap-4">
        <div className="relative flex flex-col items-center">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border text-muted-foreground transition-shadow",
              isCompleted
                ? "border-primary bg-primary/10 text-primary shadow-[0_0_0_4px_rgba(20,184,166,0.18)]"
                : "border-border/60 bg-muted/40",
              isActive && "shadow-[0_0_0_6px_rgba(20,184,166,0.22)]",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          {!isLast ? (
            <>
              <span
                aria-hidden="true"
                className="absolute left-[19px] top-10 h-[calc(100%-40px)] w-[2px] bg-border/60 lg:hidden"
              />
              <span
                aria-hidden="true"
                className="absolute top-1/2 hidden h-[2px] w-[calc(100%+48px)] bg-border/60 lg:block lg:left-1/2 lg:translate-x-1/2"
              />
            </>
          ) : null}
        </div>

        <div className="flex-1 rounded-card border border-border/60 bg-card px-4 py-3 shadow-sm transition lg:text-center">
          <p className="text-sm font-semibold text-foreground">{entry.title}</p>
          {entry.description ? (
            <p className="text-xs text-muted-foreground">{entry.description}</p>
          ) : null}
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {new Date(entry.timestamp).toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {entry.note ? (
            <p className="mt-2 rounded-card border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
              {entry.note}
            </p>
          ) : null}
        </div>
      </div>
    </motion.li>
  );
}
