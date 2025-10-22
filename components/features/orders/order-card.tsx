"use client";

import { CalendarDays, ChevronRight, PackageCheck } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import type { OrderSummary } from "./data";
import { StatusBadge } from "./status-badge";

type OrderCardProps = {
  order: OrderSummary;
  onView: () => void;
  onReorder: () => void;
};

export function OrderCard({ order, onView, onReorder }: OrderCardProps) {
  return (
    <motion.article
      layout
      className="card-surface interactive flex flex-col gap-4 border border-border/60 p-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            ID Pesanan
          </p>
          <h2 className="text-lg font-semibold text-foreground">{order.id}</h2>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-badge border border-border/60 bg-muted/40 px-3 py-1 text-xs">
          <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          {new Date(order.placedAt).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span className="font-semibold text-foreground">Total {formatCurrency(order.total)}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {order.timeline.slice(0, 3).map((entry) => (
          <span key={entry.status} className="rounded-badge border border-border/50 px-3 py-1">
            {entry.title}
          </span>
        ))}
        {order.timeline.length > 3 ? (
          <span className="rounded-badge border border-border/50 px-3 py-1">+{order.timeline.length - 3} langkah</span>
        ) : null}
      </div>

      <footer className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onView}
          className="tap-target inline-flex items-center justify-center gap-2 rounded-button border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Lihat detail
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onReorder}
          className="tap-target inline-flex items-center justify-center gap-2 rounded-button bg-gradient-to-r from-primary to-primary-dark px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <PackageCheck className="h-4 w-4" aria-hidden="true" />
          Reorder
        </button>
      </footer>
    </motion.article>
  );
}
