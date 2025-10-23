"use client";

import { useClinicalRealtime } from "@/hooks/useClinicalRealtime";
import { upsertDbClinicalOrder } from "@/components/features/orders/clinical-store";
import { upsertDbPrescription } from "@/components/features/prescription/store";

export function ClinicalRealtimeBootstrap() {
  useClinicalRealtime({
    onPrescriptionStatusChange: (row) => upsertDbPrescription(row),
    onOrderInsert: (row) => upsertDbClinicalOrder(row),
    onOrderUpdate: (row) => upsertDbClinicalOrder(row),
  });
  return null;
}
