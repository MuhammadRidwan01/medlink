"use client";

import { create } from "zustand";

export type NotificationCategory = "system" | "doctor" | "reminder";

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  description?: string;
  timestamp: string; // ISO
  read: boolean;
  // routing context
  route?: string;
  // reminder payload
  prescriptionId?: string;
};

type NotificationState = {
  items: AppNotification[];
  add: (n: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
};

export const useNotificationStore = create<NotificationState>()((set) => ({
  items: [
    {
      id: "sys-1",
      category: "system",
      title: "Pembaharuan aplikasi",
      description: "Peningkatan performa dan perbaikan bug.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      read: false,
      route: "/patient/notifications",
    },
    {
      id: "doc-1",
      category: "doctor",
      title: "Pesan dari dokter",
      description: "Silakan pantau tekanan darah selama 1 minggu.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      route: "/patient/inbox",
    },
    {
      id: "rem-1",
      category: "reminder",
      title: "Waktunya obat Metformin",
      description: "Ambil dosis pagi sesuai jadwal.",
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      read: false,
      route: "/patient/prescriptions",
      prescriptionId: "rx-metformin",
    },
  ],
  add: (n) => set((s) => ({ items: [n, ...s.items] })),
  markRead: (id) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, read: true } : i)) })),
  markAllRead: () => set((s) => ({ items: s.items.map((i) => ({ ...i, read: true })) })),
}));

// Simple event bus for live notifications
type EventMap = {
  "notify:new": AppNotification;
};

type Handler<T> = (payload: T) => void;

class NotifyBus {
  private handlers: { [K in keyof EventMap]?: Set<Handler<EventMap[K]>> } = {};
  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>) {
    if (!this.handlers[event]) this.handlers[event] = new Set();
    this.handlers[event]!.add(handler);
    return () => this.off(event, handler);
  }
  off<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>) {
    this.handlers[event]?.delete(handler);
  }
  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    this.handlers[event]?.forEach((h) => h(payload));
  }
}

export const notificationBus = new NotifyBus();

