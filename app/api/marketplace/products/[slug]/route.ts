export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

function mapRow(row: MarketplaceRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? "",
    longDescription: row.long_description ?? "",
    price: Number(row.price ?? 0) || 0,
    imageUrl: row.image_url ?? "",
    categories: row.categories ?? [],
    tags: row.tags ?? [],
    rating: Number(row.rating ?? 0) || 0,
    ratingCount: row.rating_count ?? 0,
    inventoryStatus: (row.inventory_status ?? "in-stock") as "in-stock" | "low-stock" | "out-of-stock",
    badges: row.badges ?? undefined,
    contraindications: Array.isArray(row.contraindications)
      ? (row.contraindications as any[])
      : (() => {
          try { return JSON.parse(String(row.contraindications ?? "[]")); } catch { return undefined; }
        })(),
  };
}

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_: Request, ctx: RouteContext) {
  try {
    const supabase = await getSupabaseServerClient();
    const { slug } = await ctx.params;
    const { data, error } = await supabase
      .from("marketplace_products")
      .select(
        "id, slug, name, short_description, long_description, price, image_url, categories, tags, rating, rating_count, inventory_status, badges, contraindications",
      )
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ product: mapRow(data as MarketplaceRow) });
  } catch (error) {
    console.error("[marketplace] failed to load product by slug", error);
    return NextResponse.json({ message: "Failed to load" }, { status: 500 });
  }
}
