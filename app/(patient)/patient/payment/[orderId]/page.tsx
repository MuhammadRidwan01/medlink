import { notFound } from "next/navigation";
import { PaymentPageClient } from "./payment-page-client";

type PaymentPageParams = {
  orderId: string;
};

type PaymentPageProps = {
  params?: Promise<PaymentPageParams>;
};

export default async function PaymentPage({ params }: PaymentPageProps) {
  const resolvedParams = params ? await params : undefined;
  const orderId = resolvedParams?.orderId;

  if (!orderId) {
    notFound();
  }

  return <PaymentPageClient orderId={orderId} />;
}
