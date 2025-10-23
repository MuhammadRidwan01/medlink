'use client';

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import {
  getArticleBySlug,
  subscribeContent,
  type Article,
} from "@/components/features/content/store";
import { AuthorBadge } from "@/components/features/content/author-badge";
import { PublicArticleCard } from "@/components/features/content/public-article-card";

type ArticleDetailPageClientProps = {
  slug: string;
};

export function ArticleDetailPageClient({
  slug,
}: ArticleDetailPageClientProps) {
  const [article, setArticle] = useState<Article | null>(
    getArticleBySlug(slug),
  );

  useEffect(
    () => subscribeContent(() => setArticle(getArticleBySlug(slug))),
    [slug],
  );

  const related = useMemo(() => {
    if (!article) return [] as Article[];

    const rawStore =
      localStorage.getItem("ml-content-store-v1") ?? '{"articles":[]}';
    const parsedStore = JSON.parse(rawStore) as { articles: Article[] };

    return parsedStore.articles
      .filter(
        (candidate) =>
          candidate.status === "published" &&
          candidate.slug !== article.slug &&
          (candidate.category === article.category ||
            candidate.tags.some((t) => article.tags.includes(t))),
      )
      .slice(0, 3);
  }, [article]);

  if (!article) {
    return (
      <PageShell
        title="Artikel tidak ditemukan"
        subtitle="Silakan kembali ke daftar"
        className="space-y-4"
      >
        <Link
          href="/health/articles"
          className="tap-target inline-flex items-center justify-center rounded-button border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
        >
          Kembali
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={article.title}
      subtitle={article.excerpt}
      className="space-y-6"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card border border-border/60">
        <Image
          src={article.coverUrl}
          alt={article.title}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <AuthorBadge name={article.author} role={article.authorRole} />
      <article className="prose prose-sm max-w-none text-foreground">
        {article.content.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </article>
      {related.length ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Artikel terkait
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((candidate) => (
              <PublicArticleCard key={candidate.id} article={candidate} />
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
