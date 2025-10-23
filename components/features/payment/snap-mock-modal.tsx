"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { AnimatePresence, cubicBezier, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useState } from "react";
import {
  Banknote,
  Check,
  Copy,
  CreditCard,
  QrCode,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { PaymentChannel } from "./mock-data";
import type { PaymentOrder, PaymentStatus } from "./store";
import { PaymentStatusIndicator } from "./payment-status-indicator";

type SnapMockModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PaymentOrder;
  selectedChannel: PaymentChannel;
  onSelectChannel: (channel: PaymentChannel) => void;
  status: PaymentStatus;
  onConfirmPayment: () => void;
  developerOutcomeLabel: string;
};

const channels: Array<{
  id: PaymentChannel;
  label: string;
  description: string;
  icon: typeof Banknote;
}> = [
  {
    id: "virtual_account",
    label: "Virtual Account",
    description: "BNI, BRI, Mandiri, CIMB",
    icon: Banknote,
  },
  {
    id: "qris",
    label: "QRIS",
    description: "Scan di mobile banking",
    icon: QrCode,
  },
  {
    id: "card",
    label: "Kartu Kredit/Debit",
    description: "Visa, MasterCard, JCB",
    icon: CreditCard,
  },
];

const virtualAccountCode = "8808801234567890";
const standardEase = cubicBezier(0.2, 0.8, 0.2, 1);

