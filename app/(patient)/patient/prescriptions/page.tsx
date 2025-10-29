"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { usePillTimelineStore } from "@/components/features/pill-timeline/store";

type PrescriptionCardItem = {
  id: number;
  name: string | null;
  strength: string | null;
  frequency: string | null;
  duration: string | null;
  notes: string | null;
};

type PrescriptionCard = {
  id: string;
  status: string;
  created_at: string;
  items: PrescriptionCardItem[];
  created_label: string | null;
};

export default function PatientPrescriptionsPage() {
  const router = useRouter();
  const prescriptions = usePillTimelineStore((state) => state.prescriptions);

  const cards = useMemo<PrescriptionCard[]>(() => {
    return prescriptions.map((prescription) => {
      const createdLabel = prescription.createdLabel ?? (() => {
        const timestamp = Date.parse(prescription.createdAt);
        if (Number.isNaN(timestamp)) return null;
        return new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(timestamp));
      })();

      const grouped = Object.values(
        prescription.doses.reduce(
          (acc, dose) => {
            const key = `${dose.medication}-${dose.strength}`;
            if (!acc[key]) {
              acc[key] = {
                medication: dose.medication,
                strength: dose.strength,
                times: [] as string[],
              };
            }
            acc[key].times.push(dose.time);
            return acc;
          },
          {} as Record<
            string,
            {
              medication: string;
              strength: string;
              times: string[];
            }
          >,
        ),
      ).map((entry, index) => ({
        id: index,
        name: entry.medication,
        strength: entry.strength,
        frequency: `Jadwal ${entry.times.sort().join(", ")}`,
        duration: null,
        notes: null,
      }));

      return {
        id: prescription.id,
        status: prescription.status,
        created_at: prescription.createdAt,
        created_label: createdLabel,
        items: grouped,
      };
    });
  }, [prescriptions]);

  return (
    <PageShell
      title="Resep Elektronik"
      subtitle="Kelola jadwal minum obat dan pengingat harian Anda."
    >
      {cards.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((rx) => (
            <div key={rx.id} className="rounded-card border border-border/60 bg-card p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resep</span>
                <span className={`rounded-badge px-2 py-0.5 text-tiny font-semibold uppercase ${
                  rx.status === "approved" ? "bg-success/10 text-success" :
                  rx.status === "awaiting_approval" ? "bg-warning/10 text-warning" :
                  rx.status === "rejected" ? "bg-danger/10 text-danger" :
                  "bg-muted/30 text-muted-foreground"
                }`}>{rx.status}</span>
              </div>
              <div className="text-sm font-semibold text-foreground">
                {rx.created_label ?? "Tanggal tidak tersedia"}
              </div>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {rx.items.map((item) => (
                  <li key={item.id}>
                    <span className="font-medium text-foreground">{item.name}</span> {item.strength} • {item.frequency} • {item.duration}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => router.push(`/patient/prescriptions/${rx.id}`)}
                className="tap-target mt-3 w-full rounded-button border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"
              >Lihat Detail</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">Belum ada resep.</div>
      )}
    </PageShell>
  );
}
