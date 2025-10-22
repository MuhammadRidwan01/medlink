"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlarmClock, BellRing, Clock10, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/layout/page-shell";
import { PillTimeline } from "@/components/features/pill-timeline/timeline";
import { ReminderSheet } from "@/components/features/pill-timeline/reminder-sheet";
import {
  buildTimelineSegments,
  computeAdherence,
  computeNextDose,
  selectPrescription,
  usePillTimelineStore,
} from "@/components/features/pill-timeline/store";
import { useToast } from "@/components/ui/use-toast";

type PrescriptionDetailPageProps = {
  params: {
    id: string;
  };
};

export default function PrescriptionDetailPage({ params }: PrescriptionDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const prescription = usePillTimelineStore(selectPrescription(params.id));
  const markCurrentDose = usePillTimelineStore((state) => state.markCurrentDose);
  const snoozeCurrentDose = usePillTimelineStore((state) => state.snoozeCurrentDose);
  const updateReminder = usePillTimelineStore((state) => state.updateReminder);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  const timelineSegments = useMemo(() => (prescription ? buildTimelineSegments(prescription) : []), [prescription]);
  const adherence = prescription ? computeAdherence(prescription) : 0;
  const nextDose = prescription ? computeNextDose(prescription) : null;
  const nextSegmentLabel = prescription && nextDose
    ? prescription.segments.find((segment) => segment.id === nextDose.segmentId)?.label ?? "Jadwal"
    : "Jadwal";

  if (!prescription) {
    return (
      <PageShell title="Resep tidak ditemukan" subtitle="Silakan kembali ke daftar resep.">
        <button
          type="button"
          onClick={() => router.push("/patient/prescriptions")}
          className="tap-target inline-flex items-center gap-2 rounded-button border border-border/60 bg-muted/40 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted/60"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
      </PageShell>
    );
  }

  const handleMarkTaken = () => {
    markCurrentDose(prescription.id);
    toast({
      title: "Dosis tercatat",
      description: "Adherence diperbarui. Teruskan konsistensi Anda!",
    });
  };

  const handleSnooze = () => {
    if (!nextDose) return;
    snoozeCurrentDose(prescription.id, 10);
    toast({
      title: "Pengingat diundur",
      description: "Dosis dipindahkan 10 menit ke depan.",
    });
  };

  const handleReminderSave = (time: string, offsetMinutes: number) => {
    updateReminder(prescription.id, { time, offsetMinutes });
    toast({
      title: "Pengingat disimpan",
      description: `Pengingat diatur pada ${time}${offsetMinutes ? ` (offset ${offsetMinutes}m)` : ""}.`,
    });
  };

  return (
    <PageShell
      title={prescription.name}
      subtitle="Pantau jadwal minum obat, tandai dosis, dan atur pengingat personal."
      className="space-y-6 pb-28 lg:pb-12"
    >
      <button
        type="button"
        onClick={() => router.push("/patient/prescriptions")}
        className="tap-target inline-flex items-center gap-2 rounded-button border border-border/60 bg-muted/30 px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted/50"
        aria-label="Kembali ke daftar resep"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="card-surface space-y-4 p-4">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Kepatuhan
              </p>
              <p className="text-2xl font-semibold text-foreground">{Math.round(adherence * 100)}%</p>
            </div>
            <span className="rounded-card border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
              {prescription.description}
            </span>
          </header>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Dosis berikutnya: <span className="font-semibold text-foreground">{nextSegmentLabel}</span> • {nextDose ? nextDose.time : "Tidak ada"}
            </p>
            <p>
              Pengingat aktif: <span className="font-semibold text-foreground">{prescription.reminder.time}</span>
              {prescription.reminder.offsetMinutes
                ? ` (offset ${prescription.reminder.offsetMinutes}m)`
                : null}
            </p>
          </div>
        </div>

        <div className="card-surface space-y-3 p-4">
          <h3 className="text-sm font-semibold text-foreground">Aksi cepat</h3>
          <div className="flex flex-col gap-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleMarkTaken}
              className="tap-target inline-flex items-center justify-center gap-2 rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:shadow-lg"
            >
              <CheckCircle2 className="h-4 w-4" />
              Tandai sudah diminum
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSnooze}
              className="tap-target inline-flex items-center justify-center gap-2 rounded-button border border-warning/40 bg-warning/10 px-4 py-2 text-sm font-semibold text-warning transition hover:border-warning/60"
            >
              <Clock10 className="h-4 w-4" />
              Tunda 10 menit
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsReminderOpen(true)}
              className="tap-target inline-flex items-center justify-center gap-2 rounded-button border border-border/60 bg-muted/30 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted/50"
            >
              <BellRing className="h-4 w-4" />
              Buka pengingat
            </motion.button>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-foreground">Timeline dosis</h2>
        <PillTimeline
          segments={timelineSegments}
          nextDoseId={nextDose?.id ?? null}
          onDoseSelect={() => setIsReminderOpen(true)}
        />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 bg-background/95 backdrop-blur-md px-4 py-4 shadow-xl lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleMarkTaken}
            className="tap-target flex-1 rounded-button bg-primary-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:shadow-lg"
          >
            Tandai diminum
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSnooze}
            className="tap-target flex-1 rounded-button border border-warning/40 bg-warning/10 px-4 py-3 text-sm font-semibold text-warning transition"
          >
            Tunda 10m
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsReminderOpen(true)}
            className="tap-target rounded-button border border-border/60 bg-muted/30 p-3 text-muted-foreground transition hover:bg-muted/50"
            aria-label="Buka pengingat"
          >
            <AlarmClock className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      <ReminderSheet
        open={isReminderOpen}
        onOpenChange={setIsReminderOpen}
        onSave={handleReminderSave}
        anchorLabel={prescription.name}
        initialTime={prescription.reminder.time}
        initialOffset={prescription.reminder.offsetMinutes}
      />
    </PageShell>
  );
}
