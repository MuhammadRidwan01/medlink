import { ActivitySquare, HeartPulse, Pill, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

const highlightCards = [
  {
    label: "Status Kesehatan",
    value: "Stabil",
    icon: HeartPulse,
  },
  {
    label: "Triage Terakhir",
    value: "2 jam lalu",
    icon: ActivitySquare,
  },
  {
    label: "Obat Aktif",
    value: "3 resep",
    icon: Pill,
  },
  {
    label: "Asuransi",
    value: "Aktif",
    icon: ShieldCheck,
  },
] as const;

export default function PatientDashboardPage() {
  return (
    <PageShell
      title="Ringkasan Pasien"
      subtitle="Pantau kesehatan dan aktivitas konsultasi Anda."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {highlightCards.map((card) => (
          <div key={card.label} className="card-surface interactive p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/10 text-primary">
                <card.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-small text-muted-foreground">{card.label}</p>
                <p className="text-body font-semibold">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card-surface p-4">
        <h3 className="mb-2">Aktivitas Terbaru</h3>
        <p className="text-small text-muted-foreground">
          Aktivitas real-time akan ditampilkan di sini setelah integrasi.
        </p>
      </div>
    </PageShell>
  );
}

