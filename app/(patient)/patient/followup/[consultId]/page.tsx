import { notFound } from "next/navigation";
import { FollowUpBookingPageClient } from "./follow-up-booking-page-client";

type FollowUpBookingPageParams = {
  consultId: string;
};

type FollowUpBookingPageProps = {
  params?: Promise<FollowUpBookingPageParams>;
};

export default async function FollowUpBookingPage({
  params,
}: FollowUpBookingPageProps) {
  const resolvedParams = params ? await params : undefined;
  const consultId = resolvedParams?.consultId;

  if (!consultId) {
    notFound();
  }

  return <FollowUpBookingPageClient consultId={consultId} />;
}
