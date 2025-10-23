"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { presetRange, type DateRange, generateSeries, detectAnomaly, downloadCSV } from "@/components/features/admin-analytics/utils";
import { KpiTiles, type KpiValues } from "@/components/features/admin-analytics/kpi-tiles";
import { FunnelCard, type FunnelValues } from "@/components/features/admin-analytics/funnel-card";
import dynamic from "next/dynamic";
const TimeseriesCard = dynamic(() => import("@/components/features/admin-analytics/timeseries-card").then(m => m.TimeseriesCard), { ssr: false });
const GeoHeatCard = dynamic(() => import("@/components/features/admin-analytics/geo-heat-card").then(m => m.GeoHeatCard), { ssr: false });
import type { RegionStat } from "@/components/features/admin-analytics/geo-heat-card";
import { TableTopEntities, type TopRow } from "@/components/features/admin-analytics/table-top-entities";
import { AnomalyBanner } from "@/components/features/admin-analytics/anomaly-banner";

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<DateRange>(presetRange("7d"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 350); // skeleton first paint
    return () => clearTimeout(t);
  }, []);

  const series = useMemo(() => generateSeries(range, 7), [range]);

  const kpis: KpiValues = useMemo(() => {
    const dau = Math.max(...series.sessions);
    const wau = series.sessions.slice(-7).reduce((a, b) => a + b, 0);
    const triageSessions = series.sessions.reduce((a, b) => a + b, 0);
    const totalConsults = series.consults.reduce((a, b) => a + b, 0);
    const conversionRate = triageSessions ? totalConsults / triageSessions : 0;
    const avgWaitMin = Math.round(8 + (1 - conversionRate) * 6);
    return { dau, wau, triageSessions, conversionRate, avgWaitMin };
  }, [series]);

  const funnel: FunnelValues = useMemo(() => {
    const triage = series.sessions.reduce((a, b) => a + b, 0);
    const consult = series.consults.reduce((a, b) => a + b, 0);
    const draft = Math.round(consult * 0.85);
    const approval = Math.round(draft * 0.9);
    const fulfillment = Math.round(approval * 0.92);
    return { triage, consult, draft, approval, fulfillment };
  }, [series]);

  const regions: RegionStat[] = useMemo(() => {
    const base = [
      { id: "id-jkt", label: "DKI Jakarta" },
      { id: "id-jabar", label: "Jawa Barat" },
      { id: "id-jatim", label: "Jawa Timur" },
      { id: "id-bali", label: "Bali" },
      { id: "id-sum", label: "Sumatera Utara" },
      { id: "id-kalsel", label: "Kalimantan Selatan" },
      { id: "id-kaltim", label: "Kalimantan Timur" },
      { id: "id-sulsel", label: "Sulawesi Selatan" },
      { id: "id-ntt", label: "NTT" },
      { id: "id-ntb", label: "NTB" },
      { id: "id-papua", label: "Papua" },
      { id: "id-riau", label: "Riau" },
    ];
    return base.map((b, i) => ({ ...b, value: 100 + (i + 1) * 17 }));
  }, []);

  const topDoctors: TopRow[] = useMemo(() => (
    ["Dr. Meida", "Dr. Andi", "Dr. Rina", "Dr. Bayu", "Dr. Sari"].map((n, i) => ({ id: `doc-${i}`, label: n, metric: 120 - i * 11 }))
  ), []);
  const topPharmacies: TopRow[] = useMemo(() => (
    ["Apotek Sehat", "Apotek Prima", "Apotek Nusantara", "Apotek Kita", "Apotek Medika"].map((n, i) => ({ id: `ph-${i}`, label: n, metric: 320 - i * 23 }))
  ), []);
  const topMeds: TopRow[] = useMemo(() => (
    ["Paracetamol 500mg", "Metformin 850mg", "Atorvastatin 20mg", "Cetirizine 10mg", "Omeprazole 20mg"].map((n, i) => ({ id: `med-${i}`, label: n, metric: 900 - i * 120 }))
  ), []);

  const anomaly = useMemo(() => detectAnomaly(series.consults), [series.consults]);

  const exportTimeseries = () => {
    const headers = ["Date", "Sessions", "Consults", "GMV"];
    const rows = series.labels.map((d, i) => [d, series.sessions[i]!, series.consults[i]!, series.gmv[i]!]);
    downloadCSV(`timeseries-${range.key}`, headers, rows);
  };

  return (
    <PageShell title="Admin Analytics" subtitle="Product health for triage, consults, prescriptions, and pharmacy approvals" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2" role="tablist" aria-label="Date range">
          {(["7d", "28d", "90d", "custom"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setRange(presetRange(k))}
              role="tab"
              aria-selected={range.key === k}
              className={`tap-target rounded-button border px-3 py-1.5 text-xs font-semibold ${range.key === k ? "border-primary/30 bg-primary/10 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/50"}`}
            >
              {k.toUpperCase()}
            </button>
          ))}
        </div>
        <button type="button" onClick={exportTimeseries} className="tap-target inline-flex items-center justify-center rounded-button border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/50">Export CSV</button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-card bg-muted/40" />
          ))}
        </div>
      ) : (
        <KpiTiles values={kpis} />
      )}

      {anomaly ? (
        <AnomalyBanner type={anomaly.type} message={`Anomaly detected on consults (${anomaly.type}) at index ${anomaly.index + 1}.`} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <TimeseriesCard title="Sessions / Consults / GMV" series={series} />
        <FunnelCard values={funnel} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <GeoHeatCard regions={regions} />
        <div className="grid gap-4">
          <TableTopEntities title="Top Doctors" rows={topDoctors} filename="top-doctors" />
          <TableTopEntities title="Top Pharmacies" rows={topPharmacies} filename="top-pharmacies" />
          <TableTopEntities title="Top Medications" rows={topMeds} filename="top-meds" />
        </div>
      </div>
    </PageShell>
  );
}
