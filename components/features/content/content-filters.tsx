"use client";

import { useMemo } from "react";

export type FilterState = {
  category: string | "all";
  status: string | "all";
  query: string;
};

export function ContentFilters({ value, onChange, categories }: { value: FilterState; onChange: (v: FilterState) => void; categories: string[] }) {
  const cats = useMemo(() => ["all", ...categories], [categories]);
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</span>
        <select value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value as FilterState["category"] })} className="tap-target rounded-input border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring">
          {cats.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
        <select value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value as FilterState["status"] })} className="tap-target rounded-input border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring">
          {["all", "draft", "scheduled", "published"].map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </label>
      <label className="flex-1 space-y-1 min-w-[200px]">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Search</span>
        <input value={value.query} onChange={(e) => onChange({ ...value, query: e.target.value })} placeholder="Title, author, tag" className="tap-target w-full rounded-input border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring" />
      </label>
    </div>
  );
}
