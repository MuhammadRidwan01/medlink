"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { highlight } from "./fuzzy";

export function CommandInput({ value, onChange, placeholder = "Type a command or search...", indices }: { value: string; onChange: (v: string) => void; placeholder?: string; indices: number[] }) {
  const [internal, setInternal] = useState(value);
  const timer = useRef<number | null>(null);
  useEffect(() => setInternal(value), [value]);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const onInput = (v: string) => {
    setInternal(v);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange(v), 250);
  };

  // Highlighting reserved for future inline decorations; not rendered directly here
  useMemo(() => highlight(internal, indices), [internal, indices]);

  return (
    <div className="relative rounded-input border border-border/60 bg-muted/30">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        value={internal}
        onChange={(e) => onInput(e.target.value)}
        placeholder={placeholder}
        className="tap-target w-full rounded-input bg-transparent px-10 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        aria-label="Search commands"
      />
      {/* visually hidden markup helper for SR could be added if needed */}
    </div>
  );
}
