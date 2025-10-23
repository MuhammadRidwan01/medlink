"use client";

import type { DbPrescription } from "@/lib/clinical/types";

export type DraftStatus = "draft" | "awaiting_approval" | "approved" | "rejected";

export type DraftItem = {
  id: string;
  name: string;
  code: string;
  strength: string;
  dose: string;
  frequency: string;
  duration: string;
};

export type DraftRecord = {
  id: string;
  patientName: string;
  createdAt: string; // ISO
  status: DraftStatus;
  items: DraftItem[];
  note?: string; // pharmacist note / reject reason
};

const EVENT_KEY = "rx-drafts-update";

let __drafts: DraftRecord[] = [
  {
    id: "rx-1001",
    patientName: "Aulia Pratama",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: "draft",
    items: [
      {
        id: "i-1",
        name: "Paracetamol",
        code: "paracetamol",
        strength: "500 mg",
        dose: "1 tablet",
        frequency: "3x sehari",
        duration: "5 hari",
      },
    ],
  },
  {
    id: "rx-1002",
    patientName: "Rudi Hartono",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "awaiting_approval",
    items: [
      {
        id: "i-2",
        name: "Aspirin",
        code: "aspirin",
        strength: "80 mg",
        dose: "1 tablet",
        frequency: "1x sehari",
        duration: "7 hari",
      },
    ],
  },
];

function emit() {
  const event = new CustomEvent<DraftRecord[]>(EVENT_KEY, { detail: __drafts.slice() });
  window.dispatchEvent(event);
}

export function subscribeToDrafts(cb: (drafts: DraftRecord[]) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<DraftRecord[]>).detail);
  window.addEventListener(EVENT_KEY, handler);
  // fire immediately
  cb(__drafts.slice());
  return () => window.removeEventListener(EVENT_KEY, handler);
}

export function getCurrentDrafts(): DraftRecord[] {
  return __drafts.slice();
}

export function addDraft(input: {
  patientName: string;
  items: DraftItem[];
  status?: DraftStatus;
}) {
  const record: DraftRecord = {
    id: `rx-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    patientName: input.patientName,
    createdAt: new Date().toISOString(),
    status: input.status ?? "draft",
    items: input.items,
  };
  __drafts = [...__drafts, record];
  emit();
  return record.id;
}

export function updateDraft(id: string, patch: Partial<Omit<DraftRecord, "id">>) {
  __drafts = __drafts.map((d) => (d.id === id ? { ...d, ...patch } : d));
  emit();
}

export function bulkSendForApproval(ids: string[]) {
  if (!ids.length) return;
  __drafts = __drafts.map((d) => (ids.includes(d.id) ? { ...d, status: "awaiting_approval" } : d));
  emit();
}

export function approveDraft(id: string, note?: string) {
  updateDraft(id, { status: "approved", note });
}

export function rejectDraft(id: string, reason?: string) {
  updateDraft(id, { status: "rejected", note: reason ?? "" });
}

// Bridge helper: upsert from DB prescription into demo store (status + basic fields)
export function upsertDbPrescription(row: DbPrescription) {
  const existing = __drafts.find((d) => d.id === row.id);
  if (existing) {
    updateDraft(row.id, { status: row.status });
    return;
  }
  const rec: DraftRecord = {
    id: row.id,
    patientName: "(unknown)",
    createdAt: row.created_at,
    status: row.status,
    items: [],
  };
  __drafts = [...__drafts, rec];
  emit();
}
