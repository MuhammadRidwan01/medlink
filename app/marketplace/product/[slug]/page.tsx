import { notFound } from "next/navigation";
import { ProductDetailPageClient } from "./product-detail-page-client";

type ProductDetailPageParams = {
  slug: string;
};

type ProductDetailPageProps = {
  params?: Promise<ProductDetailPageParams>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const resolvedParams = params ? await params : undefined;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  return <ProductDetailPageClient slug={slug} />;
}
