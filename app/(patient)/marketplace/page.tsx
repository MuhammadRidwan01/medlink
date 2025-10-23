"use client";

import { useMemo } from "react";
import {
  ArrowRight,
  HeartPulse,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { CartSheet } from "@/components/features/marketplace/cart/cart-sheet";
import { CartTrigger } from "@/components/features/marketplace/cart/cart-trigger";
import { CategoryTabs } from "@/components/features/marketplace/category-tabs";
import { MarketplaceToolbar } from "@/components/features/marketplace/filters/toolbar";
import { ProductGrid } from "@/components/features/marketplace/product-grid";
import { MOCK_PRODUCTS, type MarketplaceCategory } from "@/components/features/marketplace/data";
import { filterProducts, useMarketplaceStore } from "@/components/features/marketplace/store";

const marketplaceHighlights = [
  {
    icon: ShoppingBag,
    title: "Kurasi mitra apotek",
    description: "Semua produk berasal dari jaringan apotek terverifikasi dengan rantai pasok terkontrol.",
    tone: "primary",
  },
  {
    icon: Truck,
    title: "Pengiriman adaptif",
    description: "Same-day untuk kota besar, lengkap dengan pelacakan suhu dan status pengantaran.",
    tone: "emerald",
  },
  {
    icon: Sparkles,
    title: "Rekomendasi AI",
    description: "Sistem memantau interaksi obat dan preferensi profil Anda sebelum checkout.",
    tone: "purple",
  },
] as const;

const highlightTone = {
  primary: {
    container: "border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
    icon: "bg-primary/15 text-primary",
  },
  emerald: {
    container: "border-emerald-400/40 bg-gradient-to-br from-emerald-100/40 via-emerald-50 to-transparent",
    icon: "bg-emerald-500/15 text-emerald-600",
  },
  purple: {
    container: "border-purple-400/40 bg-gradient-to-br from-purple-100/40 via-purple-50 to-transparent",
    icon: "bg-purple-500/15 text-purple-600",
  },
} as const;

const allCategories = Array.from(
  new Set(MOCK_PRODUCTS.flatMap((product) => product.categories)),
) as MarketplaceCategory[];
const allTags = Array.from(new Set(MOCK_PRODUCTS.flatMap((product) => product.tags))).slice(0, 12);

const initialCategoryCounts: Record<MarketplaceCategory, number> = {
  Obat: 0,
  Vitamin: 0,
  Perangkat: 0,
  Layanan: 0,
  Herbal: 0,
};

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
    patientSnapshot,
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

  const categoryCounts = useMemo(() => {
    return MOCK_PRODUCTS.reduce((acc, product) => {
      product.categories.forEach((category) => {
        acc[category] = (acc[category] ?? 0) + 1;
      });
      return acc;
    }, { ...initialCategoryCounts });
  }, []);

  const [primaryAllergy, ...restAllergies] = patientSnapshot.allergies;
  const allergySummary =
    patientSnapshot.allergies.length > 0
      ? [primaryAllergy, restAllergies[0]].filter(Boolean).join(", ") +
        (patientSnapshot.allergies.length > 2 ? ` +${patientSnapshot.allergies.length - 2}` : "")
      : "Tidak ada catatan alergi";
  const [primaryMedication, ...restMedications] = patientSnapshot.medications;
  const medicationSummary =
    patientSnapshot.medications.length > 0
      ? [primaryMedication, restMedications[0]].filter(Boolean).join(", ") +
        (patientSnapshot.medications.length > 2 ? ` +${patientSnapshot.medications.length - 2}` : "")
      : "Belum ada obat aktif";

  return (
    <PageShell
      title="Marketplace Medis"
      subtitle="Belanja kebutuhan kesehatan dengan rekomendasi AI dan apotek terverifikasi."
      className="relative space-y-10 pb-24 lg:space-y-12"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_320px]">
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm lg:p-8">
          <div className="absolute right-[-120px] top-[-80px] h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-[-120px] left-[10%] h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative flex flex-col gap-4">
            <span className="inline-flex w-max items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Marketplace Beta
            </span>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground lg:text-3xl">
                Kurasi produk & layanan kesehatan yang adaptif dengan profil Anda.
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground lg:text-base">
                Fitur rekomendasi kami otomatis memeriksa interaksi obat dan alergi sebelum Anda
                checkout. Gunakan tab kategori dan filter pintar untuk penyaringan cepat.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#filter-marketplace"
                className="tap-target inline-flex items-center gap-2 rounded-button border border-primary/60 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Sesuaikan filter
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <div className="hidden md:block">
                <CartTrigger variant="desktop" />
              </div>
            </div>
          </div>
        </section>

        <aside className="card-surface flex h-full flex-col gap-4 rounded-3xl border border-border/60 p-6 shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Profil kesehatan Anda
            </p>
            <p className="text-sm text-muted-foreground">
              Marketplace menyesuaikan rekomendasi berdasarkan data konsultasi terakhir.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-card border border-warning/50 bg-warning/10 p-3 text-sm text-warning">
              <ShieldAlert className="mt-0.5 h-4 w-4" aria-hidden="true" />
              <div>
                <p className="font-semibold">Alergi terpantau</p>
                <p>{allergySummary}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-card border border-primary/50 bg-primary/10 p-3 text-sm text-primary">
              <HeartPulse className="mt-0.5 h-4 w-4" aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">Obat aktif & kontrol</p>
                <p className="text-primary">{medicationSummary}</p>
              </div>
            </div>
          </div>
          <div className="rounded-card border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            Tips: produk dengan tanda peringatan interaksi akan muncul lebih awal agar Anda dapat
            berkonsultasi sebelum menambahkan ke keranjang.
          </div>
        </aside>
      </div>

      <CategoryTabs categories={allCategories} counts={categoryCounts} />

      <div className="grid gap-4 lg:grid-cols-3">
        {marketplaceHighlights.map((item) => {
          const tone = highlightTone[item.tone];
          return (
            <div
              key={item.title}
              className={`relative overflow-hidden rounded-2xl border p-5 transition hover:shadow-md ${tone.container}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone.icon}`}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section id="filter-marketplace">
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
      </section>

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
