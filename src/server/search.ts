import { db } from "@/lib/db";
import { getProducts, type ProductCardData } from "@/server/queries/products";

/**
 * Search abstraction. `DbSearchProvider` runs a full-text-ish query against
 * Postgres via Prisma. Swap in an `AlgoliaSearchProvider` /
 * `MeilisearchProvider` later by implementing the same interface — no
 * caller code changes.
 */
export interface SearchProvider {
  search(query: string, limit?: number): Promise<ProductCardData[]>;
}

class DbSearchProvider implements SearchProvider {
  async search(query: string, limit = 24) {
    if (!query.trim()) return [];
    const { products } = await getProducts({ search: query, perPage: limit });
    return products;
  }
}

export const searchProvider: SearchProvider = new DbSearchProvider();

export async function getPopularSearchTerms() {
  const categories = await db.category.findMany({ where: { status: "ACTIVE" }, take: 6, orderBy: { sortOrder: "asc" } });
  return categories.map((c) => c.name);
}
