import { db } from "@/lib/db";

export async function getActiveCategories() {
  return db.category.findMany({
    where: { status: "ACTIVE" },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({ where: { slug } });
}

export async function getActiveCollections(limit?: number) {
  return db.collection.findMany({
    where: { status: "ACTIVE" },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
}

export async function getCollectionBySlug(slug: string) {
  return db.collection.findUnique({ where: { slug } });
}

export async function getFeaturedCollection() {
  return db.collection.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getApprovedReviewsSample(limit = 6) {
  return db.review.findMany({
    where: { status: "APPROVED" },
    include: { user: { select: { name: true } }, product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getHomepageSections() {
  return db.homepageSection.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPublishedLookbook() {
  return db.lookbook.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { images: { orderBy: { sortOrder: "asc" }, include: { products: { include: { product: true } } } } },
  });
}
