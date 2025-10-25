"use client";

import { motion } from "framer-motion";
import {
  Activity,
  CalendarDays,
  Pill,
  Stethoscope,
  Thermometer,
  TriangleAlert,
} from "lucide-react";
import type { ComponentType } from "react";
import { RiskBadge } from "@/components/features/ai-triage/risk-badge";
import type { RiskLevel } from "@/types/triage";
import {
  RedFlagBanner,
  type RedFlagSeverity,
} from "./red-flag-banner";

type Medication = {
  name: string;
  dosage: string;
  frequency: string;
};

type PatientSnapshotData = {
  name: string;
  age: number;
  gender: string;
  weight: string;
  lastVisit: string;
  diagnosis: string;
  riskLevel: RiskLevel;
  allergies: string[];
  medications: Medication[];
  redFlags: string[];
  vitals: {
    label: string;
    value: string;
    icon: "temp" | "bp" | "pulse";
  }[];
};

type SnapshotBanner = {
  visible: boolean;
  severity: RedFlagSeverity;
  title: string;
  message: string;
  onDismiss: () => void;
  key?: string;
};

type PatientSnapshotProps = {
  data: PatientSnapshotData;
  banner?: SnapshotBanner;
};

const vitalIconMap: Record<PatientSnapshotData["vitals"][number]["icon"], ComponentType<{ className?: string }>> = {
  temp: Thermometer,
  bp: Activity,
  pulse: Stethoscope,
};

export function PatientSnapshot({ data, banner }: PatientSnapshotProps) {
  return (
    <div className="sticky top-4 flex max-h-[calc(100vh-140px)] flex-col gap-4 overflow-hidden">
      {banner ? (
        <RedFlagBanner
          key={banner.key}
          visible={banner.visible}
          severity={banner.severity}
          title={banner.title}
          message={banner.message}
          onDismiss={banner.onDismiss}
        />
      ) : null}
      <motion.section
        layout
        className="card-surface space-y-4 p-4"
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      >
        <header className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Pasien aktif
              </p>
              <h3 className="text-lg font-semibold text-foreground">{data.name}</h3>
            </div>
            <RiskBadge level={data.riskLevel} />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-badge bg-muted px-2.5 py-1">
              {data.gender} · {data.age} th · {data.weight}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4 text-primary" />
              {data.lastVisit}
            </span>
          </div>
        </header>
        <div className="grid gap-3 rounded-card bg-muted/40 p-3">
          <div className="flex items-start gap-3">
            <TriangleAlert className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm font-semibold text-foreground">Diagnosis sementara</p>
              <p className="text-small text-muted-foreground">{data.diagnosis}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {data.vitals.map((vital) => {
              const Icon = vitalIconMap[vital.icon];
              return (
                <div
                  key={`${vital.label}-${vital.value}`}
                  className="flex items-center gap-2 rounded-card border border-border/60 bg-card/70 px-3 py-2 shadow-sm"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{vital.label}</p>
                    <p>{vital.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>
      <motion.section
        layout
        className="card-surface space-y-3 overflow-hidden p-4"
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      >
        <header className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">Alergi Terdaftar</h4>
          <span className="text-xs text-muted-foreground">{data.allergies.length} item</span>
        </header>
        <div className="flex flex-wrap gap-2">
          {data.allergies.map((allergy) => (
            <span
              key={allergy}
              className="rounded-badge border border-warning/30 bg-warning/10 px-3 py-1 text-tiny font-semibold uppercase tracking-wide text-warning"
            >
              {allergy}
            </span>
          ))}
        </div>
      </motion.section>
      <motion.section
        layout
        className="card-surface space-y-3 overflow-hidden p-4"
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      >
        <header className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">Obat Aktif</h4>
          <span className="text-xs text-muted-foreground">{data.medications.length} item</span>
        </header>
        <div className="space-y-2">
          {data.medications.map((med) => (
            <div
              key={`${med.name}-${med.dosage}`}
              className="flex items-start gap-3 rounded-card border border-border/70 bg-muted/30 p-3 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-card bg-primary/10 text-primary">
                <Pill className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{med.name}</p>
                <p className="text-xs text-muted-foreground">
                  {med.dosage} · {med.frequency}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
      {data.redFlags.length ? (
        <motion.section
          layout
          className="card-surface space-y-3 overflow-hidden p-4"
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        >
          <header className="flex items-center gap-2 text-sm font-semibold text-danger">
            <TriangleAlert className="h-4 w-4" />
            Red Flags
          </header>
          <ul className="space-y-2 text-small text-muted-foreground">
            {data.redFlags.map((flag) => (
              <li
                key={flag}
                className="rounded-card border border-danger/30 bg-danger/5 px-3 py-2 text-danger"
              >
                {flag}
              </li>
            ))}
          </ul>
        </motion.section>
      ) : null}
    </div>
  );
}
