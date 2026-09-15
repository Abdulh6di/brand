import type { Metadata } from "next";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { searchProvider, getPopularSearchTerms } from "@/server/search";
import { ProductCard } from "@/components/storefront/product-card";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const [results, popularTerms] = await Promise.all([searchProvider.search(q), getPopularSearchTerms()]);

  return (
    <div className="container-editorial py-12 md:py-16">
      <form action="/search" className="mx-auto mb-12 max-w-xl">
        <div className="flex items-center gap-3 border-b border-ink pb-3">
          <SearchIcon className="h-4 w-4 text-taupe" strokeWidth={1.5} />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search products, fabrics, collections..."
            className="w-full bg-transparent text-lg focus-visible:outline-none"
            autoFocus
          />
        </div>
      </form>

      {!q ? (
        <div className="text-center">
          <p className="kicker mb-4">Popular Searches</p>
          <div className="flex flex-wrap justify-center gap-3">
            {popularTerms.map((term) => (
              <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="border border-line-strong px-4 py-2 text-sm hover:border-ink">
                {term}
              </Link>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title={`No results for "${q}"`}
          description="Try a different search term, or explore our full collection."
          actionLabel="Shop All"
          actionHref="/shop"
        />
      ) : (
        <>
          <p className="mb-8 text-xs text-taupe">{results.length} results for &ldquo;{q}&rdquo;</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
