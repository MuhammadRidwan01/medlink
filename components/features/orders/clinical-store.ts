"use client";

export type OrderKind = "lab" | "imaging";
export type OrderStatus = "pending" | "completed";

export type ClinicalOrder = {
  id: string;
  kind: OrderKind;
  patient: string;
  date: string; // ISO
  status: OrderStatus;
  priority: "normal" | "high" | "stat";
  note?: string;
  report?: string;
  aiSummary?: string;
  images?: string[]; // mock URLs
  timeline?: { id: string; label: string; timestamp: string }[];
};

const EVENT_KEY = "clinical-orders-update";

let __orders: ClinicalOrder[] = [
  {
    id: "IMG-20251021-001",
    kind: "imaging",
    patient: "Aulia Pratama",
    date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: "completed",
    priority: "normal",
    aiSummary:
      "Foto toraks AP menunjukkan bayangan homogen di lobus inferior kanan. Tidak tampak efusi pleura. Saran: korelasi dengan gejala klinis dan pertimbangkan CT bila perlu.",
    report: "Infiltrat perifer kanan, pertimbangkan pneumonia lobus inferior. Rekomendasi terapi empiris.",
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    ],
    timeline: [
      { id: "t1", label: "Dipesan", timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
      { id: "t2", label: "Diambil gambar", timestamp: new Date(Date.now() - 1000 * 60 * 80).toISOString() },
      { id: "t3", label: "Hasil siap", timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    ],
  },
  {
    id: "LAB-20251021-112",
    kind: "lab",
    patient: "Rudi Hartono",
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "pending",
    priority: "stat",
    note: "CBC + Troponin T",
    aiSummary:
      "Prioritas STAT untuk rule-out ACS. Sistem akan menandai nilai troponin di atas ambang sebagai red flag.",
    images: [],
    timeline: [
      { id: "t1", label: "Dipesan", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    ],
  },
  {
    id: "LAB-20251020-034",
    kind: "lab",
    patient: "Dewi Kartika",
    date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    status: "completed",
    priority: "high",
    note: "CRP, D-Dimer",
    report: "CRP 18 mg/L (tinggi ringan), D-Dimer 0.3 µg/mL (normal).",
    aiSummary: "Inflamasi ringan; trombosis tidak disarankan. Evaluasi klinis lebih lanjut.",
    images: [],
    timeline: [
      { id: "t1", label: "Dipesan", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString() },
      { id: "t2", label: "Diproses", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6.5).toISOString() },
      { id: "t3", label: "Selesai", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
    ],
  },
];

function emit() {
  const event = new CustomEvent<ClinicalOrder[]>(EVENT_KEY, { detail: __orders.slice() });
  window.dispatchEvent(event);
}

export function subscribeToClinicalOrders(cb: (orders: ClinicalOrder[]) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<ClinicalOrder[]>).detail);
  window.addEventListener(EVENT_KEY, handler);
  cb(__orders.slice());
  return () => window.removeEventListener(EVENT_KEY, handler);
}

export function getCurrentClinicalOrders() {
  return __orders.slice();
}

export function addClinicalOrder(input: {
  kind: OrderKind;
  patient: string;
  priority: "normal" | "high" | "stat";
  note?: string;
}) {
  const id = `${input.kind === "lab" ? "LAB" : "IMG"}-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.floor(Math.random() * 900 + 100)}`;
  const now = new Date().toISOString();
  const order: ClinicalOrder = {
    id,
    kind: input.kind,
    patient: input.patient,
    date: now,
    status: "pending",
    priority: input.priority,
    note: input.note,
    images: input.kind === "imaging" ? [
      "https://images.unsplash.com/photo-1582095133179-2988d3c02e51?auto=format&fit=crop&w=1200&q=80",
    ] : [],
    timeline: [{ id: "t1", label: "Dipesan", timestamp: now }],
  };
  __orders = [order, ...__orders];
  emit();
  return id;
}

export function updateClinicalOrder(id: string, patch: Partial<ClinicalOrder>) {
  __orders = __orders.map((o) => (o.id === id ? { ...o, ...patch } : o));
  emit();
}

