import { PageShell } from "@/components/layout/page-shell";
import { KpiCards } from "@/components/features/doctor/dashboard/kpi-cards";
import { MiniQueue } from "@/components/features/doctor/dashboard/mini-queue";
import { RecentNotes } from "@/components/features/doctor/dashboard/recent-notes";
import { computeKpis, MOCK_NOTES, MOCK_QUEUE } from "@/components/features/doctor/dashboard/mock-data";

const KPI_ITEMS = computeKpis();

export default function DoctorDashboardPage() {
  return (
    <PageShell
      title="Ringkasan Klinik"
      subtitle="Monitor metrik utama, antrean aktif, dan catatan konsultasi terakhir."
    >
      <div className="space-y-6">
        <KpiCards items={KPI_ITEMS} />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)]">
          <RecentNotes notes={MOCK_NOTES} />
          <MiniQueue queue={MOCK_QUEUE} />
        </div>
      </div>
    </PageShell>
  );
}
