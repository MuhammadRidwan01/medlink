'use client';

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShoppingCart, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/layout/page-shell";
import { InteractionHint } from "@/components/features/marketplace/interaction-hint";
import { InventoryBadge } from "@/components/features/marketplace/inventory-badge";
import { RatingStars } from "@/components/features/marketplace/rating-stars";
import { CartSheet } from "@/components/features/marketplace/cart/cart-sheet";
import { CartTrigger } from "@/components/features/marketplace/cart/cart-trigger";
import { MOCK_PRODUCTS } from "@/components/features/marketplace/data";
import { useMarketplaceCart } from "@/components/features/marketplace/store";

type ProductDetailPageClientProps = {
  slug: string;
};

const conflictFlags = new Set([
  "danger",
  "warning",
  "allergy-penisilin",
  "allergy-sulfa",
  "med-metformin",
  "med-atorvastatin",
]);

export function ProductDetailPageClient({
  slug,
}: ProductDetailPageClientProps) {
  const product = MOCK_PRODUCTS.find((item) => item.slug === slug);
  const addItem = useMarketplaceCart((state) => state.addItem);
  const toggleCart = useMarketplaceCart((state) => state.toggle);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    return MOCK_PRODUCTS.filter(
      (item) =>
        item.id !== product.id &&
        item.categories.some((category) =>
          product.categories.includes(category),
        ),
    ).slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <PageShell
        title="Produk tidak ditemukan"
        subtitle="Silakan kembali ke marketplace untuk melihat produk lainnya."
      >
        <Link
          href="/marketplace"
          className="tap-target inline-flex items-center gap-2 rounded-button border border-border/60 bg-muted/30 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Marketplace
        </Link>
      </PageShell>
    );
  }

  const conflicts = (product.conflicts ?? []).filter((flag) =>
    conflictFlags.has(flag),
  );

  const handleAddCart = () => {
    addItem(product);
    toggleCart(true);
  };

  return (
    <PageShell
      title={product.name}
      subtitle="Detail produk, manfaat, dan rekomendasi penggunaan."
      className="relative space-y-8 pb-24 lg:pb-16"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Link
          href="/marketplace"
          className="tap-target inline-flex items-center gap-2 rounded-button border border-border/60 bg-muted/30 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali
        </Link>
        <div className="hidden md:block">
          <CartTrigger variant="desktop" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="card-surface space-y-4 p-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card bg-muted">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <RatingStars rating={product.rating} count={product.ratingCount} />
            <InventoryBadge status={product.inventoryStatus} />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.longDescription}
          </p>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-button border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground"
              >
                <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                #{tag}
              </span>
            ))}
          </div>
          <InteractionHint conflicts={conflicts} />
        </div>

        <aside className="card-surface flex h-max flex-col gap-4 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Harga
            </p>
            <p className="text-2xl font-semibold text-foreground">
              Rp {product.price.toLocaleString("id-ID")}
            </p>
          </div>
          {product.badges?.length ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {product.badges.map((badge) => (
                <li key={badge} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  {badge}
                </li>
              ))}
            </ul>
          ) : null}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleAddCart}
            className="tap-target inline-flex items-center justify-center gap-2 rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Tambah ke keranjang
          </motion.button>
          <div className="rounded-card border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Interaksi akan diperiksa lagi saat checkout untuk memastikan keamanan terapi Anda.
          </div>
        </aside>
      </div>

      {relatedProducts.length ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Produk serupa</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <Link
                key={related.id}
                href={`/marketplace/product/${related.slug}`}
                prefetch
                className="card-surface flex h-full flex-col overflow-hidden border border-border/60 transition hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <Image
                    src={related.imageUrl}
                    alt={related.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-sm font-semibold text-foreground line-clamp-2">
                    {related.name}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {related.shortDescription}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    Rp {related.price.toLocaleString("id-ID")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <CartSheet />
      <CartTrigger variant="floating" />
    </PageShell>
  );
}
