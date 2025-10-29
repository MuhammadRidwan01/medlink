"use client";

import { useCallback, useRef } from "react";
import type { MarketplaceProduct } from "@/components/features/marketplace/data";
import { useMarketplaceCart } from "@/components/features/marketplace/store";
import type { CheckoutItem } from "@/components/features/payment/mock-data";
import { usePaymentStore } from "@/components/features/payment/store";

type OtcSuggestion = {
  name: string;
  code?: string;
};

type AddOptions = {
  openCart?: boolean;
  syncCheckout?: boolean;
};

type AddResult = {
  added: number;
  failed: string[];
};

function slugify(value: string | undefined | null): string {
  if (!value) {
    return "";
  }
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function findMatchingProduct(
  products: MarketplaceProduct[],
  suggestion: OtcSuggestion,
): MarketplaceProduct | null {
  const candidates = new Set<string>();
  const codeSlug = slugify(suggestion.code);
  if (codeSlug) {
    candidates.add(codeSlug);
  }
  const nameSlug = slugify(suggestion.name);
  if (nameSlug) {
    candidates.add(nameSlug);
  }

  for (const candidate of candidates) {
    if (!candidate) continue;
    const exact = products.find(
      (product) =>
        slugify(product.slug) === candidate || slugify(product.name) === candidate,
    );
    if (exact) {
      return exact;
    }
  }

  for (const candidate of candidates) {
    if (!candidate) continue;
    const partial = products.find((product) =>
      slugify(product.slug).includes(candidate),
    );
    if (partial) {
      return partial;
    }
  }

  const lowered = suggestion.name.toLowerCase();
  if (lowered) {
    const byName = products.find((product) =>
      product.name.toLowerCase().includes(lowered),
    );
    if (byName) {
      return byName;
    }
  }

  return null;
}

export function useAddSuggestionsToCart() {
  const addItem = useMarketplaceCart((state) => state.addItem);
  const toggle = useMarketplaceCart((state) => state.toggle);
  // @ts-expect-error dynamic setter injected in store
  const setCheckoutItems = usePaymentStore((state: any) => state.setCheckoutItems);

  const cacheRef = useRef<MarketplaceProduct[] | null>(null);
  const loadingRef = useRef<Promise<MarketplaceProduct[] | null> | null>(null);

  const ensureCatalog = useCallback(async (): Promise<MarketplaceProduct[]> => {
    if (cacheRef.current) {
      return cacheRef.current;
    }
    if (!loadingRef.current) {
      loadingRef.current = fetch("/api/marketplace/products", { cache: "no-store" })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Marketplace API ${response.status}`);
          }
          const payload = (await response.json()) as {
            products?: MarketplaceProduct[];
          };
          cacheRef.current = payload.products ?? [];
          return cacheRef.current;
        })
        .catch((error) => {
          console.error("[triage] failed to load marketplace catalog", error);
          cacheRef.current = [];
          return [];
        })
        .finally(() => {
          loadingRef.current = null;
        });
    }
    const result = await loadingRef.current;
    return result ?? [];
  }, []);

  const ensureCartCheckoutItems = useCallback(async (): Promise<CheckoutItem[]> => {
    try {
      const response = await fetch("/api/marketplace/cart", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Cart API ${response.status}`);
      }
      const payload = (await response.json()) as {
        items?: Array<{ product: MarketplaceProduct; quantity: number }>;
      };
      return (payload.items ?? []).map((item) => ({
        id: item.product.id,
        productId: item.product.id,
        slug: item.product.slug,
        name: item.product.name,
        detail: item.product.shortDescription ?? item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        imageUrl: item.product.imageUrl,
      }));
    } catch (error) {
      console.error("[triage] gagal memuat isi cart untuk checkout", error);
      return [];
    }
  }, []);

  return useCallback(
    async (suggestions: OtcSuggestion[], options?: AddOptions): Promise<AddResult> => {
      const catalog = await ensureCatalog();
      const failed: string[] = [];
      let added = 0;

      for (const suggestion of suggestions) {
        const product = findMatchingProduct(catalog, suggestion);
        if (!product) {
          failed.push(suggestion.name);
          continue;
        }

        try {
          await addItem(product);
          added += 1;
        } catch (error) {
          console.error("[triage] failed to add product to cart", error);
          failed.push(suggestion.name);
        }
      }

      if (options?.openCart && added > 0) {
        toggle(true);
      }

      if (options?.syncCheckout && added > 0 && typeof setCheckoutItems === "function") {
        const checkoutItems = await ensureCartCheckoutItems();
        if (checkoutItems.length) {
          setCheckoutItems(checkoutItems);
        }
      }

      return { added, failed };
    },
    [addItem, ensureCatalog, ensureCartCheckoutItems, setCheckoutItems, toggle],
  );
}
