"use client";

import { useMemo } from "react";
import { History } from "lucide-react";
import { useHistoryStore } from "./history-store";

export function RecentHistory({ onPick }: { onPick: (href: string) => void }) {
  const items = useHistoryStore((s) => s.items);
  const recent = useMemo(() => items.slice(0, 5), [items]);
  if (!recent.length) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <History className="h-4 w-4 text-primary" /> Recent
      </div>
      <div className="grid gap-2">
        {recent.map((h) => (
          <button key={h.href} type="button" className="tap-target inline-flex items-center justify-between rounded-card border border-border/60 bg-muted/30 px-3 py-2 text-left text-sm hover:bg-muted/50" onClick={() => onPick(h.href)}>
            <span className="truncate text-foreground">{h.label}</span>
            <span className="text-tiny text-muted-foreground">{new Date(h.at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

