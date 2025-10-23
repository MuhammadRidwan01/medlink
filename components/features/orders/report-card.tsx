"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  aiSummary?: string;
  initialReport?: string;
  onChange?: (next: string) => void;
};

export function ReportCard({ aiSummary, initialReport = "", onChange }: Props) {
  const [report, setReport] = useState(initialReport);
  const [dirty, setDirty] = useState(false);
  const first = useRef(true);
  const { toast } = useToast();

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!dirty) return;
    const t = window.setTimeout(() => {
      setDirty(false);
      onChange?.(report);
      toast({ title: "Catatan tersimpan", description: "Perubahan telah disimpan secara lokal." });
    }, 2000);
    return () => window.clearTimeout(t);
  }, [dirty, report, onChange, toast]);

  return (
    <section className="space-y-4">
      {aiSummary ? (
        <div className="rounded-card border border-primary/20 bg-primary/5 p-3 text-sm">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-primary/90">{aiSummary}</p>
          </div>
        </div>
      ) : null}
      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Catatan Dokter</span>
        <textarea
          value={report}
          onChange={(e) => {
            setReport(e.target.value);
            setDirty(true);
          }}
          rows={10}
          className="tap-target w-full rounded-input border border-border/70 bg-muted/30 px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Tulis interpretasi dan rekomendasi klinis di sini."
        />
      </label>
    </section>
  );
}

