"use client";

import { create } from "zustand";

type HistoryEntry = { href: string; label: string; at: string };

type HistoryState = {
  items: HistoryEntry[];
  push: (entry: HistoryEntry) => void;
  clear: () => void;
};

export const useHistoryStore = create<HistoryState>()((set) => ({
  items: [],
  push: (entry) =>
    set((s) => {
      const dedup = s.items.filter((i) => i.href !== entry.href);
      const next = [entry, ...dedup].slice(0, 5);
      return { items: next };
    }),
  clear: () => set({ items: [] }),
}));

