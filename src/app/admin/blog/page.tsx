import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader, AdminButton, AdminBadge } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Blog — Admin" };

export default async function AdminBlogPage() {
  await requirePermission("blog.read");
  const posts = await db.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminPageHeader
        title="Blog"
        description={`${posts.length} posts`}
        action={
          <AdminButton asChild>
            <Link href="/admin/blog/new">+ New Post</Link>
          </AdminButton>
        }
      />
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-500">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-neutral-100 last:border-none hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium">{post.title}</td>
                <td className="px-4 py-3">
                  <AdminBadge tone={post.status === "PUBLISHED" ? "success" : "neutral"}>{post.status}</AdminBadge>
                </td>
                <td className="px-4 py-3 text-neutral-500">{formatDate(post.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/blog/${post.id}`} className="text-neutral-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
