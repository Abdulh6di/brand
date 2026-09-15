import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublishedPosts } from "@/server/queries/blog";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Journal", description: "Fashion guides, fabric education, and stories from the AELIA atelier." };

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="container-editorial py-16 md:py-24">
      <div className="mb-14 text-center">
        <p className="kicker mb-3">The Journal</p>
        <h1 className="font-display text-4xl md:text-5xl">Stories &amp; Style Guides</h1>
      </div>

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-ivory">
              <Image
                src={post.coverImageUrl ?? "https://picsum.photos/seed/blog/800/600"}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p className="kicker mt-4 mb-2">{post.category?.name ?? "Journal"}</p>
            <h2 className="font-display text-xl leading-snug">{post.title}</h2>
            <p className="mt-2 text-xs text-taupe">{post.publishedAt && formatDate(post.publishedAt)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
