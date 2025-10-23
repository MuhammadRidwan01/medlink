import { PageShell } from "@/components/layout/page-shell";
import { ApprovalQueue } from "@/components/features/prescription/approval-queue";

export default function PharmacyApprovalsPage() {
  return (
    <PageShell title="Antrian Persetujuan" subtitle="Lihat dan proses permintaan persetujuan resep" className="space-y-6">
      <ApprovalQueue />
    </PageShell>
  );
}

