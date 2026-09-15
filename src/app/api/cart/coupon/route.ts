import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { resolveCart, getCartWithItems, computeCartTotals, getCartSummary } from "@/server/cart";
import { validateCoupon } from "@/server/coupons";
import { apiSuccess, apiError, handleApiError } from "@/server/api-response";

export async function POST(req: NextRequest) {
  try {
    const { code } = z.object({ code: z.string().min(1) }).parse(await req.json());
    const cart = await resolveCart(true);
    if (!cart) return apiError("Cart not found", 404);

    const full = await getCartWithItems(cart.id);
    const { subtotal } = computeCartTotals(full?.items ?? []);
    const session = await auth();
    const result = await validateCoupon(code, subtotal, session?.user?.id);

    if (!result.valid) return apiError(result.reason, 400);

    await db.cart.update({ where: { id: cart.id }, data: { couponCode: result.coupon.code } });
    return apiSuccess(await getCartSummary(cart.id, session?.user?.id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const cart = await resolveCart(false);
    if (!cart) return apiSuccess({ lines: [], subtotal: 0, itemCount: 0, discountAmount: 0, couponCode: null });

    await db.cart.update({ where: { id: cart.id }, data: { couponCode: null } });
    const session = await auth();
    return apiSuccess(await getCartSummary(cart.id, session?.user?.id));
  } catch (error) {
    return handleApiError(error);
  }
}
