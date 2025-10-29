export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { type MarketplaceCategory, type MarketplaceProduct, type ProductContraindication } from "@/components/features/marketplace/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const CATEGORY_ORDER: MarketplaceCategory[] = ["Obat", "Vitamin", "Perangkat", "Layanan", "Herbal"];
const INVENTORY_STATES = new Set(["in-stock", "low-stock", "out-of-stock"]);

type MarketplaceRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  price: string | number | null;
  image_url: string | null;
  categories: string[] | null;
  tags: string[] | null;
  rating: string | number | null;
  rating_count: number | null;
  inventory_status: string | null;
  badges: string[] | null;
  contraindications: unknown;
};

function coerceCategories(values: string[] | null | undefined): MarketplaceCategory[] {
  if (!values) {
    return [];
  }
  return values.filter((value): value is MarketplaceCategory =>
    CATEGORY_ORDER.includes(value as MarketplaceCategory),
  );
}

function coerceContraindications(input: unknown): ProductContraindication[] | undefined {
  if (!input) {
    return undefined;
  }
  const raw = Array.isArray(input) ? input : (() => {
    try {
      return JSON.parse(String(input));
    } catch {
      return null;
    }
  })();

  if (!Array.isArray(raw)) {
    return undefined;
  }

  const mapped = raw.filter((item): item is ProductContraindication => {
    return (
      item &&
      typeof item === "object" &&
      "id" in item &&
      "type" in item &&
      "value" in item &&
      "severity" in item
    );
  });

  return mapped.length ? mapped : undefined;
}

function mapRowToProduct(row: MarketplaceRow): MarketplaceProduct {
  const categories = coerceCategories(row.categories);
  const inventoryStatus = INVENTORY_STATES.has((row.inventory_status ?? "").toLowerCase())
    ? (row.inventory_status as MarketplaceProduct["inventoryStatus"])
    : "in-stock";

  const priceNumber = Number(row.price ?? 0);
  const ratingNumber = Number(row.rating ?? 0);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? "",
    longDescription: row.long_description ?? "",
    price: Number.isFinite(priceNumber) ? priceNumber : 0,
    imageUrl: row.image_url ?? "",
    categories,
    tags: row.tags ?? [],
    rating: Number.isFinite(ratingNumber) ? Number(ratingNumber.toFixed(1)) : 0,
    ratingCount: row.rating_count ?? 0,
    inventoryStatus,
    badges: row.badges && row.badges.length ? row.badges : undefined,
    contraindications: coerceContraindications(row.contraindications),
  };
}

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("marketplace_products")
      .select(
        "id, slug, name, short_description, long_description, price, image_url, categories, tags, rating, rating_count, inventory_status, badges, contraindications",
      )
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    const products =
      (data ?? [])
        .map((row) => mapRowToProduct(row as MarketplaceRow))
        .filter(Boolean);

    return NextResponse.json(
      {
        source: "supabase",
        count: products.length,
        products,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[marketplace] failed to load products from supabase", error);
    return NextResponse.json({ message: "Failed to load products" }, { status: 500 });
  }
}
