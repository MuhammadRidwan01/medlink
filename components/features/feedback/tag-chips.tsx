"use client";

import { cn } from "@/lib/utils";

export function TagChips({ tags, value, onChange }: { tags: string[]; value: string[]; onChange: (next: string[]) => void }) {
  const toggle = (t: string) => {
    const set = new Set(value);
    if (set.has(t)) {
      set.delete(t);
    } else {
      set.add(t);
    }
    onChange(Array.from(set));
  };
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => {
        const active = value.includes(t);
        return (
          <button key={t} type="button" onClick={() => toggle(t)} aria-pressed={active} className={cn("tap-target rounded-button border px-3 py-1.5 text-xs font-semibold transition", active ? "border-primary/30 bg-primary/10 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/50")}> 
            {t}
          </button>
        );
      })}
    </div>
  );
}
