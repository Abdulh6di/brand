import { auth } from "@/lib/auth";
import { resolveCart, getCartSummary } from "@/server/cart";
import { apiSuccess, handleApiError } from "@/server/api-response";

export async function GET() {
  try {
    const cart = await resolveCart(false);
    if (!cart) return apiSuccess({ lines: [], subtotal: 0, itemCount: 0, discountAmount: 0, couponCode: null });

    const session = await auth();
    return apiSuccess(await getCartSummary(cart.id, session?.user?.id));
  } catch (error) {
    return handleApiError(error);
  }
}
