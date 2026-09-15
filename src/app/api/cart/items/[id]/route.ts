import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updateCartItemSchema } from "@/validations/cart";
import { resolveCart, getCartSummary } from "@/server/cart";
import { apiSuccess, handleApiError, apiError } from "@/server/api-response";

async function assertOwnership(itemId: string) {
  const cart = await resolveCart(false);
  if (!cart) return null;
  const item = await db.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
  return item ? cart : null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cart = await assertOwnership(id);
    if (!cart) return apiError("Cart item not found", 404);

    const input = updateCartItemSchema.parse(await req.json());

    if (input.quantity === 0) {
      await db.cartItem.delete({ where: { id } });
    } else {
      await db.cartItem.update({ where: { id }, data: input });
    }

    const session = await auth();
    return apiSuccess(await getCartSummary(cart.id, session?.user?.id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cart = await assertOwnership(id);
    if (!cart) return apiError("Cart item not found", 404);

    await db.cartItem.delete({ where: { id } });
    const session = await auth();
    return apiSuccess(await getCartSummary(cart.id, session?.user?.id));
  } catch (error) {
    return handleApiError(error);
  }
}
