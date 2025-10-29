"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  PATIENT_CONTEXT,
  type MarketplaceProduct,
  type MarketplaceCategory,
} from "./data";
import type {
  MarketplaceSafetyResponse,
  MarketplaceSafetyResult,
  MarketplaceSafetySnapshot,
  MarketplaceSafetyWarning,
} from "@/components/features/marketplace/safety";

export type SortOption = "relevance" | "price-asc" | "price-desc" | "rating";

type MarketplaceState = {
  search: string;
  debouncedSearch: string;
  sort: SortOption;
  priceRange: [number, number];
  categories: MarketplaceCategory[];
  tags: string[];
  visibleCount: number;
  totalProducts: number;
  patientSnapshot: MarketplaceSafetySnapshot;
  setSearch: (value: string) => void;
  setDebouncedSearch: (value: string) => void;
  setSort: (value: SortOption) => void;
  setPriceRange: (range: [number, number]) => void;
  selectCategory: (category?: MarketplaceCategory) => void;
  toggleCategory: (category: MarketplaceCategory) => void;
  toggleTag: (tag: string) => void;
  resetFilters: () => void;
  loadMore: () => void;
  setPatientSnapshot: (snapshot: MarketplaceSafetySnapshot) => void;
  setTotalProducts: (count: number) => void;
};

const DEFAULT_PRICE_RANGE: [number, number] = [0, 600000];
const PAGE_SIZE = 8;

const FALLBACK_SNAPSHOT: MarketplaceSafetySnapshot = {
  allergies: PATIENT_CONTEXT.allergies,
  medications: PATIENT_CONTEXT.medications,
  source: "fallback",
};

export const useMarketplaceStore = create<MarketplaceState>()(
  devtools((set) => ({
    search: "",
    debouncedSearch: "",
    sort: "relevance",
    priceRange: DEFAULT_PRICE_RANGE,
    categories: [],
    tags: [],
    visibleCount: PAGE_SIZE,
    totalProducts: PAGE_SIZE,
    patientSnapshot: FALLBACK_SNAPSHOT,
    setSearch: (value) => set(() => ({ search: value })),
    setDebouncedSearch: (value) => set(() => ({ debouncedSearch: value, visibleCount: PAGE_SIZE })),
    setSort: (value) => set(() => ({ sort: value, visibleCount: PAGE_SIZE })),
    setPriceRange: (range) => set(() => ({ priceRange: range, visibleCount: PAGE_SIZE })),
    selectCategory: (category) =>
      set(() => ({
        categories: category ? [category] : [],
        visibleCount: PAGE_SIZE,
      })),
    toggleCategory: (category) =>
      set((state) => {
        const categories = state.categories.includes(category)
          ? state.categories.filter((item) => item !== category)
          : [...state.categories, category];
        return { categories, visibleCount: PAGE_SIZE };
      }),
    toggleTag: (tag) =>
      set((state) => {
        const tags = state.tags.includes(tag)
          ? state.tags.filter((item) => item !== tag)
          : [...state.tags, tag];
        return { tags, visibleCount: PAGE_SIZE };
      }),
    resetFilters: () =>
      set(() => ({
        search: "",
        debouncedSearch: "",
        sort: "relevance",
        priceRange: DEFAULT_PRICE_RANGE,
        categories: [],
        tags: [],
        visibleCount: PAGE_SIZE,
      })),
    loadMore: () =>
      set((state) => ({
        visibleCount: Math.min(state.visibleCount + PAGE_SIZE, state.totalProducts),
      })),
    setPatientSnapshot: (snapshot) => set(() => ({ patientSnapshot: snapshot })),
    setTotalProducts: (count) =>
      set((state) => ({
        totalProducts: count,
        visibleCount: Math.min(state.visibleCount, Math.max(count, PAGE_SIZE)),
      })),
  })),
);

export type CartItem = { product: MarketplaceProduct; quantity: number };

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: MarketplaceProduct) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  load: () => Promise<void>;
  toggle: (open?: boolean) => void;
  subtotal: () => number;
};

