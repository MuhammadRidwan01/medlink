"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { CalendarDays, Pill, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InteractionWarning,
  type InteractionSeverity,
} from "./interaction-warning";
import {
  MedicationSearch,
  type MedicationOption,
} from "./medication-search";
import { MedicationCard, type DraftMedication } from "./medication-card";

type PatientSummary = {
  name: string;
  age: number;
  weight: string;
  allergies: string[];
};

type DraftStatus = "idle" | "draft" | "awaiting_approval";

type DraftPrescriptionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: PatientSummary;
  medications: DraftMedication[];
  onAddMedication: (option: MedicationOption) => void;
  onUpdateMedication: (medication: DraftMedication) => void;
  onRemoveMedication: (id: string) => void;
  status: DraftStatus;
  onSaveDraft: () => void;
  onSendForApproval: () => void;
  onCancel: () => void;
};

type InteractionRule = {
  id: string;
  combination: string[];
  severity: InteractionSeverity;
  title: string;
  message: string;
  recommendation: string;
};

const INTERACTION_RULES: InteractionRule[] = [
  {
    id: "atorvastatin-clarithromycin",
    combination: ["atorvastatin", "clarithromycin"],
    severity: "moderate",
    title: "Interaksi metabolisme hati",
    message: "Atorvastatin dengan klaritromisin meningkatkan risiko miopati.",
    recommendation: "Pantau enzim hati dan pertimbangkan penyesuaian dosis.",
  },
  {
    id: "salbutamol-propranolol",
    combination: ["salbutamol", "propranolol"],
    severity: "moderate",
    title: "Penghambatan bronkodilator",
    message: "Propranolol dapat mengurangi efek bronkodilatasi salbutamol.",
    recommendation: "Pertimbangkan beta-blocker selektif atau pantau gejala pasien.",
  },
];

export function DraftPrescriptionSheet({
  open,
  onOpenChange,
  patient,
  medications,
  onAddMedication,
  onUpdateMedication,
  onRemoveMedication,
  status,
  onSaveDraft,
  onSendForApproval,
  onCancel,
}: DraftPrescriptionSheetProps) {
  const interactionWarnings = useMemo(() => {
    const codes = medications.map((med) => med.sourceId);
    return INTERACTION_RULES.filter((rule) =>
      rule.combination.every((code) => codes.includes(code)),
    );
  }, [medications]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="draft-backdrop"
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
          <motion.aside
            key="draft-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Draf resep"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] border-l border-border/60 bg-background shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex h-full flex-col">
              <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-background px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Draf Resep
                  </p>
                  <h2 className="text-lg font-semibold text-foreground">
                    {patient.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onCancel();
                    onOpenChange(false);
                  }}
                  className="tap-target rounded-full border border-border/60 bg-muted/40 p-2 transition hover:bg-muted/60"
                  aria-label="Tutup draf resep"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </header>

              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5 pb-32">
                <section className="rounded-card border border-border/60 bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {patient.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {patient.age} th • {patient.weight}
                      </p>
                    </div>
                    <div className={cn(
                      "rounded-badge px-3 py-1 text-tiny font-semibold uppercase tracking-wide",
                      status === "awaiting_approval"
                        ? "bg-warning/10 text-warning border border-warning/40"
                        : "bg-primary/10 text-primary border border-primary/30",
                    )}>
                      {status === "awaiting_approval"
                        ? "Menunggu persetujuan"
                        : "Draf aktif"}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-card border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                      Tanggal {new Date().toLocaleDateString("id-ID")}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-card border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                      <Pill className="h-4 w-4 text-primary" aria-hidden="true" />
                      {medications.length} obat dipilih
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Alergi
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.length ? (
                        patient.allergies.map((allergy) => (
                          <span
                            key={allergy}
                            className="rounded-badge border border-warning/30 bg-warning/10 px-3 py-1 text-tiny font-semibold uppercase tracking-wide text-warning"
                          >
                            {allergy}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-badge border border-border/60 bg-muted/30 px-3 py-1 text-tiny text-muted-foreground">
                          Tidak ada alergi
                        </span>
                      )}
                    </div>
                  </div>
                </section>

                <MedicationSearch
                  onSelect={onAddMedication}
                  disabledCodes={medications.map((med) => med.sourceId)}
                />

                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Obat terpilih</h3>
                    <p className="text-xs text-muted-foreground">
                      Sesuaikan dosis dan catatan untuk tiap obat.
                    </p>
                  </div>
                  <AnimatePresence initial={false}>
                    {medications.length ? (
                      medications.map((medication) => (
                        <MedicationCard
                          key={medication.id}
                          medication={medication}
                          onChange={onUpdateMedication}
                          onRemove={onRemoveMedication}
                        />
                      ))
                    ) : (
                      <motion.div
                        key="empty-medications"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="rounded-card border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground"
                      >
                        Belum ada obat yang ditambahkan.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

                {interactionWarnings.length ? (
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Potensi interaksi obat
                    </h3>
                    <div className="space-y-3">
                      {interactionWarnings.map((warning) => (
                        <InteractionWarning
                          key={warning.id}
                          severity={warning.severity}
                          title={warning.title}
                          message={warning.message}
                          recommendation={warning.recommendation}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="rounded-card border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
                  Data pasien dan riwayat interaksi akan disinkronkan otomatis setelah backend siap. Untuk saat ini, semua perubahan disimpan secara lokal.
                </section>
              </div>

              <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onCancel();
                      onOpenChange(false);
                    }}
                    className="tap-target inline-flex items-center justify-center gap-2 rounded-button border border-border/70 bg-muted/40 px-4 py-2 text-sm font-semibold text-muted-foreground transition-all duration-fast ease-out hover:border-border/50 hover:bg-muted/60"
                  >
                    Batal
                  </motion.button>
                  <div className="flex flex-wrap items-center gap-2">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={onSaveDraft}
                      className="tap-target inline-flex items-center justify-center gap-2 rounded-button border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all duration-fast ease-out hover:border-primary/40 hover:bg-primary/20"
                    >
                      Simpan Draf
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={onSendForApproval}
                      disabled={!medications.length}
                      className={cn(
                        "tap-target inline-flex items-center justify-center gap-2 rounded-button bg-primary-gradient px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-fast ease-out hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60",
                      )}
                    >
                      Kirim untuk Persetujuan
                    </motion.button>
                  </div>
                </div>
              </footer>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export type { DraftMedication, DraftStatus, MedicationOption };
