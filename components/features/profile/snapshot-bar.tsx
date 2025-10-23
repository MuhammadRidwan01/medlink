"use client";

import { cubicBezier, motion } from "framer-motion";
import { Pill, ShieldAlert } from "lucide-react";
import { useProfileSnapshot } from "./store";

export function SnapshotBar() {
  const { topAllergies, topMeds } = useProfileSnapshot();
  const standardEase = cubicBezier(0.2, 0.8, 0.2, 1);

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: standardEase }}
      className="rounded-card border border-border/60 bg-card p-4 shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Snapshot alergi & obat</h2>
          <p className="text-xs text-muted-foreground">
            Digunakan untuk cek interaksi di marketplace dan draf resep.
          </p>
        </div>
      </header>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {topAllergies.map((allergy) => (
          <span
            key={allergy.id}
            className="inline-flex items-center gap-2 rounded-badge border border-danger/20 bg-danger/5 px-3 py-1 text-danger"
          >
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            {allergy.substance}
          </span>
        ))}
        {topMeds.map((med) => (
          <span
            key={med.id}
            className="inline-flex items-center gap-2 rounded-badge border border-primary/20 bg-primary/5 px-3 py-1 text-primary"
          >
            <Pill className="h-3.5 w-3.5" aria-hidden="true" />
            {med.name}
          </span>
        ))}
        {!topAllergies.length && !topMeds.length ? (
          <span className="rounded-badge border border-border/60 bg-muted/30 px-3 py-1 text-muted-foreground">
            Snapshot belum tersedia
          </span>
        ) : null}
      </div>
    </motion.section>
  );
}
