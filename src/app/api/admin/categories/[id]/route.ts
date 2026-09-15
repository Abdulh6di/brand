import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { apiSuccess, apiError, handleApiError } from "@/server/api-response";

const schema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("categories.update");
    const { id } = await params;
    const input = schema.parse(await req.json());
    const category = await db.category.update({ where: { id }, data: input });
    return apiSuccess({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("categories.delete");
    const { id } = await params;
    const productCount = await db.product.count({ where: { categoryId: id } });
    if (productCount > 0) return apiError("Cannot delete a category that still has products. Reassign them first.", 400);
    await db.category.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
