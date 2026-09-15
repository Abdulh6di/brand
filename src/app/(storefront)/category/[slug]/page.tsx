import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/server/queries/catalog";
import { getProducts } from "@/server/queries/products";
import { ProductCard } from "@/components/storefront/product-card";
import { EmptyState } from "@/components/shared/empty-state";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.seoTitle ?? category.name,
    description: category.seoDescription ?? category.description ?? undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { products, total } = await getProducts({
    categorySlug: slug,
    sort: (sp.sort as never) ?? "featured",
    page: sp.page ? Number(sp.page) : 1,
    perPage: 24,
  });

  return (
    <div>
      <div className="border-b border-line bg-ivory py-16 text-center md:py-24">
        <p className="kicker mb-4">Category</p>
        <h1 className="font-display text-4xl md:text-5xl">{category.name}</h1>
        {category.description && (
          <p className="mx-auto mt-4 max-w-lg text-sm text-charcoal/75">{category.description}</p>
        )}
      </div>

      <div className="container-editorial py-12 md:py-16">
        <p className="mb-8 text-xs text-taupe">{total} pieces</p>
        {products.length === 0 ? (
          <EmptyState title="No pieces available yet" description="Check back soon — new arrivals are added regularly." />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
