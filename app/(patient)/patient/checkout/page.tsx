"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { PageShell } from "@/components/layout/page-shell";
import { CheckoutForm } from "@/components/features/payment/checkout-form";
import { OrderSummary } from "@/components/features/payment/order-summary";
import { TestSwitches } from "@/components/features/payment/test-switches";
import { BASE_DISCOUNT, DELIVERY_OPTIONS } from "@/components/features/payment/mock-data";
import { usePaymentStore } from "@/components/features/payment/store";
import type { Address } from "@/components/features/payment/mock-data";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/format";
import { useProfileStore } from "@/components/features/profile/store";

export default function CheckoutPage() {
  const router = useRouter();
  const addresses = usePaymentStore((state) => state.addresses);
  const deliveryOptions = usePaymentStore((state) => state.deliveryOptions);
  const items = usePaymentStore((state) => state.checkoutItems);
  const profile = useProfileStore((s) => s.profile);
  const fetchProfileSnapshot = useProfileStore((s) => s.fetchSnapshot);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const createOrder = usePaymentStore((state) => state.createOrder);
  const setActiveOrder = usePaymentStore((state) => state.setActiveOrder);
  const developerOutcome = usePaymentStore((state) => state.developerOutcome);
  const setDeveloperOutcome = usePaymentStore((state) => state.setDeveloperOutcome);
  const { toast } = useToast();

  // Ensure checkout reflects latest data from patient/profile
  useEffect(() => {
    // hydrate snapshot on mount similar to patient/profile page
    void fetchProfileSnapshot().catch(() => {
      // non-fatal for checkout; form can still be filled manually
    });
  }, [fetchProfileSnapshot]);

  // Build addresses prioritizing profile data, then any saved/mock addresses
  const profileAddresses = useMemo(() => {
    const list: Array<{
      id: string;
      label: string;
      recipient: string;
      phone: string;
      addressLine: string;
      city: string;
      postalCode: string;
      notes?: string;
      isDefault?: boolean;
    }> = [];
    if (profile?.address) {
      list.push({
        id: "profile-home",
        label: "Rumah (Profil)",
        recipient: profile.name ?? "",
        phone: profile.phone ?? "",
        addressLine: profile.address,
        city: "",
        postalCode: "",
        notes: "",
        isDefault: true,
      });
    }
    if (profile?.officeAddress) {
      list.push({
        id: "profile-office",
        label: "Kantor (Profil)",
        recipient: profile?.name ?? "",
        phone: profile?.phone ?? "",
        addressLine: profile.officeAddress,
        city: "",
        postalCode: "",
        notes: "",
        isDefault: list.length === 0,
      });
    }
    return list;
  }, [profile]);

  // Local addresses user adds during checkout session
  const [extraAddresses, setExtraAddresses] = useState<Address[]>([]);

  const addressesToUse = useMemo(() => {
    // Use profile-derived addresses first, then any user-added addresses
    return [...profileAddresses, ...extraAddresses];
  }, [profileAddresses, extraAddresses]);

  const defaultAddress = useMemo(
    () => addressesToUse.find((address) => (address as any).isDefault) ?? addressesToUse[0],
    [addressesToUse],
  );
  const defaultDelivery = useMemo(
    () => deliveryOptions[0] ?? DELIVERY_OPTIONS[0],
    [deliveryOptions],
  );

  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id ?? "");
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(defaultDelivery?.id ?? "");
  const [contactName, setContactName] = useState(defaultAddress?.recipient || profile?.name || "");
  const [contactPhone, setContactPhone] = useState(defaultAddress?.phone || profile?.phone || "");
  const [contactEmail, setContactEmail] = useState(profile?.email || "");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Add-address form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState<{
    label: string;
    recipient: string;
    phone: string;
    addressLine: string;
    city: string;
    postalCode: string;
    notes: string;
  }>({
    label: "",
    recipient: profile?.name ?? "",
    phone: profile?.phone ?? "",
    addressLine: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const handleAddAddress = () => setShowAddForm(true);
  const handleSaveAddress = async () => {
    if (!newAddress.label || !newAddress.addressLine) return;
    const id = `extra-${Date.now()}`;
    const addr: Address = {
      id,
      label: newAddress.label,
      recipient: newAddress.recipient || profile?.name || "",
      phone: newAddress.phone || profile?.phone || "",
      addressLine: newAddress.addressLine,
      city: newAddress.city,
      postalCode: newAddress.postalCode,
      notes: newAddress.notes,
      isDefault: addressesToUse.length === 0,
    };
    setExtraAddresses((list) => [addr, ...list]);
    setSelectedAddressId(id);
    setShowAddForm(false);
    // Persist to Supabase as primary profile address and contact
    try {
      await updateProfile({
        address: addr.addressLine,
        phone: addr.phone,
        name: addr.recipient,
      });
    } catch (_) {
      // ignore errors here; user can still proceed with local address
    }
    // reset minimal fields but keep name/phone from profile for convenience
    setNewAddress((prev) => ({ ...prev, label: "", addressLine: "", city: "", postalCode: "", notes: "" }));
  };

  useEffect(() => {
    if (!selectedAddressId && defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
      setContactName(defaultAddress.recipient || profile?.name || "");
      setContactPhone(defaultAddress.phone || profile?.phone || "");
      if (!contactEmail && profile?.email) setContactEmail(profile.email);
    }
  }, [defaultAddress, selectedAddressId, profile?.name, profile?.phone, profile?.email, contactEmail]);

  useEffect(() => {
    const selected = addressesToUse.find((a) => a.id === selectedAddressId);
    if (selected) {
      setContactName(selected.recipient || profile?.name || "");
      setContactPhone(selected.phone || profile?.phone || "");
      if (!contactEmail && profile?.email) setContactEmail(profile.email);
    }
  }, [selectedAddressId, addressesToUse, profile?.name, profile?.phone, profile?.email, contactEmail]);

  useEffect(() => {
    if (!selectedDeliveryId && defaultDelivery) {
      setSelectedDeliveryId(defaultDelivery.id);
    }
  }, [defaultDelivery, selectedDeliveryId]);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );
  const selectedDelivery = deliveryOptions.find((option) => option.id === selectedDeliveryId);
  const shipping = selectedDelivery?.cost ?? defaultDelivery?.cost ?? 0;
  const discount = BASE_DISCOUNT;
  const total = Math.max(subtotal + shipping - discount, 0);

  const isFormValid =
    Boolean(selectedAddressId) &&
    Boolean(selectedDeliveryId) &&
    contactName.trim().length > 2 &&
    contactPhone.trim().length >= 8 &&
    contactEmail.includes("@");

  const handlePay = async () => {
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    try {
      const { orderId } = await createOrder({
        addressId: selectedAddressId,
        deliveryOptionId: selectedDeliveryId,
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        notes,
      });
      setActiveOrder(orderId);
      router.push(`/patient/payment/${orderId}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Checkout gagal. Silakan coba beberapa saat lagi.";
      toast({
        title: "Checkout gagal",
        description: message,
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title="Checkout MedLink"
      subtitle="Konfirmasi alamat, kontak, dan metode pembayaran Anda."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <CheckoutForm
            addresses={addressesToUse}
            selectedAddressId={selectedAddressId}
            onSelectAddress={setSelectedAddressId}
            onAddAddress={handleAddAddress}
            deliveryOptions={deliveryOptions}
            selectedDeliveryOptionId={selectedDeliveryId}
            onSelectDeliveryOption={setSelectedDeliveryId}
            contactName={contactName}
            contactPhone={contactPhone}
            contactEmail={contactEmail}
            onContactChange={(field, value) => {
              if (field === "name") setContactName(value);
              if (field === "phone") setContactPhone(value);
              if (field === "email") setContactEmail(value);
            }}
            notes={notes}
            onNotesChange={setNotes}
          />

          <Dialog.Root open={showAddForm} onOpenChange={setShowAddForm}>
            {showAddForm ? (
              <>
                <Dialog.Overlay asChild>
                  <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />
                </Dialog.Overlay>
                <Dialog.Content asChild>
                  <div role="dialog" aria-modal="true" aria-label="Tambah alamat baru" className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
                    <div className="relative w-full max-w-xl rounded-[20px] border border-border/80 bg-background p-6 shadow-xl">
                      <header className="mb-3 flex items-start justify-between gap-4">
                        <div>
                          <Dialog.Title className="text-base font-semibold text-foreground">Tambah alamat baru</Dialog.Title>
                          <Dialog.Description className="text-sm text-muted-foreground">Isi detail alamat untuk pengiriman.</Dialog.Description>
                        </div>
                        <Dialog.Close asChild>
                          <button type="button" onClick={() => setShowAddForm(false)} className="tap-target rounded-full border border-border/60 bg-muted/40 p-2 text-muted-foreground" aria-label="Tutup dialog">×</button>
                        </Dialog.Close>
                      </header>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="flex flex-col gap-1 text-sm">
                          <span className="text-xs text-muted-foreground">Label</span>
                          <input className="rounded-card border border-border/60 bg-muted/20 px-3 py-2 outline-none focus:border-primary" placeholder="Rumah/Kantor/Orang tua" value={newAddress.label} onChange={(e) => setNewAddress((v) => ({ ...v, label: e.target.value }))} />
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                          <span className="text-xs text-muted-foreground">Nama Penerima</span>
                          <input className="rounded-card border border-border/60 bg-muted/20 px-3 py-2 outline-none focus:border-primary" placeholder="Nama lengkap" value={newAddress.recipient} onChange={(e) => setNewAddress((v) => ({ ...v, recipient: e.target.value }))} />
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                          <span className="text-xs text-muted-foreground">Nomor Telepon</span>
                          <input className="rounded-card border border-border/60 bg-muted/20 px-3 py-2 outline-none focus:border-primary" placeholder="+62 ..." value={newAddress.phone} onChange={(e) => setNewAddress((v) => ({ ...v, phone: e.target.value }))} />
                        </label>
                        <div />
                        <label className="flex flex-col gap-1 text-sm md:col-span-2">
                          <span className="text-xs text-muted-foreground">Alamat</span>
                          <input className="rounded-card border border-border/60 bg-muted/20 px-3 py-2 outline-none focus:border-primary" placeholder="Jalan, nomor, RT/RW, kelurahan" value={newAddress.addressLine} onChange={(e) => setNewAddress((v) => ({ ...v, addressLine: e.target.value }))} />
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                          <span className="text-xs text-muted-foreground">Kota/Kabupaten</span>
                          <input className="rounded-card border border-border/60 bg-muted/20 px-3 py-2 outline-none focus:border-primary" value={newAddress.city} onChange={(e) => setNewAddress((v) => ({ ...v, city: e.target.value }))} />
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                          <span className="text-xs text-muted-foreground">Kode Pos</span>
                          <input className="rounded-card border border-border/60 bg-muted/20 px-3 py-2 outline-none focus:border-primary" value={newAddress.postalCode} onChange={(e) => setNewAddress((v) => ({ ...v, postalCode: e.target.value }))} />
                        </label>
                        <label className="flex flex-col gap-1 text-sm md:col-span-2">
                          <span className="text-xs text-muted-foreground">Catatan (opsional)</span>
                          <input className="rounded-card border border-border/60 bg-muted/20 px-3 py-2 outline-none focus:border-primary" value={newAddress.notes} onChange={(e) => setNewAddress((v) => ({ ...v, notes: e.target.value }))} />
                        </label>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button type="button" onClick={handleSaveAddress} className="rounded-button bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90">Simpan alamat</button>
                        <Dialog.Close asChild>
                          <button type="button" onClick={() => setShowAddForm(false)} className="rounded-button border border-border/70 bg-muted/20 px-3 py-2 text-xs font-medium text-foreground">Batal</button>
                        </Dialog.Close>
                      </div>
                    </div>
                  </div>
                </Dialog.Content>
              </>
            ) : null}
          </Dialog.Root>

          <TestSwitches
            outcome={developerOutcome}
            onOutcomeChange={setDeveloperOutcome}
            className="hidden lg:block"
          />
        </div>

        <div className="space-y-4">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            shipping={shipping}
            discount={discount}
            total={total}
            selectedDelivery={selectedDelivery}
          />
          <button
            type="button"
            onClick={handlePay}
            disabled={!isFormValid || submitting}
            className="tap-target hidden w-full items-center justify-center gap-2 rounded-button bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-fast ease-out xl:inline-flex"
          >
            Bayar {formatCurrency(total)}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-6 lg:hidden">
        <TestSwitches
          outcome={developerOutcome}
          onOutcomeChange={setDeveloperOutcome}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/95 px-4 py-4 shadow-[0_-12px_30px_-20px_rgba(0,0,0,0.35)] backdrop-blur md:hidden safe-area-bottom">
        <button
          type="button"
          onClick={handlePay}
          disabled={!isFormValid || submitting}
          className="tap-target flex w-full items-center justify-center gap-2 rounded-button bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-fast ease-out disabled:cursor-not-allowed disabled:opacity-60"
        >
          Bayar {formatCurrency(total)}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </PageShell>
  );
}

