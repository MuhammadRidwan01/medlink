import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { ConsultationWorkspace } from "@/components/features/doctor/consultation-workspace";

type ConsultationDetailPageParams = {
  id: string;
};

type ConsultationDetailPageProps = {
  params?: Promise<ConsultationDetailPageParams>;
};

export default async function ConsultationDetailPage({
  params,
}: ConsultationDetailPageProps) {
  const resolvedParams = params ? await params : undefined;
  const id = resolvedParams?.id;

  if (!id) {
    notFound();
  }

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
