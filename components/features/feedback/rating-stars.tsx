"use client";

import { Star } from "lucide-react";

export function RatingStars({ value, onChange, ariaLabel = "Rate your consultation from 1 to 5 stars" }: { value: number; onChange: (v: number) => void; ariaLabel?: string }) {
  // steps of 0.5 => 0 to 5
  const steps = Array.from({ length: 10 }, (_, i) => (i + 1) * 0.5);
  const setByIndex = (idx: number) => onChange(steps[idx]!);
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIdx = Math.max(0, steps.findIndex((s) => s === value));
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setByIndex(Math.min(steps.length - 1, currentIdx + 1));
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setByIndex(Math.max(0, currentIdx - 1));
    }
  };

  return (
    <div className="flex items-center gap-2" role="group" aria-label={ariaLabel} tabIndex={0} onKeyDown={onKey}>
      {Array.from({ length: 5 }, (_, i) => i + 1).map((i) => {
        const full = value >= i;
        const half = !full && value >= i - 0.5;
        const setVal = (v: number) => onChange(v);
        return (
          <div key={i} className="relative">
            <button type="button" className="tap-target inline-flex items-center justify-center rounded-button border border-border/60 bg-muted/30 p-2 text-muted-foreground hover:bg-muted/50" aria-label={`${i - 0.5} stars`} onClick={() => setVal(i - 0.5)}>
              <Star className={half || full ? "h-5 w-5 text-primary" : "h-5 w-5"} />
            </button>
            <button type="button" className="tap-target ml-1 inline-flex items-center justify-center rounded-button border border-border/60 bg-muted/30 p-2 text-muted-foreground hover:bg-muted/50" aria-label={`${i} stars`} onClick={() => setVal(i)}>
              <Star className={full ? "h-5 w-5 text-primary" : "h-5 w-5"} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

