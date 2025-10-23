import { PageShell } from "@/components/layout/page-shell";
import { DraftsTable } from "@/components/features/prescription/drafts-table";

export default function DoctorPrescriptionsPage() {
  return (
    <PageShell title="Draf Resep" subtitle="Kelola draf resep dan kirim untuk persetujuan" className="space-y-6">
      <DraftsTable />
    </PageShell>
  );
}

