import { db } from "@/lib/db";
import type { Product, ProductImage, ProductVariant, Category } from "@/generated/prisma/client";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  salePrice: number | null;
  currency: string;
  image: string;
  hoverImage: string | null;
  colors: string[];
  sizes: string[];
  badges: Array<"NEW" | "BESTSELLER" | "LIMITED" | "SALE" | "EXCLUSIVE">;
  categorySlug: string;
  categoryName: string;
  inStock: boolean;
};

type ProductWithRelations = Product & {
  images: ProductImage[];
  variants: ProductVariant[];
  category: Category;
};

export function toProductCard(product: ProductWithRelations): ProductCardData {
  const sorted = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const badges: ProductCardData["badges"] = [];
  if (product.isNew) badges.push("NEW");
  if (product.isBestseller) badges.push("BESTSELLER");
  if (product.isLimited) badges.push("LIMITED");
  if (product.salePrice) badges.push("SALE");
  if (product.isExclusive) badges.push("EXCLUSIVE");

  const totalStock = product.variants.reduce((sum, v) => sum + Math.max(v.stock - v.reservedStock, 0), 0);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    salePrice: product.salePrice,
    currency: product.currency,
    image: sorted[0]?.url ?? "/images/placeholder.jpg",
    hoverImage: sorted[1]?.url ?? null,
    colors: product.availableColors,
    sizes: product.availableSizes,
    badges,
    categorySlug: product.category.slug,
    categoryName: product.category.name,
    inStock: totalStock > 0,
  };
}

const cardInclude = {
  images: true,
  variants: true,
  category: true,
} as const;

export async function getFeaturedProducts(limit = 8) {
  const products = await db.product.findMany({
    where: { status: "ACTIVE", isFeatured: true, deletedAt: null },
    include: cardInclude,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(toProductCard);
}

export async function getBestsellers(limit = 8) {
  const products = await db.product.findMany({
    where: { status: "ACTIVE", isBestseller: true, deletedAt: null },
    include: cardInclude,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(toProductCard);
}

export async function getNewArrivals(limit = 8) {
  const products = await db.product.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    include: cardInclude,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(toProductCard);
}

export type ProductFilters = {
  categorySlug?: string;
  collectionSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  search?: string;
  sort?: "featured" | "newest" | "price-asc" | "price-desc" | "bestselling";
  page?: number;
  perPage?: number;
};

export async function getProducts(filters: ProductFilters) {
  const {
    categorySlug,
    collectionSlug,
    minPrice,
    maxPrice,
    sizes,
    colors,
    search,
    sort = "featured",
    page = 1,
    perPage = 12,
  } = filters;

  const where: import("@/generated/prisma/client").Prisma.ProductWhereInput = {
    status: "ACTIVE",
    deletedAt: null,
  };

  if (categorySlug) where.category = { slug: categorySlug };
  if (collectionSlug) where.collections = { some: { slug: collectionSlug } };
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }
  if (sizes?.length) where.availableSizes = { hasSome: sizes };
  if (colors?.length) where.availableColors = { hasSome: colors };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { tags: { has: search.toLowerCase() } },
    ];
  }

  const orderBy: import("@/generated/prisma/client").Prisma.ProductOrderByWithRelationInput =
    sort === "newest"
      ? { createdAt: "desc" }
      : sort === "price-asc"
        ? { price: "asc" }
        : sort === "price-desc"
          ? { price: "desc" }
          : sort === "bestselling"
            ? { isBestseller: "desc" }
            : { isFeatured: "desc" };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: cardInclude,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.product.count({ where }),
  ]);

  return {
    products: products.map(toProductCard),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      videos: true,
      variants: true,
      category: true,
      collections: true,
      customizationOptions: { include: { choices: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
      reviews: { where: { status: "APPROVED" }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  const products = await db.product.findMany({
    where: { categoryId, status: "ACTIVE", deletedAt: null, id: { not: productId } },
    include: cardInclude,
    take: limit,
  });
  return products.map(toProductCard);
}
