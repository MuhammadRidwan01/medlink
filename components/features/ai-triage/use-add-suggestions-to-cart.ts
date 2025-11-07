"use client";

import { useCallback, useRef } from "react";
import type { MarketplaceProduct } from "@/components/features/marketplace/data";
import { useMarketplaceCart } from "@/components/features/marketplace/store";
import type { CheckoutItem } from "@/components/features/payment/mock-data";
import { usePaymentStore } from "@/components/features/payment/store";
import { DRUG_IMAGE_SRC } from "@/lib/product-image";

type OtcSuggestion = {
  name: string;
  code?: string;
  strength?: string;
};

type AddOptions = {
  openCart?: boolean;
  syncCheckout?: boolean;
  replaceCart?: boolean;
};

type AddResult = {
  added: number;
  failed: string[];
};

type IndexedProduct = MarketplaceProduct & {
  _slug: string;
  _canonicalSlug: string;
  _canonicalName: string;
  _dosages: Set<string>;
};

const PLATFORM_SUFFIX_PATTERN =
  /-(strip|tablet|tablets|botol|bottle|sirup|syrup|capsule|capsul|kapsul|caplet|caplets|cap|tabs)$/;

const CODE_ALIASES: Record<string, string> = {
  "paracetamol-500mg": "paracetamol-500mg-strip",
  "paracetamol-500mg-strip": "paracetamol-500mg-strip",
  "acetaminophen-500mg": "paracetamol-500mg-strip",
  "ibuprofen-200mg": "ibuprofen-200mg-tablet",
  "ibuprofen-200mg-tablet": "ibuprofen-200mg-tablet",
  "ibuprofen-400mg": "ibuprofen-400mg-botol",
  "ibuprofen-400mg-botol": "ibuprofen-400mg-botol",
  "guaifenesin-100mg": "guaifenesin-200mg-syrup",
  "guaifenesin-200mg": "guaifenesin-200mg-syrup",
  "expectorant-100mg": "guaifenesin-200mg-syrup",
  "expectorant-guaifenesin-200mg": "guaifenesin-200mg-syrup",
  "vitamin-c-100mg": "vitamin-c-100mg-tablet",
  "vitamin-c-500mg": "vitamin-c-500mg-chewable",
  "vitamin-c-1000mg": "vitamin-c-1000mg-effervescent",
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

function canonicalize(value: string | undefined | null): string {
  if (!value) return "";
  return slugify(value).replace(PLATFORM_SUFFIX_PATTERN, "");
}

function extractDosages(value: string | undefined | null): Set<string> {
  const dosages = new Set<string>();
  if (!value) {
    return dosages;
  }
  const regex = /(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu)/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(value)) !== null) {
    const amount = (match[1] ?? "").replace(/^0+/, "");
    const unit = (match[2] ?? "").toLowerCase();
    if (amount && unit) {
      dosages.add(`${amount}${unit}`);
    }
  }
  return dosages;
}

function hasMatchingDosage(
  suggestionDosages: Set<string>,
  productDosages: Set<string>,
): boolean {
  if (!suggestionDosages.size || !productDosages.size) {
    return true;
  }
  for (const value of suggestionDosages) {
    if (productDosages.has(value)) {
      return true;
    }
  }
  return false;
}

function indexProduct(product: MarketplaceProduct): IndexedProduct {
  const slug = slugify(product.slug);
  const canonicalSlug = canonicalize(product.slug);
  return {
    ...product,
    _slug: slug,
    _canonicalSlug: canonicalSlug,
    _canonicalName: canonicalize(product.name),
    _dosages: extractDosages(`${product.name} ${product.shortDescription}`),
  };
}

function normalizeCandidate(raw: string | undefined): string | null {
  if (!raw) return null;
  const slug = slugify(raw);
  const alias = CODE_ALIASES[slug] ?? slug;
  return canonicalize(alias);
}

function buildCandidateSlugs(suggestion: OtcSuggestion): string[] {
  const values = [
    suggestion.code,
    suggestion.name,
    suggestion.strength ? `${suggestion.name} ${suggestion.strength}` : undefined,
  ];
  const set = new Set<string>();
  for (const value of values) {
    const normalized = normalizeCandidate(value ?? undefined);
    if (normalized) {
      set.add(normalized);
    }
  }
  return Array.from(set);
}

