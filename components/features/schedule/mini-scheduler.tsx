"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { consultationBus } from "@/components/features/consultation/event-bus";
import { DateTimePicker } from "./date-time-picker";
import { ConfirmationCard } from "./confirmation-card";
import { bookAppointment } from "./store";
import { PatientPicker, type PatientLite } from "@/components/features/patients/patient-picker";

type Prefill = { consultId: string; patientName?: string; date?: string } | null;

export function MiniScheduler() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<Prefill>(null);
  const [step, setStep] = useState<"pick" | "confirm" | "done">("pick");
  const [selection, setSelection] = useState<{ date: string; time: string }>({ date: new Date().toISOString().slice(0, 10), time: "09:00" });
  const [patient, setPatient] = useState<PatientLite | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const off = consultationBus.on("followup:suggest", (p) => {
      setPrefill(p);
      if (p.date) setSelection((s) => ({ ...s, date: p.date! }));
      setOpen(true);
      setStep("pick");
    });
    return off;
  }, []);

  const onConfirm = useCallback(async () => {
    if (!patient?.id) {
      toast({ title: "Pilih pasien", description: "Pasien wajib dipilih", variant: "destructive" as any });
      return;
    }
    setSaving(true);
    try {
      const starts_at = new Date(`${selection.date}T${selection.time}:00`);
      const ends_at = new Date(starts_at.getTime() + 30 * 60 * 1000);
      const res = await fetch("/api/clinical/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, starts_at: starts_at.toISOString(), ends_at: ends_at.toISOString(), reason: "Follow-up" }),
      });
      if (!res.ok) throw new Error("Gagal membuat janji");
      // Local optimistic add (optional, keep for instant feedback)
      bookAppointment({ consultId: prefill?.consultId, patient: patient.name ?? patient.email ?? "Patient", date: selection.date, time: selection.time, reason: "Follow-up" });
      toast({ title: "Follow-up dijadwalkan", description: `${selection.date} • ${selection.time}` });
      setStep("confirm");
    } catch (e) {
      toast({ title: "Gagal", description: (e as Error).message, variant: "destructive" as any });
    } finally {
      setSaving(false);
    }
  }, [patient, prefill, selection, toast]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div className="fixed inset-0 z-[70] bg-background/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={() => setOpen(false)} />
          <motion.aside className="fixed inset-0 z-[71] grid place-items-center px-4" role="dialog" aria-modal="true" aria-label="Mini scheduler" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }}>
            <div className="w-full max-w-lg space-y-4 rounded-card border border-border/60 bg-card p-4 shadow-xl">
              {step === "pick" ? (
                <>
                  <h3 className="text-sm font-semibold text-foreground">Jadwalkan Follow-up</h3>
                  <PatientPicker label="Pilih pasien" value={patient} onChange={setPatient} />
                  <DateTimePicker value={selection} onChange={setSelection} />
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => setOpen(false)} className="tap-target rounded-button border border-border/60 bg-muted/30 px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/50">Batal</button>
                    <button type="button" disabled={saving} onClick={onConfirm} className="tap-target rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-60">{saving ? "Menyimpan…" : "Konfirmasi"}</button>
                  </div>
                </>
              ) : null}
              {step === "confirm" ? (
                <>
                  <ConfirmationCard patient={prefill?.patientName ?? "Patient"} date={selection.date} time={selection.time} onAddReminder={() => setStep("done")} />
                </>
              ) : null}
              {step === "done" ? (
                <div className="text-center text-sm text-muted-foreground">Selesai. Anda dapat menutup jendela ini.</div>
              ) : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
