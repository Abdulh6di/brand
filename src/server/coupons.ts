import "server-only";
import { db } from "@/lib/db";

export type CouponValidationResult =
  | { valid: true; coupon: NonNullable<Awaited<ReturnType<typeof db.coupon.findUnique>>>; discountAmount: number }
  | { valid: false; reason: string };

/** Recomputes discount server-side. Never trust a discount amount sent by the client. */
export async function validateCoupon(code: string, subtotal: number, userId?: string): Promise<CouponValidationResult> {
  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon || !coupon.isActive) return { valid: false, reason: "Coupon not found" };

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return { valid: false, reason: "Coupon is not active yet" };
  if (coupon.expiresAt && coupon.expiresAt < now) return { valid: false, reason: "Coupon has expired" };
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return { valid: false, reason: `Minimum order amount not met` };
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, reason: "Coupon usage limit reached" };
  }

  if (userId) {
    const usageCount = await db.couponUsage.count({ where: { couponId: coupon.id, userId } });
    if (coupon.perUserLimit && usageCount >= coupon.perUserLimit) {
      return { valid: false, reason: "You've already used this coupon" };
    }
    if (coupon.firstOrderOnly) {
      const priorOrders = await db.order.count({ where: { userId, status: { not: "CANCELLED" } } });
      if (priorOrders > 0) return { valid: false, reason: "This coupon is valid for first orders only" };
    }
  }

  let discountAmount =
    coupon.type === "PERCENTAGE" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;

  if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
  discountAmount = Math.min(discountAmount, subtotal);

  return { valid: true, coupon, discountAmount };
}
