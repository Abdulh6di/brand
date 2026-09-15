import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { apiSuccess, handleApiError } from "@/server/api-response";

const schema = z.object({
  title: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  excerpt: z.string().optional(),
  content: z.string().trim().min(10),
  coverImageUrl: z.string().url().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("blog.update");
    const { id } = await params;
    const input = schema.parse(await req.json());
    const existing = await db.blogPost.findUnique({ where: { id } });
    const post = await db.blogPost.update({
      where: { id },
      data: { ...input, publishedAt: input.status === "PUBLISHED" && !existing?.publishedAt ? new Date() : undefined },
    });
    return apiSuccess({ post });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("blog.delete");
    const { id } = await params;
    await db.blogPost.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
