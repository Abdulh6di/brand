import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts } from "@/server/queries/products";
import { getActiveCategories } from "@/server/queries/catalog";
import { ProductCard } from "@/components/storefront/product-card";
import { FiltersSidebar } from "@/components/storefront/shop/filters-sidebar";
import { SortSelect } from "@/components/storefront/shop/sort-select";
import { Pagination } from "@/components/storefront/shop/pagination";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse the full AELIA collection — bridal, occasion, and ready-to-wear luxury pieces.",
};

type SearchParams = Record<string, string | undefined>;

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const categories = await getActiveCategories();

  const filters = {
    categorySlug: sp.category,
    sizes: sp.sizes?.split(",").filter(Boolean),
    colors: sp.colors?.split(",").filter(Boolean),
    search: sp.q,
    sort: (sp.sort as never) ?? "featured",
    page: sp.page ? Number(sp.page) : 1,
  };

  const { products, total, page, totalPages } = await getProducts(filters);

  return (
    <div className="container-editorial py-12 md:py-16">
      <div className="mb-10 text-center">
        <p className="kicker mb-3">Full Collection</p>
        <h1 className="font-display text-4xl md:text-5xl">Shop All</h1>
      </div>

      <div className="flex flex-col gap-10 md:flex-row md:gap-12">
        <Suspense fallback={<div className="w-full md:w-56" />}>
          <FiltersSidebar categories={categories} />
        </Suspense>

        <div className="flex-1">
          <div className="mb-8 flex items-center justify-between">
            <p className="text-xs text-taupe">{total} pieces</p>
            <Suspense fallback={null}>
              <SortSelect />
            </Suspense>
          </div>

          {products.length === 0 ? (
            <EmptyState
              title="No pieces match your filters"
              description="Try adjusting your filters or browse the full collection."
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} searchParams={sp} />
        </div>
      </div>
    </div>
  );
}
