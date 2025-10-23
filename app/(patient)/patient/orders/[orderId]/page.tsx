import { notFound } from "next/navigation";
import { MOCK_ORDERS } from "@/components/features/orders/data";
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

  if (!orderId || !MOCK_ORDERS.some((entry) => entry.id === orderId)) {
    notFound();
  }

  return <OrderDetailPageClient orderId={orderId} />;
}
