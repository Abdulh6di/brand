import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { apiSuccess, handleApiError } from "@/server/api-response";

const schema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
});

export async function POST(req: NextRequest) {
  try {
    await requirePermission("collections.create");
    const input = schema.parse(await req.json());
    const collection = await db.collection.create({ data: input });
    return apiSuccess({ collection }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
