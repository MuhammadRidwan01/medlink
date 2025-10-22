import { Clock, MessageSquare, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";

const queueItems = [
  {
    id: "Q-2301",
    name: "Ananda Putri",
    status: "Menunggu dokter",
    priority: "Sedang",
  },
  {
    id: "Q-2302",
    name: "Rangga Saputra",
    status: "Emergency flag dari AI",
    priority: "Tinggi",
  },
] as const;

export default function DoctorQueuePage() {
  return (
    <PageShell
      title="Antrian Konsultasi"
      subtitle="Kelola pasien yang menunggu respon dokter."
    >
      <div className="space-y-3">
        {queueItems.map((patient) => (
          <Link
            key={patient.id}
            href={`/doctor/consultation/${patient.id}`}
            className="card-surface interactive tap-target block p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">{patient.name}</h3>
                <p className="text-small text-muted-foreground">{patient.status}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-badge bg-warning/20 px-2 py-1 text-tiny font-medium text-warning">
                <ShieldAlert className="h-4 w-4" />
                {patient.priority}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-tiny text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                5 menit lalu
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                2 pesan AI
              </span>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
