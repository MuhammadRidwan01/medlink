"use client";

import { motion } from "framer-motion";
import { Edit3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const frequencyPresets = ["1x sehari", "2x sehari", "3x sehari", "Sesaat diperlukan"];
const durationPresets = ["3 hari", "5 hari", "7 hari", "14 hari"];

export type DraftMedication = {
  id: string;
  sourceId: string;
  name: string;
  availableStrengths: string[];
  strength: string;
  dose: string;
  frequency: string;
  frequencyIsCustom: boolean;
  duration: string;
  durationIsCustom: boolean;
  notes: string;
};

type MedicationCardProps = {
  medication: DraftMedication;
  onChange: (medication: DraftMedication) => void;
  onRemove: (id: string) => void;
};

export function MedicationCard({ medication, onChange, onRemove }: MedicationCardProps) {
  const handleUpdate = (partial: Partial<DraftMedication>) => {
    onChange({ ...medication, ...partial });
  };

  const toggleCustomFrequency = () => {
    handleUpdate({
      frequencyIsCustom: !medication.frequencyIsCustom,
      frequency: medication.frequencyIsCustom ? frequencyPresets[0] : "",
    });
  };

  const toggleCustomDuration = () => {
    handleUpdate({
      durationIsCustom: !medication.durationIsCustom,
      duration: medication.durationIsCustom ? durationPresets[0] : "",
    });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="card-surface space-y-4 border border-border/60 p-4 shadow-md"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{medication.name}</h4>
          <p className="text-xs text-muted-foreground">Atur dosis dan instruksi</p>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => onRemove(medication.id)}
          className="tap-target inline-flex items-center gap-2 rounded-button border border-danger/30 bg-danger/10 px-2.5 py-1.5 text-xs font-semibold text-danger transition-all duration-fast ease-out hover:border-danger/40 hover:bg-danger/20"
          aria-label={`Hapus ${medication.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Hapus
        </motion.button>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Dosis
          </span>
          <input
            value={medication.dose}
            onChange={(event) => handleUpdate({ dose: event.target.value })}
            className="tap-target w-full rounded-input border border-border/70 bg-background px-3 py-2 text-sm shadow-sm transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Mis. 1 tablet"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kekuatan
          </span>
          <div className="relative">
            <select
              value={medication.strength}
              onChange={(event) => handleUpdate({ strength: event.target.value })}
              className="tap-target w-full appearance-none rounded-input border border-border/70 bg-background px-3 py-2 text-sm shadow-sm transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
            >
              {medication.availableStrengths.map((strength) => (
                <option key={strength} value={strength}>
                  {strength}
                </option>
              ))}
            </select>
            <Edit3 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          </div>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Frekuensi
            <button
              type="button"
              className="text-primary underline-offset-4 transition hover:underline"
              onClick={toggleCustomFrequency}
            >
              {medication.frequencyIsCustom ? "Gunakan preset" : "Kustom"}
            </button>
          </div>
          {medication.frequencyIsCustom ? (
            <input
              value={medication.frequency}
              onChange={(event) => handleUpdate({ frequency: event.target.value })}
              className="tap-target mt-2 w-full rounded-input border border-border/70 bg-background px-3 py-2 text-sm shadow-sm transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Mis. setiap 8 jam"
            />
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {frequencyPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleUpdate({ frequency: preset })}
                  className={cn(
                    "tap-target rounded-button border px-3 py-1.5 text-xs font-semibold transition-all duration-fast ease-out active:scale-[0.98]",
                    medication.frequency === preset
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/70 bg-background text-muted-foreground hover:border-primary/30",
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Durasi
            <button
              type="button"
              className="text-primary underline-offset-4 transition hover:underline"
              onClick={toggleCustomDuration}
            >
              {medication.durationIsCustom ? "Gunakan preset" : "Kustom"}
            </button>
          </div>
          {medication.durationIsCustom ? (
            <input
              value={medication.duration}
              onChange={(event) => handleUpdate({ duration: event.target.value })}
              className="tap-target mt-2 w-full rounded-input border border-border/70 bg-background px-3 py-2 text-sm shadow-sm transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Mis. 10 hari"
            />
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {durationPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleUpdate({ duration: preset })}
                  className={cn(
                    "tap-target rounded-button border px-3 py-1.5 text-xs font-semibold transition-all duration-fast ease-out active:scale-[0.98]",
                    medication.duration === preset
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/70 bg-background text-muted-foreground hover:border-primary/30",
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Catatan tambahan
        </span>
        <textarea
          value={medication.notes}
          onChange={(event) => handleUpdate({ notes: event.target.value })}
          className="tap-target min-h-[80px] w-full rounded-card border border-border/70 bg-background px-3 py-2 text-sm leading-relaxed shadow-sm transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Instruksi khusus untuk pasien."
        />
      </label>
    </motion.article>
  );
}
