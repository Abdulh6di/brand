import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { db } from "@/lib/db";
import { validateCoupon } from "@/server/coupons";

/**
 * Integration test against the real (local/dev) Postgres database seeded by
 * `npm run db:seed`. Requires WELCOME10 and AELIA50 to exist — run the seed
 * script first if this fails with "Coupon not found".
 */
describe("validateCoupon", () => {
  afterAll(async () => {
    await db.$disconnect();
  });

  it("rejects an unknown coupon code", async () => {
    const result = await validateCoupon("DOES-NOT-EXIST", 10000);
    expect(result.valid).toBe(false);
  });

  it("applies a percentage discount capped to the subtotal", async () => {
    const result = await validateCoupon("WELCOME10", 5000);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.discountAmount).toBe(500);
    }
  });

  it("rejects a fixed coupon below its minimum order amount", async () => {
    const result = await validateCoupon("AELIA50", 1000);
    expect(result.valid).toBe(false);
  });

  it("applies a fixed coupon once the minimum order amount is met", async () => {
    const result = await validateCoupon("AELIA50", 40000);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.discountAmount).toBe(5000);
    }
  });
});
