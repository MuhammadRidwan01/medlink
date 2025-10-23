"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { QueueList } from "./queue-list";
import { SplitPane } from "./split-pane";
import type { OrderEntry } from "./session-tabs";
import { SessionTabs as ConsultationTabs } from "@/components/features/consultation/session-tabs";
import { consultationBus } from "@/components/features/consultation/event-bus";
import { MEDICATION_OPTIONS, type MedicationOption } from "@/components/features/prescription/medication-search";
import { PatientSnapshot } from "./patient-snapshot";
import { HeaderActions } from "./header-actions";
import type { RedFlagSeverity } from "./red-flag-banner";
import type { ChatMessageProps } from "@/components/features/ai-triage/chat-message";
import { useToast } from "@/components/ui/use-toast";
import type { QueueEntry } from "./queue-item";
import dynamic from "next/dynamic";
import type { DraftMedication, DraftStatus, MedicationOption } from "@/components/features/prescription/draft-prescription-sheet";
const DraftPrescriptionSheet = dynamic(
  () => import("@/components/features/prescription/draft-prescription-sheet").then((m) => m.DraftPrescriptionSheet),
  { ssr: false },
);
import { MiniScheduler } from "@/components/features/schedule/mini-scheduler";
import { addDraft } from "@/components/features/prescription/store";

type ConsultationWorkspaceProps = {
  consultationId: string;
};

const queueSeed: QueueEntry[] = [
  {
    id: "queue-1",
    name: "Aulia Pratama",
    age: 32,
    reason: "Demam tinggi, menggigil",
    status: "waiting",
    waitTime: "5 menit",
    lastInteraction: "2 menit lalu",
    riskLevel: "moderate",
    notes: "AI menyarankan observasi intensif.",
  },
  {
    id: "queue-2",
    name: "Dewi Kartika",
    age: 41,
    reason: "Sesak napas, riwayat asma",
    status: "waiting",
    waitTime: "12 menit",
    lastInteraction: "5 menit lalu",
    riskLevel: "high",
    notes: "Butuh evaluasi chest auscultation.",
  },
  {
    id: "queue-3",
    name: "Rudi Hartono",
    age: 55,
    reason: "Nyeri dada akut",
    status: "waiting",
    waitTime: "18 menit",
    lastInteraction: "8 menit lalu",
    riskLevel: "emergency",
    notes: "AI menandai red flag kardio.",
  },
  {
    id: "queue-4",
    name: "Intan Sari",
    age: 28,
    reason: "Ruam kulit menyebar",
    status: "waiting",
    waitTime: "25 menit",
    lastInteraction: "10 menit lalu",
    riskLevel: "low",
    notes: "Kemungkinan reaksi alergi.",
  },
  {
    id: "queue-5",
    name: "Yoga Maulana",
    age: 47,
    reason: "Hipertensi kontrol rutin",
    status: "done",
    waitTime: "Selesai",
    lastInteraction: "Baru saja",
    riskLevel: "moderate",
    notes: "Konsultasi selesai 5 menit lalu.",
  },
  {
    id: "queue-6",
    name: "Siti Rahma",
    age: 36,
    reason: "Batuk berdarah ringan",
    status: "waiting",
    waitTime: "32 menit",
    lastInteraction: "12 menit lalu",
    riskLevel: "high",
    notes: "AI menyarankan skrining TB.",
  },
];

