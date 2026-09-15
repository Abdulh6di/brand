import { auth } from "@/lib/auth";
import { getWishlistForClient } from "@/server/serializers/cart";
import { getOrCreateWishlist } from "@/server/wishlist";
import { apiSuccess, handleApiError } from "@/server/api-response";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiSuccess({ items: [] });

    const wishlist = await getOrCreateWishlist();
    if (!wishlist) return apiSuccess({ items: [] });

    const items = await getWishlistForClient(wishlist.id);
    return apiSuccess({ items });
  } catch (error) {
    return handleApiError(error);
  }
}
