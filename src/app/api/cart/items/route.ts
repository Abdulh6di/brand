import { NextRequest } from "next/server";
import { addCartItemSchema } from "@/validations/cart";
import { addItemToCart, resolveCart, getCartSummary } from "@/server/cart";
import { auth } from "@/lib/auth";
import { apiSuccess, handleApiError, apiError } from "@/server/api-response";
import { rateLimit, getClientIp } from "@/server/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { success } = await rateLimit(`cart-add:${getClientIp(req)}`, 30, 60);
    if (!success) return apiError("Too many requests", 429);

    const body = await req.json();
    const input = addCartItemSchema.parse(body);

    await addItemToCart(input);

    const cart = await resolveCart(false);
    if (!cart) return apiSuccess({ lines: [], subtotal: 0, itemCount: 0, discountAmount: 0, couponCode: null });

    const session = await auth();
    return apiSuccess(await getCartSummary(cart.id, session?.user?.id), 201);
  } catch (error) {
    if (error instanceof Error && ["Product not available", "Invalid variant", "Insufficient stock", "Invalid customization selection"].includes(error.message)) {
      return apiError(error.message, 400);
    }
    return handleApiError(error);
  }
}
