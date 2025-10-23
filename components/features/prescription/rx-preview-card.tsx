"use client";

import { Pill, CalendarDays, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DraftRecord } from "./store";

export function RxPreviewCard({ draft }: { draft: DraftRecord }) {
  return (
    <section className="space-y-4 rounded-card border border-border/60 bg-card p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{draft.patientName}</p>
          <p className="text-xs text-muted-foreground inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            {new Date(draft.createdAt).toLocaleString("id-ID")}
          </p>
        </div>
      </header>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Obat</p>
        <div className="space-y-2">
          {draft.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 rounded-card border border-border/60 bg-background p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground inline-flex items-center gap-2">
                  <Pill className="h-4 w-4 text-primary" />
                  {item.name} {item.strength}
                </p>
                <p className="text-xs text-muted-foreground">{item.dose} • {item.frequency} • {item.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {draft.status === "rejected" && draft.note ? (
        <div className={cn("rounded-card border border-danger/30 bg-danger/5 p-3 text-xs text-danger flex items-start gap-2")}
             aria-live="polite">
          <AlertTriangle className="h-4 w-4" />
          <span>Alasan penolakan: {draft.note}</span>
        </div>
      ) : null}

      <div className="rounded-card border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
        Peringatan interaksi obat akan muncul di sini bila ada; tidak menghambat alur persetujuan.
      </div>
    </section>
  );
}

