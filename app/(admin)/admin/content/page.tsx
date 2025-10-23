"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { subscribeContent, listArticles, createArticle, type Article } from "@/components/features/content/store";
import { ContentFilters, type FilterState } from "@/components/features/content/content-filters";
import { ArticleTable } from "@/components/features/content/article-table";
import { ArticleEditor } from "@/components/features/content/article-editor";

export default function AdminContentPage() {
  const [articles, setArticles] = useState<Article[]>(listArticles());
  const [filters, setFilters] = useState<FilterState>({ category: "all", status: "all", query: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => subscribeContent((s) => setArticles(s.articles)), []);

  const categories = useMemo(() => Array.from(new Set(articles.map((a) => a.category))), [articles]);
  const filtered = useMemo(() => {
    const q = filters.query.toLowerCase();
    return articles.filter((a) => (filters.category === "all" || a.category === filters.category) && (filters.status === "all" || a.status === filters.status) && (!q || [a.title, a.author, a.tags.join(" ")].join(" ").toLowerCase().includes(q)));
  }, [articles, filters]);

  const current = editingId ? articles.find((a) => a.id === editingId) ?? null : null;

  return (
    <PageShell title="Content" subtitle="Kelola artikel kesehatan" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <ContentFilters value={filters} onChange={setFilters} categories={categories} />
        <button type="button" onClick={() => { const id = createArticle({ title: "New Article" }); setEditingId(id); }} className="tap-target rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg">New Article</button>
      </div>
      {!current ? (
        <ArticleTable items={filtered} onEdit={setEditingId} />
      ) : (
        <ArticleEditor article={current} />
      )}
    </PageShell>
  );
}
