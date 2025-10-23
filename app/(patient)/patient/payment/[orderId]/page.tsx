"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, CreditCard, RotateCcw } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { SnapMockModal } from "@/components/features/payment/snap-mock-modal";
import { OrderSummary } from "@/components/features/payment/order-summary";
import { PaymentStatusIndicator } from "@/components/features/payment/payment-status-indicator";
import { TestSwitches } from "@/components/features/payment/test-switches";
import { WebhookSimulator } from "@/components/features/payment/webhook-simulator";
import { PaymentToastCenter } from "@/components/features/payment/toast-center";
import { hydrateFromUrl } from "@/components/features/payment/payment-state-store";
import { usePaymentStore, type PaymentOutcome } from "@/components/features/payment/store";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/components/ui/use-toast";
import { BASE_DISCOUNT, DELIVERY_OPTIONS, type PaymentChannel } from "@/components/features/payment/mock-data";

type PaymentPageProps = {
  params: {
    orderId: string;
  };
};

const outcomeLabel: Record<PaymentOutcome, string> = {
  success: "Success override",
  failed: "Force fail override",
  pending: "Keep pending override",
};

export default function PaymentPage({ params }: PaymentPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const order = usePaymentStore((state) => state.orders[params.orderId]);
  const setActiveOrder = usePaymentStore((state) => state.setActiveOrder);
  const setOrderStatus = usePaymentStore((state) => state.setOrderStatus);
  const setPaymentChannel = usePaymentStore((state) => state.setPaymentChannel);
  const markRetryUsed = usePaymentStore((state) => state.markRetryUsed);
  const developerOutcome = usePaymentStore((state) => state.developerOutcome);
  const setDeveloperOutcome = usePaymentStore((state) => state.setDeveloperOutcome);
  const deliveryOptions = usePaymentStore((state) => state.deliveryOptions);
  const [modalOpen, setModalOpen] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>("virtual_account");
  const processingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActiveOrder(params.orderId);
    hydrateFromUrl(params.orderId);
    return () => {
      if (processingTimeout.current) {
        clearTimeout(processingTimeout.current);
      }
    };
  }, [params.orderId, setActiveOrder]);

  useEffect(() => {
    if (order?.paymentChannel) {
      setSelectedChannel(order.paymentChannel);
    }
  }, [order?.paymentChannel]);

  useEffect(() => {
    if (!order) return;
    if (order.status === "success") {
      toast({
        title: "Pembayaran berhasil",
        description: "Resep sedang disiapkan oleh apotek mitra.",
      });
      router.replace(`/patient/payment/success?orderId=${order.id}`);
    }
  }, [order, router, toast]);

  useEffect(() => {
    if (!order) {
      const fallback = setTimeout(() => {
        router.replace("/patient/checkout");
      }, 1800);
      return () => clearTimeout(fallback);
    }
    return undefined;
  }, [order, router]);

  const subtotal = useMemo(() => order?.subtotal ?? 0, [order]);
  const shipping = useMemo(() => order?.shipping ?? 0, [order]);
  const discount = useMemo(() => order?.discount ?? BASE_DISCOUNT, [order]);
  const total = useMemo(() => order?.total ?? subtotal + shipping - discount, [order, subtotal, shipping, discount]);
  const selectedDelivery = useMemo(
    () => deliveryOptions.find((option) => option.id === order?.deliveryOptionId) ?? DELIVERY_OPTIONS[0],
    [deliveryOptions, order?.deliveryOptionId],
  );

  const handleOutcome = (outcome: PaymentOutcome) => {
    if (!order) return;
    if (processingTimeout.current) {
      clearTimeout(processingTimeout.current);
    }
    setOrderStatus(order.id, "pending");
    const duration = Math.random() * 1000 + 1500;
    processingTimeout.current = setTimeout(() => {
      if (outcome === "success") {
        setOrderStatus(order.id, "success");
      } else if (outcome === "failed") {
        setOrderStatus(order.id, "failed");
      } else {
        setOrderStatus(order.id, "pending");
      }
    }, duration);
  };

  const onConfirmPayment = () => {
    if (!order) return;
    setPaymentChannel(order.id, selectedChannel);
    handleOutcome(developerOutcome);
  };

  const handleRetry = () => {
    if (!order) return;
    handleOutcome(developerOutcome);
  };

  const handleAlreadyPaid = () => {
    if (!order) return;
    if (!order.hasRetried) {
      markRetryUsed(order.id);
      handleOutcome(developerOutcome === "pending" ? "success" : developerOutcome);
    }
  };

  const onModalChange = (open: boolean) => {
    setModalOpen(open);
    if (!open && order) {
      if (order.status === "pending") {
        router.push(`/patient/payment/pending?orderId=${order.id}`);
      }
    }
  };

  if (!order) {
    return (
      <PageShell
        title="Memuat pembayaran"
        subtitle="Kami tidak menemukan pesanan. Mengarahkan ke checkout..."
      >
        <div className="card-surface p-4">
          <PaymentStatusIndicator status="pending" detail="Menyiapkan ulang sesi checkout Anda." />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Selesaikan Pembayaran"
      subtitle="Snap Midtrans siap. Pilih kanal dan konfirmasi pembayaran Anda."
    >
      <SnapMockModal
        open={modalOpen}
        onOpenChange={onModalChange}
        order={order}
        selectedChannel={selectedChannel}
        onSelectChannel={(channel) => {
          setSelectedChannel(channel);
          setPaymentChannel(order.id, channel);
        }}
        status={order.status}
        onConfirmPayment={onConfirmPayment}
        developerOutcomeLabel={outcomeLabel[developerOutcome]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="space-y-4">
          <div className="rounded-card border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  ID Pesanan
                </p>
                <p className="text-sm font-semibold text-foreground">{order.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="tap-target inline-flex items-center gap-2 rounded-button border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15"
              >
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                Buka Lagi Snap
              </button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Total yang harus dibayar{" "}
              <span className="font-semibold text-foreground">{formatCurrency(total)}</span>. Status
              saat ini:{" "}
              <span className="font-semibold text-foreground">{order.status.toUpperCase()}</span>.
            </p>
          </div>

          {order.status === "failed" ? (
            <div className="animate-in fade-in rounded-card border border-destructive/40 bg-destructive/10 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-destructive">Pembayaran ditolak</p>
                  <p className="text-muted-foreground">
                    Bank menolak transaksi. Pastikan saldo mencukupi atau coba kanal lain.
                  </p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="tap-target inline-flex items-center gap-2 rounded-button bg-gradient-to-r from-primary to-primary-dark px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:shadow-lg active:scale-[0.98]"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Coba lagi
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {order.status === "pending" ? (
            <PaymentStatusIndicator
              status="pending"
              detail="Menunggu konfirmasi dari bank. Anda dapat menutup Snap sementara."
            />
          ) : null}

          {order.status === "pending" && !order.hasRetried ? (
            <div className="rounded-card border border-border/70 bg-muted/30 p-4 text-sm">
              <p className="font-semibold text-foreground">Sudah melakukan pembayaran?</p>
              <p className="text-muted-foreground">
                Kami dapat memeriksa ulang status satu kali lagi jika Anda sudah menyelesaikan
                pembayaran.
              </p>
              <button
                type="button"
                onClick={handleAlreadyPaid}
                className="tap-target mt-3 inline-flex items-center gap-2 rounded-button border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15"
              >
                Saya sudah bayar
              </button>
            </div>
          ) : null}

          <TestSwitches
            outcome={developerOutcome}
            onOutcomeChange={setDeveloperOutcome}
          />

          <WebhookSimulator orderId={order.id} />
          <PaymentToastCenter />
        </section>

        <aside className="space-y-4">
          <OrderSummary
            items={order.items}
            subtotal={subtotal}
            shipping={shipping}
            discount={discount}
            total={total}
            selectedDelivery={selectedDelivery}
          />
          <div className="rounded-card border border-border/70 bg-muted/30 p-4 text-xs text-muted-foreground">
            <div className="flex items-start gap-3">
              <ArrowLeft className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
              <p>
                Jika ingin mengubah isi keranjang, batalkan pembayaran dan kembali ke halaman
                checkout.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
