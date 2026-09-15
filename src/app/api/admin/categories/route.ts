import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { apiSuccess, handleApiError } from "@/server/api-response";

const schema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export async function POST(req: NextRequest) {
  try {
    await requirePermission("categories.create");
    const input = schema.parse(await req.json());
    const category = await db.category.create({ data: input });
    return apiSuccess({ category }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