export function SnapMockModal({
  open,
  onOpenChange,
  order,
  selectedChannel,
  onSelectChannel,
  status,
  onConfirmPayment,
  developerOutcomeLabel,
}: SnapMockModalProps) {

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(virtualAccountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, []);

  const renderChannelContent = () => {
    switch (selectedChannel) {
      case "virtual_account":
        return (
          <div className="space-y-3 rounded-card border border-border/70 bg-muted/30 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Instruksi Virtual Account
            </p>
            <p className="text-muted-foreground">
              Gunakan kode di bawah ini melalui ATM, mobile banking, atau internet banking.
            </p>
            <div className="flex flex-wrap items-center gap-3 rounded-card border border-primary/40 bg-primary/10 p-3">
              <span className="font-mono text-base font-semibold tracking-wide text-primary">
                {virtualAccountCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="tap-target inline-flex items-center gap-2 rounded-button border border-primary/30 bg-card px-3 py-2 text-xs font-semibold text-primary transition duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:bg-primary/10"
                aria-label="Salin kode virtual account"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Disalin
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    Salin kode
                  </>
                )}
              </button>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              <li>Pilih menu pembayaran &gt; Virtual Account Billing.</li>
              <li>Masukkan kode di atas, cek nama penerima & nominal.</li>
              <li>Konfirmasi pembayaran. Status diperbarui otomatis.</li>
            </ul>
          </div>
        );
      case "qris":
        return (
          <div className="space-y-3 rounded-card border border-border/70 bg-muted/30 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Scan QRIS
            </p>
            <p className="text-muted-foreground">
              Gunakan aplikasi mobile banking yang mendukung QRIS untuk menyelesaikan pembayaran.
            </p>
            <div className="flex flex-col items-center gap-3 rounded-card border border-primary/30 bg-card p-4">
              <div className="relative h-44 w-44 overflow-hidden rounded-card border border-border/70 bg-muted">
                <Image
                  src="https://images.unsplash.com/photo-1612810806695-d6d0a1fab3fb?auto=format&fit=crop&w=320&q=80"
                  alt="QR kode mock"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Nominal otomatis terisi {formatCurrency(order.total)}
              </p>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              <li>Buka aplikasi bank, pilih bayar dengan QRIS.</li>
              <li>Scan QR, pastikan nama merchant “PT MedLink Sehat”.</li>
              <li>Konfirmasi. Mohon tunggu 1-2 menit untuk sinkronisasi.</li>
            </ul>
          </div>
        );
      case "card":
        return (
          <div className="space-y-3 rounded-card border border-border/70 bg-muted/30 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Detail Kartu
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Nomor Kartu</span>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="tap-target rounded-input border border-border/70 bg-card px-3 py-2 text-sm shadow-sm transition duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Nomor kartu kredit atau debit"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Nama Pemilik</span>
                <input
                  type="text"
                  placeholder="Nama sesuai kartu"
                  className="tap-target rounded-input border border-border/70 bg-card px-3 py-2 text-sm shadow-sm transition duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Nama pemilik kartu"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Kadaluarsa</span>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="tap-target rounded-input border border-border/70 bg-card px-3 py-2 text-sm shadow-sm transition duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Tanggal kadaluarsa kartu"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">CVV</span>
                <input
                  type="password"
                  placeholder="123"
                  className="tap-target rounded-input border border-border/70 bg-card px-3 py-2 text-sm shadow-sm transition duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Kode CVV"
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Transaksi diproteksi oleh enkripsi 3DS. Tidak ada biaya tambahan.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const confirmLabel =
    status === "pending" ? "Memproses..." : `Konfirmasi ${channels.find((item) => item.id === selectedChannel)?.label ?? "Pembayaran"}`;

  const isConfirmDisabled = status === "pending" || status === "success";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                key="snap-backdrop"
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: standardEase }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                key="snap-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Pembayaran Midtrans Snap Mock"
                className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.16, ease: standardEase }}
              >
                <div className="relative flex w-full max-w-2xl flex-col gap-4 rounded-[24px] border border-border/80 bg-background p-6 shadow-xl">
                  <header className="flex items-start justify-between gap-4">
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-foreground">
                        Midtrans Snap Mock
                      </Dialog.Title>
                      <Dialog.Description className="text-sm text-muted-foreground">
                        Id pesanan <span className="font-semibold text-foreground">{order.id}</span>
                        {" - "}Total {formatCurrency(order.total)}
                      </Dialog.Description>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Developer override: {developerOutcomeLabel}
                      </p>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="tap-target rounded-full border border-border/60 bg-muted/40 p-2 text-muted-foreground transition duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:bg-muted/60"
                        aria-label="Tutup dialog pembayaran"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </Dialog.Close>
                  </header>

                  {status === "pending" || status === "success" || status === "failed" ? (
                    <PaymentStatusIndicator
                      status={status as Extract<PaymentStatus, "pending" | "success" | "failed">}
                    />
                  ) : null}

                  <Tabs.Root
                    value={selectedChannel}
                    onValueChange={(value: string) => onSelectChannel(value as PaymentChannel)}
                    className="flex flex-col gap-4"
                  >
                    <Tabs.List
                      className="flex flex-wrap gap-2 rounded-card border border-border/70 bg-muted/30 p-2"
                      aria-label="Pilih kanal pembayaran"
                    >
                      {channels.map((channel) => {
                        const Icon = channel.icon;
                        const isActive = selectedChannel === channel.id;
                        return (
                          <Tabs.Trigger
                            key={channel.id}
                            value={channel.id}
                            className={cn(
                              "tap-target inline-flex flex-1 min-w-[140px] items-center gap-2 rounded-card border px-3 py-2 text-sm font-semibold transition-all duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              isActive
                                ? "border-primary bg-primary/10 text-primary shadow-sm"
                                : "border-transparent bg-card text-muted-foreground hover:border-primary/30 hover:text-primary",
                            )}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            {channel.label}
                          </Tabs.Trigger>
                        );
                      })}
                    </Tabs.List>
                    <Tabs.Content value={selectedChannel} forceMount className="outline-none">
                      {renderChannelContent()}
                    </Tabs.Content>
                  </Tabs.Root>

                  <footer className="safe-area-bottom flex flex-col gap-3 rounded-card border border-border/70 bg-muted/30 p-4">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span>
                        Pembayaran diproses oleh Midtrans Sandbox. Tidak ada dana yang benar-benar
                        ditarik dari akun Anda.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onConfirmPayment}
                      disabled={isConfirmDisabled}
                      className={cn(
                        "tap-target inline-flex w-full items-center justify-center rounded-button bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isConfirmDisabled
                          ? "cursor-not-allowed opacity-70"
                          : "hover:shadow-lg active:scale-[0.98]",
                      )}
                    >
                      {confirmLabel}
                    </button>
                  </footer>
                </div>
              </motion.div>
            </Dialog.Content>
          </>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