export const useMarketplaceCart = create<CartState>()(
  devtools((set, get) => ({
    items: [],
    isOpen: false,
    async load() {
      try {
        const res = await fetch("/api/marketplace/cart", { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 401) {
            set({ items: [] });
            return;
          }
          throw new Error(String(res.status));
        }
        const json = (await res.json()) as { items: CartItem[] };
        set({ items: json.items ?? [] });
      } catch (e) {
        console.error("[cart] load failed", e);
      }
    },
    async addItem(product) {
      try {
        const res = await fetch("/api/marketplace/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, qty: 1 }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as { items: CartItem[] };
        set({ items: json.items ?? [] });
        set({ isOpen: true });
      } catch (e) {
        console.error("[cart] add item failed", e);
      }
    },
    async removeItem(productId) {
      try {
        const url = new URL("/api/marketplace/cart", window.location.origin);
        url.searchParams.set("productId", productId);
        const res = await fetch(url.toString(), { method: "DELETE" });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as { items: CartItem[] };
        set({ items: json.items ?? [] });
      } catch (e) {
        console.error("[cart] remove item failed", e);
      }
    },
    async updateQuantity(productId, quantity) {
      try {
        const res = await fetch("/api/marketplace/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, qty: quantity }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as { items: CartItem[] };
        set({ items: json.items ?? [] });
      } catch (e) {
        console.error("[cart] update qty failed", e);
      }
    },
    toggle: (open) => {
      if (typeof open === "boolean") {
        set({ isOpen: open });
        if (open) void get().load();
      } else {
        set((state) => {
          const next = !state.isOpen;
          if (next) void get().load();
          return { isOpen: next };
        });
      }
    },
    subtotal: () => get().items.reduce((t, it) => t + it.product.price * it.quantity, 0),
  })),
);

type FilterState = Pick<
  MarketplaceState,
  "debouncedSearch" | "sort" | "priceRange" | "categories" | "tags"
>;

export function filterProducts(products: MarketplaceProduct[], state: FilterState) {
  const normalizedSearch = state.debouncedSearch.trim().toLowerCase();
  const [minPrice, maxPrice] = state.priceRange;

  let filtered = products.filter((product) => {
    const priceMatch = product.price >= minPrice && product.price <= maxPrice;
    const categoryMatch =
      state.categories.length === 0 ||
      state.categories.some((category) => product.categories.includes(category));
    const tagMatch =
      state.tags.length === 0 || state.tags.some((tag) => product.tags.includes(tag));
    const searchMatch =
      !normalizedSearch ||
      [product.name, product.shortDescription, ...product.tags, ...product.categories]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

    return priceMatch && categoryMatch && tagMatch && searchMatch;
  });

  switch (state.sort) {
    case "price-asc":
      filtered = filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered = filtered.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      filtered = filtered.sort((a, b) => b.rating - a.rating);
      break;
    default:
      filtered = filtered.sort((a, b) => b.rating * b.ratingCount - a.rating * a.ratingCount);
      break;
  }

  return filtered;
}

type SafetyState = {
  snapshot: MarketplaceSafetySnapshot;
  warnings: Record<string, MarketplaceSafetyWarning[]>;
  status: "idle" | "loading" | "ready" | "error";
  lastError?: string;
  fetchConflicts: (productIds: string[]) => Promise<MarketplaceSafetyResult[]>;
  resetWarnings: (productIds?: string[]) => void;
};

export const useMarketplaceSafety = create<SafetyState>()(
  devtools((set, get) => ({
    snapshot: FALLBACK_SNAPSHOT,
    warnings: {},
    status: "idle",
    lastError: undefined,
    async fetchConflicts(productIds) {
      const uniqueIds = [...new Set(productIds)];
      const currentWarnings = get().warnings;
      const missing = uniqueIds.filter((id) => !currentWarnings[id]);

      if (missing.length === 0) {
        return uniqueIds.map((id) => ({
          productId: id,
          warnings: currentWarnings[id] ?? [],
        }));
      }

      set({ status: "loading", lastError: undefined });

      try {
        const response = await fetch("/api/marketplace/safety", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productIds: missing }),
        });

        if (!response.ok) {
          throw new Error(`Safety API returned ${response.status}`);
        }

        const payload = (await response.json()) as MarketplaceSafetyResponse;
        const updatedMap: Record<string, MarketplaceSafetyWarning[]> = {
          ...currentWarnings,
        };

        payload.conflicts.forEach((result) => {
          updatedMap[result.productId] = result.warnings;
        });

        set({
          snapshot: payload.snapshot,
          warnings: updatedMap,
          status: "ready",
        });

        useMarketplaceStore.setState({
          patientSnapshot: payload.snapshot,
        });

        return uniqueIds.map((id) => ({
          productId: id,
          warnings: updatedMap[id] ?? [],
        }));
      } catch (error) {
        console.error("Failed to fetch marketplace safety data", error);
        set({
          status: "error",
          lastError: error instanceof Error ? error.message : "Unknown error",
        });
        return uniqueIds.map((id) => ({
          productId: id,
          warnings: currentWarnings[id] ?? [],
        }));
      }
    },
    resetWarnings(productIds) {
      if (!productIds || productIds.length === 0) {
        set({ warnings: {} });
        return;
      }
      const next = { ...get().warnings };
      productIds.forEach((id) => {
        delete next[id];
      });
      set({ warnings: next });
    },
  })),
);

// No longer re-export MOCK_PRODUCTS for production cart usage
