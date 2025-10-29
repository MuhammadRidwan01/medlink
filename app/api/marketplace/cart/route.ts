export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  price: number | string | null;
  image_url: string | null;
  categories: string[] | null;
  tags: string[] | null;
  rating: number | string | null;
  rating_count: number | null;
  inventory_status: string | null;
  badges: string[] | null;
  contraindications: unknown;
};

function mapProduct(row: ProductRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? "",
    longDescription: row.long_description ?? "",
    price: Number(row.price ?? 0) || 0,
    imageUrl: row.image_url ?? "",
    categories: Array.isArray(row.categories) ? row.categories : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
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

async function getClientOr401() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) } as const;
  return { supabase, user } as const;
}

async function serializeItems(supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>) {
  const { data, error } = await supabase.rpc("cart_items_detailed");
  if (error) throw error;
  const rows = Array.isArray(data) ? (data as Array<{ product: ProductRow | null; quantity: number | null }>) : [];
  return rows
    .filter((row) => row.product !== null)
    .map((row) => ({
      product: mapProduct(row.product as ProductRow),
      quantity: Math.max(1, Math.min(10, Number(row.quantity ?? 1))),
    }));
}

export async function GET() {
  try {
    const ctx = await getClientOr401();
    if ("error" in ctx) return ctx.error;
    const items = await serializeItems(ctx.supabase);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[cart] GET error", error);
    return NextResponse.json({ message: "Failed to load cart" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getClientOr401();
    if ("error" in ctx) return ctx.error;
    const body = await request.json().catch(() => ({}));
    const productId = String((body as any)?.productId ?? "").trim();
    const qtyDelta = Number((body as any)?.qty ?? 1) || 1;
    if (!productId) return NextResponse.json({ message: "productId required" }, { status: 400 });
    const { error } = await ctx.supabase.rpc("add_to_cart", { p_product_id: productId, p_qty: qtyDelta });
    if (error) throw error;
    const items = await serializeItems(ctx.supabase);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[cart] POST error", error);
    return NextResponse.json({ message: "Failed to add to cart" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await getClientOr401();
    if ("error" in ctx) return ctx.error;
    const body = await request.json().catch(() => ({}));
    const productId = String((body as any)?.productId ?? "").trim();
    const qty = Number((body as any)?.qty ?? 1) || 1;
    if (!productId) return NextResponse.json({ message: "productId required" }, { status: 400 });
    const nextQty = Math.max(0, Math.min(10, qty));
    const { error } = await ctx.supabase.rpc("update_cart_item", { p_product_id: productId, p_qty: nextQty });
    if (error) throw error;
    const items = await serializeItems(ctx.supabase);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[cart] PATCH error", error);
    return NextResponse.json({ message: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const ctx = await getClientOr401();
    if ("error" in ctx) return ctx.error;
    const { searchParams } = new URL(request.url);
    const productId = String(searchParams.get("productId") ?? "").trim();
    if (!productId) return NextResponse.json({ message: "productId required" }, { status: 400 });
    const { error } = await ctx.supabase.rpc("remove_from_cart", { p_product_id: productId });
    if (error) throw error;
    const items = await serializeItems(ctx.supabase);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[cart] DELETE error", error);
    return NextResponse.json({ message: "Failed to remove from cart" }, { status: 500 });
  }
}
