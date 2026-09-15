import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteConfig } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, collections, posts] = await Promise.all([
    db.product.findMany({ where: { status: "ACTIVE", deletedAt: null }, select: { slug: true, updatedAt: true } }),
    db.category.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
    db.collection.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
    db.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes = [
    "",
    "/shop",
    "/collections",
    "/lookbook",
    "/custom-order",
    "/about",
    "/contact",
    "/size-guide",
    "/shipping",
    "/returns",
    "/faq",
    "/privacy-policy",
    "/terms",
    "/blog",
    "/track-order",
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const productRoutes = products.map((p) => ({
    url: `${siteConfig.url}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${siteConfig.url}/category/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const collectionRoutes = collections.map((c) => ({
    url: `${siteConfig.url}/collections/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const postRoutes = posts.map((p) => ({
    url: `${siteConfig.url}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...collectionRoutes, ...postRoutes];
}
