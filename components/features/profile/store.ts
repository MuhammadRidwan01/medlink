"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type AllergySeverity = "mild" | "moderate" | "severe";

export type Allergy = {
  id: string;
  substance: string;
  reaction: string;
  severity: AllergySeverity;
};

export type MedicationStatus = "active" | "stopped";

export type Medication = {
  id: string;
  name: string;
  strength: string;
  frequency: string;
  status: MedicationStatus;
};

type ProfileState = {
  allergies: Allergy[];
  medications: Medication[];
  updateAllergy: (allergy: Allergy) => void;
  addAllergy: (allergy: Allergy) => void;
  removeAllergy: (id: string) => void;
  updateMedication: (med: Medication) => void;
  addMedication: (med: Medication) => void;
  removeMedication: (id: string) => void;
  stopMedication: (id: string) => void;
  hydrate: (payload: { allergies: Allergy[]; medications: Medication[] }) => void;
};

const initialAllergies: Allergy[] = [
  { id: "a1", substance: "Penisilin", reaction: "Ruam kulit", severity: "moderate" },
  { id: "a2", substance: "Udang", reaction: "Sesak napas", severity: "severe" },
  { id: "a3", substance: "Serbuk sari", reaction: "Rinitis", severity: "mild" },
];

const initialMeds: Medication[] = [
  { id: "m1", name: "Metformin", strength: "850 mg", frequency: "2x sehari", status: "active" },
  { id: "m2", name: "Atorvastatin", strength: "20 mg", frequency: "1x malam", status: "active" },
  { id: "m3", name: "Salbutamol Inhaler", strength: "100 mcg", frequency: "Jika perlu", status: "active" },
];

export const useProfileStore = create<ProfileState>()(
  devtools((set) => ({
    allergies: initialAllergies,
    medications: initialMeds,
    updateAllergy: (allergy) =>
      set((state) => ({
        allergies: state.allergies.map((item) => (item.id === allergy.id ? allergy : item)),
      })),
    addAllergy: (allergy) =>
      set((state) => ({
        allergies: [...state.allergies, allergy],
      })),
    removeAllergy: (id) =>
      set((state) => ({
        allergies: state.allergies.filter((item) => item.id !== id),
      })),
    updateMedication: (med) =>
      set((state) => ({
        medications: state.medications.map((item) => (item.id === med.id ? med : item)),
      })),
    addMedication: (med) =>
      set((state) => ({
        medications: [...state.medications, med],
      })),
    removeMedication: (id) =>
      set((state) => ({
        medications: state.medications.filter((item) => item.id !== id),
      })),
    stopMedication: (id) =>
      set((state) => ({
        medications: state.medications.map((item) =>
          item.id === id ? { ...item, status: "stopped" } : item,
        ),
      })),
    hydrate: ({ allergies, medications }) =>
      set(() => ({
        allergies,
        medications,
      })),
  })),
);

export type SnapshotEventDetail = {
  topAllergies: Allergy[];
  topMeds: Medication[];
  allAllergies: Allergy[];
  allMedications: Medication[];
};

type SnapshotState = SnapshotEventDetail & {
  recompute: () => void;
};

const computeSnapshot = (allergies: Allergy[], medications: Medication[]): SnapshotEventDetail => ({
  topAllergies: allergies.slice(0, 3),
  topMeds: medications.filter((med) => med.status === "active").slice(0, 3),
  allAllergies: allergies,
  allMedications: medications,
});

export const useProfileSnapshot = create<SnapshotState>()(
  devtools((set) => ({
    ...computeSnapshot(initialAllergies, initialMeds),
    recompute: () => {
      const { allergies, medications } = useProfileStore.getState();
      const snapshot = computeSnapshot(allergies, medications);
      set(snapshot);
      dispatchSnapshotEvent(snapshot);
    },
  })),
);

export function initializeProfileSnapshotListener() {
  const recompute = useProfileSnapshot.getState().recompute;
  const unsubscribe = useProfileStore.subscribe(() => {
    recompute();
  });
  recompute();
  return unsubscribe;
}

const SNAPSHOT_EVENT_KEY = "profile-snapshot-update";

function dispatchSnapshotEvent(snapshot: SnapshotEventDetail) {
  const event = new CustomEvent<SnapshotEventDetail>(SNAPSHOT_EVENT_KEY, { detail: snapshot });
  window.dispatchEvent(event);
}

export function subscribeToProfileSnapshot(callback: (snapshot: SnapshotEventDetail) => void) {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<SnapshotEventDetail>;
    callback(customEvent.detail);
  };
  window.addEventListener(SNAPSHOT_EVENT_KEY, handler);
  return () => window.removeEventListener(SNAPSHOT_EVENT_KEY, handler);
}

export function getCurrentProfileSnapshot(): SnapshotEventDetail {
  const { allergies, medications } = useProfileStore.getState();
  return computeSnapshot(allergies, medications);
}

let listenerBound = false;

if (typeof window !== "undefined" && !listenerBound) {
  initializeProfileSnapshotListener();
  listenerBound = true;
}
