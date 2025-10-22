import { create } from "zustand";
import type { TimelineSegment, TimelineDose } from "./timeline";

type ReminderConfig = {
  time: string;
  offsetMinutes: number;
};

type DoseEntry = TimelineDose & {
  segmentId: string;
};

type Prescription = {
  id: string;
  name: string;
  description: string;
  segments: TimelineSegment[];
  doses: DoseEntry[];
  reminder: ReminderConfig;
};

const SEGMENT_ORDER: Record<string, number> = {
  morning: 0,
  afternoon: 1,
  evening: 2,
  night: 3,
};

type PillTimelineState = {
  prescriptions: Prescription[];
  markCurrentDose: (prescriptionId: string) => void;
  snoozeCurrentDose: (prescriptionId: string, minutes: number) => void;
  updateReminder: (prescriptionId: string, reminder: ReminderConfig) => void;
};

const initialPrescriptions: Prescription[] = [
  {
    id: "rx-metformin",
    name: "Metformin",
    description: "500 mg • 2x sehari setelah makan",
    reminder: {
      time: "06:30",
      offsetMinutes: 0,
    },
    segments: [
      { id: "morning", label: "Pagi", range: "05:00 - 09:00", doses: [] },
      { id: "afternoon", label: "Siang", range: "11:00 - 14:00", doses: [] },
      { id: "evening", label: "Sore", range: "17:00 - 19:00", doses: [] },
      { id: "night", label: "Malam", range: "20:00 - 23:00", doses: [] },
    ],
    doses: [
      {
        id: "met-1",
        segmentId: "morning",
        time: "06:30",
        medication: "Metformin",
        strength: "500 mg",
        status: "due",
      },
      {
        id: "met-2",
        segmentId: "evening",
        time: "18:30",
        medication: "Metformin",
        strength: "500 mg",
        status: "soon",
      },
    ],
  },
  {
    id: "rx-atorvastatin",
    name: "Atorvastatin",
    description: "20 mg • 1x sehari sebelum tidur",
    reminder: {
      time: "21:00",
      offsetMinutes: 0,
    },
    segments: [
      { id: "morning", label: "Pagi", range: "05:00 - 09:00", doses: [] },
      { id: "afternoon", label: "Siang", range: "11:00 - 14:00", doses: [] },
      { id: "evening", label: "Sore", range: "17:00 - 19:00", doses: [] },
      { id: "night", label: "Malam", range: "20:00 - 23:59", doses: [] },
    ],
    doses: [
      {
        id: "ator-1",
        segmentId: "night",
        time: "21:30",
        medication: "Atorvastatin",
        strength: "20 mg",
        status: "soon",
      },
    ],
  },
];

const usePillTimelineStore = create<PillTimelineState>((set) => ({
  prescriptions: initialPrescriptions,
  markCurrentDose: (prescriptionId) => {
    set((state) => {
      const prescriptions = state.prescriptions.map((prescription) => {
        if (prescription.id !== prescriptionId) return prescription;

        const doses = prescription.doses.map((dose) => ({ ...dose }));
        const currentIndex = doses.findIndex((dose) => dose.status === "due" || dose.status === "soon");
        if (currentIndex === -1) return prescription;

        const currentDose = doses[currentIndex];
        currentDose.status = "taken";

        const nextIndex = doses.findIndex((dose, idx) => idx > currentIndex && dose.status !== "taken");
        if (nextIndex !== -1) {
          doses[nextIndex].status = "due";
          doses.forEach((dose, idx) => {
            if (idx > nextIndex && dose.status !== "taken") {
              dose.status = "soon";
            }
          });
        }

        return {
          ...prescription,
          doses,
        };
      });

      return { prescriptions };
    });
  },
  snoozeCurrentDose: (prescriptionId, minutes) => {
    set((state) => {
      const prescriptions = state.prescriptions.map((prescription) => {
        if (prescription.id !== prescriptionId) return prescription;

        const doses = prescription.doses.map((dose) => ({ ...dose }));
        const currentIndex = doses.findIndex((dose) => dose.status === "due");
        if (currentIndex === -1) return prescription;

        const dose = doses[currentIndex];
        dose.time = addMinutesToTimeString(dose.time, minutes);

        return {
          ...prescription,
          doses: sortDoses(doses),
        };
      });

      return { prescriptions };
    });
  },
  updateReminder: (prescriptionId, reminder) => {
    set((state) => ({
      prescriptions: state.prescriptions.map((prescription) =>
        prescription.id === prescriptionId
          ? {
              ...prescription,
              reminder,
            }
          : prescription,
      ),
    }));
  },
}));

function addMinutesToTimeString(time: string, minutes: number) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute + minutes);
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function sortDoses(doses: DoseEntry[]) {
  return [...doses].sort((a, b) => {
    const orderA = SEGMENT_ORDER[a.segmentId] ?? 999;
    const orderB = SEGMENT_ORDER[b.segmentId] ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    const timeA = parseInt(a.time.replace(":", ""), 10);
    const timeB = parseInt(b.time.replace(":", ""), 10);
    return timeA - timeB;
  });
}

export function selectPrescription(prescriptionId: string) {
  return (state: PillTimelineState) => state.prescriptions.find((prescription) => prescription.id === prescriptionId);
}

export function computeAdherence(prescription: Prescription) {
  const total = prescription.doses.length;
  const taken = prescription.doses.filter((dose) => dose.status === "taken").length;
  return total === 0 ? 0 : taken / total;
}

export function computeNextDose(prescription: Prescription) {
  return prescription.doses.find((dose) => dose.status === "due" || dose.status === "soon") ?? null;
}

export function buildTimelineSegments(prescription: Prescription) {
  const dosesBySegment = prescription.segments.map((segment) => ({
    ...segment,
    doses: prescription.doses
      .filter((dose) => dose.segmentId === segment.id)
      .sort((a, b) => parseInt(a.time.replace(":", ""), 10) - parseInt(b.time.replace(":", ""), 10)),
  }));
  return dosesBySegment;
}

export { usePillTimelineStore };
export type { Prescription };
