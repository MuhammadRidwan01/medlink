"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SearchX } from "lucide-react";
import type { MarketplaceProduct } from "@/components/features/marketplace/data";
import { ProductCard } from "@/components/features/marketplace/product-card";
import { useMarketplaceSafety } from "@/components/features/marketplace/store";
import { cn } from "@/lib/utils";

type ProductGridProps = {
  products: MarketplaceProduct[];
  visibleCount: number;
  onLoadMore?: () => void;
  hasMore: boolean;
};

export function ProductGrid({ products, visibleCount, onLoadMore, hasMore }: ProductGridProps) {
  const visibleProducts = products.slice(0, visibleCount);
  const fetchConflicts = useMarketplaceSafety((state) => state.fetchConflicts);
  const visibleProductIds = useMemo(
    () => visibleProducts.map((product) => product.id),
    [visibleProducts],
  );

  useEffect(() => {
    if (visibleProductIds.length) {
      void fetchConflicts(visibleProductIds);
    }
  }, [fetchConflicts, visibleProductIds]);

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "grid gap-4",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        )}
      >
        <AnimatePresence mode="popLayout">
          {visibleProducts.length ? (
            visibleProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="col-span-full flex flex-col items-center justify-center gap-3 rounded-card border border-border/60 bg-muted/20 p-8 text-center"
            >
              <SearchX className="h-8 w-8 text-muted-foreground/70" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Tidak ada produk yang cocok</p>
                <p className="text-xs text-muted-foreground">
                  Coba ubah kata kunci, reset filter, atau pilih kategori lain.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {hasMore && visibleProducts.length ? (
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
