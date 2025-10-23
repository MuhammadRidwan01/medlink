"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { OrderFilters, type FilterState } from "@/components/features/orders/order-filters";
import { OrderTable } from "@/components/features/orders/order-table";
import { NewOrderDialog } from "@/components/features/orders/new-order-dialog";
import { getCurrentClinicalOrders, subscribeToClinicalOrders, type ClinicalOrder } from "@/components/features/orders/clinical-store";

export default function DoctorOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ClinicalOrder[]>(getCurrentClinicalOrders());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ kind: { lab: true, imaging: true }, status: { pending: true, completed: true } });

  useEffect(() => subscribeToClinicalOrders(setOrders), []);

  const filtered = useMemo(() => {
    return orders.filter((o) => filters.kind[o.kind] && filters.status[o.status]);
  }, [orders, filters]);

  return (
    <PageShell title="Orders" subtitle="Pemeriksaan lab dan imaging" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <OrderFilters value={filters} onChange={setFilters} />
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="tap-target inline-flex items-center justify-center rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
        >
          New Order
        </button>
      </div>
      <OrderTable orders={filtered} onOpen={(id) => router.push(`/doctor/orders/${id}`)} />
      <NewOrderDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={(id) => router.push(`/doctor/orders/${id}`)} />
    </PageShell>
  );
}