const messagesSeed: Record<string, ChatMessageProps[]> = {
  "queue-1": [
    {
      id: "q1-ai-1",
      role: "ai",
      content:
        "Saya mendeteksi demam tinggi sejak 2 jam lalu dengan respon obat penurun panas yang lambat. Sarankan pemeriksaan lanjutan oleh dokter.",
      timestamp: "09:05",
      riskLevel: "moderate",
    },
    {
      id: "q1-user-1",
      role: "user",
      content: "Saya merasa menggigil dan sendi-sendi sakit. Apakah ini tifus?",
      timestamp: "09:06",
    },
    {
      id: "q1-doctor-1",
      role: "doctor",
      content:
        "Halo Aulia, saya akan mengevaluasi kemungkinan infeksi bakteri. Tolong sampaikan apakah ada sakit perut atau diare.",
      timestamp: "09:07",
    },
  ],
  "queue-2": [
    {
      id: "q2-ai-1",
      role: "ai",
      content:
        "Riwayat asma aktif dengan inhaler terakhir digunakan 4 jam yang lalu. Napas terdengar mengi menurut catatan pasien.",
      timestamp: "08:58",
      riskLevel: "high",
    },
    {
      id: "q2-user-1",
      role: "user",
      content: "Saya merasa dada berat dan inhaler kurang membantu kali ini.",
      timestamp: "08:59",
    },
    {
      id: "q2-doctor-1",
      role: "doctor",
      content:
        "Kita akan siapkan bronkodilator nebulizer. Mohon ukur saturasi oksigen Anda sebelum sesi.",
      timestamp: "09:00",
    },
  ],
  "queue-3": [
    {
      id: "q3-ai-1",
      role: "ai",
      content:
        "AI mendeteksi pola red flag: nyeri dada menjalar ke lengan kiri, keringat dingin, dan mual. Risiko darurat kardiovaskular.",
      timestamp: "08:52",
      riskLevel: "emergency",
      redFlag: "Tanda serangan jantung - segera evaluasi EKG.",
    },
    {
      id: "q3-user-1",
      role: "user",
      content: "Nyeri makin berat sejak 30 menit lalu dan saya merasa lemas.",
      timestamp: "08:53",
    },
    {
      id: "q3-doctor-1",
      role: "doctor",
      content:
        "Tetap tenang Pak Rudi, saya akan panggil tim IGD. Tolong ukur tekanan darah bila memungkinkan.",
      timestamp: "08:54",
    },
  ],
  "queue-4": [
    {
      id: "q4-ai-1",
      role: "ai",
      content:
        "Ruam kulit menyebar setelah konsumsi antibiotik baru. Pantau kemungkinan alergi obat.",
      timestamp: "09:15",
      riskLevel: "low",
    },
  ],
  "queue-5": [
    {
      id: "q5-doctor-1",
      role: "doctor",
      content: "Kunjungan follow-up telah selesai, tekanan darah stabil di 130/85.",
      timestamp: "08:40",
    },
  ],
  "queue-6": [
    {
      id: "q6-ai-1",
      role: "ai",
      content:
        "Batuk berdarah ringan, frekuensi 2 kali sehari. Sarankan foto toraks dan tes sputum.",
      timestamp: "08:45",
      riskLevel: "high",
    },
  ],
};

// legacy notes seed removed; notes move to structured Notes pane

const ordersSeed: Record<string, OrderEntry[]> = {
  "queue-1": [
    {
      id: "order-q1-1",
      medication: "Paracetamol 500mg",
      dosage: "1 tablet",
      frequency: "3x sehari",
      status: "draft",
    },
  ],
  "queue-3": [
    {
      id: "order-q3-1",
      medication: "Aspirin 80mg",
      dosage: "1 tablet",
      frequency: "Sekali",
      status: "pending",
    },
    {
      id: "order-q3-2",
      medication: "Nitrogliserin 0.4mg SL",
      dosage: "1 tablet",
      frequency: "Setiap 5 menit bila nyeri",
      status: "draft",
    },
  ],
};

