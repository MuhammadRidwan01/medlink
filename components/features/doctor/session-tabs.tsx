"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { AnimatePresence, motion } from "framer-motion";
import { ClipboardList, FileText, MessageSquareText } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChatMessage,
  type ChatMessageProps,
} from "@/components/features/ai-triage/chat-message";

export type NoteEntry = {
  id: string;
  title: string;
  author: string;
  timestamp: string;
  content: string;
};

export type OrderEntry = {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  status: "draft" | "sent" | "pending";
};

type SessionTabsProps = {
  messages: ChatMessageProps[];
  notes: NoteEntry[];
  orders: OrderEntry[];
};

const tabs = [
  { value: "messages", label: "Pesan", icon: MessageSquareText },
  { value: "notes", label: "Catatan", icon: FileText },
  { value: "orders", label: "Orders", icon: ClipboardList },
];

export function SessionTabs({ messages, notes, orders }: SessionTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["value"]>("messages");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTab === "messages" && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [activeTab, messages]);

  const indicatorLayout = useMemo(
    () => ({
      layoutId: "session-tab-indicator",
      transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
    }),
    [],
  );

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as typeof activeTab)}
      className="flex h-full flex-col"
    >
      <Tabs.List
        className="flex items-center gap-2 rounded-button border border-border/60 bg-card p-1 shadow-sm"
        aria-label="Kontrol sesi konsultasi"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "relative flex-1 overflow-hidden rounded-button px-4 py-2 text-sm font-semibold transition-all duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "tap-target",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              {isActive ? (
                <motion.span
                  {...indicatorLayout}
                  className="absolute inset-0 -z-10 rounded-button bg-primary/10"
                />
              ) : null}
              <span className="flex items-center justify-center gap-2">
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {tab.label}
              </span>
            </Tabs.Trigger>
          );
        })}
      </Tabs.List>

      <div className="mt-4 flex-1 overflow-hidden rounded-card border border-border/60 bg-card shadow-sm">
        <AnimatePresence mode="wait" initial={false}>
          <Tabs.Content
            key="messages"
            value="messages"
            forceMount
            className="h-full"
            data-state={activeTab === "messages" ? "active" : "inactive"}
          >
            {activeTab === "messages" ? (
              <motion.div
                key="tab-messages"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="flex h-full flex-col gap-4 p-4"
              >
                <div
                  ref={listRef}
                  className="flex-1 space-y-3 overflow-y-auto pr-1"
                >
                  {messages.map((message) => (
                    <ChatMessage key={message.id} {...message} />
                  ))}
                </div>
                <div className="rounded-card border border-dashed border-border/70 p-3 text-sm text-muted-foreground">
                  Input pesan dan catatan akan tersedia setelah integrasi realtime.
                </div>
              </motion.div>
            ) : null}
          </Tabs.Content>

          <Tabs.Content
            key="notes"
            value="notes"
            forceMount
            className="h-full"
            data-state={activeTab === "notes" ? "active" : "inactive"}
          >
            {activeTab === "notes" ? (
              <motion.div
                key="tab-notes"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="flex h-full flex-col gap-3 overflow-y-auto p-4"
              >
                {notes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-card border border-border/70 bg-muted/40 p-4 shadow-sm transition-all duration-fast ease-out hover:shadow-md"
                  >
                    <header className="flex items-center justify-between text-sm font-semibold text-foreground">
                      <span>{note.title}</span>
                      <span className="text-xs text-muted-foreground">{note.timestamp}</span>
                    </header>
                    <p className="mt-2 text-small text-muted-foreground">{note.content}</p>
                    <footer className="mt-3 text-xs text-muted-foreground">Ditulis oleh {note.author}</footer>
                  </article>
                ))}
              </motion.div>
            ) : null}
          </Tabs.Content>

          <Tabs.Content
            key="orders"
            value="orders"
            forceMount
            className="h-full"
            data-state={activeTab === "orders" ? "active" : "inactive"}
          >
            {activeTab === "orders" ? (
              <motion.div
                key="tab-orders"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="flex h-full flex-col gap-3 overflow-y-auto p-4"
              >
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-card border border-border/70 bg-card p-4 shadow-sm transition-all duration-fast ease-out hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{order.medication}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.dosage} • {order.frequency}
                        </p>
                      </div>
                      <StatusPill status={order.status} />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : null}
          </Tabs.Content>
        </AnimatePresence>
      </div>
    </Tabs.Root>
  );
}

type StatusPillProps = {
  status: "draft" | "sent" | "pending";
};

function StatusPill({ status }: StatusPillProps) {
  const mapping: Record<
    StatusPillProps["status"],
    { label: string; className: string }
  > = {
    draft: {
      label: "Draft",
      className: "bg-muted text-muted-foreground border border-border/70",
    },
    sent: {
      label: "Dikirim",
      className: "bg-primary/10 text-primary border border-primary/30",
    },
    pending: {
      label: "Menunggu",
      className: "bg-warning/10 text-warning border border-warning/30",
    },
  };

  const config = mapping[status];
  return (
    <span
      className={cn(
        "rounded-badge px-3 py-1 text-tiny font-semibold uppercase tracking-wide",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
