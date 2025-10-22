import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { MOCK_PRODUCTS, PATIENT_CONTEXT, type MarketplaceProduct, type MarketplaceCategory } from "./data";

export type SortOption = "relevance" | "price-asc" | "price-desc" | "rating";

type MarketplaceState = {
  search: string;
  debouncedSearch: string;
  sort: SortOption;
  priceRange: [number, number];
  categories: MarketplaceCategory[];
  tags: string[];
  visibleCount: number;
  setSearch: (value: string) => void;
  setDebouncedSearch: (value: string) => void;
  setSort: (value: SortOption) => void;
  setPriceRange: (range: [number, number]) => void;
  toggleCategory: (category: MarketplaceCategory) => void;
  toggleTag: (tag: string) => void;
  resetFilters: () => void;
  loadMore: () => void;
};

const DEFAULT_PRICE_RANGE: [number, number] = [0, 600000];
const PAGE_SIZE = 8;

export const useMarketplaceStore = create<MarketplaceState>()(
  devtools((set) => ({
    search: "",
    debouncedSearch: "",
    sort: "relevance",
    priceRange: DEFAULT_PRICE_RANGE,
    categories: [],
    tags: [],
    visibleCount: PAGE_SIZE,
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
  }))
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

const patientConflictSet = new Set([
  ...PATIENT_CONTEXT.allergies.map((item) => `allergy-${item}`),
  ...PATIENT_CONTEXT.medications.map((item) => `med-${item}`),
  "danger",
  "warning",
]);

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

type FilterState = Pick<MarketplaceState, "debouncedSearch" | "sort" | "priceRange" | "categories" | "tags">;

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
      [
        product.name,
        product.shortDescription,
        ...product.tags,
        ...product.categories,
      ]
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

export { MOCK_PRODUCTS };
