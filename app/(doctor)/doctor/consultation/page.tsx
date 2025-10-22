import { Stethoscope } from "lucide-react";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";

const consultations = [
  { id: "Q-2302", summary: "Rangga Saputra - Emergency flag" },
  { id: "Q-2303", summary: "Mega Lestari - Follow up resep" },
] as const;

export default function DoctorConsultationListPage() {
  return (
    <PageShell
      title="Daftar Konsultasi"
      subtitle="Pilih konsultasi untuk melihat detail percakapan dan catatan AI."
    >
      <div className="grid gap-3">
        {consultations.map((item) => (
          <Link
            key={item.id}
            href={`/doctor/consultation/${item.id}`}
            className="card-surface interactive tap-target flex items-center gap-3 p-4"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/10 text-primary">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium text-foreground">{item.id}</p>
              <p className="text-small text-muted-foreground">{item.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
