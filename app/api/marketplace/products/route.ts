export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type {
  MarketplaceCategory,
  MarketplaceProduct,
  ProductContraindication,
} from "@/components/features/marketplace/data";
import { MOCK_PRODUCTS } from "@/components/features/marketplace/data";

const RXNAV_ENDPOINT = "https://rxnav.nlm.nih.gov/REST/drugs.json";
const CATEGORY_ORDER: MarketplaceCategory[] = ["Obat", "Vitamin", "Perangkat", "Layanan", "Herbal"];
const MAX_CONCEPTS_PER_PRESET = 3;

type RxNavConcept = {
  rxcui?: string;
  name?: string;
  synonym?: string;
  tty?: string;
};

type RxNavConceptGroup = {
  tty?: string;
  conceptProperties?: RxNavConcept[];
};

type RxNavResponse = {
  drugGroup?: {
    conceptGroup?: RxNavConceptGroup[];
  };
};

type MedicinePreset = {
  query: string;
  displayName: string;
  shortDescription: string;
  longDescription: string;
  tags: string[];
  category: MarketplaceCategory;
  imageUrl: string;
  badge?: string;
  contraindications?: ProductContraindication[];
  maxConcepts?: number;
};

const MEDICINE_PRESETS: MedicinePreset[] = [
  {
    query: "paracetamol",
    displayName: "Paracetamol 500 mg Tablet",
    shortDescription: "Analgesik dan antipiretik lini pertama untuk demam dan nyeri ringan.",
    longDescription:
      "{NAME} membantu menurunkan demam serta meredakan nyeri ringan hingga sedang. Gunakan sesuai dosis anjuran dan hindari konsumsi bersamaan dengan produk yang juga mengandung parasetamol.",
    tags: ["analgesik", "antipiretik", "OTC"],
    category: "Obat",
    imageUrl:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    badge: "Live API",
    contraindications: [
      {
        id: "allergy-paracetamol",
        type: "allergy",
        value: "acetaminophen",
        severity: "caution",
        note: "Hentikan pemakaian jika muncul reaksi hipersensitivitas terhadap parasetamol.",
      },
    ],
  },
  {
    query: "ibuprofen",
    displayName: "Ibuprofen 400 mg Kaplet",
    shortDescription: "NSAID untuk nyeri inflamasi disertai demam atau pembengkakan.",
    longDescription:
      "{NAME} efektif meredakan peradangan, nyeri sendi, dan kram otot. Konsumsi setelah makan dan konsultasikan bila memiliki riwayat maag, gangguan ginjal, atau penggunaan antikoagulan.",
    tags: ["NSAID", "nyeri", "inflamasi"],
    category: "Obat",
    imageUrl:
      "https://images.unsplash.com/photo-1580281658629-1796132cc0c3?auto=format&fit=crop&w=1200&q=80",
    badge: "Live API",
    contraindications: [
      {
        id: "allergy-nsaid",
        type: "allergy",
        value: "NSAID",
        severity: "warning",
        note: "Hindari bila memiliki riwayat alergi obat anti-inflamasi non-steroid.",
      },
    ],
  },
  {
    query: "amoxicillin",
    displayName: "Amoxicillin 500 mg Kapsul",
    shortDescription: "Antibiotik spektrum luas untuk infeksi bakteri yang peka.",
    longDescription:
      "{NAME} bekerja menghambat sintesis dinding sel bakteri. Konsumsi sesuai durasi terapi dokter dan selesaikan regimen untuk mencegah resistensi.",
    tags: ["antibiotik", "spektrum-luas"],
    category: "Obat",
    imageUrl:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    badge: "Live API",
    contraindications: [
      {
        id: "allergy-penicillin",
        type: "allergy",
        value: "penisilin",
        severity: "danger",
        note: "Pasien dengan alergi penisilin harus menghindari turunan beta-laktam seperti amoksisilin.",
      },
    ],
  },
  {
    query: "metformin",
    displayName: "Metformin 500 mg Tablet Lepas Lambat",
    shortDescription: "Biguanid oral untuk kontrol glikemik pasien diabetes tipe 2.",
    longDescription:
      "{NAME} membantu meningkatkan sensitivitas insulin dan menurunkan produksi glukosa hati. Ideal digunakan bersama diet dan aktivitas fisik teratur.",
    tags: ["diabetes", "biguanid"],
    category: "Obat",
    imageUrl:
      "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=1200&q=80",
    badge: "Live API",
  },
  {
    query: "atorvastatin",
    displayName: "Atorvastatin 20 mg Tablet",
    shortDescription: "Statin untuk menurunkan kolesterol LDL dan trigliserida.",
    longDescription:
      "{NAME} menurunkan kadar kolesterol dengan menghambat enzim HMG-CoA reduktase. Konsumsi pada malam hari untuk manfaat optimal dan pantau fungsi hati secara berkala.",
    tags: ["dislipidemia", "statin"],
    category: "Obat",
    imageUrl:
      "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1200&q=80",
    badge: "Live API",
    contraindications: [
      {
        id: "medication-interaction",
        type: "medication",
        value: "atorvastatin",
        severity: "warning",
        note: "Perhatikan potensi interaksi dengan terapi statin aktif pasien.",
      },
    ],
  },
  {
    query: "omeprazole",
    displayName: "Omeprazole 20 mg Enteric Capsule",
    shortDescription: "Inhibitor pompa proton untuk gastritis dan refluks asam.",
    longDescription:
      "{NAME} memberikan penekanan produksi asam lambung jangka pendek. Konsumsi sebelum makan dan hindari penggunaan lebih dari 14 hari tanpa konsultasi.",
    tags: ["GERD", "pencernaan"],
    category: "Obat",
    imageUrl:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
    badge: "Live API",
  },
  {
    query: "salbutamol",
    displayName: "Salbutamol Inhaler Metered Dose",
    shortDescription: "Bronkodilator kerja cepat untuk serangan asma.",
    longDescription:
      "{NAME} bekerja sebagai agonis β2 untuk merelaksasi otot bronkus. Gunakan sebagai pereda gejala akut dan pantau frekuensi penggunaan harian.",
    tags: ["asma", "bronkodilator"],
    category: "Obat",
    imageUrl:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
    badge: "Live API",
  },
  {
    query: "cetirizine",
    displayName: "Cetirizine 10 mg Tablet",
    shortDescription: "Antihistamin generasi kedua untuk alergi musiman.",
    longDescription:
      "{NAME} menghambat reseptor H1 sehingga meredakan bersin, gatal, dan hidung tersumbat tanpa efek kantuk berlebih.",
    tags: ["antihistamin", "alergi"],
    category: "Obat",
    imageUrl:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    badge: "Live API",
  },
];

