import "server-only";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getOrCreateWishlist() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let wishlist = await db.wishlist.findUnique({ where: { userId: session.user.id } });
  if (!wishlist) {
    wishlist = await db.wishlist.create({ data: { userId: session.user.id } });
  }
  return wishlist;
}

export async function toggleWishlistItem(productId: string, variantId?: string) {
  const wishlist = await getOrCreateWishlist();
  if (!wishlist) throw new Error("UNAUTHENTICATED");

  const existing = await db.wishlistItem.findFirst({
    where: { wishlistId: wishlist.id, productId, variantId: variantId ?? null },
  });

  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
    return { wishlisted: false };
  }

  await db.wishlistItem.create({ data: { wishlistId: wishlist.id, productId, variantId } });
  return { wishlisted: true };
}
