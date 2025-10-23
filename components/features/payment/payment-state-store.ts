"use client";

import { usePaymentStore } from "./store";

export function hydrateFromUrl(orderId?: string) {
  if (!orderId) return;
  const { orders, setActiveOrder } = usePaymentStore.getState();
  if (orders[orderId]) {
    setActiveOrder(orderId);
  }
}

