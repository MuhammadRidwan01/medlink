import type {
  ContraindicationSeverity,
  ContraindicationType,
} from "@/components/features/marketplace/data";

export type MarketplaceSafetySnapshot = {
  allergies: string[];
  medications: string[];
  source: "supabase" | "fallback";
};

export type MarketplaceSafetyWarning = {
  id: string;
  productId: string;
  type: ContraindicationType;
  severity: ContraindicationSeverity;
  value: string;
  message: string;
  note?: string;
};

export type MarketplaceSafetyResult = {
  productId: string;
  warnings: MarketplaceSafetyWarning[];
  notFound?: boolean;
};

export type MarketplaceSafetyResponse = {
  snapshot: MarketplaceSafetySnapshot;
  conflicts: MarketplaceSafetyResult[];
};
