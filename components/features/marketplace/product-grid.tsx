"use client";

import { AnimatePresence } from "framer-motion";
import type { MarketplaceProduct } from "@/components/features/marketplace/data";
import { ProductCard } from "@/components/features/marketplace/product-card";
import { cn } from "@/lib/utils";

type ProductGridProps = {
  products: MarketplaceProduct[];
  visibleCount: number;
  onLoadMore?: () => void;
  hasMore: boolean;
};

export function ProductGrid({ products, visibleCount, onLoadMore, hasMore }: ProductGridProps) {
  const visibleProducts = products.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "grid gap-4",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        )}
      >
        <AnimatePresence>
          {visibleProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </AnimatePresence>
      </div>
      {hasMore ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            className="tap-target inline-flex items-center justify-center rounded-button border border-border/60 bg-muted/30 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted/50"
          >
            Muat lebih banyak
          </button>
        </div>
      ) : null}
    </div>
  );
}