const FALLBACK_PRODUCTS = MOCK_PRODUCTS.filter((product) =>
  product.categories.some((category) => category !== "Obat"),
);

const CONCEPT_PRIORITY = ["SBD", "SBDC", "SCD", "SCDC", "GPCK", "BPCK"];

function normalizeName(input?: string): string | undefined {
  if (!input) {
    return undefined;
  }
  return input.replace(/[{}]/g, " ").replace(/\s+/g, " ").trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function seededNumber(seed: string): number {
  return Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function productFromConcept(
  preset: MedicinePreset,
  concept: RxNavConcept,
  index: number,
): MarketplaceProduct {
  const conceptName = normalizeName(concept.synonym ?? concept.name) ?? preset.displayName;
  const seed = `${preset.query}-${concept.rxcui ?? index}`;
  const hash = seededNumber(seed);
  const price = 15000 + (hash % 36) * 2500;
  const rating = 4 + (hash % 9) / 10;
  const ratingCount = 90 + (hash % 180);
  const inventoryStatus = hash % 7 === 0 ? "low-stock" : "in-stock";
  const badges = preset.badge ? [preset.badge] : undefined;

  return {
    id: concept.rxcui ? `rx-${concept.rxcui}` : `rx-${slugify(seed)}`,
    slug: slugify(`${preset.query}-${concept.rxcui ?? index}`),
    name: conceptName,
    shortDescription: preset.shortDescription,
    longDescription: preset.longDescription.replace("{NAME}", conceptName),
    price,
    imageUrl: preset.imageUrl,
    categories: [preset.category],
    tags: Array.from(new Set([...preset.tags, preset.query.toLowerCase()])),
    rating: Number(rating.toFixed(1)),
    ratingCount,
    inventoryStatus,
    badges,
    contraindications: preset.contraindications,
  };
}

function collectConcepts(response: RxNavResponse, limit: number): RxNavConcept[] {
  const groups = response.drugGroup?.conceptGroup ?? [];

  const seen = new Set<string>();
  const ordered: RxNavConcept[] = [];

  CONCEPT_PRIORITY.forEach((tty) => {
    groups
      .filter((group) => group.tty === tty)
      .forEach((group) => {
        group.conceptProperties?.forEach((concept) => {
          const key = concept.rxcui ?? concept.name ?? concept.synonym ?? "";
          if (!key || seen.has(key)) {
            return;
          }
          seen.add(key);
          ordered.push(concept);
        });
      });
  });

  groups.forEach((group) => {
    group.conceptProperties?.forEach((concept) => {
      const key = concept.rxcui ?? concept.name ?? concept.synonym ?? "";
      if (!key || seen.has(key)) {
        return;
      }
      seen.add(key);
      ordered.push(concept);
    });
  });

  return ordered.slice(0, limit);
}

async function fetchPreset(preset: MedicinePreset, index: number): Promise<MarketplaceProduct[]> {
  const url = `${RXNAV_ENDPOINT}?name=${encodeURIComponent(preset.query)}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`RxNav returned ${response.status}`);
    }

    const payload = (await response.json()) as RxNavResponse;
    const concepts = collectConcepts(payload, preset.maxConcepts ?? MAX_CONCEPTS_PER_PRESET);
    if (!concepts.length) {
      return [];
    }

    return concepts.map((concept, conceptIndex) =>
      productFromConcept(preset, concept, conceptIndex + index * 10),
    );
  } catch (error) {
    console.error(`[marketplace] failed to fetch ${preset.query} from RxNav`, error);
    return [];
  }
}

export async function GET() {
  const collections = await Promise.all(MEDICINE_PRESETS.map(fetchPreset));
  const liveProducts = collections.flat();

  if (liveProducts.length === 0) {
    const fallback = CATEGORY_ORDER.flatMap((category) =>
      FALLBACK_PRODUCTS.filter((product) => product.categories.includes(category)),
    ).slice(0, 8);

    return NextResponse.json(
      {
        source: "fallback",
        count: fallback.length,
        products: fallback,
      },
      { status: 200 },
    );
  }

  const enriched = [
    ...liveProducts,
    ...FALLBACK_PRODUCTS.filter((product) => !liveProducts.some((item) => item.id === product.id)),
  ];

  return NextResponse.json(
    {
      source: "rxnav",
      count: enriched.length,
      products: enriched,
    },
    { status: 200 },
  );
}
