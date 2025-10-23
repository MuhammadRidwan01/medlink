"use client";

import { motion } from "framer-motion";
import { useMemo, type ElementType } from "react";
import { Grid3x3, HandHeart, Leaf, Pill, Sparkles, Stethoscope } from "lucide-react";
import type { MarketplaceCategory } from "@/components/features/marketplace/data";
import { useMarketplaceStore } from "@/components/features/marketplace/store";
import { cn } from "@/lib/utils";

type CategoryTabsProps = {
  categories: MarketplaceCategory[];
  counts: Record<MarketplaceCategory, number>;
};

type TabItem = {
  id: "all" | MarketplaceCategory;
  label: string;
  description: string;
  icon: ElementType;
  count: number;
};

export function CategoryTabs({ categories, counts }: CategoryTabsProps) {
  const activeCategories = useMarketplaceStore((state) => state.categories);
  const selectCategory = useMarketplaceStore((state) => state.selectCategory);

  const tabs = useMemo<TabItem[]>(() => {
    const base: TabItem[] = [
      {
        id: "all",
        label: "Semua",
        description: "Kurasi lengkap pilihan Medlink",
        icon: Grid3x3,
        count: Object.values(counts).reduce((total, value) => total + value, 0),
      },
      {
        id: "Obat",
        label: "Obat",
        description: "Resep & OTC yang aman",
        icon: Pill,
        count: counts.Obat ?? 0,
      },
      {
        id: "Vitamin",
        label: "Vitamin",
        description: "Nutrisi harian & suplementasi",
        icon: Sparkles,
        count: counts.Vitamin ?? 0,
      },
      {
        id: "Perangkat",
        label: "Perangkat",
        description: "Monitoring & perangkat smart",
        icon: HandHeart,
        count: counts.Perangkat ?? 0,
      },
      {
        id: "Herbal",
        label: "Herbal",
        description: "Racikan alami pilihan tim medis",
        icon: Leaf,
        count: counts.Herbal ?? 0,
      },
      {
        id: "Layanan",
        label: "Layanan",
        description: "Konsultasi & home visit terjadwal",
        icon: Stethoscope,
        count: counts.Layanan ?? 0,
      },
    ];

    if (!categories.length) {
      return base;
    }

    return base.filter((item) => item.id === "all" || categories.includes(item.id));
  }, [categories, counts]);

  const activeId = activeCategories.length === 1 ? activeCategories[0] : "all";

  return (
    <div className="sticky top-[76px] z-30 -mx-4 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:-mx-8 md:rounded-card md:border md:px-6 md:py-4">
      <div className="flex snap-x gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() =>
                selectCategory(tab.id === "all" ? undefined : (tab.id as MarketplaceCategory))
              }
              whileTap={{ scale: 0.98 }}
              className={cn(
                "tap-target relative flex min-w-[220px] flex-col items-start gap-1 rounded-card border px-4 py-3 text-left transition-all duration-150 ease-out md:min-w-0",
                isActive
                  ? "border-primary/60 bg-primary/5 text-primary shadow-sm"
                  : "border-border/60 bg-muted/20 text-muted-foreground hover:border-primary/30",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute inset-x-2 top-2 h-1 rounded-full bg-primary/60"
                />
              ) : null}
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </span>
              <span className="text-xs">
                {tab.description}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {tab.count} produk
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
