"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { OrderCard } from "@/components/features/orders/order-card";
import { ReorderDialog } from "@/components/features/orders/reorder-dialog";
import { MOCK_ORDERS, type OrderSummary } from "@/components/features/orders/data";

const PAGE_SIZE = 2;

export default function OrdersPage() {
  const router = useRouter();
  const [activeReorder, setActiveReorder] = useState<OrderSummary | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sortedOrders = useMemo(
    () =>
      [...MOCK_ORDERS].sort(
        (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
      ),
    [],
  );

  const hasMore = visibleCount < sortedOrders.length;

  return (
    <>
      <PageShell
        title="Riwayat Pesanan"
        subtitle="Pantau pengiriman obat dan perangkat kesehatan Anda."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {sortedOrders.slice(0, visibleCount).map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onView={() => router.push(`/patient/orders/${order.id}`)}
              onReorder={() => setActiveReorder(order)}
            />
          ))}
        </div>
        {hasMore ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() =>
                setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, sortedOrders.length))
              }
              className="tap-target inline-flex items-center justify-center rounded-button border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Muat lebih banyak riwayat pesanan"
            >
              Muat lebih banyak
            </button>
          </div>
        ) : null}
      </PageShell>

      {activeReorder ? (
        <ReorderDialog
          open={Boolean(activeReorder)}
          onOpenChange={(open) => {
            if (!open) {
              setActiveReorder(null);
            }
          }}
          items={activeReorder.items}
          orderId={activeReorder.id}
        />
      ) : null}
    </>
  );
}
