"use client";

import { useEffect, useRef, useState } from "react";
import { updateArticle, type Article } from "./store";
import { SchedulePublish } from "./schedule-publish";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

type Props = { article: Article };

export function ArticleEditor({ article }: Props) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<Article>(article);
  const [showPreview, setShowPreview] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => setDraft(article), [article]);

  // autosave every 2s
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      updateArticle(draft.id, draft);
      toast({ title: "Autosaved", description: new Date().toLocaleTimeString("id-ID") });
    }, 2000);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [draft, toast]);

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Editor formatting">
      {[
        { k: "H1", act: () => insert("# ") },
        { k: "H2", act: () => insert("## ") },
        { k: "List", act: () => insert("- ") },
        { k: "Callout", act: () => insert("> ") },
      ].map((b) => (
        <button key={b.k} type="button" onClick={b.act} className="tap-target rounded-button border border-border/60 bg-muted/30 px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted/50">{b.k}</button>
      ))}
      <button type="button" onClick={() => setShowPreview(true)} className="tap-target rounded-button border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/15">Preview</button>
    </div>
  );

  function insert(prefix: string) {
    setDraft((d) => ({ ...d, content: `${prefix}${d.content}` }));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <section className="space-y-3">
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</span>
          <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} className="tap-target w-full rounded-input border border-border/60 bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cover image URL</span>
          <input value={draft.coverUrl} onChange={(e) => setDraft((d) => ({ ...d, coverUrl: e.target.value }))} className="tap-target w-full rounded-input border border-border/60 bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring" />
        </label>
        {draft.coverUrl ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card border border-border/60">
            <Image src={draft.coverUrl} alt="Cover" fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover" />
          </div>
        ) : null}
        <div className="space-y-2">
          {toolbar}
          <textarea value={draft.content} onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))} rows={16} className="tap-target w-full rounded-input border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring" placeholder="# Heading\n\nParagraph..." />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</span>
            <input value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} className="tap-target w-full rounded-input border border-border/60 bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags (comma separated)</span>
            <input value={draft.tags.join(", ")} onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }))} className="tap-target w-full rounded-input border border-border/60 bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SEO title</span>
            <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} className="tap-target w-full rounded-input border border-border/60 bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SEO description</span>
            <input value={draft.excerpt} onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))} className="tap-target w-full rounded-input border border-border/60 bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
        </div>
      </section>
      <aside className="space-y-3">
        <SchedulePublish status={draft.status} scheduledAt={draft.scheduledAt} onChange={(next) => setDraft((d) => ({ ...d, status: next.status, scheduledAt: next.scheduledAt }))} />
        <div className="rounded-card border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">Perubahan tersimpan secara otomatis. Gunakan Preview untuk melihat tampilan publik.</div>
      </aside>

      {showPreview ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Preview">
          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-card border border-border/60 bg-card p-4 shadow-xl">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card border border-border/60">
              <Image src={draft.coverUrl} alt="Cover" fill sizes="100vw" className="object-cover" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-foreground">{draft.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{draft.excerpt}</p>
            <article className="prose prose-sm mt-4 text-foreground">
              {draft.content.split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </article>
            <div className="mt-4 text-right">
              <button type="button" onClick={() => setShowPreview(false)} className="tap-target rounded-button border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/50">Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
