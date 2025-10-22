import { Activity, ClipboardList, HeartPulse, Users } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

const summaryMetrics = [
  {
    label: "Pasien aktif",
    value: "24",
    icon: Users,
  },
  {
    label: "Menunggu triase",
    value: "6",
    icon: ClipboardList,
  },
  {
    label: "Emergency flag",
    value: "1",
    icon: Activity,
  },
  {
    label: "Resep butuh persetujuan",
    value: "4",
    icon: HeartPulse,
  },
] as const;

export default function DoctorDashboardPage() {
  return (
    <PageShell
      title="Ringkasan Klinik"
      subtitle="Monitor antrian, status triase AI, dan pending approval resep."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryMetrics.map((metric) => (
          <div key={metric.label} className="card-surface p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-button bg-secondary/10 text-secondary">
                <metric.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-small text-muted-foreground">{metric.label}</p>
                <p className="text-body font-semibold">{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card-surface p-4">
        <h3 className="mb-2">Tugas Prioritas</h3>
        <p className="text-small text-muted-foreground">
          Integrasi kalender dan sistem penjadwalan akan ditambahkan di fase
          berikutnya.
        </p>
      </div>
    </PageShell>
  );
}

