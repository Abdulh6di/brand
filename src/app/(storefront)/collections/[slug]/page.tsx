import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getCollectionBySlug } from "@/server/queries/catalog";
import { getProducts } from "@/server/queries/products";
import { ProductCard } from "@/components/storefront/product-card";
import { EmptyState } from "@/components/shared/empty-state";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  return {
    title: collection.seoTitle ?? collection.name,
    description: collection.seoDescription ?? collection.description ?? undefined,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const { products, total } = await getProducts({
    collectionSlug: slug,
    sort: (sp.sort as never) ?? "featured",
    page: sp.page ? Number(sp.page) : 1,
    perPage: 24,
  });

  return (
    <div>
      <div className="relative flex h-[50vh] min-h-[360px] items-end overflow-hidden bg-ink">
        <Image
          src={collection.bannerImageUrl ?? collection.heroImageUrl ?? "https://picsum.photos/seed/collection-banner/1920/900"}
          alt={collection.name}
          fill
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <div className="container-editorial relative z-10 pb-12 text-warm-white">
          <p className="kicker mb-3 text-warm-white/80">Collection</p>
          <h1 className="font-display text-4xl md:text-6xl">{collection.name}</h1>
        </div>
      </div>

      <div className="container-editorial py-12 md:py-16">
        {collection.description && (
          <p className="mx-auto mb-10 max-w-2xl text-center text-sm leading-relaxed text-charcoal/80">
            {collection.description}
          </p>
        )}
        <p className="mb-8 text-xs text-taupe">{total} pieces</p>
        {products.length === 0 ? (
          <EmptyState title="No pieces available yet" description="Check back soon." />
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
