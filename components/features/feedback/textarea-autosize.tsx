"use client";

import { useEffect, useRef } from "react";

export function TextareaAutosize({ value, onChange, max = 500, placeholder, ariaLabel }: { value: string; onChange: (v: string) => void; max?: number; placeholder?: string; ariaLabel?: string }) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "0px";
    ref.current.style.height = Math.min(ref.current.scrollHeight, 240) + "px";
  }, [value]);
  return (
    <div className="space-y-1">
      <textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} rows={3} maxLength={max} placeholder={placeholder} aria-label={ariaLabel} className="tap-target w-full resize-none rounded-input border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring" />
      <div className="text-right text-tiny text-muted-foreground">{value.length}/{max}</div>
    </div>
  );
}

