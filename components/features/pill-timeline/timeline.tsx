"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { DoseNode, type DoseStatus } from "./dose-node";

type Dose = {
  id: string;
  time: string;
  medication: string;
  strength: string;
  status: DoseStatus;
};

type Segment = {
  id: string;
  label: string;
  range: string;
  doses: Dose[];
};

type TimelineProps = {
  segments: Segment[];
  nextDoseId: string | null;
  onDoseSelect?: (doseId: string) => void;
};

export function PillTimeline({ segments, nextDoseId, onDoseSelect }: TimelineProps) {
  const linearSegments = useMemo(() => segments.filter((segment) => segment.doses.length), [segments]);

  return (
    <div className="flex flex-col gap-6">
      <div className="hidden gap-6 lg:flex">
        {linearSegments.map((segment, segmentIndex) => (
          <div key={segment.id} className="flex-1">
            <SegmentHeader label={segment.label} range={segment.range} />
            <div className="mt-4 flex h-full flex-1 flex-col">
              <div className="relative flex flex-col items-center gap-6">
                <motion.div
                  layout
                  className="absolute left-1/2 top-0 -z-10 h-full w-px bg-border"
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                />
                {segment.doses.map((dose, doseIndex) => (
                  <DoseNode
                    key={dose.id}
                    id={dose.id}
                    label={`${segment.label} #${doseIndex + 1}`}
                    time={dose.time}
                    medication={dose.medication}
                    strength={dose.strength}
                    status={dose.status}
                    isNext={dose.id === nextDoseId}
                    onClick={() => onDoseSelect?.(dose.id)}
                  />
                ))}
              </div>
            </div>
            {segmentIndex < linearSegments.length - 1 ? (
              <div className="mt-6 h-full">
                <div className="mx-auto h-px w-full max-w-[220px] bg-border" />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:hidden">
        {linearSegments.map((segment) => (
          <div key={segment.id} className="rounded-card border border-border/60 bg-card p-4 shadow-sm">
            <SegmentHeader label={segment.label} range={segment.range} />
            <div className="mt-4 flex flex-col gap-4">
              {segment.doses.map((dose, index) => (
                <div key={dose.id} className="relative pl-6">
                  <motion.span
                    layout
                    className="absolute left-2 top-3 h-full w-px bg-border"
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                    aria-hidden="true"
                  />
                  <DoseNode
                    id={dose.id}
                    label={`${segment.label} #${index + 1}`}
                    time={dose.time}
                    medication={dose.medication}
                    strength={dose.strength}
                    status={dose.status}
                    isNext={dose.id === nextDoseId}
                    onClick={() => onDoseSelect?.(dose.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type SegmentHeaderProps = {
  label: string;
  range: string;
};

function SegmentHeader({ label, range }: SegmentHeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-card border border-border/60 bg-muted/30 px-3 py-2">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{range}</p>
      </div>
      <span className="rounded-badge border border-primary/30 bg-primary/10 px-3 py-1 text-tiny font-semibold uppercase tracking-wide text-primary">
        Jadwal
      </span>
    </div>
  );
}

export type { Segment as TimelineSegment, Dose as TimelineDose };
