"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { OrderStatus, OrderTimelineEntry } from "./data";
import { MilestoneNode } from "./milestone-node";

const STATUS_ORDER: OrderStatus[] = ["placed", "paid", "packed", "shipped", "delivered"];

type CourierTimelineProps = {
  entries: OrderTimelineEntry[];
  currentStatus: OrderStatus;
};

export function CourierTimeline({ entries, currentStatus }: CourierTimelineProps) {
  const normalizedEntries = useMemo(() => {
    const entryByStatus = new Map(entries.map((entry) => [entry.status, entry]));
    const ordered = STATUS_ORDER.map((status) => entryByStatus.get(status)).filter(
      (entry): entry is OrderTimelineEntry => Boolean(entry),
    );
    const extras = entries.filter(
      (entry) => !STATUS_ORDER.includes(entry.status),
    );
    return [...ordered, ...extras];
  }, [entries]);

  return (
    <section className="rounded-card border border-border/70 bg-card p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Perjalanan Pesanan</h2>
          <p className="text-xs text-muted-foreground">
            Status diperbarui real-time oleh kurir medis dan apotek.
          </p>
        </div>
      </header>

      <motion.ol
        layout
        className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      >
        {normalizedEntries.map((entry, index) => {
          const isActive = entry.status === currentStatus;
          const currentIndex = STATUS_ORDER.indexOf(currentStatus);
          const entryIndex = STATUS_ORDER.indexOf(entry.status);
          const isCompleted =
            (entryIndex !== -1 && currentIndex !== -1 && entryIndex <= currentIndex) ||
            entry.status === currentStatus;
          const isLast = index === normalizedEntries.length - 1;

          return (
            <MilestoneNode
              key={entry.status}
              entry={entry}
              index={index}
              isActive={isActive}
              isCompleted={isCompleted}
              isLast={isLast}
            />
          );
        })}
      </motion.ol>
    </section>
  );
}