function findMatchingProduct(
  products: IndexedProduct[],
  suggestion: OtcSuggestion,
): MarketplaceProduct | null {
  const suggestionDosages = new Set<string>([
    ...extractDosages(suggestion.name),
    ...extractDosages(suggestion.strength),
    ...extractDosages(suggestion.code),
  ]);

  const candidates = buildCandidateSlugs(suggestion);

  for (const candidate of candidates) {
    const exact = products.find(
      (product) =>
        product._canonicalSlug === candidate || product._canonicalName === candidate,
    );
    if (exact && hasMatchingDosage(suggestionDosages, exact._dosages)) {
      return exact;
    }
  }

  for (const candidate of candidates) {
    const prefix = products.find(
      (product) =>
        (product._canonicalSlug.startsWith(`${candidate}-`) ||
          candidate.startsWith(`${product._canonicalSlug}-`)) &&
        hasMatchingDosage(suggestionDosages, product._dosages),
    );
    if (prefix) {
      return prefix;
    }
  }

  // Fallback: pick product with most overlapping tokens while respecting dosage
  let best: IndexedProduct | null = null;
  let bestScore = 0;
  const candidateTokens = new Set(
    candidates.flatMap((candidate) => candidate.split("-")).filter(Boolean),
  );

  for (const product of products) {
    if (!hasMatchingDosage(suggestionDosages, product._dosages)) {
      continue;
    }
    const tokens = product._canonicalSlug.split("-").filter(Boolean);
    let score = 0;
    for (const token of tokens) {
      if (candidateTokens.has(token)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = product;
    }
  }

  return bestScore > 0 && best ? best : null;
}

export function useAddSuggestionsToCart() {
  const addItem = useMarketplaceCart((state) => state.addItem);
  const updateQuantity = useMarketplaceCart((state) => state.updateQuantity);
  const removeItem = useMarketplaceCart((state) => state.removeItem);
  const toggle = useMarketplaceCart((state) => state.toggle);
  const setCheckoutItems = usePaymentStore((state: any) => state.setCheckoutItems);

  const cacheRef = useRef<IndexedProduct[] | null>(null);
  const loadingRef = useRef<Promise<IndexedProduct[] | null> | null>(null);

  const ensureCatalog = useCallback(async (): Promise<IndexedProduct[]> => {
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
          const indexed = (payload.products ?? []).map(indexProduct);
          cacheRef.current = indexed;
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

  const ensureCartRawItems = useCallback(async () => {
    try {
      const response = await fetch("/api/marketplace/cart", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Cart API ${response.status}`);
      }
      const payload = (await response.json()) as {
        items?: Array<{ product: MarketplaceProduct; quantity: number }>;
      };
      return payload.items ?? [];
    } catch (error) {
      console.error("[triage] gagal memuat isi cart", error);
      return [];
    }
  }, []);

  const ensureCartCheckoutItems = useCallback(async (): Promise<CheckoutItem[]> => {
    const items = await ensureCartRawItems();
    return items.map((item) => ({
      id: item.product.id,
      productId: item.product.id,
      slug: item.product.slug,
      name: item.product.name,
      detail: item.product.shortDescription ?? item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      imageUrl: DRUG_IMAGE_SRC,
    }));
  }, [ensureCartRawItems]);

  return useCallback(
    async (suggestions: OtcSuggestion[], options?: AddOptions): Promise<AddResult> => {
      const catalog = await ensureCatalog();
      if (!catalog.length) {
        return { added: 0, failed: suggestions.map((item) => item.name) };
      }

      const failed: string[] = [];
      const matched = new Map<string, MarketplaceProduct>();

      for (const suggestion of suggestions) {
        const product = findMatchingProduct(catalog, suggestion);
        if (!product) {
          failed.push(suggestion.name);
          continue;
        }
        if (!matched.has(product.id)) {
          matched.set(product.id, product);
        }
      }

      const matchedProducts = Array.from(matched.values());
      if (matchedProducts.length) {
        const currentItems = await ensureCartRawItems();
        const currentMap = new Map<string, number>();
        for (const item of currentItems) {
          currentMap.set(item.product.id, item.quantity);
        }

        if (options?.replaceCart) {
          const targetIds = new Set(matchedProducts.map((product) => product.id));
          for (const [productId] of currentMap) {
            if (!targetIds.has(productId)) {
              await removeItem(productId);
              currentMap.delete(productId);
            }
          }
        }

        for (const product of matchedProducts) {
          const existingQuantity = currentMap.get(product.id);
          if (options?.replaceCart) {
            if (existingQuantity === 1) {
              continue;
            }
            if (existingQuantity && existingQuantity !== 1) {
              await updateQuantity(product.id, 1);
              currentMap.set(product.id, 1);
              continue;
            }
          }

          await addItem(product);
          currentMap.set(product.id, (existingQuantity ?? 0) + 1);
        }

        if (options?.replaceCart) {
          try {
            await useMarketplaceCart.getState().load();
          } catch (error) {
            console.warn("[triage] failed to refresh cart items", error);
          }
        }
      }

      if (options?.openCart && matched.size > 0) {
        toggle(true);
      }

      if (options?.syncCheckout && matched.size > 0 && typeof setCheckoutItems === "function") {
        const checkoutItems = await ensureCartCheckoutItems();
        if (checkoutItems.length) {
          setCheckoutItems(checkoutItems);
        }
      }

      return { added: matched.size, failed };
    },
    [
      addItem,
      ensureCatalog,
      ensureCartCheckoutItems,
      ensureCartRawItems,
      removeItem,
      setCheckoutItems,
      toggle,
      updateQuantity,
    ],
  );
}
