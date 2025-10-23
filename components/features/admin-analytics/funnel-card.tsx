"use client";

import { useMemo } from "react";

export type FunnelValues = {
  triage: number;
  consult: number;
  draft: number;
  approval: number;
  fulfillment: number;
};

export function FunnelCard({ values }: { values: FunnelValues }) {
  const steps = useMemo(() => [
    { key: "Triage", value: values.triage },
    { key: "Consult", value: values.consult },
    { key: "Rx Draft", value: values.draft },
    { key: "Approval", value: values.approval },
    { key: "Fulfillment", value: values.fulfillment },
  ], [values]);

  const base = steps[0]?.value || 1;

  return (
    <section className="space-y-3 rounded-card border border-border/60 bg-card p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Conversion Funnel</h3>
      </header>
      <div className="space-y-2">
        {steps.map((s, idx) => {
          const pct = Math.max(0, Math.min(100, Math.round((s.value / base) * 100)));
          const prev = idx > 0 ? steps[idx - 1]!.value : undefined;
          const rel = prev != null && prev > 0 ? Math.round((s.value / prev) * 100) : 100;
          return (
            <div key={s.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">{s.key}</span>
                <span className="text-muted-foreground">{s.value.toLocaleString()} ({pct}%)</span>
              </div>
              <div className="h-3 w-full rounded-button bg-muted">
                <div className="h-3 rounded-button bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-tiny text-muted-foreground">{idx === 0 ? "Base" : `${s.key} / ${steps[idx - 1]!.key} = ${rel}%`}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

