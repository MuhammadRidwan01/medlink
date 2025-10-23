"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, Clock, MessagesSquare, UserCheck } from "lucide-react";

export type KpiValues = {
  dau: number;
  wau: number;
  triageSessions: number;
  conversionRate: number; // 0..1
  avgWaitMin: number;
};

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    let raf = 0;
    const step = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      setValue(Math.round(target * easeOutCubic(p)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

export function KpiTiles({ values }: { values: KpiValues }) {
  const dau = useCountUp(values.dau);
  const wau = useCountUp(values.wau);
  const triage = useCountUp(values.triageSessions);
  const conv = useCountUp(Math.round(values.conversionRate * 100));
  const wait = useCountUp(values.avgWaitMin);

  const tiles = [
    { icon: Activity, label: "DAU", value: dau.toString() },
    { icon: Activity, label: "WAU", value: wau.toString() },
    { icon: MessagesSquare, label: "Triage Sessions", value: triage.toString() },
    { icon: UserCheck, label: "Conversion", value: `${conv}%` },
    { icon: Clock, label: "Avg Wait", value: `${wait}m` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-card border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.label}</p>
            <t.icon className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <p className="mt-2 text-lg font-semibold text-foreground">{t.value}</p>
        </div>
      ))}
    </div>
  );
}

