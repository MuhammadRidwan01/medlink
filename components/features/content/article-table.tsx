"use client";

import { useMemo } from "react";
import type { Article } from "./store";

export function ArticleTable({ items, onEdit }: { items: Article[]; onEdit: (id: string) => void }) {
  const rows = useMemo(() => items, [items]);
  return (
    <div role="table" className="rounded-card border border-border/60 bg-card shadow-sm">
      <div role="rowgroup">
        <div role="row" className="grid grid-cols-[1.4fr_1fr_1fr_1fr_auto] items-center gap-3 border-b border-border/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <div>Title</div>
          <div>Author</div>
          <div>Category</div>
          <div>Status</div>
          <div></div>
        </div>
      </div>
      <div role="rowgroup" className="divide-y divide-border/60">
        {rows.map((a) => (
          <div key={a.id} role="row" className="grid grid-cols-[1.4fr_1fr_1fr_1fr_auto] items-center gap-3 px-3 py-2 text-sm">
            <div role="cell" className="truncate font-semibold text-foreground">{a.title}</div>
            <div role="cell" className="text-muted-foreground">{a.author}</div>
            <div role="cell" className="text-muted-foreground">{a.category}</div>
            <div role="cell"><span className={`rounded-badge border px-2 py-0.5 text-tiny font-semibold uppercase tracking-wide ${a.status === "draft" ? "border-border/60 bg-muted/30 text-muted-foreground" : a.status === "scheduled" ? "border-warning/30 bg-warning/10 text-warning" : "border-primary/30 bg-primary/10 text-primary"}`}>{a.status}</span></div>
            <div role="cell" className="text-right">
              <button type="button" onClick={() => onEdit(a.id)} className="tap-target rounded-button border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/50">Edit</button>
            </div>
          </div>
        ))}
        {!rows.length ? <div className="px-3 py-6 text-center text-sm text-muted-foreground">No articles.</div> : null}
      </div>
    </div>
  );
}
