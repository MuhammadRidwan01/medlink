"use client";

import { cn } from "@/lib/utils";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  meta?: string;
  shortcut?: string;
  active?: boolean;
  onClick?: () => void;
};

export function CommandItem({ icon: Icon, label, meta, shortcut, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="listitem"
      className={cn(
        "tap-target flex w-full items-center justify-between gap-3 rounded-card border px-3 py-2 text-left text-sm shadow-sm",
        active ? "border-primary/30 bg-primary/10" : "border-border/60 bg-card hover:bg-muted/30",
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className={cn("rounded-button border p-2", active ? "border-primary/30 bg-primary/10 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground")}> 
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-semibold text-foreground">{label}</span>
          {meta ? <span className="block truncate text-xs text-muted-foreground">{meta}</span> : null}
        </span>
      </span>
      {shortcut ? (
        <kbd className="rounded-badge border border-border/60 bg-muted/30 px-2 py-0.5 text-tiny text-muted-foreground">{shortcut}</kbd>
      ) : null}
    </button>
  );
}

