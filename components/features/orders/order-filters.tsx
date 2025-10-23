"use client";

import { useMemo } from "react";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterState = {
  kind: { lab: boolean; imaging: boolean };
  status: { pending: boolean; completed: boolean };
};

type Props = {
  value: FilterState;
  onChange: (next: FilterState) => void;
};

export function OrderFilters({ value, onChange }: Props) {
  const chips = useMemo(
    () => [
      { key: "lab", label: "Lab", group: "kind" as const },
      { key: "imaging", label: "Imaging", group: "kind" as const },
      { key: "pending", label: "Pending", group: "status" as const },
      { key: "completed", label: "Completed", group: "status" as const },
    ],
    [],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-2 rounded-card border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
        <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
        Filters
      </span>
      {chips.map((chip) => {
        const active = (value[chip.group] as Record<string, boolean>)[chip.key];
        return (
          <button
            key={`${chip.group}-${chip.key}`}
            type="button"
            onClick={() =>
              onChange({
                ...value,
                [chip.group]: { ...(value[chip.group] as Record<string, boolean>), [chip.key]: !active },
              })
            }
            className={cn(
              "tap-target inline-flex items-center justify-center rounded-button px-3 py-1.5 text-xs font-semibold transition-all duration-fast ease-out",
              active
                ? "border border-primary/30 bg-primary/10 text-primary"
                : "border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/50",
            )}
            aria-pressed={active}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
