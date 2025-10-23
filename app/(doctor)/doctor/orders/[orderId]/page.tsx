import { notFound } from "next/navigation";
import { OrderDetailPageClient } from "./order-detail-page-client";

type OrderDetailPageParams = {
  orderId: string;
};

type OrderDetailPageProps = {
  params?: Promise<OrderDetailPageParams>;
};

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const resolvedParams = params ? await params : undefined;
  const orderId = resolvedParams?.orderId;

  if (!orderId) {
    notFound();
  }

  return <OrderDetailPageClient orderId={orderId} />;
}
