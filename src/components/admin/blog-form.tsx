"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AdminButton, AdminInput, AdminLabel, AdminTextarea, AdminSelect, AdminCard } from "@/components/admin/ui";
import { slugifyText } from "@/lib/utils";

type Initial = { title: string; slug: string; excerpt?: string; content: string; coverImageUrl?: string; status: "DRAFT" | "SCHEDULED" | "PUBLISHED" };

export function BlogForm({ initial, postId }: { initial?: Initial; postId?: string }) {
  const router = useRouter();
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(!!initial?.slug);
  const [excerpt, setExcerpt] = React.useState(initial?.excerpt ?? "");
  const [content, setContent] = React.useState(initial?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = React.useState(initial?.coverImageUrl ?? "");
  const [status, setStatus] = React.useState(initial?.status ?? "DRAFT");
  const [saving, setSaving] = React.useState(false);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugifyText(value));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(postId ? `/api/admin/blog/${postId}` : "/api/admin/blog", {
        method: postId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, excerpt, content, coverImageUrl: coverImageUrl || undefined, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Post saved");
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save post");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <AdminCard>
          <AdminLabel>Title</AdminLabel>
          <AdminInput value={title} onChange={(e) => onTitleChange(e.target.value)} required />
          <div className="mt-4">
            <AdminLabel>Slug</AdminLabel>
            <AdminInput value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} required />
          </div>
          <div className="mt-4">
            <AdminLabel>Excerpt</AdminLabel>
            <AdminInput value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>
          <div className="mt-4">
            <AdminLabel>Cover Image URL</AdminLabel>
            <AdminInput value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
          </div>
          <div className="mt-4">
            <AdminLabel>Content</AdminLabel>
            <AdminTextarea className="min-h-64" value={content} onChange={(e) => setContent(e.target.value)} required />
          </div>
        </AdminCard>
      </div>
      <div className="space-y-4">
        <AdminCard>
          <AdminLabel>Status</AdminLabel>
          <AdminSelect value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
          </AdminSelect>
        </AdminCard>
        <AdminButton type="submit" className="w-full" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Post"}
        </AdminButton>
      </div>
    </form>
  );
}
