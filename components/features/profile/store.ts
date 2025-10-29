"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type ProfileSummary = {
  id: string;
  email: string | null;
  name: string | null;
  dob: string | null;
  sex: string | null;
  bloodType: string | null;
  phone: string | null;
  address: string | null;
  heightCm: number | null;
  weightKg: number | null;
  officeAddress: string | null;
};

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

type SnapshotApiResponse = {
  profile: {
    id: string;
    email: string | null;
    name: string | null;
    dob: string | null;
    sex: string | null;
    blood_type: string | null;
    phone: string | null;
    address: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    office_address: string | null;
  } | null;
  allergies: Array<{
    id: number;
    substance: string;
    reaction: string | null;
    severity: "mild" | "moderate" | "severe";
  }>;
  meds: Array<{
    id: number;
    name: string;
    strength: string | null;
    frequency: string | null;
    status: "active" | "stopped";
  }>;
};

type SnapshotMutation =
  | {
      entity: "allergy";
      action: "upsert";
      record: {
        id?: number;
        substance: string;
        reaction?: string | null;
        severity: AllergySeverity;
      };
    }
  | {
      entity: "allergy";
      action: "delete";
      id: number;
    }
  | {
      entity: "med";
      action: "upsert";
      record: {
        id?: number;
        name: string;
        strength?: string | null;
        frequency?: string | null;
        status?: MedicationStatus;
      };
    }
  | {
      entity: "med";
      action: "delete";
      id: number;
    }
  | {
      entity: "med";
      action: "status";
      id: number;
      status: MedicationStatus;
    }
  | {
      entity: "profile";
      action: "upsert";
      record: {
        email?: string | null;
        name?: string | null;
        dob?: string | null;
        sex?: string | null;
        bloodType?: string | null;
        phone?: string | null;
        address?: string | null;
        officeAddress?: string | null;
      };
    };

type ProfileState = {
  profile: ProfileSummary | null;
  allergies: Allergy[];
  medications: Medication[];
  loading: boolean;
  error: string | null;
  hydrate: (payload: {
    profile: ProfileSummary | null;
    allergies: Allergy[];
    medications: Medication[];
  }) => void;
  fetchSnapshot: () => Promise<void>;
  updateProfile: (payload: {
    email?: string | null;
    name?: string | null;
    dob?: string | null;
    sex?: string | null;
    bloodType?: string | null;
    phone?: string | null;
    address?: string | null;
    heightCm?: number | null;
    weightKg?: number | null;
  }) => Promise<void>;
  addAllergy: (allergy: Allergy) => Promise<void>;
  updateAllergy: (allergy: Allergy) => Promise<void>;
  removeAllergy: (id: string) => Promise<void>;
  addMedication: (med: Medication) => Promise<void>;
  updateMedication: (med: Medication) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
  stopMedication: (id: string) => Promise<void>;
};

const API_ENDPOINT = "/api/profile/snapshot";

const parseNumericId = (value: string): number | null => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const mapSnapshotResponse = (
  payload: SnapshotApiResponse,
): {
  profile: ProfileSummary | null;
  allergies: Allergy[];
  medications: Medication[];
} => ({
  profile: payload.profile
    ? {
        id: payload.profile.id,
        email: payload.profile.email,
        name: payload.profile.name,
        dob: payload.profile.dob,
        sex: payload.profile.sex,
        bloodType: payload.profile.blood_type,
        phone: payload.profile.phone,
        address: payload.profile.address,
        heightCm: payload.profile.height_cm,
        weightKg: payload.profile.weight_kg,
        officeAddress: payload.profile.office_address,
      }
    : null,
  allergies: payload.allergies.map((item) => ({
    id: item.id.toString(),
    substance: item.substance,
    reaction: item.reaction ?? "",
    severity: item.severity,
  })),
  medications: payload.meds.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    strength: item.strength ?? "",
    frequency: item.frequency ?? "",
    status: item.status,
  })),
});

