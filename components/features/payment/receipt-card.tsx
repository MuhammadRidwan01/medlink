"use client";

import { CalendarClock, Download, MapPinHouse, Receipt, SmartphoneNfc } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { PaymentOrder } from "./store";
import type { PaymentChannel } from "./mock-data";

type ReceiptCardProps = {
  order: PaymentOrder;
  channel: PaymentChannel | undefined;
  onDownload?: () => void;
};

const channelLabels: Record<PaymentChannel, string> = {
  virtual_account: "Virtual Account",
  qris: "QRIS",
  card: "Kartu Kredit/Debit",
};

export function ReceiptCard({ order, channel, onDownload }: ReceiptCardProps) {
  return (
    <section className="space-y-6 rounded-card border border-border/70 bg-card p-6 shadow-lg">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Bukti Pembayaran
          </p>
          <h1 className="text-lg font-semibold text-foreground">MedLink Checkout</h1>
          <p className="text-sm text-muted-foreground">
            Pesanan {order.id} •{" "}
            {new Date(order.createdAt).toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={onDownload}
          className="tap-target inline-flex items-center gap-2 rounded-button border border-border/60 bg-muted/30 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted/50"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Unduh PDF
        </button>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-card border border-border/60 bg-muted/30 p-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Receipt className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="font-semibold text-foreground">Ringkasan Pembelian</span>
          </div>
          <dl className="space-y-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">
                  {item.name} &times; {item.quantity}
                </dt>
                <dd className="font-semibold text-foreground">
                  {formatCurrency(item.price * item.quantity)}
                </dd>
              </div>
            ))}
          </dl>
          <div className="h-px bg-border/70" />
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-semibold text-foreground">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Diskon</span>
            <span className="font-semibold text-success">- {formatCurrency(order.discount)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Pengiriman</span>
            <span className="font-semibold text-foreground">{formatCurrency(order.shipping)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border/70 pt-2 text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        <div className="space-y-3 rounded-card border border-border/60 bg-muted/20 p-4 text-sm">
          <div className="flex items-start gap-3">
            <MapPinHouse className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">Dikirim ke</p>
              <p className="text-muted-foreground">{order.contact.name}</p>
              <p className="text-muted-foreground">
                {order.contact.email} • {order.contact.phone}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">Estimasi pengiriman</p>
              <p className="text-muted-foreground">
                Diproses dalam 30 menit, dikirim sesuai opsi pengiriman yang dipilih.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <SmartphoneNfc className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">Kanal pembayaran</p>
              <p className="text-muted-foreground">
                {channel ? channelLabels[channel] : "Belum dipilih"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