const snapshotSeed = {
  "queue-1": {
    name: "Aulia Pratama",
    age: 32,
    gender: "Perempuan",
    weight: "62 kg",
    lastVisit: "Kontrol terakhir 2 bulan lalu",
    diagnosis: "Observasi infeksi akut vs. tifus",
    riskLevel: "moderate" as const,
    allergies: ["Penisilin"],
    medications: [
      { name: "Paracetamol", dosage: "500mg", frequency: "3x sehari" },
      { name: "Vitamin C", dosage: "500mg", frequency: "1x sehari" },
    ],
    redFlags: ["Demam > 39°C selama 2 jam", "Nyeri sendi hebat"],
    vitals: [
      { label: "Suhu", value: "39.1°C", icon: "temp" as const },
      { label: "Tekanan darah", value: "118/76", icon: "bp" as const },
      { label: "Nadi", value: "104 bpm", icon: "pulse" as const },
    ],
  },
  "queue-3": {
    name: "Rudi Hartono",
    age: 55,
    gender: "Pria",
    weight: "82 kg",
    lastVisit: "Kontrol jantung 3 bulan lalu",
    diagnosis: "Curiga Acute Coronary Syndrome",
    riskLevel: "emergency" as const,
    allergies: ["Tidak ada"],
    medications: [
      { name: "Aspirin", dosage: "80mg", frequency: "1x sehari" },
      { name: "Atorvastatin", dosage: "20mg", frequency: "1x sehari" },
    ],
    redFlags: ["Nyeri dada menjalar", "Keringat dingin", "Riwayat hipertensi"],
    vitals: [
      { label: "Suhu", value: "37.0°C", icon: "temp" as const },
      { label: "Tekanan darah", value: "150/95", icon: "bp" as const },
      { label: "Nadi", value: "112 bpm", icon: "pulse" as const },
    ],
  },
  "queue-2": {
    name: "Dewi Kartika",
    age: 41,
    gender: "Perempuan",
    weight: "68 kg",
    lastVisit: "Kontrol asma 1 bulan lalu",
    diagnosis: "Eksaserbasi asma akut",
    riskLevel: "high" as const,
    allergies: ["Debu rumah", "Udara dingin"],
    medications: [
      { name: "Salbutamol Inhaler", dosage: "100mcg", frequency: "PRN" },
      { name: "Montelukast", dosage: "10mg", frequency: "1x sehari" },
    ],
    redFlags: ["Sesak saat istirahat", "Inhaler tidak efektif"],
    vitals: [
      { label: "Suhu", value: "36.9°C", icon: "temp" as const },
      { label: "Tekanan darah", value: "124/82", icon: "bp" as const },
      { label: "Nadi", value: "102 bpm", icon: "pulse" as const },
    ],
  },
  "queue-4": {
    name: "Intan Sari",
    age: 28,
    gender: "Perempuan",
    weight: "54 kg",
    lastVisit: "Belum pernah",
    diagnosis: "Kemungkinan urtikaria akibat obat",
    riskLevel: "low" as const,
    allergies: ["Sulfa"],
    medications: [
      { name: "Cetirizine", dosage: "10mg", frequency: "1x sehari" },
    ],
    redFlags: ["Ruam menyebar", "Gatal intens"],
    vitals: [
      { label: "Suhu", value: "36.7°C", icon: "temp" as const },
      { label: "Tekanan darah", value: "110/70", icon: "bp" as const },
      { label: "Nadi", value: "88 bpm", icon: "pulse" as const },
    ],
  },
  "queue-5": {
    name: "Yoga Maulana",
    age: 47,
    gender: "Pria",
    weight: "88 kg",
    lastVisit: "Kontrol tekanan darah 1 minggu lalu",
    diagnosis: "Hipertensi terkontrol",
    riskLevel: "moderate" as const,
    allergies: [],
    medications: [
      { name: "Amlodipine", dosage: "5mg", frequency: "1x sehari" },
    ],
    redFlags: [],
    vitals: [
      { label: "Suhu", value: "36.5°C", icon: "temp" as const },
      { label: "Tekanan darah", value: "130/85", icon: "bp" as const },
      { label: "Nadi", value: "78 bpm", icon: "pulse" as const },
    ],
  },
  "queue-6": {
    name: "Siti Rahma",
    age: 36,
    gender: "Perempuan",
    weight: "60 kg",
    lastVisit: "Kontrol batuk 2 bulan lalu",
    diagnosis: "Curiga infeksi paru kronik",
    riskLevel: "high" as const,
    allergies: ["Debu"],
    medications: [
      { name: "Ambroxol", dosage: "30mg", frequency: "3x sehari" },
    ],
    redFlags: ["Batuk darah > 3 hari"],
    vitals: [
      { label: "Suhu", value: "37.8°C", icon: "temp" as const },
      { label: "Tekanan darah", value: "118/80", icon: "bp" as const },
      { label: "Nadi", value: "96 bpm", icon: "pulse" as const },
    ],
  },
};

