"use client";

import { Bell, MessageSquareText, Pill } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AppNotification } from "./store";
import { useNotificationStore } from "./store";
import { usePillTimelineStore } from "@/components/features/pill-timeline/store";
import { UnreadDot } from "./unread-dot";

export function NotificationItem({ item }: { item: AppNotification }) {
  const router = useRouter();
  const markRead = useNotificationStore((s) => s.markRead);
  const markDose = usePillTimelineStore((s) => s.markCurrentDose);

  const Icon = item.category === "doctor" ? MessageSquareText : item.category === "reminder" ? Pill : Bell;

  const onClick = () => {
    markRead(item.id);
    if (item.route) router.push(item.route);
  };

  const onReminder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.prescriptionId) {
      markDose(item.prescriptionId);
      markRead(item.id);
    }
  };

  return (
    <button
      type="button"
      className={cn(
        "tap-target flex w-full items-start gap-3 rounded-card border border-border/60 bg-card p-3 text-left shadow-sm transition hover:shadow-md",
        !item.read && "border-primary/30 bg-primary/5",
      )}
      onClick={onClick}
      role="listitem"
      aria-label={item.title}
    >
      <span className={cn("rounded-button border p-2", !item.read ? "border-primary/30 bg-primary/10 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground")}> 
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
          <UnreadDot visible={!item.read} />
        </div>
        {item.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        ) : null}
        <p className="mt-1 text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString("id-ID")}</p>
        {item.category === "reminder" ? (
          <div className="mt-2">
            <button
              type="button"
              onClick={onReminder}
              className="tap-target inline-flex items-center justify-center rounded-button border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15"
            >
              Tandai sudah diminum
            </button>
          </div>
        ) : null}
      </div>
    </button>
  );
}

