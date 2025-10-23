export type PrescriptionStatus = "draft" | "awaiting_approval" | "approved" | "rejected";

export type PrescriptionItemInput = {
  name: string;
  strength?: string | null;
  frequency?: string | null;
  duration?: string | null;
  notes?: string | null;
};

export type ClinicalOrderType = "lab" | "imaging";
export type ClinicalOrderStatus = "pending" | "completed" | "canceled";

export type ClinicalOrderInput = {
  type: ClinicalOrderType;
  name?: string | null;
  priority?: string | null;
  note?: string | null;
  status?: ClinicalOrderStatus; // default to 'pending' if not provided
};

export type DbPrescription = {
  id: string;
  user_id: string;
  doctor_id: string;
  status: PrescriptionStatus;
  created_at: string;
};

export type DbPrescriptionItem = {
  id: number;
  prescription_id: string;
  name: string | null;
  strength: string | null;
  frequency: string | null;
  duration: string | null;
  notes: string | null;
};

export type DbClinicalOrder = {
  id: string;
  patient_id: string;
  doctor_id: string;
  type: ClinicalOrderType;
  name: string | null;
  priority: string | null;
  note: string | null;
  status: ClinicalOrderStatus;
  created_at: string;
};

