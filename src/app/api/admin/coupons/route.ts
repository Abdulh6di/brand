import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { apiSuccess, handleApiError } from "@/server/api-response";

const schema = z.object({
  code: z.string().trim().min(3),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().int().positive(),
  minOrderAmount: z.number().int().positive().optional(),
  maxDiscountAmount: z.number().int().positive().optional(),
  firstOrderOnly: z.boolean().default(false),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    await requirePermission("coupons.create");
    const input = schema.parse(await req.json());
    const coupon = await db.coupon.create({
      data: { ...input, code: input.code.toUpperCase(), expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined },
    });
    return apiSuccess({ coupon }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
