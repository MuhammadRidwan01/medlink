"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketplaceCategory } from "@/components/features/marketplace/data";
import type { SortOption } from "@/components/features/marketplace/store";

type ToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  setDebounced: (value: string) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  categories: MarketplaceCategory[];
  onToggleCategory: (category: MarketplaceCategory) => void;
  availableCategories: MarketplaceCategory[];
  tags: string[];
  availableTags: string[];
  onToggleTag: (tag: string) => void;
  onReset: () => void;
};

export function MarketplaceToolbar({
  search,
  onSearchChange,
  setDebounced,
  sort,
  onSortChange,
  priceRange,
  onPriceChange,
  categories,
  availableCategories,
  tags,
  availableTags,
  onToggleTag,
  onToggleCategory,
  onReset,
}: ToolbarProps) {
  const [minPrice, setMinPrice] = useState(priceRange[0]);
  const [maxPrice, setMaxPrice] = useState(priceRange[1]);

  useEffect(() => {
    setMinPrice(priceRange[0]);
    setMaxPrice(priceRange[1]);
  }, [priceRange]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebounced(search);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [search, setDebounced]);

  const hasActiveFilters = useMemo(() => {
    return (
      search.trim().length > 0 ||
      sort !== "relevance" ||
      categories.length > 0 ||
      tags.length > 0 ||
      minPrice !== 0 ||
      maxPrice !== 600000
    );
  }, [search, sort, categories, tags, minPrice, maxPrice]);

  const handlePriceBlur = () => {
    const normalized: [number, number] = [Math.max(0, minPrice), Math.max(minPrice, maxPrice)];
    onPriceChange(normalized);
  };

  return (
    <section className="space-y-4 rounded-card border border-border/60 bg-card p-4 shadow-sm">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4 text-primary" />
          Filter Marketplace
        </div>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="tap-target inline-flex items-center gap-2 self-start rounded-button border border-border/60 bg-muted/30 px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-muted/50"
          >
            <X className="h-3.5 w-3.5" />
            Bersihkan filter
          </button>
        ) : null}
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <label className="flex items-center gap-2 rounded-input border border-border/70 bg-muted/30 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari produk atau manfaat"
            className="tap-target w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            aria-label="Cari produk"
          />
        </label>
        <label className="flex items-center gap-2 rounded-input border border-border/70 bg-muted/30 px-3 py-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            className="tap-target w-full bg-transparent text-sm font-medium outline-none"
            aria-label="Urutkan produk"
          >
            <option value="relevance">Paling relevan</option>
            <option value="price-asc">Harga terendah</option>
            <option value="price-desc">Harga tertinggi</option>
            <option value="rating">Rating tertinggi</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rentang harga (IDR)</p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={(event) => setMinPrice(Number(event.target.value))}
              onBlur={handlePriceBlur}
              className="tap-target w-full rounded-input border border-border/60 bg-background px-3 py-2 text-sm shadow-sm transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Harga minimum"
            />
            <span className="text-xs text-muted-foreground">—</span>
            <input
              type="number"
              min={minPrice}
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              onBlur={handlePriceBlur}
              className="tap-target w-full rounded-input border border-border/60 bg-background px-3 py-2 text-sm shadow-sm transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Harga maksimum"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kategori</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {availableCategories.map((category) => {
              const isActive = categories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onToggleCategory(category)}
                  className={cn(
                    "tap-target rounded-button border px-3 py-1.5 text-xs font-semibold transition-all duration-fast ease-out",
                    isActive
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:border-primary/30",
                  )}
                  aria-pressed={isActive}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tag populer</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const isActive = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className={cn(
                  "tap-target rounded-button border px-3 py-1.5 text-xs font-semibold transition-all duration-fast ease-out",
                  isActive
                    ? "border-secondary bg-secondary/10 text-secondary shadow-sm"
                    : "border-border/60 bg-muted/20 text-muted-foreground hover:border-secondary/30",
                )}
                aria-pressed={isActive}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
