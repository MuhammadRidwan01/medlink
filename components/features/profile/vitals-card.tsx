"use client";

import { useEffect, useMemo, useState } from "react";
import { useProfileStore } from "./store";
import { AnimatePresence, motion } from "framer-motion";
import { Scale, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

type Unit = "metric" | "imperial";

type VitalsCardProps = {
  initialHeightCm: number;
  initialWeightKg: number;
  loading?: boolean;
};

export function VitalsCard({ initialHeightCm, initialWeightKg, loading }: VitalsCardProps) {
  const [unit, setUnit] = useState<Unit>("metric");
  const [isEditing, setIsEditing] = useState(false);
  const [heightCm, setHeightCm] = useState(initialHeightCm);
  const [weightKg, setWeightKg] = useState(initialWeightKg);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const storeLoading = useProfileStore((s) => s.loading);

  useEffect(() => {
    setHeightCm(initialHeightCm);
    setWeightKg(initialWeightKg);
  }, [initialHeightCm, initialWeightKg]);

  const bmi = useMemo(() => {
    if (!heightCm || !weightKg) return "—";
    const bmiValue = weightKg / (Math.pow(heightCm / 100, 2) || 1);
    return bmiValue ? bmiValue.toFixed(1) : "—";
  }, [heightCm, weightKg]);

  const displayHeight =
    unit === "metric" ? `${heightCm} cm` : `${(heightCm / 2.54).toFixed(1)} in`;
  const displayWeight =
    unit === "metric" ? `${weightKg} kg` : `${(weightKg * 2.20462).toFixed(1)} lb`;

  if (loading || storeLoading) {
    return (
      <section className="patient-panel px-6 py-6">
        <div className="h-4 w-32 animate-pulse rounded bg-muted/50" />
        <div className="mt-4 space-y-3">
          <div className="h-3 w-full animate-pulse rounded bg-muted/40" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted/40" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted/40" />
        </div>
      </section>
    );
  }

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="patient-panel px-6 py-6"
      aria-label="Data vital"
    >
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Tanda vital</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button
            type="button"
            className={cn(
              "tap-target rounded-button border px-2.5 py-1 font-semibold transition shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              unit === "metric"
                ? "border-primary/30 bg-primary/12 text-primary"
                : "border-white/50 bg-white/60 text-muted-foreground/80 dark:border-slate-700/40 dark:bg-slate-900/60",
            )}
            onClick={() => setUnit("metric")}
            aria-pressed={unit === "metric"}
          >
            Metric
          </button>
          <button
            type="button"
            className={cn(
              "tap-target rounded-button border px-2.5 py-1 font-semibold transition shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              unit === "imperial"
                ? "border-primary/30 bg-primary/12 text-primary"
                : "border-white/50 bg-white/60 text-muted-foreground/80 dark:border-slate-700/40 dark:bg-slate-900/60",
            )}
            onClick={() => setUnit("imperial")}
            aria-pressed={unit === "imperial"}
          >
            Imperial
          </button>
        </div>
      </header>

      <AnimatePresence initial={false} mode="wait">
        {isEditing ? (
          <motion.form
            key="edit"
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="mt-4 space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                await updateProfile({ heightCm, weightKg });
              } finally {
                setIsEditing(false);
              }
            }}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-muted-foreground">Tinggi (cm)</span>
                <div className="flex items-center gap-2 rounded-[14px] border border-white/60 bg-white/75 px-3 py-2 shadow-sm dark:border-slate-700/40 dark:bg-slate-900/60">
                  <Ruler className="h-4 w-4 text-primary" aria-hidden="true" />
                  <input
                    type="number"
                    className="w-full bg-transparent text-sm outline-none"
                    value={heightCm}
                    min={50}
                    max={230}
                    step={0.5}
                    onChange={(event) => setHeightCm(Number.parseFloat(event.target.value))}
                  />
                </div>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-muted-foreground">Berat (kg)</span>
                <div className="flex items-center gap-2 rounded-[14px] border border-white/60 bg-white/75 px-3 py-2 shadow-sm dark:border-slate-700/40 dark:bg-slate-900/60">
                  <Scale className="h-4 w-4 text-primary" aria-hidden="true" />
                  <input
                    type="number"
                    className="w-full bg-transparent text-sm outline-none"
                    value={weightKg}
                    min={30}
                    max={200}
                    step={0.5}
                    onChange={(event) => setWeightKg(Number.parseFloat(event.target.value))}
                  />
                </div>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="interactive tap-target inline-flex items-center justify-center rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="tap-target inline-flex items-center justify-center rounded-button border border-border/60 bg-muted/30 px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Batal
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="display"
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="mt-4 space-y-2 text-sm text-muted-foreground"
          >
            <div className="flex items-center justify-between gap-2">
              <span>Tinggi</span>
              <span className="font-semibold text-foreground">{displayHeight}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Berat</span>
              <span className="font-semibold text-foreground">{displayWeight}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Indeks massa tubuh</span>
              <span className="font-semibold text-foreground">{bmi}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="interactive tap-target mt-3 inline-flex items-center justify-center rounded-button border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Ubah tinggi & berat
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