export function ConsultationWorkspace({ consultationId }: ConsultationWorkspaceProps) {
  const [queue, setQueue] = useState(queueSeed);
  const [selectedId, setSelectedId] = useState(queueSeed[0].id);
  const [isActive, setIsActive] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [draftMedications, setDraftMedications] = useState<DraftMedication[]>([]);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("idle");
  const { toast } = useToast();

  const selectedSnapshot = snapshotSeed[selectedId];
  const messages = messagesSeed[selectedId] ?? [];
  const orders = ordersSeed[selectedId] ?? [];

  const selectedPatient = useMemo(
    () => queue.find((item) => item.id === selectedId),
    [queue, selectedId],
  );

  const handleSelectQueueItem = useCallback(
    (id: string) => {
      if (id !== selectedId) {
        setDraftMedications([]);
        setDraftStatus("idle");
        setIsDraftOpen(false);
      }
      setQueue((current) => {
        const next = current.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              status: isActive && item.status !== "done" ? "in-progress" : item.status,
            };
          }
          if (isActive && item.status === "in-progress") {
            return { ...item, status: "waiting" };
          }
          return item;
        });
        return next;
      });
      setSelectedId(id);
    },
    [isActive, selectedId],
  );

  const handleToggleConsultation = useCallback(() => {
    setIsActive((prev) => {
      const next = !prev;
      setQueue((current) =>
        current.map((item) => {
          if (item.id === selectedId) {
            return {
              ...item,
              status: next ? "in-progress" : "done",
              waitTime: next ? "Sedang ditangani" : "Selesai",
              lastInteraction: next ? "Baru saja" : "1 menit lalu",
            };
          }
          if (next) {
            return item.status === "in-progress"
              ? { ...item, status: "waiting", waitTime: "Menunggu giliran" }
              : item;
          }
          return item;
        }),
      );

      if (next) {
        toast({
          title: "Konsultasi dimulai",
          description: "Sesi dokter dan AI tersinkronisasi.",
        });
      } else {
        toast({
          title: "Konsultasi diakhiri",
          description: "Catatan sesi disimpan sementara di draft.",
        });
        setIsDraftOpen(false);
      }

      return next;
    });
  }, [selectedId, toast]);

  const handleCreateDraft = useCallback(() => {
    setIsDraftOpen(true);
    setDraftStatus((current) => (current === "idle" ? "draft" : current));
    toast({
      title: "Draf resep dibuka",
      description: "Tambahkan obat dan sesuaikan instruksi sebelum dikirim.",
    });
  }, [toast]);

  const handleAddMedication = useCallback((option: MedicationOption) => {
    const newMedication: DraftMedication = {
      id: `draft-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      sourceId: option.code,
      name: option.name,
      availableStrengths: option.strengths,
      strength: option.strengths[0] ?? "",
      dose: option.defaultDose,
      frequency: option.defaultFrequency,
      frequencyIsCustom: false,
      duration: option.defaultDuration,
      durationIsCustom: false,
      notes: "",
    };

    setDraftMedications((current) => [...current, newMedication]);
    setDraftStatus("draft");
  }, []);

  const handleUpdateMedication = useCallback((updated: DraftMedication) => {
    setDraftMedications((current) =>
      current.map((medication) => (medication.id === updated.id ? updated : medication)),
    );
  }, []);

  const handleRemoveMedication = useCallback((id: string) => {
    setDraftMedications((current) => {
      const next = current.filter((medication) => medication.id !== id);
      if (!next.length) {
        setDraftStatus((status) => (status === "awaiting_approval" ? status : "idle"));
      }
      return next;
    });
  }, []);

  const handleSaveDraft = useCallback(() => {
    setDraftStatus("draft");
    toast({
      title: "Draf resep disimpan",
      description: "Anda dapat melanjutkan penyuntingan kapan saja.",
    });
    if (selectedSnapshot && draftMedications.length) {
      addDraft({
        patientName: selectedSnapshot.name,
        status: "draft",
        items: draftMedications.map((m) => ({
          id: m.id,
          name: m.name,
          code: m.sourceId,
          strength: m.strength,
          dose: m.dose,
          frequency: m.frequency,
          duration: m.duration,
        })),
      });
    }
  }, [toast, selectedSnapshot, draftMedications]);

  const handleSendForApproval = useCallback(() => {
    setDraftStatus("awaiting_approval");
    toast({
      title: "Dikirim untuk persetujuan",
      description: "Pasien akan diberi tahu setelah dokter menyetujui.",
    });
    if (selectedSnapshot && draftMedications.length) {
      addDraft({
        patientName: selectedSnapshot.name,
        status: "awaiting_approval",
        items: draftMedications.map((m) => ({
          id: m.id,
          name: m.name,
          code: m.sourceId,
          strength: m.strength,
          dose: m.dose,
          frequency: m.frequency,
          duration: m.duration,
        })),
      });
    }
  }, [toast, selectedSnapshot, draftMedications]);

  const handleCancelDraft = useCallback(() => {
    setIsDraftOpen(false);
  }, []);

  const bannerSeverity: RedFlagSeverity =
    selectedSnapshot?.riskLevel === "emergency" ? "danger" : "warning";

  const shouldShowBanner =
    isActive &&
    selectedSnapshot?.riskLevel === "emergency" &&
    !dismissedAlerts.includes(selectedId);

  const patientBanner = selectedSnapshot
    ? {
        key: selectedId,
        visible: shouldShowBanner,
        severity: bannerSeverity,
        title: "Prioritas Darurat",
        message:
          "AI menandai kombinasi gejala risiko tinggi. Ikuti protokol kegawatdaruratan sebelum melanjutkan konsultasi.",
        onDismiss: () =>
          setDismissedAlerts((current) =>
            current.includes(selectedId) ? current : [...current, selectedId],
          ),
      }
    : undefined;

  // Subscribe to consultation events (e.g., add medication opens Draft Prescription)
  useEffect(() => {
    const off = consultationBus.on("prescription:add", (payload) => {
      const match = MEDICATION_OPTIONS.find((m) => m.code === payload.code || m.name === payload.name);
      const option: MedicationOption =
        match ?? {
          id: payload.id,
          name: payload.name,
          code: payload.code,
          strengths: payload.strengths,
          defaultDose: payload.defaultDose,
          defaultFrequency: payload.defaultFrequency,
          defaultDuration: payload.defaultDuration,
          tags: [],
        };
      setIsDraftOpen(true);
      handleAddMedication(option);
    });
    return () => {
      off();
    };
  }, [handleAddMedication]);

  return (
    <motion.div
      layout
      className="flex flex-col gap-4"
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
    >
      <HeaderActions
        isActive={isActive}
        onToggle={handleToggleConsultation}
        onCreateDraft={handleCreateDraft}
        draftStatus={draftStatus}
      />
      <SplitPane
        left={
          <QueueList items={queue} selectedId={selectedId} onSelect={handleSelectQueueItem} />
        }
        center={
          <div className="flex h-full flex-col gap-4">
            <div className="rounded-card border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-primary shadow-sm">
              <span className="inline-flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4" />
                Konsultasi #{consultationId.slice(-6)}
              </span>
              <p className="mt-1 text-xs text-primary/80">
                Fokus pada eksplorasi gejala, catatan dokter, dan perintah AI dalam satu panel.
              </p>
              {selectedPatient ? (
                <p className="mt-1 text-xs text-primary/70">
                  Pasien aktif:{" "}
                  <span className="font-semibold text-primary">
                    {selectedPatient.name}
                  </span>{" "}
                  · {selectedPatient.reason}
                </p>
              ) : null}
            </div>
            <ConsultationTabs
              messages={messages}
              sessionActive={isActive}
              ordersSeed={orders.map((o) => ({ id: o.id, kind: "meds" as const, label: o.medication }))}
              snapshot={{
                cc: selectedPatient?.reason,
                hpi: selectedSnapshot?.diagnosis,
                redFlags: selectedSnapshot?.redFlags,
              }}
            />
          </div>
        }
        right={
          selectedSnapshot ? (
            <div className="flex h-full flex-col overflow-y-auto pr-1">
              <PatientSnapshot data={selectedSnapshot} banner={patientBanner} />
            </div>
          ) : null
        }
      />
      <MiniScheduler />
      {selectedSnapshot ? (
        <DraftPrescriptionSheet
          open={isDraftOpen}
          onOpenChange={setIsDraftOpen}
          patient={{
            name: selectedSnapshot.name,
            age: selectedSnapshot.age,
            weight: selectedSnapshot.weight,
            allergies: selectedSnapshot.allergies,
          }}
          medications={draftMedications}
          onAddMedication={handleAddMedication}
          onUpdateMedication={handleUpdateMedication}
          onRemoveMedication={handleRemoveMedication}
          status={draftStatus}
          onSaveDraft={handleSaveDraft}
          onSendForApproval={handleSendForApproval}
          onCancel={handleCancelDraft}
        />
      ) : null}
    </motion.div>
  );
}
