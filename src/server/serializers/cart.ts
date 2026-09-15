import type { CartLine } from "@/hooks/use-cart-store";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: { include: { images: true } };
        variant: true;
      };
    };
  };
}>;

export function serializeCartLines(cart: CartWithItems): CartLine[] {
  return cart.items
    .filter((item) => !item.savedForLater)
    .map((item) => {
      const customization = item.customization as { selections?: { choiceLabel: string }[] } | null;
      const unitBase = item.variant?.priceOverride ?? item.product.salePrice ?? item.product.price;
      const availableStock = item.variant ? item.variant.stock - item.variant.reservedStock : 999;

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        name: item.product.name,
        slug: item.product.slug,
        image: item.product.images[0]?.url ?? "/images/placeholder.jpg",
        color: item.variant?.color ?? undefined,
        size: item.variant?.size ?? undefined,
        customizationLabel: customization?.selections?.map((s) => s.choiceLabel).join(", "),
        unitPrice: unitBase + item.customizationPriceDelta,
        quantity: item.quantity,
        currency: item.product.currency,
        maxQuantity: Math.max(availableStock, 0),
      };
    });
}

export async function getWishlistForClient(wishlistId: string) {
  const items = await db.wishlistItem.findMany({
    where: { wishlistId },
    include: { product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } }, variant: true },
    orderBy: { createdAt: "desc" },
  });

  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    name: item.product.name,
    slug: item.product.slug,
    image: item.product.images[0]?.url ?? "/images/placeholder.jpg",
    price: item.product.price,
    salePrice: item.product.salePrice,
    currency: item.product.currency,
    inStock: item.product.status === "ACTIVE",
  }));
}
