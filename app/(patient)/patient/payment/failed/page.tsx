"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PaymentStatusIndicator } from "@/components/features/payment/payment-status-indicator";
import { usePaymentStore } from "@/components/features/payment/store";

export default function PaymentFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fallbackId = usePaymentStore((state) => state.activeOrderId);
  const orderId = searchParams.get("orderId") ?? fallbackId;
  useEffect(() => {
    if (!orderId) {
      router.replace("/patient/checkout");
    }
  }, [orderId, router]);

  if (!orderId) return null;

  return (
    <PageShell
      title="Pembayaran tidak berhasil"
      subtitle="Kami belum menerima konfirmasi dari kanal pembayaran."
    >
      <PaymentStatusIndicator
        status="failed"
        detail="Bank penagihan menolak transaksi ini. Anda dapat mencoba ulang atau memilih kanal lain."
        className="border-destructive/30 bg-destructive/5"
      />
      <div className="rounded-card border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>
          Kami menyimpan detail pesanan Anda selama 24 jam. Klik coba lagi untuk membuka kembali
          Snap dan mengulangi pembayaran.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(`/patient/payment/${orderId}`)}
          className="tap-target inline-flex items-center gap-2 rounded-button bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Coba lagi pembayaran
        </button>
        <button
          type="button"
          onClick={() => router.push("/patient/checkout")}
          className="tap-target inline-flex items-center gap-2 rounded-button border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/15"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke checkout
        </button>
      </div>
    </PageShell>
  );
}
