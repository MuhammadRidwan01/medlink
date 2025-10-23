"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type Series = {
  labels: string[];
  sessions: number[];
  consults: number[];
  gmv: number[];
};

type LegendKey = "sessions" | "consults" | "gmv";

export function TimeseriesCard({ title, series }: { title: string; series: Series }) {
  const [visible, setVisible] = useState<Record<LegendKey, boolean>>({ sessions: true, consults: true, gmv: true });
  const maxY = useMemo(() => {
    const candidates: number[] = [];
    if (visible.sessions) candidates.push(...series.sessions);
    if (visible.consults) candidates.push(...series.consults);
    if (visible.gmv) candidates.push(...series.gmv.map((v) => v / 1000)); // scale down GMV for same chart
    return Math.max(1, ...candidates);
  }, [series, visible]);

  const width = 640;
  const height = 200;
  const pad = 24;
  const step = (width - pad * 2) / Math.max(1, series.labels.length - 1);

  const toPoint = (idx: number, value: number) => {
    const x = pad + idx * step;
    const y = pad + (1 - value / maxY) * (height - pad * 2);
    return `${x},${y}`;
  };

  return (
    <section className="space-y-3 rounded-card border border-border/60 bg-card p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-2" role="tablist" aria-label="Toggle series">
          {([
            { key: "sessions", label: "Sessions", color: "#3b82f6" },
            { key: "consults", label: "Consults", color: "#22c55e" },
            { key: "gmv", label: "GMV (k) ", color: "#eab308" },
          ] as const).map((l) => (
            <button
              key={l.key}
              type="button"
              onClick={() => setVisible((v) => ({ ...v, [l.key]: !v[l.key] }))}
              role="tab"
              aria-selected={visible[l.key]}
              className={cn(
                "tap-target inline-flex items-center gap-2 rounded-button border px-2 py-1 text-xs font-semibold",
                visible[l.key] ? "border-border/60 bg-muted/30" : "border-border/60 bg-transparent opacity-70",
              )}
            >
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </button>
          ))}
        </div>
      </header>

      <div className="relative overflow-x-auto">
        <svg width={width} height={height} className="block">
          <rect x={0} y={0} width={width} height={height} fill="transparent" />
          {visible.sessions ? (
            <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={series.sessions.map((v, i) => toPoint(i, v)).join(" ")} />
          ) : null}
          {visible.consults ? (
            <polyline fill="none" stroke="#22c55e" strokeWidth="2" points={series.consults.map((v, i) => toPoint(i, v)).join(" ")} />
          ) : null}
          {visible.gmv ? (
            <polyline fill="none" stroke="#eab308" strokeWidth="2" points={series.gmv.map((v, i) => toPoint(i, v / 1000)).join(" ")} />
          ) : null}
        </svg>
      </div>
    </section>
  );
}
