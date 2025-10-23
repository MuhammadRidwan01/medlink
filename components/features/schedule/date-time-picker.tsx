"use client";

import { useMemo, useState } from "react";

function formatDate(d: Date) { return d.toISOString().slice(0,10); }

export function DateTimePicker({ value, onChange }: { value: { date: string; time: string }; onChange: (v: { date: string; time: string }) => void }) {
  const presets = useMemo(() => {
    const today = new Date();
    const d3 = new Date(today); d3.setDate(today.getDate() + 3);
    const nw = new Date(today); nw.setDate(today.getDate() + 7);
    return [
      { key: "+3d", label: "+3 hari", value: formatDate(d3) },
      { key: "nextw", label: "Minggu depan", value: formatDate(nw) },
    ];
  }, []);

  const times = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","13:00","14:00","15:00","16:00"];
  const [date, setDate] = useState<string>(value.date);
  const [time, setTime] = useState<string>(value.time);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        {presets.map((p) => (
          <button key={p.key} type="button" onClick={() => { setDate(p.value); onChange({ date: p.value, time }); }} className="tap-target rounded-button border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/50">{p.label}</button>
        ))}
      </div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tanggal
        <input type="date" value={date} onChange={(e) => { setDate(e.target.value); onChange({ date: e.target.value, time }); }} className="mt-1 w-full rounded-input border border-border/60 bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring" />
      </label>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Waktu</p>
        <div className="mt-1 grid grid-cols-4 gap-2">
          {times.map((t) => (
            <button key={t} type="button" onClick={() => { setTime(t); onChange({ date, time: t }); }} className={`tap-target rounded-button border px-3 py-1.5 text-xs font-semibold ${time===t?"border-primary/30 bg-primary/10 text-primary":"border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/50"}`}>{t}</button>
          ))}
        </div>
      </div>
    </section>
  );
}
