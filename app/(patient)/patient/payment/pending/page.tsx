"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, CreditCard } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PaymentStatusIndicator } from "@/components/features/payment/payment-status-indicator";
import { usePaymentStore } from "@/components/features/payment/store";

export default function PaymentPendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fallbackId = usePaymentStore((state) => state.activeOrderId);
  const orderId = searchParams.get("orderId") ?? fallbackId;
  const order = usePaymentStore((state) => (orderId ? state.orders[orderId] : undefined));

  useEffect(() => {
    if (!orderId) {
      router.replace("/patient/checkout");
    }
  }, [orderId, router]);

  useEffect(() => {
    if (order?.status === "success") {
      router.replace(`/patient/payment/success?orderId=${order.id}`);
    }
    if (order?.status === "failed") {
      router.replace(`/patient/payment/failed?orderId=${order.id}`);
    }
  }, [order?.status, order?.id, router]);

  if (!order || !orderId) {
    return null;
  }

  return (
    <PageShell
      title="Menunggu konfirmasi pembayaran"
      subtitle="Kami memonitor status pembayaran Anda secara real-time."
    >
      <PaymentStatusIndicator
        status="pending"
        detail="Bank mitra sedang memproses transaksi Anda. Halaman ini akan otomatis diperbarui."
      />
      <div className="rounded-card border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>
          Jika Anda sudah menyelesaikan pembayaran tetapi status belum berubah, buka kembali Snap
          untuk memicu pengecekan status.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(`/patient/payment/${orderId}`)}
          className="tap-target inline-flex items-center gap-2 rounded-button bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98]"
        >
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          Buka Snap lagi
        </button>
        <button
          type="button"
          onClick={() => router.push("/patient/dashboard")}
          className="tap-target inline-flex items-center gap-2 rounded-button border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/15"
        >
          <Clock className="h-4 w-4" aria-hidden="true" />
          Pantau dari dashboard
        </button>
      </div>
    </PageShell>
  );
}
