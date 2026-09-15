import { NextRequest } from "next/server";
import { z } from "zod";
import { toggleWishlistItem } from "@/server/wishlist";
import { apiSuccess, apiError, handleApiError } from "@/server/api-response";

const schema = z.object({ productId: z.string().min(1), variantId: z.string().optional() });

export async function POST(req: NextRequest) {
  try {
    const { productId, variantId } = schema.parse(await req.json());
    const result = await toggleWishlistItem(productId, variantId);
    return apiSuccess(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return apiError("Please sign in to save items to your wishlist", 401);
    }
    return handleApiError(error);
  }
}
