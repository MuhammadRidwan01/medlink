import { z } from "zod";

export const RxMedicationDraft = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  strength: z.string().min(1),
  dose: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
  notes: z.string().optional().default(""),
});
export type RxMedicationDraft = z.infer<typeof RxMedicationDraft>;

export const RxDraftInput = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  items: z.array(RxMedicationDraft).min(1),
  submit: z.boolean().optional().default(false),
});
export type RxDraftInput = z.infer<typeof RxDraftInput>;

export const RxAiSuggestion = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  strength: z.string().min(1),
  dose: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
  notes: z.string().optional().default(""),
  rationale: z.string().optional().default(""),
});
export type RxAiSuggestion = z.infer<typeof RxAiSuggestion>;

export const RxAiOutput = z.object({
  suggestions: z.array(RxAiSuggestion),
  warnings: z.array(z.string()).optional().default([]),
});
export type RxAiOutput = z.infer<typeof RxAiOutput>;

export const PatientSnapshotInput = z.object({
  profile: z
    .object({
      id: z.string().optional(), // Allow any string (e.g., "self" for OTC auto-draft)
      name: z.string().nullable().optional(),
      age: z.string().nullable().optional(),
      sex: z.string().nullable().optional(),
      bloodType: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  allergies: z
    .array(
      z.object({
        substance: z.string(),
        reaction: z.string().nullable().optional(),
        severity: z.enum(["mild", "moderate", "severe"]).optional().default("mild"),
      }),
    )
    .optional()
    .default([]),
  meds: z
    .array(
      z.object({
        name: z.string(),
        strength: z.string().nullable().optional(),
        frequency: z.string().nullable().optional(),
        status: z.enum(["active", "stopped"]).optional().default("active"),
      }),
    )
    .optional()
    .default([]),
});
export type PatientSnapshotInput = z.infer<typeof PatientSnapshotInput>;

export const TriageSummaryInput = z
  .object({
    riskLevel: z.enum(["low", "moderate", "high", "emergency"]).optional(),
    symptoms: z.array(z.string()).optional(),
    duration: z.string().optional(),
    redFlags: z.array(z.string()).optional(),
    recommendation: z
      .object({
        type: z.enum(["otc", "doctor", "emergency"]).optional(),
        reason: z.string().optional(),
        otcSuggestions: z.array(z.string()).optional(),
        urgency: z.enum(["immediate", "within_24h", "within_week"]).optional(),
      })
      .optional(),
  })
  .optional();
export type TriageSummaryInput = z.infer<typeof TriageSummaryInput>;

export const AiPrescriptionRequest = z.object({
  patient: PatientSnapshotInput,
  triageSummary: TriageSummaryInput,
  provisionalDiagnosis: z.string().optional(),
  vitals: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
});
export type AiPrescriptionRequest = z.infer<typeof AiPrescriptionRequest>;
