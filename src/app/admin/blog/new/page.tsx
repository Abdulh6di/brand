import type { Metadata } from "next";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader } from "@/components/admin/ui";
import { BlogForm } from "@/components/admin/blog-form";

export const metadata: Metadata = { title: "New Post — Admin" };

export default async function NewBlogPostPage() {
  await requirePermission("blog.create");
  return (
    <div>
      <AdminPageHeader title="New Post" />
      <BlogForm />
    </div>
  );
}
