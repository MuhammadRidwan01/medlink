import { PageShell } from "@/components/layout/page-shell";
import { ConsultationWorkspace } from "@/components/features/doctor/consultation-workspace";

type ConsultationDetailPageProps = {
  params: {
    id: string;
  };
};

export default function ConsultationDetailPage({
  params,
}: ConsultationDetailPageProps) {
  const { id } = params;

  return (
    <PageShell
      title={`Konsultasi ${id}`}
      subtitle="Workspace dokter dengan antrian pasien, pesan realtime, dan snapshot klinis."
      className="space-y-6"
    >
      <ConsultationWorkspace consultationId={id} />
    </PageShell>
  );
}
