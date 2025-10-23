"use client";

import { usePaymentStore, type PaymentOutcome, type PaymentStatus } from "./store";

// Tiny state helpers that mirror gateway callbacks (pending/success/failed)
export function setOutcomeWithDelay(orderId: string, outcome: PaymentOutcome, delayMs: number) {
  const setOrderStatus = usePaymentStore.getState().setOrderStatus;
  // Immediately reflect webhook received -> pending
  setOrderStatus(orderId, "pending");
  window.setTimeout(() => {
    const status: PaymentStatus = outcome === "success" ? "success" : outcome === "failed" ? "failed" : "pending";
    setOrderStatus(orderId, status);
  }, Math.max(0, delayMs));
}

export function hydrateFromUrl(orderId?: string) {
  if (!orderId) return;
  const { orders, setActiveOrder } = usePaymentStore.getState();
  if (orders[orderId]) {
    setActiveOrder(orderId);
  }
}

