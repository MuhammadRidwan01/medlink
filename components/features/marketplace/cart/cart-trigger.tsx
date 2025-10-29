"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useMarketplaceCart } from "@/components/features/marketplace/store";
import { cn } from "@/lib/utils";

type CartTriggerProps = {
  variant?: "desktop" | "floating";
};

export function CartTrigger({ variant = "desktop" }: CartTriggerProps) {
  const itemCount = useMarketplaceCart((state) => state.items.reduce((total, item) => total + item.quantity, 0));
  const toggle = useMarketplaceCart((state) => state.toggle);
  const load = useMarketplaceCart((state) => state.load);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    void load();
    if (itemCount > 0) {
      setPulse(true);
      const timeout = window.setTimeout(() => setPulse(false), 600);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [itemCount, load]);

  if (variant === "floating") {
    return (
      <button
        type="button"
        onClick={() => toggle(true)}
        className={cn(
          "tap-target fixed bottom-20 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-gradient text-primary-foreground shadow-xl transition hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          pulse && "animate-pulse",
        )}
        aria-label="Buka keranjang belanja"
      >
        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
        {itemCount ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {itemCount}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(true)}
      className={cn(
        "tap-target inline-flex items-center gap-2 rounded-button border border-border/60 bg-muted/30 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        pulse && "shadow-md",
      )}
    >
      <ShoppingCart className="h-4 w-4" aria-hidden="true" />
      Keranjang
      {itemCount ? (
        <span className="rounded-badge bg-primary/10 px-2 py-1 text-tiny font-semibold uppercase tracking-wide text-primary">
          {itemCount}
        </span>
      ) : null}
    </button>
  );
}
