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
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).default("DRAFT"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission("blog.create");
    const input = schema.parse(await req.json());
    const post = await db.blogPost.create({
      data: { ...input, authorId: session.user.id, publishedAt: input.status === "PUBLISHED" ? new Date() : undefined },
    });
    return apiSuccess({ post }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
