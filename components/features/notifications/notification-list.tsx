"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NotificationItem } from "./notification-item";
import { useNotificationStore } from "./store";
import { notificationBus } from "./store";
import { NotificationFilters, type TabKey } from "./notification-filters";

export function NotificationList() {
  const items = useNotificationStore((s) => s.items);
  const add = useNotificationStore((s) => s.add);
  const [tab, setTab] = useState<TabKey>("all");
  useEffect(() => {
    const off = notificationBus.on("notify:new", (payload) => add(payload));
    return off;
  }, [add]);

  const filtered = useMemo(() => items.filter((n) => (tab === "all" ? true : n.category === tab)), [items, tab]);

  return (
    <section className="space-y-4" aria-live="polite">
      <NotificationFilters value={tab} onChange={setTab} />
      <div role="list" className="space-y-2">
        <AnimatePresence initial={false}>
          {filtered.map((n) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              <NotificationItem item={n} />
            </motion.div>
          ))}
          {!filtered.length ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-card border border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              Tidak ada notifikasi.
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
