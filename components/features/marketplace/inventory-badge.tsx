"use client";

import { AlertTriangle, PackageCheck, PackageSearch } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export type InventoryState = "in-stock" | "low-stock" | "out-of-stock";

type InventoryBadgeProps = {
  status: InventoryState;
  className?: string;
};

const config: Record<InventoryState, { label: string; className: string; icon: ComponentType<{ className?: string }> }> = {
  "in-stock": {
    label: "Tersedia",
    className: "border-success/40 bg-success/10 text-success",
    icon: PackageCheck,
  },
  "low-stock": {
    label: "Stok terbatas",
    className: "border-warning/40 bg-warning/10 text-warning",
    icon: AlertTriangle,
  },
  "out-of-stock": {
    label: "Habis",
    className: "border-danger/40 bg-danger/10 text-danger",
    icon: PackageSearch,
  },
};

export function InventoryBadge({ status, className }: InventoryBadgeProps) {
  const variant = config[status];
  const Icon = variant.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-badge border px-2.5 py-1 text-tiny font-semibold uppercase tracking-wide",
        variant.className,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {variant.label}
    </span>
  );
}
