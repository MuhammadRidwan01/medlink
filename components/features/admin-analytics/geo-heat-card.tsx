"use client";

import { useMemo, useState } from "react";

export type RegionStat = { id: string; label: string; value: number };

export function GeoHeatCard({ regions }: { regions: RegionStat[] }) {
  const [hover, setHover] = useState<RegionStat | null>(null);
  const max = useMemo(() => Math.max(1, ...regions.map((r) => r.value)), [regions]);
  const color = (v: number) => `rgba(59, 130, 246, ${0.2 + 0.8 * (v / max)})`;

  return (
    <section className="space-y-3 rounded-card border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Geo Distribution</h3>
      <div className="relative grid grid-cols-6 gap-2">
        {regions.map((r) => (
          <button
            key={r.id}
            type="button"
            onMouseEnter={() => setHover(r)}
            onMouseLeave={() => setHover(null)}
            className="h-10 rounded-button border border-border/60"
            style={{ backgroundColor: color(r.value) }}
            aria-label={`${r.label}: ${r.value}`}
          />
        ))}
      </div>
      {hover ? (
        <div role="tooltip" className="rounded-card border border-border/60 bg-muted/30 p-2 text-xs text-muted-foreground">
          {hover.label}: {hover.value.toLocaleString()}
        </div>
      ) : null}
    </section>
  );
}

