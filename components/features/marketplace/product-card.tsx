"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MarketplaceProduct } from "@/components/features/marketplace/data";
import { InteractionHint } from "@/components/features/marketplace/interaction-hint";
import { InventoryBadge } from "@/components/features/marketplace/inventory-badge";
import { RatingStars } from "@/components/features/marketplace/rating-stars";
import { useMarketplaceCart, useMarketplaceSafety } from "@/components/features/marketplace/store";

type ProductCardProps = {
  product: MarketplaceProduct;
  priority?: boolean;
};

export function ProductCard({ product, priority }: ProductCardProps) {
  const addItem = useMarketplaceCart((state) => state.addItem);
  const toggleCart = useMarketplaceCart((state) => state.toggle);
  const warningEntry = useMarketplaceSafety((state) => state.warnings[product.id]);
  const [isAdding, setIsAdding] = useState(false);

  const warnings = warningEntry ?? [];

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(product);
    toggleCart(true);
    window.setTimeout(() => setIsAdding(false), 240);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="card-surface group flex h-full flex-col border border-border/60"
    >
      <Link
        href={`/marketplace/product/${product.slug}`}
        prefetch
        className="relative block overflow-hidden"
        aria-label={`Lihat detail ${product.name}`}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-card bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-normal ease-out group-hover:scale-105"
            priority={priority}
          />
          {product.badges?.length ? (
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              {product.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-badge bg-primary/90 px-2 py-1 text-tiny font-semibold uppercase tracking-wide text-white shadow-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              <Link href={`/marketplace/product/${product.slug}`} prefetch className="hover:underline">
                {product.name}
              </Link>
            </h3>
            <InventoryBadge status={product.inventoryStatus} />
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{product.shortDescription}</p>
          <RatingStars rating={product.rating} count={product.ratingCount} />
        </div>

        <div className="mt-auto space-y-2">
          <p className="text-lg font-semibold text-foreground">Rp {product.price.toLocaleString("id-ID")}</p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className={cn(
              "tap-target flex w-full items-center justify-center gap-2 rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isAdding && "scale-[0.99]",
            )}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Tambah ke keranjang
          </motion.button>
          <InteractionHint warnings={warnings ?? []} />
        </div>
      </div>
    </motion.article>
  );
}
