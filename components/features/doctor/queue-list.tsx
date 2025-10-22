"use client";

import { AnimatePresence, motion } from "framer-motion";
import { UsersRound } from "lucide-react";
import type { QueueEntry } from "./queue-item";
import { QueueItem } from "./queue-item";

type QueueListProps = {
  items: QueueEntry[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function QueueList({ items, selectedId, onSelect }: QueueListProps) {
  const waitingCount = items.filter((item) => item.status === "waiting").length;
  const inProgressCount = items.filter((item) => item.status === "in-progress").length;

  return (
    <div className="flex h-full flex-col gap-4">
      <motion.header
        layout
        className="flex items-center justify-between rounded-card border border-border/60 bg-card px-4 py-3 shadow-sm"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <UsersRound className="h-5 w-5 text-primary" />
          <span>Antrian Pasien</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{waitingCount} menunggu</span>
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
          <span>{inProgressCount} aktif</span>
        </div>
      </motion.header>
      <div className="relative flex-1 overflow-hidden rounded-card border border-border/60 bg-card shadow-sm">
        <div className="flex h-full flex-col gap-3 overflow-y-auto px-3 py-4">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              >
                <QueueItem item={item} isActive={item.id === selectedId} onSelect={onSelect} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
