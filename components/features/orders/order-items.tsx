"use client";

import Image from "next/image";
import { PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { DRUG_IMAGE_SRC } from "@/lib/product-image";
import type { OrderItem } from "./data";

type OrderItemsProps = {
  items: OrderItem[];
  className?: string;
};

export function OrderItems({ items, className }: OrderItemsProps) {
  return (
    <section
      className={cn(
        "space-y-4 rounded-card border border-border/60 bg-card p-4 shadow-sm",
        className,
      )}
    >
      <header className="flex items-center gap-2">
        <PackageSearch className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-foreground">Rincian Produk</h2>
      </header>
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex items-center gap-3 rounded-card border border-border/60 bg-muted/30 p-3"
          >
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-card bg-muted">
              <Image
                src={DRUG_IMAGE_SRC}
                alt={item.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
              <p className="text-xs text-muted-foreground">
                Jumlah: <span className="font-semibold text-foreground">{item.quantity}</span>
              </p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(item.price * item.quantity)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
