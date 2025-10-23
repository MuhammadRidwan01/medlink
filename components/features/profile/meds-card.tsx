"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pill, StopCircle, Pencil, Plus } from "lucide-react";
import { useProfileStore, type Medication } from "./store";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "@/components/ui/use-toast";

type MedsCardProps = {
  loading?: boolean;
};

export function MedsCard({ loading }: MedsCardProps) {
  const medications = useProfileStore((state) => state.medications);
  const updateMedication = useProfileStore((state) => state.updateMedication);
  const addMedication = useProfileStore((state) => state.addMedication);
  const stopMedication = useProfileStore((state) => state.stopMedication);
  const storeLoading = useProfileStore((state) => state.loading);
  const storeError = useProfileStore((state) => state.error);
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Medication | null>(null);
  const [confirmStopId, setConfirmStopId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const activeMeds = useMemo(
    () => medications.filter((med) => med.status === "active"),
    [medications],
  );
  const stoppedMeds = useMemo(
    () => medications.filter((med) => med.status === "stopped"),
    [medications],
  );

  const isEditingExisting = useMemo(
    () => Boolean(editingId && medications.some((item) => item.id === editingId)),
    [editingId, medications],
  );

  const displayActiveMeds = useMemo(() => {
    if (editingId && !isEditingExisting && draft) {
      return [...activeMeds, draft];
    }
    return activeMeds;
  }, [activeMeds, draft, editingId, isEditingExisting]);

  const handleStartEdit = (med: Medication) => {
    setEditingId(med.id);
    setDraft({ ...med });
  };

  const handleAdd = () => {
    const id = crypto.randomUUID?.() ?? `med-${Date.now()}`;
    setEditingId(id);
    setDraft({
      id,
      name: "",
      strength: "",
      frequency: "",
      status: "active",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setDraft(null);
  };

  const handleSave = async () => {
    if (!draft || isSaving) return;

    if (!draft.name.trim()) {
      toast({
        title: "Data belum lengkap",
        description: "Nama obat wajib diisi.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload: Medication = {
        id: draft.id,
        name: draft.name.trim(),
        strength: draft.strength.trim(),
        frequency: draft.frequency.trim(),
        status: draft.status,
      };

      if (isEditingExisting) {
        await updateMedication(payload);
      } else {
        await addMedication(payload);
      }
      toast({
        title: "Obat tersimpan",
        description: "Perubahan obat berhasil disinkronkan.",
      });
      setEditingId(null);
      setDraft(null);
    } catch (error) {
      console.error("[meds] save failed", error);
      toast({
        title: "Gagal menyimpan obat",
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan obat.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const mutationPending = storeLoading || isSaving || isStopping;

  if (loading) {
    return (
      <section className="rounded-card border border-border/60 bg-card p-5 shadow-sm">
        <div className="h-4 w-36 animate-pulse rounded bg-muted/50" />
        <div className="mt-4 space-y-3">
          <div className="h-16 w-full animate-pulse rounded bg-muted/30" />
          <div className="h-16 w-full animate-pulse rounded bg-muted/30" />
        </div>
      </section>
    );
  }

  return (
    <section
      className="rounded-card border border-border/60 bg-card p-5 shadow-sm"
      aria-labelledby="meds-title"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="meds-title" className="text-sm font-semibold text-foreground">
          Obat yang sedang dikonsumsi
        </h2>
        <button
          type="button"
          onClick={handleAdd}
          disabled={mutationPending}
          className="interactive tap-target inline-flex items-center gap-2 rounded-button border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah obat
        </button>
      </header>
      {storeError ? (
        <p className="mt-3 rounded-card border border-danger/20 bg-danger/10 px-3 py-2 text-xs text-danger">
          {storeError}
        </p>
      ) : null}
      <div className="mt-4 space-y-4">
        <ul className="space-y-3" role="list" aria-label="Obat aktif">
          <AnimatePresence initial={false}>
            {displayActiveMeds.map((med) => {
              const isEditing = editingId === med.id;
              return (
                <motion.li
                  key={med.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                  role="listitem"
                  aria-label={`Obat ${med.name || "baru"}`}
                  className="rounded-card border border-border/60 bg-muted/20 p-4 shadow-sm"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="flex flex-col gap-1 text-sm">
                          <span className="font-semibold text-muted-foreground">Nama obat</span>
                          <input
                            type="text"
                            value={draft?.name ?? ""}
                            onChange={(event) =>
                              setDraft((prev) =>
                                prev ? { ...prev, name: event.target.value } : prev,
                              )
                            }
                            className="tap-target w-full rounded-card border border-border/60 bg-card px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Metformin"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                          <span className="font-semibold text-muted-foreground">Kekuatan</span>
                          <input
                            type="text"
                            value={draft?.strength ?? ""}
                            onChange={(event) =>
                              setDraft((prev) =>
                                prev ? { ...prev, strength: event.target.value } : prev,
                              )
                            }
                            className="tap-target w-full rounded-card border border-border/60 bg-card px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="850 mg"
                          />
                        </label>
                      </div>
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="font-semibold text-muted-foreground">Frekuensi</span>
                        <input
                          type="text"
                          value={draft?.frequency ?? ""}
                          onChange={(event) =>
                            setDraft((prev) =>
                              prev ? { ...prev, frequency: event.target.value } : prev,
                            )
                          }
                          className="tap-target w-full rounded-card border border-border/60 bg-card px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder="1x pagi sebelum makan"
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={mutationPending}
                          className="interactive tap-target inline-flex items-center justify-center rounded-button bg-primary-gradient px-4 py-2 text-xs font-semibold text-white shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
                        >
                          {isSaving ? "Menyimpan..." : "Simpan"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={mutationPending}
                          className="tap-target inline-flex items-center justify-center rounded-button border border-border/60 bg-muted/30 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{med.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {med.strength} · {med.frequency}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-badge border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                          <Pill className="h-3.5 w-3.5" aria-hidden="true" />
                          Aktif
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(med)}
                          className="tap-target inline-flex items-center gap-2 rounded-button border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmStopId(med.id)}
                          disabled={mutationPending}
                          className="tap-target inline-flex items-center gap-2 rounded-button border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
                        >
                          <StopCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Hentikan
                        </button>
                      </div>
                    </div>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        {stoppedMeds.length ? (
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Riwayat obat dihentikan
            </div>
            <ul className="space-y-2" role="list" aria-label="Obat dihentikan">
              {stoppedMeds.map((med) => (
                <li
                  key={med.id}
                  role="listitem"
                  className="rounded-card border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground"
                >
                  <span className="font-semibold text-foreground">{med.name}</span> · {med.frequency}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(confirmStopId)}
        onOpenChange={(open) => !open && setConfirmStopId(null)}
        title="Hentikan obat?"
        description="Obat tidak lagi digunakan dalam pengecekan interaksi. Anda dapat menambahkannya kembali nanti."
        confirmLabel="Hentikan"
        onConfirm={async () => {
          if (confirmStopId) {
            setIsStopping(true);
            try {
              await stopMedication(confirmStopId);
              toast({
                title: "Obat dihentikan",
                description: "Obat dipindahkan ke riwayat.",
              });
            } catch (error) {
              console.error("[meds] stop failed", error);
              toast({
                title: "Gagal menghentikan obat",
                description:
                  error instanceof Error ? error.message : "Terjadi kesalahan saat menghentikan obat.",
                variant: "destructive",
              });
            } finally {
              setConfirmStopId(null);
              setIsStopping(false);
            }
          }
        }}
      />
    </section>
  );
}
