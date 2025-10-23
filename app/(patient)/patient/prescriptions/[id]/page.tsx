import { notFound } from "next/navigation";
import { PrescriptionDetailPageClient } from "./prescription-detail-page-client";

type PrescriptionDetailPageParams = {
  id: string;
};

type PrescriptionDetailPageProps = {
  params?: Promise<PrescriptionDetailPageParams>;
};

export default async function PrescriptionDetailPage({
  params,
}: PrescriptionDetailPageProps) {
  const resolvedParams = params ? await params : undefined;
  const id = resolvedParams?.id;

  if (!id) {
    notFound();
  }

  return <PrescriptionDetailPageClient prescriptionId={id} />;
}
