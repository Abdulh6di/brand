import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getPostBySlug } from "@/server/queries/blog";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    alternates: { canonical: `${siteConfig.url}/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    author: { "@type": "Person", name: post.author?.name ?? siteConfig.name },
  };

  return (
    <article className="container-editorial max-w-2xl py-16 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mb-10 text-center">
        <p className="kicker mb-3">{post.category?.name ?? "Journal"}</p>
        <h1 className="font-display text-4xl md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-xs text-taupe">
          {post.author?.name ?? siteConfig.name} · {post.publishedAt && formatDate(post.publishedAt)}
        </p>
      </div>
      {post.coverImageUrl && (
        <div className="relative mb-10 aspect-[16/9] overflow-hidden">
          <Image src={post.coverImageUrl} alt={post.title} fill sizes="100vw" className="object-cover" />
        </div>
      )}
      <div className="space-y-6 text-sm leading-relaxed text-charcoal/85">
        {post.content.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
