"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
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
export async function createPrescription(userId: string, doctorId: string) {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("clinical.prescriptions")
    .insert({ user_id: userId, doctor_id: doctorId, status: "draft" satisfies PrescriptionStatus })
    .select()
    .single<DbPrescription>();

  if (error) throw error;
  return data;
}

// Adds an item to a draft prescription owned by the doctor
export async function addPrescriptionItem(
  prescriptionId: string,
  payload: PrescriptionItemInput,
) {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("clinical.prescription_items")
    .insert({ prescription_id: prescriptionId, ...payload })
    .select()
    .single<DbPrescriptionItem>();

  if (error) throw error;
  return data;
}

// Updates a prescription status (e.g., to 'awaiting_approval', 'approved', 'rejected')
export async function updatePrescriptionStatus(
  prescriptionId: string,
  status: PrescriptionStatus,
) {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("clinical.prescriptions")
    .update({ status })
    .eq("id", prescriptionId)
    .select()
    .single<DbPrescription>();

  if (error) throw error;
  return data;
}

// Creates a clinical order by doctor for a patient
export async function createClinicalOrder(
  patientId: string,
  doctorId: string,
  payload: ClinicalOrderInput,
) {
  const supabase = getSupabaseServerClient();

  const { status = "pending", ...rest } = payload;

  const { data, error } = await supabase
    .from("clinical.clinical_orders")
    .insert({ patient_id: patientId, doctor_id: doctorId, status, ...rest })
    .select()
    .single<DbClinicalOrder>();

  if (error) throw error;
  return data;
}

// Updates the status of an existing clinical order
export async function updateClinicalOrderStatus(id: string, status: ClinicalOrderStatus) {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("clinical.clinical_orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single<DbClinicalOrder>();

  if (error) throw error;
  return data;
}

// Convenience: create draft prescription, add items, and then submit for approval
export async function createPrescriptionAndSubmit(
  userId: string,
  doctorId: string,
  items: PrescriptionItemInput[],
) {
  const rx = await createPrescription(userId, doctorId);
  for (const item of items) {
    await addPrescriptionItem(rx.id, item);
  }
  const submitted = await updatePrescriptionStatus(rx.id, "awaiting_approval");
  return submitted;
}
