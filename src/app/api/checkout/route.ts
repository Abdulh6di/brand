import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { resolveCart } from "@/server/cart";
import { checkoutSchema } from "@/validations/checkout";
import { createOrderFromCart, CheckoutError } from "@/server/orders";
import { apiSuccess, apiError, handleApiError } from "@/server/api-response";
import { rateLimit, getClientIp } from "@/server/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { success } = await rateLimit(`checkout:${getClientIp(req)}`, 10, 60);
    if (!success) return apiError("Too many requests, please try again shortly", 429);

    const input = checkoutSchema.parse(await req.json());
    const session = await auth();

    const cart = await resolveCart(false);
    if (!cart) return apiError("Your bag is empty", 400);

    const result = await createOrderFromCart({ cartId: cart.id, userId: session?.user?.id, input });
    return apiSuccess(result, 201);
  } catch (error) {
    if (error instanceof CheckoutError) return apiError(error.message, 400);
    return handleApiError(error);
  }
}
