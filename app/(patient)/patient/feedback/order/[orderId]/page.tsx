import { notFound } from "next/navigation";
import { OrderFeedbackPageClient } from "./order-feedback-page-client";

type OrderFeedbackPageParams = {
  orderId: string;
};

type OrderFeedbackPageProps = {
  params?: Promise<OrderFeedbackPageParams>;
};

export default async function OrderFeedbackPage({
  params,
}: OrderFeedbackPageProps) {
  const resolvedParams = params ? await params : undefined;
  const orderId = resolvedParams?.orderId;

  if (!orderId) {
    notFound();
  }

  return <OrderFeedbackPageClient orderId={orderId} />;
}
