"use client";

import { MapPin, NotebookPen, Phone, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderAddress } from "./data";

type DeliveryAddressCardProps = {
  address: OrderAddress;
  className?: string;
};

export function DeliveryAddressCard({ address, className }: DeliveryAddressCardProps) {
  return (
    <section
      className={cn(
        "rounded-card border border-border/60 bg-card p-4 shadow-sm",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">Alamat Pengantaran</h2>
        </div>
        <span className="rounded-badge border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
          {address.label}
        </span>
      </header>
      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-foreground">{address.recipient}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>{address.phone}</span>
        </div>
        <p>{address.addressLine}</p>
        <p>
          {address.city} • {address.postalCode}
        </p>
        {address.notes ? (
          <p className="flex items-start gap-2 rounded-card border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
            <NotebookPen className="mt-0.5 h-4 w-4" aria-hidden="true" />
            {address.notes}
          </p>
        ) : null}
      </div>
    </section>
  );
}
