'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, MapPin, PackageCheck, Truck } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { MOCK_ORDERS } from "@/components/features/orders/data";
import { StatusBadge } from "@/components/features/orders/status-badge";
import { CourierTimeline } from "@/components/features/orders/courier-timeline";
import { DeliveryAddressCard } from "@/components/features/orders/delivery-address-card";
import { OrderItems } from "@/components/features/orders/order-items";
import { ReorderDialog } from "@/components/features/orders/reorder-dialog";
import { formatCurrency } from "@/lib/format";
import { FeedbackPrompt } from "@/components/features/feedback/feedback-prompt";

type OrderDetailPageClientProps = {
  orderId: string;
};

export function OrderDetailPageClient({ orderId }: OrderDetailPageClientProps) {
  const router = useRouter();
  const [showReorder, setShowReorder] = useState(false);

  const order = useMemo(
    () => MOCK_ORDERS.find((entry) => entry.id === orderId),
    [orderId],
  );

  if (!order) {
    return (
      <PageShell
        title="Pesanan tidak ditemukan"
        subtitle="Pesanan mungkin telah dihapus atau tidak tersedia."
        className="space-y-4"
      >
        <button
          type="button"
          onClick={() => router.replace("/patient/orders")}
          className="tap-target inline-flex items-center gap-2 rounded-button border border-border/60 bg-muted/30 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke daftar pesanan
        </button>
      </PageShell>
    );
  }

  return (
    <>
      <PageShell
        title={`Pesanan ${order.id}`}
        subtitle="Detail pengiriman, status, dan riwayat perjalanan pesanan."
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="tap-target inline-flex items-center gap-2 rounded-button border border-border/60 bg-muted/30 px-3 py-2 text-xs font-semibold text-muted-foreground transition duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali
          </button>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="space-y-6">
            <section className="rounded-card border border-border/60 bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status terbaru
                  </p>
                  <StatusBadge status={order.status} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Total pembayaran
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Metode
                  </p>
                  <p className="font-semibold text-foreground">
                    {order.paymentChannel === "cash_on_delivery"
                      ? "Bayar di tempat"
                      : order.paymentChannel.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Tanggal pemesanan
                  </p>
                  <p>
                    {new Date(order.placedAt).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </section>

            <CourierTimeline
              entries={order.timeline}
              currentStatus={order.status}
            />

            {order.courier && order.status === "shipped" ? (
              <section className="space-y-3 rounded-card border border-border/60 bg-card p-4 shadow-sm">
                <header className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
                    <h2 className="text-sm font-semibold text-foreground">
                      Pelacakan kurir
                    </h2>
                  </div>
                  <span className="rounded-badge border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {order.courier.provider}
                  </span>
                </header>
                <div className="flex flex-col gap-3 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      Resi {order.courier.trackingNumber}
                    </p>
                    <p>Hub saat ini: {order.courier.currentHub}</p>
                    <p>Estimasi tiba: {order.courier.eta}</p>
                  </div>
                  <button
                    type="button"
                    className="tap-target inline-flex items-center gap-2 rounded-button border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15"
                  >
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    Lacak paket
                  </button>
                </div>
                <div className="relative h-48 w-full overflow-hidden rounded-card border border-border/60">
                  <Image
                    src={order.courier.mapPreviewUrl}
                    alt="Peta lokasi kurir"
                    fill
                    className="object-cover"
                  />
                </div>
              </section>
            ) : null}

            <OrderItems items={order.items} />
          </div>

          <aside className="space-y-6">
            <DeliveryAddressCard address={order.address} />

            <section className="space-y-3 rounded-card border border-border/60 bg-card p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">
                Ringkasan Pembayaran
              </h2>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pengiriman</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(order.shipping)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Diskon</span>
                  <span className="font-semibold text-success">
                    - {formatCurrency(order.discount)}
                  </span>
                </div>
              </div>
              <div className="border-t border-border/60 pt-2 text-sm font-semibold text-foreground">
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReorder(true)}
                className="tap-target inline-flex w-full items-center justify-center gap-2 rounded-button bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98]"
              >
                <PackageCheck className="h-4 w-4" aria-hidden="true" />
                Reorder pesanan ini
              </button>
            </section>
          </aside>
        </div>
      </PageShell>

      <ReorderDialog
        open={showReorder}
        onOpenChange={setShowReorder}
        items={order.items}
        orderId={order.id}
      />
      {order.status === "delivered" ? (
        <FeedbackPrompt kind="order" id={order.id} />
      ) : null}
    </>
  );
}
