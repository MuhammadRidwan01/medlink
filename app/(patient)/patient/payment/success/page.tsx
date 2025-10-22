"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutDashboard, PillBottle } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PaymentStatusIndicator } from "@/components/features/payment/payment-status-indicator";
import { ReceiptCard } from "@/components/features/payment/receipt-card";
import { usePaymentStore } from "@/components/features/payment/store";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fallbackOrderId = usePaymentStore((state) => state.activeOrderId);
  const orderId = searchParams.get("orderId") ?? fallbackOrderId;
  const order = usePaymentStore((state) => (orderId ? state.orders[orderId] : undefined));
  const resetOrder = usePaymentStore((state) => state.resetOrder);

  useEffect(() => {
    if (!order) {
      router.replace("/patient/checkout");
    }
  }, [order, router]);

  if (!order) {
    return null;
  }

  const handleFinish = () => {
    resetOrder(order.id);
    router.push("/patient/dashboard");
  };

  return (
    <PageShell
      title="Pembayaran Berhasil"
      subtitle="Resep Anda sedang disiapkan. Tim apotek akan mengirimkan order segera."
    >
      <PaymentStatusIndicator
        status="success"
        detail="Resep diteruskan ke apotek mitra. Anda akan menerima notifikasi saat kurir berangkat."
        className="border-success/30 bg-success/5"
      />

      <ReceiptCard order={order} channel={order.paymentChannel} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleFinish}
          className="tap-target inline-flex items-center gap-2 rounded-button bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98]"
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          Kembali ke dashboard
        </button>
        <button
          type="button"
          onClick={() => router.push("/patient/prescriptions")}
          className="tap-target inline-flex items-center gap-2 rounded-button border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/15"
        >
          <PillBottle className="h-4 w-4" aria-hidden="true" />
          Lihat jadwal obat
        </button>
      </div>
    </PageShell>
  );
}
