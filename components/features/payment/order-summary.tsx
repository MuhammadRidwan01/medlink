"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { PackageCheck, Shield } from "lucide-react";
import { InteractionHint } from "@/components/features/marketplace/interaction-hint";
import { useMarketplaceSafety } from "@/components/features/marketplace/store";
import { formatCurrency } from "@/lib/format";
import type { CheckoutItem, DeliveryOption } from "./mock-data";

type OrderSummaryProps = {
  items: CheckoutItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  selectedDelivery?: DeliveryOption;
};

export function OrderSummary({
  items,
  subtotal,
  shipping,
  discount,
  total,
  selectedDelivery,
}: OrderSummaryProps) {
  const warningsMap = useMarketplaceSafety((state) => state.warnings);
  const fetchConflicts = useMarketplaceSafety((state) => state.fetchConflicts);
  const trackedProductIds = useMemo(
    () => Array.from(new Set(items.map((item) => item.productId).filter(Boolean) as string[])),
    [items],
  );

  useEffect(() => {
    if (trackedProductIds.length) {
      void fetchConflicts(trackedProductIds);
    }
  }, [fetchConflicts, trackedProductIds]);

  return (
    <aside className="space-y-5 rounded-card border border-border/80 bg-card p-5 shadow-md">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-h3 text-foreground">Ringkasan Pesanan</h2>
          <p className="text-small text-muted-foreground">Periksa ulang sebelum membayar.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-badge border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Shield className="h-4 w-4" aria-hidden="true" />
          Garansi Otentik
        </span>
      </header>

      <div className="space-y-3">
        {items.map((item) => {
          const warnings = item.productId ? warningsMap[item.productId] ?? [] : [];
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-card border border-border/60 bg-muted/30 p-3"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-card bg-muted">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                  priority={false}
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
                <p className="text-xs text-muted-foreground">
                  Jumlah: <span className="font-semibold text-foreground">{item.quantity}</span>
                </p>
                <InteractionHint warnings={warnings} className="mt-1" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 rounded-card border border-border/60 bg-muted/40 p-4 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Diskon</span>
          <span className="font-semibold text-success">- {formatCurrency(discount)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Pengiriman{selectedDelivery ? ` (${selectedDelivery.label})` : ""}</span>
          <span className="font-semibold text-foreground">{formatCurrency(shipping)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border/70 pt-2 text-base font-semibold text-foreground">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="rounded-card border border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-button bg-primary/10 text-primary">
            <PackageCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Pengiriman diawasi apoteker</p>
            <p>
              Obat disiapkan oleh apotek mitra berizin. Kurir medis kami mendokumentasikan suhu dan
              kondisi penyimpanan selama perjalanan.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
