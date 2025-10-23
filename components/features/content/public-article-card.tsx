"use client";

import Image from "next/image";
import Link from "next/link";
import type { Article } from "./store";

export function PublicArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/health/articles/${article.slug}`} className="block rounded-card border border-border/60 bg-card shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-card">
        <Image src={article.coverUrl} alt={article.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
      </div>
      <div className="space-y-2 p-3">
        <span className="rounded-badge border border-primary/30 bg-primary/10 px-2 py-0.5 text-tiny font-semibold uppercase tracking-wide text-primary">{article.category}</span>
        <h3 className="truncate text-sm font-semibold text-foreground">{article.title}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{article.excerpt}</p>
        <p className="text-tiny text-muted-foreground">{article.readMinutes} min read</p>
      </div>
    </Link>
  );
}

