import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { apiSuccess, handleApiError } from "@/server/api-response";

const schema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUOTED", "CUSTOMER_APPROVED", "DEPOSIT_PAID", "IN_PRODUCTION", "READY", "DELIVERED", "CANCELLED"]),
  quotedPrice: z.number().int().positive().optional(),
  depositAmount: z.number().int().positive().optional(),
  adminNote: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("customOrders.update");
    const { id } = await params;
    const input = schema.parse(await req.json());
    const customOrder = await db.customOrder.update({ where: { id }, data: input });
    return apiSuccess({ customOrder });
  } catch (error) {
    return handleApiError(error);
  }
}
