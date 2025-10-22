"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { CheckoutForm } from "@/components/features/payment/checkout-form";
import { OrderSummary } from "@/components/features/payment/order-summary";
import { TestSwitches } from "@/components/features/payment/test-switches";
import { BASE_DISCOUNT, DELIVERY_OPTIONS } from "@/components/features/payment/mock-data";
import { usePaymentStore } from "@/components/features/payment/store";
import { formatCurrency } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const addresses = usePaymentStore((state) => state.addresses);
  const deliveryOptions = usePaymentStore((state) => state.deliveryOptions);
  const items = usePaymentStore((state) => state.checkoutItems);
  const createOrder = usePaymentStore((state) => state.createOrder);
  const setActiveOrder = usePaymentStore((state) => state.setActiveOrder);
  const developerOutcome = usePaymentStore((state) => state.developerOutcome);
  const setDeveloperOutcome = usePaymentStore((state) => state.setDeveloperOutcome);

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) ?? addresses[0],
    [addresses],
  );
  const defaultDelivery = useMemo(
    () => deliveryOptions[0] ?? DELIVERY_OPTIONS[0],
    [deliveryOptions],
  );

  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id ?? "");
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(defaultDelivery?.id ?? "");
  const [contactName, setContactName] = useState(defaultAddress?.recipient ?? "");
  const [contactPhone, setContactPhone] = useState(defaultAddress?.phone ?? "");
  const [contactEmail, setContactEmail] = useState("pasien@medlink.id");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedAddressId && defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
      setContactName(defaultAddress.recipient);
      setContactPhone(defaultAddress.phone);
    }
  }, [defaultAddress, selectedAddressId]);

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

  const handlePay = () => {
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    const orderId = createOrder({
      addressId: selectedAddressId,
      deliveryOptionId: selectedDeliveryId,
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      notes,
    });
    setActiveOrder(orderId);
    router.push(`/patient/payment/${orderId}`);
  };

  return (
    <PageShell
      title="Checkout MedLink"
      subtitle="Konfirmasi alamat, kontak, dan metode pembayaran Anda."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <CheckoutForm
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            onSelectAddress={setSelectedAddressId}
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
