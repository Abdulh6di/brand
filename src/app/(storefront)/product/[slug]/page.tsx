import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/server/queries/products";
import { ProductGallery } from "@/components/storefront/product/gallery";
import { PurchasePanel } from "@/components/storefront/product/purchase-panel";
import { ProductRail } from "@/components/storefront/home/product-rail";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription ?? undefined,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
    alternates: { canonical: `${siteConfig.url}/product/${product.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId);
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description,
    sku: product.sku,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: ((product.salePrice ?? product.price) / 100).toFixed(2),
      availability: product.variants.some((v) => v.stock - v.reservedStock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/product/${product.slug}`,
    },
    ...(avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: product.reviews.length,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: `${siteConfig.url}/shop` },
      { "@type": "ListItem", position: 2, name: product.category.name, item: `${siteConfig.url}/category/${product.category.slug}` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${siteConfig.url}/product/${product.slug}` },
    ],
  };

  return (
    <div className="container-editorial py-10 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <nav className="mb-8 text-xs text-taupe">
        <Link href="/shop">Shop</Link> / <Link href={`/category/${product.category.slug}`}>{product.category.name}</Link> / {product.name}
      </nav>

      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <ProductGallery images={product.images} productName={product.name} />
        <PurchasePanel product={product} variants={product.variants} customizationOptions={product.customizationOptions} />
      </div>

      <div className="mx-auto mt-20 max-w-3xl border-t border-line pt-14">
        <h2 className="mb-6 font-display text-2xl">Description</h2>
        <p className="text-sm leading-relaxed text-charcoal/80">{product.description}</p>
      </div>

      {product.reviews.length > 0 && (
        <div className="mx-auto mt-16 max-w-3xl border-t border-line pt-14">
          <h2 className="mb-8 font-display text-2xl">
            Reviews {avgRating && `(${avgRating.toFixed(1)} / 5)`}
          </h2>
          <div className="space-y-8">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b border-line/60 pb-8 last:border-none">
                <div className="mb-2 flex gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5" fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.5} />
                  ))}
                </div>
                {review.title && <p className="font-display text-lg">{review.title}</p>}
                <p className="mt-2 text-sm text-charcoal/80">{review.comment}</p>
                <p className="mt-3 kicker">
                  {review.user.name ?? "Verified Customer"} · {formatDate(review.createdAt)}
                  {review.isVerifiedPurchase && " · Verified Purchase"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <ProductRail
        kicker="You May Also Like"
        title="Complete the Look"
        products={related.map((r) => r)}
        viewAllHref={`/category/${product.category.slug}`}
      />
    </div>
  );
}
