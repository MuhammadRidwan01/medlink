"use client";

import { downloadCSV } from "./utils";

export type TopRow = { id: string; label: string; metric: number };

export function TableTopEntities({ title, rows, filename }: { title: string; rows: TopRow[]; filename: string }) {
  return (
    <section className="space-y-3 rounded-card border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={() => downloadCSV(filename, ["Label", "Metric"], rows.map((r) => [r.label, r.metric]))}
          className="tap-target inline-flex items-center justify-center rounded-button border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/50"
        >
          Export CSV
        </button>
      </div>
      <div role="table" className="rounded-card border border-border/60">
        <div role="rowgroup">
          <div role="row" className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <div>Label</div>
            <div>Metric</div>
          </div>
        </div>
        <div role="rowgroup" className="divide-y divide-border/60">
          {rows.map((r) => (
            <div key={r.id} role="row" className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-2 text-sm">
              <div role="cell" className="truncate text-foreground">{r.label}</div>
              <div role="cell" className="text-muted-foreground">{r.metric.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

