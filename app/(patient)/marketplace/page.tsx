"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Database,
  HeartPulse,
  Loader2,
  ShieldAlert,
  Sparkles,
  Truck,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { CartSheet } from "@/components/features/marketplace/cart/cart-sheet";
import { CartTrigger } from "@/components/features/marketplace/cart/cart-trigger";
import { CategoryTabs } from "@/components/features/marketplace/category-tabs";
import { MarketplaceToolbar } from "@/components/features/marketplace/filters/toolbar";
import { ProductGrid } from "@/components/features/marketplace/product-grid";
import type { MarketplaceCategory, MarketplaceProduct } from "@/components/features/marketplace/data";
import { filterProducts, useMarketplaceStore } from "@/components/features/marketplace/store";

const categoryOrder: MarketplaceCategory[] = ["Obat", "Vitamin", "Perangkat", "Layanan", "Herbal"];

const marketplaceHighlights = [
  {
    icon: Sparkles,
    title: "Kurasi AI + klinis",
    description: "Insight konsultasi dan preferensi dokter diringkas ke rekomendasi personal.",
    tone: "primary",
  },
  {
    icon: ShieldAlert,
    title: "Safety terhubung",
    description: "Peringatan interaksi obat & alergi langsung ditarik dari snapshot resep Anda.",
    tone: "amber",
  },
  {
    icon: Truck,
    title: "Logistik adaptif",
    description: "Pengiriman same-day dengan pelacakan suhu serta pengingat refill otomatis.",
    tone: "emerald",
  },
] as const;

const highlightTone = {
  primary: {
    container:
      "border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-primary/10",
    icon: "bg-primary/15 text-primary",
  },
  emerald: {
    container:
      "border-emerald-400/50 bg-gradient-to-br from-emerald-100/40 via-emerald-50 to-transparent shadow-emerald-100/20",
    icon: "bg-emerald-500/15 text-emerald-600",
  },
  amber: {
    container:
      "border-amber-400/50 bg-gradient-to-br from-amber-100/50 via-amber-50 to-background shadow-amber-100/20",
    icon: "bg-amber-500/15 text-amber-600",
  },
} as const;

const initialCategoryCounts: Record<MarketplaceCategory, number> = {
  Obat: 0,
  Vitamin: 0,
  Perangkat: 0,
  Layanan: 0,
  Herbal: 0,
};

function dedupeProducts(products: MarketplaceProduct[]): MarketplaceProduct[] {
  const map = new Map<string, MarketplaceProduct>();
  products.forEach((product) => {
    map.set(product.id, product);
  });
  return Array.from(map.values());
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [dataSource, setDataSource] = useState<"fallback" | "supabase">("supabase");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    totalProducts,
    setSearch,
    setDebouncedSearch,
    setSort,
    setPriceRange,
    toggleCategory,
    toggleTag,
    resetFilters,
    loadMore,
    setTotalProducts,
  } = store;

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function hydrateProducts() {
      if (!isActive) {
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch("/api/marketplace/products", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Marketplace products API returned ${response.status}`);
        }
        const payload = (await response.json()) as {
          source: "fallback" | "supabase";
          products: MarketplaceProduct[];
        };

        if (!isActive) {
          return;
        }

        if (payload.products?.length) {
          const next = dedupeProducts(payload.products);
          setProducts(next);
          setDataSource(payload.source);
          setErrorMessage(null);
        }
      } catch (error) {
        if (!isActive || (error as Error).name === "AbortError") {
          return;
        }
        console.error("[marketplace] failed to hydrate products", error);
        setErrorMessage("Gagal memuat data Supabase, menampilkan katalog fallback Medlink.");
        setDataSource("fallback");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void hydrateProducts();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (totalProducts === products.length) {
      return;
    }
    setTotalProducts(products.length);
  }, [products.length, setTotalProducts, totalProducts]);

  const filteredProducts = useMemo(
    () => filterProducts(products, { debouncedSearch, sort, priceRange, categories, tags }),
    [products, debouncedSearch, sort, priceRange, categories, tags],
  );

  const hasMore = filteredProducts.length > visibleCount;

  const categoryCounts = useMemo(() => {
    return products.reduce((acc, product) => {
      product.categories.forEach((category) => {
        acc[category] = (acc[category] ?? 0) + 1;
      });
      return acc;
    }, { ...initialCategoryCounts });
  }, [products]);

  const availableCategories = useMemo(() => {
    return categoryOrder.filter((category) => categoryCounts[category] > 0);
  }, [categoryCounts]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    products.forEach((product) => {
      product.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).slice(0, 12);
  }, [products]);

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

  const isSupabase = dataSource === "supabase";

  return (
    <PageShell
      title="Marketplace Medis"
      subtitle="Belanja kebutuhan kesehatan dengan rekomendasi AI dan apotek terverifikasi."
      className="relative space-y-10 pb-24 lg:space-y-12"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_320px]">
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm lg:p-8">
          <div className="absolute right-[-120px] top-[-120px] h-60 w-60 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute bottom-[-140px] left-[15%] h-60 w-60 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),transparent_55%)]" />
          <div className="relative flex flex-col gap-4">
            <span className="inline-flex w-max items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Marketplace Beta
            </span>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground lg:text-3xl">
                Kurasi produk & layanan kesehatan yang adaptif dengan profil Anda.
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground lg:text-base">
                Katalog menggabungkan data klinis, preferensi alergi, dan riwayat pemesanan. Gunakan
                tab kategori serta filter dinamis untuk mendapatkan kecocokan tercepat.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-background/80 px-3 py-1 text-primary">
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Database className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {isSupabase ? "Terhubung ke Supabase" : "Menampilkan katalog fallback offline"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                  {products.length} produk tersedia
                </span>
              </div>
              {errorMessage ? (
                <p className="inline-flex items-center gap-2 rounded-card border border-warning/50 bg-warning/10 px-3 py-2 text-xs text-warning">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  {errorMessage}
                </p>
              ) : null}
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

      <CategoryTabs categories={availableCategories} counts={categoryCounts} />

      <div className="grid gap-4 lg:grid-cols-3">
        {marketplaceHighlights.map((item) => {
          const tone = highlightTone[item.tone];
          return (
            <div
              key={item.title}
              className={`relative overflow-hidden rounded-2xl border p-5 transition shadow-sm hover:shadow-md ${tone.container}`}
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

      {availableTags.length ? (
        <section className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-sm">
          <header className="mb-3 flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Tag populer minggu ini</p>
              <p className="text-xs text-muted-foreground">
                Telusuri cepat berdasarkan tren pencarian pasien dan rekomendasi dokter.
              </p>
            </div>
            <span className="hidden rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground md:inline-flex">
              {availableTags.length} tag aktif
            </span>
          </header>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const selected = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`tap-target rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    selected
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

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
          availableCategories={availableCategories}
          tags={tags}
          availableTags={availableTags}
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
