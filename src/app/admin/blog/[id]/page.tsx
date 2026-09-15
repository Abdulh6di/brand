import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader } from "@/components/admin/ui";
import { BlogForm } from "@/components/admin/blog-form";
import { ArchiveButton } from "@/components/admin/archive-button";

export const metadata: Metadata = { title: "Edit Post — Admin" };

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("blog.update");
  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <AdminPageHeader
        title={post.title}
        action={<ArchiveButton endpoint={`/api/admin/blog/${id}`} redirectTo="/admin/blog" label="Delete" confirmText="Delete this post?" />}
      />
      <BlogForm
        postId={id}
        initial={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? undefined,
          content: post.content,
          coverImageUrl: post.coverImageUrl ?? undefined,
          status: post.status,
        }}
      />
    </div>
  );
}
