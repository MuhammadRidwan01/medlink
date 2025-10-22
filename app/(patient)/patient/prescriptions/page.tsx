"use client";

import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { RxSummaryCard } from "@/components/features/pill-timeline/rx-summary-card";
import { computeAdherence, computeNextDose, usePillTimelineStore } from "@/components/features/pill-timeline/store";

export default function PatientPrescriptionsPage() {
  const prescriptions = usePillTimelineStore((state) => state.prescriptions);
  const router = useRouter();

  return (
    <PageShell
      title="Resep Elektronik"
      subtitle="Kelola jadwal minum obat dan pengingat harian Anda."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {prescriptions.map((prescription) => {
          const adherence = computeAdherence(prescription);
          const nextDose = computeNextDose(prescription);
          const segmentLabel = nextDose
            ? prescription.segments.find((segment) => segment.id === nextDose.segmentId)?.label ?? "Jadwal"
            : "Jadwal";

          return (
            <RxSummaryCard
              key={prescription.id}
              name={prescription.name}
              description={prescription.description}
              adherence={adherence}
              nextDoseLabel={segmentLabel}
              nextDoseTime={nextDose ? nextDose.time : "Selesai"}
              onOpenTimeline={() => router.push(`/patient/prescriptions/${prescription.id}`)}
            />
          );
        })}
      </div>
    </PageShell>
  );
}
