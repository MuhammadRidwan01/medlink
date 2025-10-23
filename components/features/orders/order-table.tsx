"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownNarrowWide, ArrowUpWideNarrow } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClinicalOrder } from "./clinical-store";

type SortKey = "kind" | "patient" | "date" | "status";

type Props = {
  orders: ClinicalOrder[];
  onOpen: (id: string) => void;
};

export function OrderTable({ orders, onOpen }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [focusIndex, setFocusIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setFocusIndex(0), [orders.length]);

  const sorted = useMemo(() => {
    const next = orders.slice();
    next.sort((a, b) => {
      let va: string | number = "";
      let vb: string | number = "";
      if (sortKey === "date") {
        va = new Date(a.date).getTime();
        vb = new Date(b.date).getTime();
      } else {
        va = (a as Record<string, string | number>)[sortKey] as string | number;
        vb = (b as Record<string, string | number>)[sortKey] as string | number;
      }
      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return next;
  }, [orders, sortKey, dir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDir("asc");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((i) => Math.min(sorted.length - 1, i + 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((i) => Math.max(0, i - 1));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const row = sorted[focusIndex];
      if (row) onOpen(row.id);
    }
  };

  return (
    <div ref={containerRef} role="table" aria-label="Orders" className="rounded-card border border-border/60 bg-card shadow-sm" onKeyDown={onKeyDown} tabIndex={0}>
      <div role="rowgroup">
        <div role="row" className="grid grid-cols-[1fr_1.4fr_1.2fr_1fr] items-center gap-3 border-b border-border/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <button className="text-left" onClick={() => toggleSort("kind")}>
            Tipe {sortKey === "kind" ? (dir === "asc" ? <ArrowDownNarrowWide className="inline h-3 w-3" /> : <ArrowUpWideNarrow className="inline h-3 w-3" />) : null}
          </button>
          <button className="text-left" onClick={() => toggleSort("patient")}>
            Pasien {sortKey === "patient" ? (dir === "asc" ? <ArrowDownNarrowWide className="inline h-3 w-3" /> : <ArrowUpWideNarrow className="inline h-3 w-3" />) : null}
          </button>
          <button className="text-left" onClick={() => toggleSort("date")}>
            Tanggal {sortKey === "date" ? (dir === "asc" ? <ArrowDownNarrowWide className="inline h-3 w-3" /> : <ArrowUpWideNarrow className="inline h-3 w-3" />) : null}
          </button>
          <button className="text-left" onClick={() => toggleSort("status")}>
            Status {sortKey === "status" ? (dir === "asc" ? <ArrowDownNarrowWide className="inline h-3 w-3" /> : <ArrowUpWideNarrow className="inline h-3 w-3" />) : null}
          </button>
        </div>
      </div>
      <div role="rowgroup" className="divide-y divide-border/60">
        {sorted.map((o, idx) => (
          <button
            key={o.id}
            role="row"
            className={cn(
              "grid w-full grid-cols-[1fr_1.4fr_1.2fr_1fr] items-center gap-3 px-3 py-2 text-sm text-left transition hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              idx === focusIndex && "bg-primary/5",
            )}
            onClick={() => onOpen(o.id)}
            aria-selected={idx === focusIndex}
          >
            <span role="cell" className="font-semibold text-foreground capitalize">{o.kind}</span>
            <span role="cell" className="text-foreground">{o.patient}</span>
            <span role="cell" className="text-muted-foreground">{new Date(o.date).toLocaleString("id-ID")}</span>
            <span role="cell" className={cn("rounded-badge px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
              o.status === "pending" ? "border border-warning/30 bg-warning/10 text-warning" : "border border-primary/30 bg-primary/10 text-primary",
            )}>{o.status}</span>
          </button>
        ))}
        {!sorted.length ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">Tidak ada order.</div>
        ) : null}
      </div>
    </div>
  );
}
