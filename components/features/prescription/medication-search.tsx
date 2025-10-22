"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type MedicationOption = {
  id: string;
  name: string;
  code: string;
  strengths: string[];
  defaultDose: string;
  defaultFrequency: string;
  defaultDuration: string;
  tags: string[];
};

export const MEDICATION_OPTIONS: MedicationOption[] = [
  {
    id: "med-1",
    name: "Atorvastatin",
    code: "atorvastatin",
    strengths: ["10 mg", "20 mg", "40 mg"],
    defaultDose: "1 tablet",
    defaultFrequency: "1x sehari",
    defaultDuration: "14 hari",
    tags: ["Kolesterol", "Statin"],
  },
  {
    id: "med-2",
    name: "Clarithromycin",
    code: "clarithromycin",
    strengths: ["250 mg", "500 mg"],
    defaultDose: "1 tablet",
    defaultFrequency: "2x sehari",
    defaultDuration: "7 hari",
    tags: ["Antibiotik", "Makrolida"],
  },
  {
    id: "med-3",
    name: "Salbutamol Inhaler",
    code: "salbutamol",
    strengths: ["100 mcg"],
    defaultDose: "2 puff",
    defaultFrequency: "Sesaat diperlukan",
    defaultDuration: "14 hari",
    tags: ["Asma", "Bronkodilator"],
  },
  {
    id: "med-4",
    name: "Propranolol",
    code: "propranolol",
    strengths: ["10 mg", "40 mg"],
    defaultDose: "1 tablet",
    defaultFrequency: "2x sehari",
    defaultDuration: "14 hari",
    tags: ["Beta blocker", "Hipertensi"],
  },
  {
    id: "med-5",
    name: "Paracetamol",
    code: "paracetamol",
    strengths: ["500 mg", "650 mg"],
    defaultDose: "1 tablet",
    defaultFrequency: "3x sehari",
    defaultDuration: "5 hari",
    tags: ["Analgesik", "Antipiretik"],
  },
  {
    id: "med-6",
    name: "Azithromycin",
    code: "azithromycin",
    strengths: ["250 mg", "500 mg"],
    defaultDose: "1 tablet",
    defaultFrequency: "1x sehari",
    defaultDuration: "3 hari",
    tags: ["Antibiotik"],
  },
  {
    id: "med-7",
    name: "Amoxicillin",
    code: "amoxicillin",
    strengths: ["250 mg", "500 mg"],
    defaultDose: "1 kapsul",
    defaultFrequency: "3x sehari",
    defaultDuration: "7 hari",
    tags: ["Antibiotik", "Penisilin"],
  },
  {
    id: "med-8",
    name: "Metformin",
    code: "metformin",
    strengths: ["500 mg", "850 mg"],
    defaultDose: "1 tablet",
    defaultFrequency: "2x sehari",
    defaultDuration: "30 hari",
    tags: ["Diabetes"],
  },
  {
    id: "med-9",
    name: "Omeprazole",
    code: "omeprazole",
    strengths: ["20 mg"],
    defaultDose: "1 kapsul",
    defaultFrequency: "1x sehari",
    defaultDuration: "14 hari",
    tags: ["Gastritis"],
  },
  {
    id: "med-10",
    name: "Cetirizine",
    code: "cetirizine",
    strengths: ["10 mg"],
    defaultDose: "1 tablet",
    defaultFrequency: "1x sehari",
    defaultDuration: "7 hari",
    tags: ["Alergi", "Antihistamin"],
  },
];

type MedicationSearchProps = {
  onSelect: (option: MedicationOption) => void;
  disabledCodes?: string[];
};

export function MedicationSearch({ onSelect, disabledCodes = [] }: MedicationSearchProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const timeout = window.setTimeout(() => setIsLoading(false), 300);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return MEDICATION_OPTIONS;
    return MEDICATION_OPTIONS.filter((option) => {
      const haystack = [option.name, option.code, ...option.tags].join(" ").toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query]);

  return (
    <section className="space-y-3">
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tambah obat
        </span>
        <div className="relative rounded-input border border-border/70 bg-muted/40">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama obat atau indikasi"
            className="tap-target w-full rounded-input bg-transparent px-10 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </div>
      </label>

      <div className="rounded-card border border-border/60 bg-card p-3 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Hasil
        </div>
        <div className="min-h-[176px] space-y-2">
          <AnimatePresence initial={false}>
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-2"
              >
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-12 rounded-card bg-muted animate-pulse"
                  />
                ))}
              </motion.div>
            ) : filteredOptions.length ? (
              filteredOptions.map((option) => {
                const isDisabled = disabledCodes.includes(option.code);
                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    layout
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (isDisabled) return;
                      onSelect(option);
                      setQuery("");
                    }}
                    className={cn(
                      "tap-target flex w-full items-start justify-between gap-3 rounded-card border border-border/60 bg-background px-3 py-3 text-left shadow-sm transition-all duration-fast ease-out hover:border-primary/30 hover:shadow-md",
                      isDisabled && "pointer-events-none opacity-60",
                    )}
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{option.name}</p>
                      <p className="text-xs text-muted-foreground">{option.tags.join(" • ")}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {option.strengths.join(", ")}
                    </div>
                  </motion.button>
                );
              })
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border/60 bg-muted/30 p-6 text-center"
              >
                <AlertCircle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  Tidak menemukan obat yang sesuai. Coba kata kunci lain.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
