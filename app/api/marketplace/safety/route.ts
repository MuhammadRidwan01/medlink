import { NextResponse } from "next/server";
import { PATIENT_CONTEXT, type MarketplaceProduct } from "@/components/features/marketplace/data";
import type { ProductContraindication } from "@/components/features/marketplace/data";
import type {
  MarketplaceSafetyResult,
  MarketplaceSafetySnapshot,
  MarketplaceSafetyWarning,
} from "@/components/features/marketplace/safety";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();

async function fetchProductsByIdentifiers(supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>, identifiers: string[]): Promise<Record<string, MarketplaceProduct>> {
  if (identifiers.length === 0) return {};
  const { data, error } = await supabase
    .from("marketplace_products")
    .select(
      "id, slug, name, short_description, long_description, price, image_url, categories, tags, rating, rating_count, inventory_status, badges, contraindications",
    )
    .in("id", identifiers);
  if (error) {
    console.error("[safety] failed to load products", error);
    return {};
  }
  const map: Record<string, MarketplaceProduct> = {};
  for (const row of data ?? []) {
    const product: MarketplaceProduct = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      shortDescription: row.short_description ?? "",
      longDescription: row.long_description ?? "",
      price: Number(row.price ?? 0) || 0,
      imageUrl: row.image_url ?? "",
      categories: (row.categories as string[] | null) ?? [],
      tags: (row.tags as string[] | null) ?? [],
      rating: Number(row.rating ?? 0) || 0,
      ratingCount: (row.rating_count as number | null) ?? 0,
      inventoryStatus: ((row.inventory_status as string | null) ?? "in-stock") as any,
      badges: (row.badges as string[] | null) ?? undefined,
      contraindications: Array.isArray(row.contraindications)
        ? (row.contraindications as any[])
        : (() => { try { return JSON.parse(String(row.contraindications ?? "[]")); } catch { return undefined; } })(),
    };
    map[product.id] = product;
    map[product.slug] = product;
  }
  return map;
}

function buildDefaultMessage(ci: ProductContraindication) {
  if (ci.note) return ci.note;
  if (ci.type === "allergy") {
    return `Pencocokan alergi ${ci.value}. Pastikan untuk berkonsultasi sebelum melanjutkan.`;
  }
  return `Anda sudah memiliki terapi ${ci.value}. Konsultasikan untuk menghindari interaksi.`;
}

async function fetchSnapshot(): Promise<MarketplaceSafetySnapshot> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        allergies: PATIENT_CONTEXT.allergies,
        medications: PATIENT_CONTEXT.medications,
        source: "fallback",
      };
    }

    // Fetch allergies and medications from separate tables
    const [allergiesResult, medicationsResult] = await Promise.all([
      supabase
        .from("allergies")
        .select("substance")
        .eq("user_id", user.id),
      supabase
        .from("meds")
        .select("name")
        .eq("user_id", user.id)
        .eq("status", "active")
    ]);

    if (allergiesResult.error) {
      console.error("Failed to load allergies", allergiesResult.error);
    }
    if (medicationsResult.error) {
      console.error("Failed to load medications", medicationsResult.error);
    }

    const allergies = allergiesResult.data?.map((item: { substance: string }) => item.substance) ?? PATIENT_CONTEXT.allergies;
    const medications = medicationsResult.data?.map((item: { name: string }) => item.name) ?? PATIENT_CONTEXT.medications;

    return {
      allergies,
      medications,
      source: "supabase",
    };
  } catch (error) {
    console.error("Supabase snapshot fallback triggered", error);
    return {
      allergies: PATIENT_CONTEXT.allergies,
      medications: PATIENT_CONTEXT.medications,
      source: "fallback",
    };
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const productIdsValue = (body as Record<string, unknown>)?.productIds;

  if (
    !Array.isArray(productIdsValue) ||
    productIdsValue.length === 0 ||
    productIdsValue.some((item) => typeof item !== "string" || item.trim().length === 0)
  ) {
    return NextResponse.json(
      {
        message: "productIds must be a non-empty array of product identifiers",
      },
      { status: 400 },
    );
  }

  const productIds = productIdsValue as string[];
  const uniqueIds = [...new Set(productIds)];

  const supabase = await getSupabaseServerClient();
  const snapshot = await fetchSnapshot();
  const productMap = await fetchProductsByIdentifiers(supabase, uniqueIds);
  const allergySet = new Set(snapshot.allergies.map(normalize));
  const medicationSet = new Set(snapshot.medications.map(normalize));

  const conflicts: MarketplaceSafetyResult[] = uniqueIds.map((identifier) => {
    const product = productMap[identifier];
    if (!product) {
      return {
        productId: identifier,
        warnings: [],
        notFound: true,
      };
    }

    const warnings: MarketplaceSafetyWarning[] =
      product.contraindications
        ?.map((ci) => {
          const targetSet = ci.type === "allergy" ? allergySet : medicationSet;
          if (!targetSet.has(normalize(ci.value))) {
            return undefined;
          }
          return {
            id: ci.id,
            productId: product.id,
            type: ci.type,
            severity: ci.severity,
            value: ci.value,
            message: buildDefaultMessage(ci),
            note: ci.note,
          } satisfies MarketplaceSafetyWarning;
        })
        .filter(Boolean) as MarketplaceSafetyWarning[] ?? [];

    return {
      productId: product.id,
      warnings,
    };
  });

  return NextResponse.json({ snapshot, conflicts });
}
