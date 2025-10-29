"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";

type PrescriptionItem = { id: number; name: string | null; strength: string | null; frequency: string | null; duration: string | null; notes: string | null };
type Prescription = { id: string; doctor_id: string; status: string; created_at: string; items: PrescriptionItem[] };

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/clinical/prescriptions/list");
        if (!res.ok) {
          const errorText = await res.text();
          console.error("[prescriptions/list] Error:", res.status, errorText);
          throw new Error(`Failed to load prescriptions: ${res.status}`);
        }
        const data = await res.json();
        setPrescriptions(data?.prescriptions || []);
      } catch (error) {
        console.error("[prescriptions/list] Fetch error:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <PageShell
      title="Resep Elektronik"
      subtitle="Kelola jadwal minum obat dan pengingat harian Anda."
    >
      {loading ? (
        <div className="text-sm text-muted-foreground">Memuat resep…</div>
      ) : prescriptions.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {prescriptions.map((rx) => (
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
              <div className="text-sm font-semibold text-foreground">{new Date(rx.created_at).toLocaleDateString("id-ID")}</div>
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
