import { db } from "@/lib/db";

export async function getPublishedPosts() {
  return db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true, author: { select: { name: true } } },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPostBySlug(slug: string) {
  return db.blogPost.findUnique({
    where: { slug },
    include: { category: true, author: { select: { name: true } } },
  });
}
