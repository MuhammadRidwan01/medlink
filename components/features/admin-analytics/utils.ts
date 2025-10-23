"use client";

export type DateRangeKey = "7d" | "28d" | "90d" | "custom";

export type DateRange = {
  key: DateRangeKey;
  from: Date;
  to: Date;
};

export function presetRange(key: DateRangeKey, base: Date = new Date()): DateRange {
  const to = base;
  const from = new Date(base);
  if (key === "7d") from.setDate(base.getDate() - 6);
  else if (key === "28d") from.setDate(base.getDate() - 27);
  else if (key === "90d") from.setDate(base.getDate() - 89);
  else from.setDate(base.getDate() - 13);
  return { key, from, to };
}

export function formatDay(date: Date) {
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

export function downloadCSV(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function generateSeries(range: DateRange, seed = 1) {
  // deterministic pseudo-random based on seed
  let s = seed;
  const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const days = Math.max(1, Math.ceil((range.to.getTime() - range.from.getTime()) / 86400000));
  const labels: string[] = [];
  const sessions: number[] = [];
  const consults: number[] = [];
  const gmv: number[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(range.from);
    d.setDate(range.from.getDate() + i);
    labels.push(formatDay(d));
    const baseS = 100 + Math.round(rand() * 80);
    const baseC = Math.round(baseS * (0.25 + rand() * 0.15));
    const baseG = Math.round(baseC * (45000 + rand() * 75000));
    sessions.push(baseS);
    consults.push(baseC);
    gmv.push(baseG);
  }
  return { labels, sessions, consults, gmv };
}

type AnomalyDetection =
  | { type: "spike"; index: number; value: number }
  | { type: "drop"; index: number; value: number }
  | null;

export function detectAnomaly(values: number[]): AnomalyDetection {
  // simple spike detection: value > mean + 2*std or < mean - 2*std
  if (!values.length) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);
  for (let i = values.length - 1; i >= 0; i--) {
    const v = values[i]!;
    if (v > mean + 2 * std) return { type: "spike", index: i, value: v };
    if (v < mean - 2 * std) return { type: "drop", index: i, value: v };
  }
  return null;
}

