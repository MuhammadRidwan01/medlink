import { notFound } from "next/navigation";
import { ArticleDetailPageClient } from "./article-detail-page-client";

type ArticleDetailPageParams = {
  slug: string;
};

type ArticleDetailPageProps = {
  params?: Promise<ArticleDetailPageParams>;
};

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  const resolvedParams = params ? await params : undefined;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  return <ArticleDetailPageClient slug={slug} />;
}