const mutateSnapshot = async (body: SnapshotMutation) => {
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = "Gagal memperbarui snapshot profil.";
    try {
      const errorPayload = (await response.json()) as { message?: string };
      if (errorPayload.message) {
        message = errorPayload.message;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return (await response.json()) as SnapshotApiResponse;
};

const fetchSnapshotFromServer = async () => {
  const response = await fetch(API_ENDPOINT, {
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Gagal memuat snapshot profil.";
    try {
      const errorPayload = (await response.json()) as { message?: string };
      if (errorPayload.message) {
        message = errorPayload.message;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return (await response.json()) as SnapshotApiResponse;
};

export const useProfileStore = create<ProfileState>()(
  devtools((set) => ({
    profile: null,
    allergies: [],
    medications: [],
    loading: false,
    error: null,
    hydrate: ({ profile, allergies, medications }) =>
      set(() => ({
        profile,
        allergies,
        medications,
      })),
    fetchSnapshot: async () => {
      set((state) => ({ ...state, loading: true, error: null }));
      try {
        const snapshot = await fetchSnapshotFromServer();
        const mapped = mapSnapshotResponse(snapshot);
        set(() => ({
          ...mapped,
          loading: false,
          error: null,
        }));
      } catch (error) {
        console.error("[profile] failed to fetch snapshot", error);
        set((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Gagal memuat snapshot.",
        }));
        throw error;
      }
    },
    updateProfile: async (payload) => {
      set((state) => ({ ...state, loading: true, error: null }));
      try {
        const snapshot = await mutateSnapshot({
          entity: "profile",
          action: "upsert",
          record: payload,
        });
        const mapped = mapSnapshotResponse(snapshot);
        set(() => ({
          ...mapped,
          loading: false,
          error: null,
        }));
      } catch (error) {
        console.error("[profile] failed to update profile", error);
        set((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Gagal memperbarui profil.",
        }));
        throw error;
      }
    },
    addAllergy: async (allergy) => {
      set((state) => ({ ...state, loading: true, error: null }));
      try {
        const id = parseNumericId(allergy.id) ?? undefined;
        const snapshot = await mutateSnapshot({
          entity: "allergy",
          action: "upsert",
          record: {
            id,
            substance: allergy.substance.trim(),
            reaction: allergy.reaction.trim() || null,
            severity: allergy.severity,
          },
        });
        const mapped = mapSnapshotResponse(snapshot);
        set(() => ({
          ...mapped,
          loading: false,
          error: null,
        }));
      } catch (error) {
        console.error("[profile] failed to add allergy", error);
        set((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Gagal menyimpan alergi.",
        }));
        throw error;
      }
    },
    updateAllergy: async (allergy) => {
      await useProfileStore.getState().addAllergy(allergy);
    },
    removeAllergy: async (id) => {
      const numericId = parseNumericId(id);
      if (numericId === null) {
        await useProfileStore.getState().fetchSnapshot();
        return;
      }

      set((state) => ({ ...state, loading: true, error: null }));
      try {
        const snapshot = await mutateSnapshot({
          entity: "allergy",
          action: "delete",
          id: numericId,
        });
        const mapped = mapSnapshotResponse(snapshot);
        set(() => ({
          ...mapped,
          loading: false,
          error: null,
        }));
      } catch (error) {
        console.error("[profile] failed to remove allergy", error);
        set((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Gagal menghapus alergi.",
        }));
        throw error;
      }
    },
    addMedication: async (med) => {
      set((state) => ({ ...state, loading: true, error: null }));
      try {
        const id = parseNumericId(med.id) ?? undefined;
        const snapshot = await mutateSnapshot({
          entity: "med",
          action: "upsert",
          record: {
            id,
            name: med.name.trim(),
            strength: med.strength.trim() || null,
            frequency: med.frequency.trim() || null,
            status: med.status,
          },
        });
        const mapped = mapSnapshotResponse(snapshot);
        set(() => ({
          ...mapped,
          loading: false,
          error: null,
        }));
      } catch (error) {
        console.error("[profile] failed to add medication", error);
        set((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Gagal menyimpan obat.",
        }));
        throw error;
      }
    },
    updateMedication: async (med) => {
      await useProfileStore.getState().addMedication(med);
    },
    removeMedication: async (id) => {
      const numericId = parseNumericId(id);
      if (numericId === null) {
        await useProfileStore.getState().fetchSnapshot();
        return;
      }

      set((state) => ({ ...state, loading: true, error: null }));
      try {
        const snapshot = await mutateSnapshot({
          entity: "med",
          action: "delete",
          id: numericId,
        });
        const mapped = mapSnapshotResponse(snapshot);
        set(() => ({
          ...mapped,
          loading: false,
          error: null,
        }));
      } catch (error) {
        console.error("[profile] failed to remove medication", error);
        set((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Gagal menghapus obat.",
        }));
        throw error;
      }
    },
    stopMedication: async (id) => {
      const numericId = parseNumericId(id);
      if (numericId === null) {
        await useProfileStore.getState().fetchSnapshot();
        return;
      }

      set((state) => ({ ...state, loading: true, error: null }));
      try {
        const snapshot = await mutateSnapshot({
          entity: "med",
          action: "status",
          id: numericId,
          status: "stopped",
        });
        const mapped = mapSnapshotResponse(snapshot);
        set(() => ({
          ...mapped,
          loading: false,
          error: null,
        }));
      } catch (error) {
        console.error("[profile] failed to stop medication", error);
        set((state) => ({
          ...state,
          loading: false,
          error: error instanceof Error ? error.message : "Gagal menghentikan obat.",
        }));
        throw error;
      }
    },
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
    ...computeSnapshot([], []),
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
let initialFetchTriggered = false;

if (typeof window !== "undefined") {
  if (!listenerBound) {
    initializeProfileSnapshotListener();
    listenerBound = true;
  }

  if (!initialFetchTriggered) {
    initialFetchTriggered = true;
    void useProfileStore
      .getState()
      .fetchSnapshot()
      .catch((error) => console.error("[profile] initial snapshot load failed", error));
  }
}
