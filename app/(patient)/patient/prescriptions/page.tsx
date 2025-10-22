import { CalendarCheck, Pill, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

const mockPrescriptions = [
  {
    name: "Amoxicillin 500mg",
    status: "Menunggu persetujuan dokter",
    icon: Pill,
  },
  {
    name: "Vitamin D 1000 IU",
    status: "Siap ditebus di apotek",
    icon: ShieldCheck,
  },
] as const;

export default function PatientPrescriptionsPage() {
  return (
    <PageShell
      title="Resep Elektronik"
      subtitle="Kelola resep dan pantau status pemenuhan obat Anda."
    >
      <div className="space-y-4">
        {mockPrescriptions.map((prescription) => (
          <div key={prescription.name} className="card-surface p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-button bg-secondary/10 text-secondary">
                <prescription.icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <h3 className="font-semibold">{prescription.name}</h3>
                <p className="text-small text-muted-foreground">
                  {prescription.status}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div className="card-surface flex items-center gap-3 p-4">
          <CalendarCheck className="h-5 w-5 text-primary" />
          <p className="text-small text-muted-foreground">
            Jadwal pengingat minum obat akan tersedia setelah fitur aktif.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

