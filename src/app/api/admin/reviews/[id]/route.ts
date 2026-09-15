import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { apiSuccess, handleApiError } from "@/server/api-response";

const schema = z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("reviews.update");
    const { id } = await params;
    const { status } = schema.parse(await req.json());
    const review = await db.review.update({ where: { id }, data: { status } });
    return apiSuccess({ review });
  } catch (error) {
    return handleApiError(error);
  }
}
