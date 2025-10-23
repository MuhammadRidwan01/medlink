"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  MOCK_PRODUCTS,
  PATIENT_CONTEXT,
  type MarketplaceProduct,
  type MarketplaceCategory,
} from "./data";
import {
  getCurrentProfileSnapshot,
  subscribeToProfileSnapshot,
  type SnapshotEventDetail,
} from "@/components/features/profile/store";

export type SortOption = "relevance" | "price-asc" | "price-desc" | "rating";

type PatientSnapshotStrings = {
  allergies: string[];
  medications: string[];
};

type MarketplaceState = {
  search: string;
  debouncedSearch: string;
  sort: SortOption;
  priceRange: [number, number];
  categories: MarketplaceCategory[];
  tags: string[];
  visibleCount: number;
  patientSnapshot: PatientSnapshotStrings;
  setSearch: (value: string) => void;
  setDebouncedSearch: (value: string) => void;
  setSort: (value: SortOption) => void;
  setPriceRange: (range: [number, number]) => void;
  toggleCategory: (category: MarketplaceCategory) => void;
  toggleTag: (tag: string) => void;
  resetFilters: () => void;
  loadMore: () => void;
  setPatientSnapshot: (snapshot: PatientSnapshotStrings) => void;
};

const DEFAULT_PRICE_RANGE: [number, number] = [0, 600000];
const PAGE_SIZE = 8;

const initialSnapshotDetail = getInitialProfileSnapshot();
let patientConflictSet = createConflictSet(initialSnapshotDetail);

export const useMarketplaceStore = create<MarketplaceState>()(
  devtools((set) => ({
    search: "",
    debouncedSearch: "",
    sort: "relevance",
    priceRange: DEFAULT_PRICE_RANGE,
    categories: [],
    tags: [],
    visibleCount: PAGE_SIZE,
    patientSnapshot: {
      allergies: initialSnapshotDetail.allAllergies.map((a) => a.substance),
      medications: initialSnapshotDetail.allMedications
        .filter((med) => med.status === "active")
        .map((med) => med.name),
    },
    setSearch: (value) => set(() => ({ search: value })),
    setDebouncedSearch: (value) => set(() => ({ debouncedSearch: value, visibleCount: PAGE_SIZE })),
    setSort: (value) => set(() => ({ sort: value, visibleCount: PAGE_SIZE })),
    setPriceRange: (range) => set(() => ({ priceRange: range, visibleCount: PAGE_SIZE })),
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
        visibleCount: Math.min(state.visibleCount + PAGE_SIZE, MOCK_PRODUCTS.length),
      })),
    setPatientSnapshot: (snapshot) => set(() => ({ patientSnapshot: snapshot })),
  })),
);

export type CartItem = {
  product: MarketplaceProduct;
  quantity: number;
  conflicts: string[];
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: MarketplaceProduct) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggle: (open?: boolean) => void;
  subtotal: () => number;
};

export const useMarketplaceCart = create<CartState>()(
  devtools((set, get) => ({
    items: [],
    isOpen: false,
    addItem: (product) => {
      set((state) => {
        const existing = state.items.find((item) => item.product.id === product.id);
        const conflicts = (product.conflicts ?? []).filter((flag) => patientConflictSet.has(flag));
        if (existing) {
          const items = state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1, conflicts }
              : item,
          );
          return { items, isOpen: true };
        }
        return { items: [...state.items, { product, quantity: 1, conflicts }], isOpen: true };
      });
    },
    removeItem: (productId) => {
      set((state) => ({ items: state.items.filter((item) => item.product.id !== productId) }));
    },
    updateQuantity: (productId, quantity) => {
      set((state) => ({
        items: state.items
          .map((item) =>
            item.product.id === productId
              ? { ...item, quantity: Math.max(1, Math.min(quantity, 10)) }
              : item,
          )
          .filter((item) => item.quantity > 0),
      }));
    },
    toggle: (open) => {
      if (typeof open === "boolean") {
        set({ isOpen: open });
      } else {
        set((state) => ({ isOpen: !state.isOpen }));
      }
    },
    subtotal: () =>
      get().items.reduce((total, item) => total + item.product.price * item.quantity, 0),
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

let subscriptionBound = false;

function bindProfileSnapshotSubscription() {
  if (subscriptionBound) return;
  subscriptionBound = true;

  subscribeToProfileSnapshot((detail) => {
    patientConflictSet = createConflictSet(detail);

    useMarketplaceStore.setState({
      patientSnapshot: {
        allergies: detail.allAllergies.map((item) => item.substance),
        medications: detail.allMedications
          .filter((med) => med.status === "active")
          .map((med) => med.name),
      },
    });

    useMarketplaceCart.setState((state) => ({
      items: state.items.map((item) => ({
        ...item,
        conflicts: (item.product.conflicts ?? []).filter((flag) =>
          patientConflictSet.has(flag),
        ),
      })),
    }));
  });
}

if (typeof window !== "undefined") {
  bindProfileSnapshotSubscription();
}

export { MOCK_PRODUCTS };

function getInitialProfileSnapshot(): SnapshotEventDetail {
  try {
    return getCurrentProfileSnapshot();
  } catch {
    return {
      topAllergies: [],
      topMeds: [],
      allAllergies: PATIENT_CONTEXT.allergies.map((substance, index) => ({
        id: `ctx-allergy-${index}`,
        substance,
        reaction: "",
        severity: "mild",
      })),
      allMedications: PATIENT_CONTEXT.medications.map((name, index) => ({
        id: `ctx-med-${index}`,
        name,
        strength: "",
        frequency: "",
        status: "active",
      })),
    };
  }
}

function createConflictSet(detail: SnapshotEventDetail) {
  const set = new Set<string>();
  detail.allAllergies.forEach((allergy) => set.add(`allergy-${allergy.substance}`));
  detail.allMedications.forEach((medication) => set.add(`med-${medication.name}`));
  set.add("danger");
  set.add("warning");
  return set;
}
