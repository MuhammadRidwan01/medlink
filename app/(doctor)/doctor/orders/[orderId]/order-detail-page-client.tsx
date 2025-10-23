'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { PageShell } from "@/components/layout/page-shell";
import {
  getCurrentClinicalOrders,
  subscribeToClinicalOrders,
  updateClinicalOrder,
  type ClinicalOrder,
} from "@/components/features/orders/clinical-store";

const ResultViewer = dynamic(
  () =>
    import("@/components/features/orders/result-viewer").then(
      (m) => m.ResultViewer,
    ),
  { ssr: false },
);

type OrderDetailPageClientProps = {
  orderId: string;
};

export function OrderDetailPageClient({
  orderId,
}: OrderDetailPageClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<ClinicalOrder[]>(
    getCurrentClinicalOrders(),
  );
  const order = useMemo(
    () => orders.find((o) => o.id === orderId),
    [orders, orderId],
  );

  useEffect(() => subscribeToClinicalOrders(setOrders), []);

  useEffect(() => {
    if (!order) {
      const timeout = setTimeout(() => router.replace("/doctor/orders"), 800);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [order, router]);

  if (!order) {
    return (
      <PageShell
        title="Memuat hasil"
        subtitle="Menyiapkan viewer hasil"
        className="space-y-4"
      >
        <div className="h-[420px] animate-pulse rounded-card bg-muted/40" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`Order ${order.id}`}
      subtitle={`${order.kind.toUpperCase()} • ${order.patient}`}
      className="space-y-4"
    >
      <motion.div
        initial={{ x: 16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      >
        <ResultViewer
          order={order}
          onUpdateReport={(next) =>
            updateClinicalOrder(order.id, { report: next })
          }
        />
      </motion.div>
    </PageShell>
  );
}
