"use client";

import { CheckCircle2, Clock3, Package, PackageCheck, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "./data";

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    icon: typeof Clock3;
    classes: string;
  }
> = {
  placed: {
    label: "Menunggu pembayaran",
    icon: Clock3,
    classes: "border-primary/40 bg-primary/10 text-primary",
  },
  paid: {
    label: "Terbayar",
    icon: CheckCircle2,
    classes: "border-accent/40 bg-accent/10 text-success",
  },
  packed: {
    label: "Dikemas",
    icon: Package,
    classes: "border-secondary/40 bg-secondary/10 text-secondary",
  },
  shipped: {
    label: "Dalam pengiriman",
    icon: Truck,
    classes: "border-warning/40 bg-warning/10 text-warning",
  },
  delivered: {
    label: "Selesai",
    icon: PackageCheck,
    classes: "border-success/40 bg-success/10 text-success",
  },
  canceled: {
    label: "Dibatalkan",
    icon: XCircle,
    classes: "border-destructive/40 bg-destructive/10 text-destructive",
  },
};

type StatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-badge border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        config.classes,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}
