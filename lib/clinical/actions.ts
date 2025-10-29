"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { PostgrestError } from "@supabase/supabase-js";
import type {
  ClinicalOrderInput,
  ClinicalOrderStatus,
  DbClinicalOrder,
  DbPrescription,
  DbPrescriptionItem,
  PrescriptionItemInput,
  PrescriptionStatus,
} from "@/lib/clinical/types";

// Creates a draft prescription owned by doctor for a patient (user)
export async function createPrescription(
  userId: string,
  doctorId: string,
): Promise<{ data: DbPrescription | null; error: PostgrestError | null }> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("prescriptions")
    .insert({ patient_id: userId, doctor_id: doctorId, status: "draft" satisfies PrescriptionStatus })
    .select()
    .single<DbPrescription>();

  return { data: data ?? null, error };
}

// Adds an item to a draft prescription owned by the doctor
export async function addPrescriptionItem(
  prescriptionId: string,
  payload: PrescriptionItemInput,
): Promise<{ data: DbPrescriptionItem | null; error: PostgrestError | null }> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("prescription_items")
    .insert({ prescription_id: prescriptionId, ...payload })
    .select()
    .single<DbPrescriptionItem>();

  return { data: data ?? null, error };
}

// Updates a prescription status (e.g., to 'awaiting_approval', 'approved', 'rejected')
export async function updatePrescriptionStatus(
  prescriptionId: string,
  status: PrescriptionStatus,
): Promise<{ data: DbPrescription | null; error: PostgrestError | null }> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("prescriptions")
    .update({ status })
    .eq("id", prescriptionId)
    .select()
    .single<DbPrescription>();

  return { data: data ?? null, error };
}

// Creates a clinical order by doctor for a patient
export async function createClinicalOrder(
  patientId: string,
  doctorId: string,
  payload: ClinicalOrderInput,
): Promise<{ data: DbClinicalOrder | null; error: PostgrestError | null }> {
  const supabase = await getSupabaseServerClient();
  const from = (table: string) => (supabase.from as any)(table);

  const { status = "pending", ...rest } = payload;

  const { data, error } = await from("clinical_orders")
    .insert({ patient_id: patientId, doctor_id: doctorId, status, ...rest })
    .select()
    .single();

  return { data: (data ?? null) as DbClinicalOrder | null, error };
}

// Updates the status of an existing clinical order
export async function updateClinicalOrderStatus(
  id: string,
  status: ClinicalOrderStatus,
): Promise<{ data: DbClinicalOrder | null; error: PostgrestError | null }> {
  const supabase = await getSupabaseServerClient();
  const from = (table: string) => (supabase.from as any)(table);

  const { data, error } = await from("clinical_orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  return { data: (data ?? null) as DbClinicalOrder | null, error };
}

// Convenience: create draft prescription, add items, and then submit for approval
export async function createPrescriptionAndSubmit(
  userId: string,
  doctorId: string,
  items: PrescriptionItemInput[],
): Promise<{ data: DbPrescription | null; error: PostgrestError | null }> {
  const created = await createPrescription(userId, doctorId);
  if (created.error || !created.data) return { data: null, error: created.error };

  for (const item of items) {
    const added = await addPrescriptionItem(created.data.id, item);
    if (added.error) return { data: null, error: added.error };
  }

  const submitted = await updatePrescriptionStatus(created.data.id, "awaiting_approval");
  return submitted;
}

// Local action-level types as requested
export type RxStatus = "draft" | "awaiting_approval" | "approved" | "rejected";
export type OrderStatus = "pending" | "completed" | "canceled";
export type ClinicalOrder = {
  id: string;
  patientId: string;
  doctorId: string;
  type: "lab" | "imaging";
  name: string;
  priority?: string;
  note?: string;
  status: OrderStatus;
  createdAt: string;
};
