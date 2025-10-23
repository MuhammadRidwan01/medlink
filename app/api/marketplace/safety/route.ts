import { NextResponse } from "next/server";
import {
  MOCK_PRODUCTS,
  PATIENT_CONTEXT,
  type MarketplaceProduct,
} from "@/components/features/marketplace/data";
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

function resolveProduct(identifier: string): MarketplaceProduct | undefined {
  return (
    MOCK_PRODUCTS.find((product) => product.id === identifier) ??
    MOCK_PRODUCTS.find((product) => product.slug === identifier)
  );
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
    const supabase = getSupabaseServerClient();
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

    const { data, error } = await supabase
      .from("patient_profile_snapshots")
      .select("allergies, medications")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load Supabase snapshot", error);
      return {
        allergies: PATIENT_CONTEXT.allergies,
        medications: PATIENT_CONTEXT.medications,
        source: "fallback",
      };
    }

    const allergies = Array.isArray(data?.allergies)
      ? (data?.allergies as string[])
      : PATIENT_CONTEXT.allergies;
    const medications = Array.isArray(data?.medications)
      ? (data?.medications as string[])
      : PATIENT_CONTEXT.medications;

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

  const snapshot = await fetchSnapshot();
  const allergySet = new Set(snapshot.allergies.map(normalize));
  const medicationSet = new Set(snapshot.medications.map(normalize));

  const conflicts: MarketplaceSafetyResult[] = uniqueIds.map((identifier) => {
    const product = resolveProduct(identifier);
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

  return NextResponse.json({
    snapshot,
    conflicts,
  });
}
