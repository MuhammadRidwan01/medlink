"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type TabKey = "all" | "system" | "doctor" | "reminder";

export function NotificationFilters({ value, onChange }: { value: TabKey; onChange: (tab: TabKey) => void }) {
  const tabs = useMemo(() => ([
    { key: "all", label: "All" },
    { key: "system", label: "System" },
    { key: "doctor", label: "Doctor" },
    { key: "reminder", label: "Reminder" },
  ] as const), []);

  return (
    <div className="flex items-center gap-2 rounded-button border border-border/60 bg-card p-1 shadow-sm" role="tablist" aria-label="Filter notifications">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          role="tab"
          aria-selected={value === t.key}
          className={cn("relative flex-1 rounded-button px-4 py-2 text-sm font-semibold", value === t.key ? "text-foreground" : "text-muted-foreground")}
        >
          {t.label}
          {value === t.key ? <span className="absolute inset-x-1 bottom-0 h-[2px] rounded-full bg-primary" /> : null}
        </button>
      ))}
    </div>
  );
}

