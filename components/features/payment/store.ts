"use client";

import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import {
  BASE_DISCOUNT,
  DELIVERY_OPTIONS,
  MOCK_ADDRESSES,
  MOCK_CHECKOUT_ITEMS,
  type Address,
  type CheckoutItem,
  type DeliveryOption,
  type PaymentChannel,
} from "./mock-data";

export type PaymentStatus = "idle" | "awaiting_payment" | "pending" | "success" | "failed";
export type PaymentOutcome = "success" | "failed" | "pending";

export type PaymentOrder = {
  id: string;
  items: CheckoutItem[];
  addressId: string;
  deliveryOptionId: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: PaymentStatus;
  paymentChannel?: PaymentChannel;
  createdAt: string;
  lastStatusUpdate: string;
  hasRetried: boolean;
};

type CreateOrderInput = {
  addressId: string;
  deliveryOptionId: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
};

type PaymentStore = {
  checkoutItems: CheckoutItem[];
  addresses: Address[];
  deliveryOptions: DeliveryOption[];
  activeOrderId?: string;
  orders: Record<string, PaymentOrder>;
  developerOutcome: PaymentOutcome;
  setDeveloperOutcome: (outcome: PaymentOutcome) => void;
  createOrder: (input: CreateOrderInput) => string;
  setActiveOrder: (orderId?: string) => void;
  setOrderStatus: (orderId: string, status: PaymentStatus) => void;
  setPaymentChannel: (orderId: string, channel: PaymentChannel) => void;
  markRetryUsed: (orderId: string) => void;
  resetOrder: (orderId: string) => void;
};

const storage = typeof window !== "undefined"
  ? createJSONStorage<PaymentStore>(() => window.sessionStorage)
  : undefined;

export const usePaymentStore = create<PaymentStore>()(
  devtools(
    persist(
      (set) => ({
        checkoutItems: MOCK_CHECKOUT_ITEMS,
        addresses: MOCK_ADDRESSES,
        deliveryOptions: DELIVERY_OPTIONS,
        activeOrderId: undefined,
        orders: {},
        developerOutcome: "success",
        setDeveloperOutcome: (outcome) => set(() => ({ developerOutcome: outcome })),
        createOrder: ({ addressId, deliveryOptionId, name, email, phone, notes }) => {
          const option =
            DELIVERY_OPTIONS.find((item) => item.id === deliveryOptionId) ?? DELIVERY_OPTIONS[0];
          const subtotal = MOCK_CHECKOUT_ITEMS.reduce(
            (total, item) => total + item.price * item.quantity,
            0,
          );
          const discount = BASE_DISCOUNT;
          const shipping = option.cost;
          const total = Math.max(subtotal + shipping - discount, 0);
          const id = `INV-${Date.now()}`;
          const timestamp = new Date().toISOString();
          const order: PaymentOrder = {
            id,
            items: MOCK_CHECKOUT_ITEMS.map((item) => ({ ...item })),
            addressId,
            deliveryOptionId: option.id,
            contact: { name, email, phone },
            notes,
            subtotal,
            shipping,
            discount,
            total,
            status: "awaiting_payment",
            paymentChannel: undefined,
            createdAt: timestamp,
            lastStatusUpdate: timestamp,
            hasRetried: false,
          };
          set((state) => ({
            orders: {
              ...state.orders,
              [id]: order,
            },
            activeOrderId: id,
          }));
          return id;
        },
        setActiveOrder: (orderId) => set(() => ({ activeOrderId: orderId })),
        setOrderStatus: (orderId, status) => {
          set((state) => {
            const order = state.orders[orderId];
            if (!order) return state;
            return {
              orders: {
                ...state.orders,
                [orderId]: {
                  ...order,
                  status,
                  lastStatusUpdate: new Date().toISOString(),
                },
              },
            };
          });
        },
        setPaymentChannel: (orderId, channel) => {
          set((state) => {
            const order = state.orders[orderId];
            if (!order) return state;
            return {
              orders: {
                ...state.orders,
                [orderId]: {
                  ...order,
                  paymentChannel: channel,
                },
              },
            };
          });
        },
        markRetryUsed: (orderId) => {
          set((state) => {
            const order = state.orders[orderId];
            if (!order || order.hasRetried) return state;
            return {
              orders: {
                ...state.orders,
                [orderId]: {
                  ...order,
                  hasRetried: true,
                },
              },
            };
          });
        },
        resetOrder: (orderId) =>
          set((state) => {
            if (!state.orders[orderId]) return state;
            const remaining = { ...state.orders };
            delete remaining[orderId];
            return {
              orders: remaining,
              activeOrderId: state.activeOrderId === orderId ? undefined : state.activeOrderId,
            };
          }),
      }),
      {
        name: "payment-store",
        storage,
        partialize: (state) => ({
          orders: state.orders,
          activeOrderId: state.activeOrderId,
          developerOutcome: state.developerOutcome,
        }),
      },
    ),
  ),
);
