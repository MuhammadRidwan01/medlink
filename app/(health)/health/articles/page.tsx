"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { subscribeContent, listArticles, type Article } from "@/components/features/content/store";
import { PublicArticleCard } from "@/components/features/content/public-article-card";

export default function HealthArticlesPage() {
  const [articles, setArticles] = useState<Article[]>(listArticles());
  const [tab, setTab] = useState<string>("All");
  const [page, setPage] = useState(1);
  const perPage = 6;

  useEffect(() => subscribeContent((s) => setArticles(s.articles.filter((a) => a.status === "published"))), []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(articles.map((a) => a.category)))], [articles]);
  const filtered = useMemo(() => articles.filter((a) => tab === "All" ? true : a.category === tab), [articles, tab]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => setPage(1), [tab]);

  return (
    <PageShell title="Artikel Kesehatan" subtitle="Bacaan edukasi kesehatan" className="space-y-4">
      <div className="flex items-center gap-2" role="tablist" aria-label="Kategori">
        {categories.map((c) => (
          <button key={c} type="button" role="tab" aria-selected={tab === c} onClick={() => setTab(c)} className={`tap-target rounded-button border px-3 py-1.5 text-xs font-semibold ${tab===c?"border-primary/30 bg-primary/10 text-primary":"border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/50"}`}>{c}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((a) => (
          <PublicArticleCard key={a.id} article={a} />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        <button type="button" disabled={page<=1} onClick={() => setPage((p)=>Math.max(1,p-1))} className="tap-target rounded-button border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground disabled:opacity-50">Prev</button>
        <span className="text-xs text-muted-foreground">{page}/{totalPages}</span>
        <button type="button" disabled={page>=totalPages} onClick={() => setPage((p)=>Math.min(totalPages,p+1))} className="tap-target rounded-button border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground disabled:opacity-50">Next</button>
      </div>
    </PageShell>
  );
}

