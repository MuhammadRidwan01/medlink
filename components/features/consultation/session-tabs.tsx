"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ClipboardList, FileText, MessageSquareText } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessageProps } from "@/components/features/ai-triage/chat-message";
import { MessagesPane } from "./messages-pane";
import { NotesPane } from "./notes-pane";
import { OrdersPane, type OrderItem } from "./orders-pane";

export type ConsultationTabsProps = {
  messages: ChatMessageProps[];
  ordersSeed?: OrderItem[];
  snapshot?: { cc?: string; hpi?: string; redFlags?: string[] };
  sessionActive: boolean;
};

const tabDefs = [
  { value: "messages", label: "Messages", icon: MessageSquareText },
  { value: "notes", label: "Notes", icon: FileText },
  { value: "orders", label: "Orders", icon: ClipboardList },
];

type TabValue = (typeof tabDefs)[number]["value"];

export function SessionTabs({ messages, ordersSeed = [], snapshot, sessionActive }: ConsultationTabsProps) {
  const [active, setActive] = useState<TabValue>("messages");
  const indicatorLayout = useMemo(
    () => ({ layoutId: "consultation-tab-underline", transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } }),
    [],
  );
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Roving focus with arrow keys
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!(e.key === "ArrowLeft" || e.key === "ArrowRight")) return;
      const idx = tabDefs.findIndex((t) => t.value === active);
      if (idx < 0) return;
      e.preventDefault();
      const nextIdx = e.key === "ArrowRight" ? (idx + 1) % tabDefs.length : (idx - 1 + tabDefs.length) % tabDefs.length;
      const next = tabDefs[nextIdx].value as TabValue;
      setActive(next);
      const btn = buttonRefs.current[next];
      btn?.focus();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [active]);

  return (
    <div className="flex h-full min-h-[420px] flex-col">
      <div className="relative flex items-center gap-2 rounded-button border border-border/60 bg-card p-1 shadow-sm" role="tablist" aria-label="Consultation tabs">
        {tabDefs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.value;
          return (
            <button
              key={tab.value}
              ref={(el) => (buttonRefs.current[tab.value] = el)}
              onClick={() => setActive(tab.value)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.value}`}
              id={`tab-${tab.value}`}
              className={cn(
                "relative flex-1 overflow-hidden rounded-button px-4 py-2 text-sm font-semibold transition-all duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "tap-target",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              {isActive ? (
                <motion.span {...indicatorLayout} className="absolute inset-x-1 bottom-0 -z-10 h-[2px] rounded-full bg-primary" />
              ) : null}
              <span className="flex items-center justify-center gap-2">
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex-1 overflow-hidden rounded-card border border-border/60 bg-card shadow-sm">
        <div className="relative h-full">
          <AnimatePresence mode="wait" initial={false}>
            {active === "messages" ? (
              <div key="messages" role="tabpanel" id="panel-messages" aria-labelledby="tab-messages" className="h-full">
                <MessagesPane messages={messages} sessionActive={sessionActive} active={active === "messages"} />
              </div>
            ) : null}
            {active === "notes" ? (
              <div key="notes" role="tabpanel" id="panel-notes" aria-labelledby="tab-notes" className="h-full">
                <NotesPane snapshot={snapshot} />
              </div>
            ) : null}
            {active === "orders" ? (
              <div key="orders" role="tabpanel" id="panel-orders" aria-labelledby="tab-orders" className="h-full">
                <OrdersPane initialItems={ordersSeed} />
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
