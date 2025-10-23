"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileStore, type Allergy, type AllergySeverity } from "./store";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "@/components/ui/use-toast";

type AllergiesCardProps = {
  loading?: boolean;
};

const severityLabel: Record<AllergySeverity, string> = {
  mild: "Ringan",
  moderate: "Sedang",
  severe: "Berat",
};

const severityClass: Record<AllergySeverity, string> = {
  mild: "border border-warning/20 bg-warning/10 text-warning",
  moderate: "border border-danger/20 bg-danger/10 text-danger",
  severe: "border border-danger/40 bg-danger text-white",
};

export function AllergiesCard({ loading }: AllergiesCardProps) {
  const allergies = useProfileStore((state) => state.allergies);
  const updateAllergy = useProfileStore((state) => state.updateAllergy);
  const addAllergy = useProfileStore((state) => state.addAllergy);
  const removeAllergy = useProfileStore((state) => state.removeAllergy);
  const storeLoading = useProfileStore((state) => state.loading);
  const storeError = useProfileStore((state) => state.error);
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Allergy | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isEditingExisting = useMemo(
    () => Boolean(editingId && allergies.some((item) => item.id === editingId)),
    [editingId, allergies],
  );

  const displayAllergies = useMemo(() => {
    if (editingId && !isEditingExisting && draft) {
      return [...allergies, draft];
    }
    return allergies;
  }, [allergies, draft, editingId, isEditingExisting]);

  const handleStartEdit = (allergy: Allergy) => {
    setEditingId(allergy.id);
    setDraft({ ...allergy });
  };

  const handleAdd = () => {
    const id = crypto.randomUUID?.() ?? `allergy-${Date.now()}`;
    setEditingId(id);
    setDraft({
      id,
      substance: "",
      reaction: "",
      severity: "mild",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setDraft(null);
  };

  const handleSave = async () => {
    if (!draft || isSaving) return;
    if (!draft.substance.trim()) {
      toast({
        title: "Data belum lengkap",
        description: "Substansi alergi wajib diisi.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload: Allergy = {
        id: draft.id,
        substance: draft.substance.trim(),
        reaction: draft.reaction.trim(),
        severity: draft.severity,
      };
      if (isEditingExisting) {
        await updateAllergy(payload);
      } else {
        await addAllergy(payload);
      }
      toast({
        title: "Alergi tersimpan",
        description: "Perubahan alergi telah disinkronkan.",
      });
      setEditingId(null);
      setDraft(null);
    } catch (error) {
      console.error("[allergies] save failed", error);
      toast({
        title: "Gagal menyimpan alergi",
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan alergi.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const mutationPending = storeLoading || isSaving || isDeleting;

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
      aria-labelledby="allergies-title"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="allergies-title" className="text-sm font-semibold text-foreground">
          Riwayat alergi
        </h2>
        <button
          type="button"
          onClick={handleAdd}
          disabled={mutationPending}
          className="interactive tap-target inline-flex items-center gap-2 rounded-button border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah alergi
        </button>
      </header>
      {storeError ? (
        <p className="mt-3 rounded-card border border-danger/20 bg-danger/10 px-3 py-2 text-xs text-danger">
          {storeError}
        </p>
      ) : null}
      <ul className="mt-4 space-y-3" role="list" aria-label="Daftar alergi">
        <AnimatePresence initial={false}>
          {displayAllergies.map((allergy) => {
            const isEditing = editingId === allergy.id;
            return (
              <motion.li
                key={allergy.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                role="listitem"
                aria-label={`Alergi ${allergy.substance || "baru"}`}
                className="rounded-card border border-border/60 bg-muted/20 p-4 shadow-sm"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="font-semibold text-muted-foreground">Substansi</span>
                        <input
                          type="text"
                          value={draft?.substance ?? ""}
                          onChange={(event) =>
                            setDraft((prev) =>
                              prev ? { ...prev, substance: event.target.value } : prev,
                            )
                          }
                          className="tap-target w-full rounded-card border border-border/60 bg-card px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder="Contoh: Penisilin"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="font-semibold text-muted-foreground">Reaksi</span>
                        <input
                          type="text"
                          value={draft?.reaction ?? ""}
                          onChange={(event) =>
                            setDraft((prev) =>
                              prev ? { ...prev, reaction: event.target.value } : prev,
                            )
                          }
                          className="tap-target w-full rounded-card border border-border/60 bg-card px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder="Ruam kulit, anafilaksis..."
                        />
                      </label>
                    </div>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold text-muted-foreground">Tingkat keparahan</span>
                      <div className="flex flex-wrap gap-2">
                        {(["mild", "moderate", "severe"] as AllergySeverity[]).map((severity) => (
                          <button
                            key={severity}
                            type="button"
                            onClick={() =>
                              setDraft((prev) =>
                                prev ? { ...prev, severity } : prev,
                              )
                            }
                            aria-pressed={draft?.severity === severity}
                            className={cn(
                              "tap-target inline-flex items-center gap-2 rounded-button border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              draft?.severity === severity
                                ? severityClass[severity]
                                : "border-border/60 bg-muted/20 text-muted-foreground",
                            )}
                          >
                            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                            {severityLabel[severity]}
                          </button>
                        ))}
                      </div>
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
                        <p className="text-sm font-semibold text-foreground">{allergy.substance}</p>
                        <p className="text-xs text-muted-foreground">{allergy.reaction}</p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-badge px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                          severityClass[allergy.severity],
                        )}
                      >
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                        {severityLabel[allergy.severity]}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(allergy)}
                        className="tap-target inline-flex items-center gap-2 rounded-button border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(allergy.id)}
                        disabled={mutationPending}
                        className="tap-target inline-flex items-center gap-2 rounded-button border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <ConfirmDialog
        open={Boolean(confirmId)}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Hapus alergi?"
        description="Data alergi ini akan dihapus dari snapshot Anda dan tidak lagi digunakan untuk pengecekan interaksi."
        onConfirm={async () => {
          if (confirmId) {
            setIsDeleting(true);
            try {
              await removeAllergy(confirmId);
              toast({
                title: "Alergi dihapus",
                description: "Data alergi berhasil dihapus.",
              });
            } catch (error) {
              console.error("[allergies] delete failed", error);
              toast({
                title: "Gagal menghapus alergi",
                description:
                  error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus alergi.",
                variant: "destructive",
              });
            } finally {
              setConfirmId(null);
              setIsDeleting(false);
            }
          }
        }}
      />
    </section>
  );
}
