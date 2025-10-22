import type { QueueEntry } from "../queue-item";

export type DoctorKpi = {
  label: string;
  value: number;
  suffix?: string;
  delta?: {
    value: number;
    positive: boolean;
  };
};

export type DoctorNote = {
  id: string;
  title: string;
  patient: string;
  timestamp: string;
  tags: string[];
};

export const MOCK_QUEUE: QueueEntry[] = [
  {
    id: "queue-1",
    name: "Anisa Putri",
    age: 32,
    reason: "Nyeri dada ringan",
    status: "in-progress",
    waitTime: "05m",
    lastInteraction: "Baru saja",
    riskLevel: "moderate",
    notes: "Riwayat asma, butuh spirometri.",
  },
  {
    id: "queue-2",
    name: "Budi Santoso",
    age: 41,
    reason: "Kontrol hipertensi",
    status: "waiting",
    waitTime: "18m",
    lastInteraction: "5 menit lalu",
    riskLevel: "low",
  },
  {
    id: "queue-3",
    name: "Clarissa Widya",
    age: 24,
    reason: "Migrain kronis",
    status: "waiting",
    waitTime: "12m",
    lastInteraction: "7 menit lalu",
    riskLevel: "low",
    notes: "Sensitif cahaya, gunakan ruangan redup.",
  },
  {
    id: "queue-4",
    name: "Dimas Prakoso",
    age: 51,
    reason: "Kontrol diabetes",
    status: "done",
    waitTime: "40m",
    lastInteraction: "20 menit lalu",
    riskLevel: "moderate",
  },
];

export const MOCK_NOTES: DoctorNote[] = [
  {
    id: "note-1",
    title: "Konsultasi Post-Operasi ACL",
    patient: "Fajar Nugroho",
    timestamp: "2025-10-21T09:45:00+07:00",
    tags: ["Ortopedi", "Rehab"],
  },
  {
    id: "note-2",
    title: "Follow-up Hipertensi",
    patient: "Budi Santoso",
    timestamp: "2025-10-20T16:12:00+07:00",
    tags: ["Interna", "Lifestyle"],
  },
  {
    id: "note-3",
    title: "Evaluasi Migrain Kronis",
    patient: "Clarissa Widya",
    timestamp: "2025-10-20T13:28:00+07:00",
    tags: ["Neurologi"],
  },
  {
    id: "note-4",
    title: "Konsultasi Prenatal Trimester 2",
    patient: "Dian Maharani",
    timestamp: "2025-10-19T11:05:00+07:00",
    tags: ["Obgyn"],
  },
  {
    id: "note-5",
    title: "Review Terapi Asthma",
    patient: "Anisa Putri",
    timestamp: "2025-10-19T08:55:00+07:00",
    tags: ["Pulmo"],
  },
];

export function computeKpis(queue = MOCK_QUEUE) {
  const activeConsultations = queue.filter((entry) => entry.status === "in-progress").length;
  const waiting = queue.filter((entry) => entry.status === "waiting");
  const completed = queue.filter((entry) => entry.status === "done").length;
  const avgWaitMinutes =
    waiting.reduce((total, entry) => total + Number.parseInt(entry.waitTime, 10), 0) ||
    0;
  const avgWait = waiting.length ? Math.round(avgWaitMinutes / waiting.length) : 0;

  return [
    {
      label: "Pasien dalam antrean",
      value: waiting.length + activeConsultations,
      suffix: "pasien",
      delta: { value: 2, positive: true },
    },
    {
      label: "Rata-rata tunggu",
      value: avgWait,
      suffix: "menit",
      delta: { value: 5, positive: false },
    },
    {
      label: "Sesi aktif",
      value: activeConsultations,
      suffix: "pasien",
      delta: { value: 1, positive: true },
    },
    {
      label: "Selesai hari ini",
      value: completed,
      suffix: "pasien",
      delta: { value: 3, positive: true },
    },
  ] as const;
}
