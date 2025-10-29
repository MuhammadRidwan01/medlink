"use client";

import { Building2, Home, NotebookPen, Phone, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { Address, DeliveryOption } from "./mock-data";

type CheckoutFormProps = {
  addresses: Address[];
  selectedAddressId: string;
  onSelectAddress: (addressId: string) => void;
  onAddAddress?: () => void;
  deliveryOptions: DeliveryOption[];
  selectedDeliveryOptionId: string;
  onSelectDeliveryOption: (deliveryOptionId: string) => void;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  onContactChange: (field: "name" | "phone" | "email", value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
};

const iconMap: Record<string, typeof Home> = {
  home: Home,
  office: Building2,
};

export function CheckoutForm({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddAddress,
  deliveryOptions,
  selectedDeliveryOptionId,
  onSelectDeliveryOption,
  contactName,
  contactPhone,
  contactEmail,
  onContactChange,
  notes,
  onNotesChange,
}: CheckoutFormProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-h3 text-foreground">Alamat Pengiriman</h2>
            <p className="text-small text-muted-foreground">
              Pilih lokasi pengantaran obat dan perangkat.
            </p>
          </div>
          {onAddAddress ? (
            <button
              type="button"
              onClick={onAddAddress}
              className="tap-target rounded-button border border-border/70 bg-muted/20 px-3 py-2 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-primary/5"
            >
              Tambah alamat
            </button>
          ) : null}
        </header>
        <div className="grid gap-3 md:grid-cols-2">
          {addresses.map((address) => {
            const Icon =
              iconMap[address.id] ??
              (address.label.toLowerCase().includes("kantor") ? Building2 : Home);
            const isActive = address.id === selectedAddressId;

            return (
              <button
                key={address.id}
                type="button"
                onClick={() => onSelectAddress(address.id)}
                className={cn(
                  "tap-target flex h-full flex-col rounded-card border bg-card p-4 text-left shadow-sm transition-all duration-fast ease-out",
                  isActive
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border/70 hover:border-primary/30 hover:shadow-md",
                )}
                aria-pressed={isActive}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-button border text-primary",
                      isActive ? "border-primary bg-primary/15" : "border-border/60 bg-muted/30",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{address.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {address.recipient} • {address.phone}
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p>{address.addressLine}</p>
                  <p>
                    {address.city} • {address.postalCode}
                  </p>
                  {address.notes ? <p className="text-xs">{address.notes}</p> : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <header>
          <h2 className="text-h3 text-foreground">Kontak Penerima</h2>
          <p className="text-small text-muted-foreground">
            Pastikan nomor dapat dihubungi oleh kurir medis kami.
          </p>
        </header>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 rounded-card border border-border/70 bg-card px-4 py-3 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nama Penerima
            </span>
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
              <input
                type="text"
                value={contactName}
                onChange={(event) => onContactChange("name", event.target.value)}
                className="tap-target flex-1 bg-transparent text-sm outline-none"
                placeholder="Nama lengkap"
                aria-label="Nama penerima"
                required
              />
            </div>
          </label>
          <label className="flex flex-col gap-1 rounded-card border border-border/70 bg-card px-4 py-3 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nomor Telepon
            </span>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
              <input
                type="tel"
                value={contactPhone}
                onChange={(event) => onContactChange("phone", event.target.value)}
                className="tap-target flex-1 bg-transparent text-sm outline-none"
                placeholder="+62 ..."
                aria-label="Nomor telepon"
                required
              />
            </div>
          </label>
        </div>
        <label className="flex flex-col gap-1 rounded-card border border-border/70 bg-card px-4 py-3 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Email Notifikasi
          </span>
          <div className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-primary" aria-hidden="true" />
            <input
              type="email"
              value={contactEmail}
              onChange={(event) => onContactChange("email", event.target.value)}
              className="tap-target flex-1 bg-transparent text-sm outline-none"
              placeholder="nama@email.com"
              aria-label="Email notifikasi"
              required
            />
          </div>
        </label>
      </section>

      <section className="space-y-4">
        <header>
          <h2 className="text-h3 text-foreground">Pengiriman</h2>
          <p className="text-small text-muted-foreground">
            Pilih kecepatan pengiriman sesuai kebutuhan konsultasi Anda.
          </p>
        </header>
        <div className="grid gap-3 md:grid-cols-3">
          {deliveryOptions.map((option) => {
            const isActive = option.id === selectedDeliveryOptionId;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectDeliveryOption(option.id)}
                className={cn(
                  "tap-target flex h-full flex-col rounded-card border bg-card p-4 text-left shadow-sm transition-all duration-fast ease-out",
                  isActive
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border/70 hover:border-primary/30 hover:shadow-md",
                )}
                aria-pressed={isActive}
              >
                <p className="text-sm font-semibold text-foreground">{option.label}</p>
                <p className="mt-1 text-xs text-primary">{option.eta}</p>
                <p className="mt-2 text-xs text-muted-foreground">{option.description}</p>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {formatCurrency(option.cost)}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-h3 text-foreground">Catatan Kurir</h2>
        <label className="flex flex-col gap-2 rounded-card border border-border/70 bg-card px-4 py-3 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Instruksi tambahan (opsional)
          </span>
          <textarea
            rows={3}
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            className="tap-target w-full resize-none rounded-card bg-muted/20 px-3 py-2 text-sm text-foreground outline-none"
            placeholder="Contoh: harap hubungi satpam sebelum naik, atau simpan di kotak pendingin."
            aria-label="Catatan tambahan untuk kurir"
          />
        </label>
      </section>
    </div>
  );
}
