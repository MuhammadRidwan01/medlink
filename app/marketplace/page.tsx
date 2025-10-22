"use client";

import { useMemo } from "react";
import { Pill, ShoppingBag, Truck } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { CartSheet } from "@/components/features/marketplace/cart/cart-sheet";
import { CartTrigger } from "@/components/features/marketplace/cart/cart-trigger";
import { MarketplaceToolbar } from "@/components/features/marketplace/filters/toolbar";
import { ProductGrid } from "@/components/features/marketplace/product-grid";
import { MOCK_PRODUCTS, type MarketplaceCategory } from "@/components/features/marketplace/data";
import { filterProducts, useMarketplaceStore } from "@/components/features/marketplace/store";

const marketplaceHighlights = [
  {
    icon: ShoppingBag,
    title: "Produk Populer",
    description: "Temukan obat & wellness kit terpercaya dari mitra apotek.",
  },
  {
    icon: Truck,
    title: "Pengiriman Cepat",
    description: "Pengantaran same-day di kota besar, aman dan terjaga.",
  },
  {
    icon: Pill,
    title: "Interaksi Obat Cerdas",
    description: "AI akan memeriksa interaksi obat sebelum checkout.",
  },
] as const;

const allCategories = Array.from(
  new Set(MOCK_PRODUCTS.flatMap((product) => product.categories)),
) as MarketplaceCategory[];
const allTags = Array.from(new Set(MOCK_PRODUCTS.flatMap((product) => product.tags))).slice(0, 12);

export default function MarketplacePage() {
  const store = useMarketplaceStore();
  const {
    search,
    debouncedSearch,
    sort,
    priceRange,
    categories,
    tags,
    visibleCount,
    setSearch,
    setDebouncedSearch,
    setSort,
    setPriceRange,
    toggleCategory,
    toggleTag,
    resetFilters,
    loadMore,
  } = store;

  const filteredProducts = useMemo(
    () => filterProducts(MOCK_PRODUCTS, { debouncedSearch, sort, priceRange, categories, tags }),
    [debouncedSearch, sort, priceRange, categories, tags],
  );

  const hasMore = filteredProducts.length > visibleCount;

  return (
    <PageShell
      title="Marketplace Medis"
      subtitle="Belanja kebutuhan kesehatan dengan rekomendasi AI dan apotek terverifikasi."
      className="relative space-y-8"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground md:max-w-xl">
          Pilih produk kesehatan yang sudah dikurasi oleh tim medis kami. Sistem akan memberi tahu jika ada potensi interaksi dengan profil Anda.
        </p>
        <div className="hidden md:block">
          <CartTrigger variant="desktop" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {marketplaceHighlights.map((item) => (
          <div key={item.title} className="card-surface p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-button bg-accent/10 text-accent">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="text-body font-semibold text-foreground">{item.title}</h3>
            </div>
            <p className="text-small text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>

      <MarketplaceToolbar
        search={search}
        onSearchChange={setSearch}
        setDebounced={setDebouncedSearch}
        sort={sort}
        onSortChange={setSort}
        priceRange={priceRange}
        onPriceChange={setPriceRange}
        categories={categories}
        availableCategories={allCategories}
        tags={tags}
        availableTags={allTags}
        onToggleTag={toggleTag}
        onToggleCategory={toggleCategory}
        onReset={resetFilters}
      />

      <ProductGrid
        products={filteredProducts}
        visibleCount={visibleCount}
        onLoadMore={loadMore}
        hasMore={hasMore}
      />

      <CartSheet />
      <CartTrigger variant="floating" />
    </PageShell>
  );
}
