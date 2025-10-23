import { notFound } from "next/navigation";
import { ConsultationFeedbackPageClient } from "./consultation-feedback-page-client";

type ConsultationFeedbackPageParams = {
  id: string;
};

type ConsultationFeedbackPageProps = {
  params?: Promise<ConsultationFeedbackPageParams>;
};

export default async function ConsultationFeedbackPage({
  params,
}: ConsultationFeedbackPageProps) {
  const resolvedParams = params ? await params : undefined;
  const id = resolvedParams?.id;

  if (!id) {
    notFound();
  }

  return <ConsultationFeedbackPageClient consultationId={id} />;
}
