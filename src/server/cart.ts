import "server-only";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Prisma } from "@/generated/prisma/client";
import { validateCoupon } from "@/server/coupons";
import { serializeCartLines } from "@/server/serializers/cart";
import type { AddCartItemInput } from "@/validations/cart";

export const CART_COOKIE = "aelia_cart_token";

export type CustomizationSelectionSnapshot = {
  optionId: string;
  optionType: string;
  optionLabel: string;
  choiceId: string;
  choiceLabel: string;
  priceDelta: number;
};

async function getGuestToken() {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

async function ensureGuestToken() {
  const store = await cookies();
  const existing = store.get(CART_COOKIE)?.value;
  if (existing) return existing;
  const token = nanoid(24);
  store.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90,
    path: "/",
  });
  return token;
}

/** Resolves (and lazily creates) the cart for the current request: the
 * logged-in user's cart, or a guest cart keyed by an httpOnly cookie. */
export async function resolveCart(createIfMissing = false) {
  const session = await auth();

  if (session?.user?.id) {
    let cart = await db.cart.findUnique({ where: { userId: session.user.id } });
    if (!cart && createIfMissing) {
      cart = await db.cart.create({ data: { userId: session.user.id } });
    }
    return cart;
  }

  const token = await getGuestToken();
  if (!token) {
    if (!createIfMissing) return null;
    const newToken = await ensureGuestToken();
    return db.cart.create({ data: { guestToken: newToken } });
  }

  let cart = await db.cart.findUnique({ where: { guestToken: token } });
  if (!cart && createIfMissing) {
    cart = await db.cart.create({ data: { guestToken: token } });
  }
  return cart;
}

export async function getCartWithItems(cartId: string) {
  return db.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
          variant: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

type CartWithItems = NonNullable<Awaited<ReturnType<typeof getCartWithItems>>>;

export function computeCartTotals(items: CartWithItems["items"]) {
  const activeItems = items.filter((i) => !i.savedForLater);
  const subtotal = activeItems.reduce((sum, item) => {
    const base = item.variant?.priceOverride ?? item.product.salePrice ?? item.product.price;
    return sum + (base + item.customizationPriceDelta) * item.quantity;
  }, 0);
  return { subtotal, itemCount: activeItems.reduce((s, i) => s + i.quantity, 0) };
}

export async function getCartSummary(cartId: string, userId?: string) {
  const cart = await db.cart.findUnique({ where: { id: cartId } });
  const full = await getCartWithItems(cartId);
  if (!full) {
    return { lines: [], subtotal: 0, itemCount: 0, discountAmount: 0, couponCode: null as string | null };
  }

  const { subtotal, itemCount } = computeCartTotals(full.items);

  let discountAmount = 0;
  let couponCode: string | null = cart?.couponCode ?? null;
  if (couponCode) {
    const result = await validateCoupon(couponCode, subtotal, userId);
    if (result.valid) {
      discountAmount = result.discountAmount;
    } else {
      couponCode = null;
      await db.cart.update({ where: { id: cartId }, data: { couponCode: null } });
    }
  }

  return { lines: serializeCartLines(full), subtotal, itemCount, discountAmount, couponCode };
}

export async function addItemToCart(input: AddCartItemInput) {
  const cart = await resolveCart(true);
  if (!cart) throw new Error("Unable to resolve cart");

  const product = await db.product.findUnique({
    where: { id: input.productId },
    include: { customizationOptions: { include: { choices: true } } },
  });
  if (!product || product.status !== "ACTIVE") throw new Error("Product not available");

  let variant = null;
  if (input.variantId) {
    variant = await db.productVariant.findUnique({ where: { id: input.variantId } });
    if (!variant || variant.productId !== product.id) throw new Error("Invalid variant");
    if (variant.stock - variant.reservedStock < input.quantity) throw new Error("Insufficient stock");
  }

  let customizationPriceDelta = 0;
  const selections: CustomizationSelectionSnapshot[] = [];
  if (input.customizationSelections?.length) {
    for (const sel of input.customizationSelections) {
      const option = product.customizationOptions.find((o) => o.id === sel.optionId);
      const choice = option?.choices.find((c) => c.id === sel.choiceId);
      if (!option || !choice) throw new Error("Invalid customization selection");
      customizationPriceDelta += choice.priceDelta;
      selections.push({
        optionId: option.id,
        optionType: option.type,
        optionLabel: option.label,
        choiceId: choice.id,
        choiceLabel: choice.label,
        priceDelta: choice.priceDelta,
      });
    }
  }

  const customizationJson = selections.length ? { selections } : null;

  const existing = await db.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: product.id,
      variantId: variant?.id ?? null,
      savedForLater: false,
      customization: { equals: customizationJson ?? Prisma.JsonNull },
    },
  });

  if (existing) {
    return db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + input.quantity },
    });
  }

  return db.cartItem.create({
    data: {
      cartId: cart.id,
      productId: product.id,
      variantId: variant?.id,
      quantity: input.quantity,
      customization: customizationJson ?? undefined,
      customizationPriceDelta,
    },
  });
}

/** Merges a guest cart into the logged-in user's cart (called right after sign-in). */
export async function mergeGuestCartIntoUser(userId: string) {
  const token = await getGuestToken();
  if (!token) return;

  const guestCart = await db.cart.findUnique({ where: { guestToken: token }, include: { items: true } });
  if (!guestCart || guestCart.items.length === 0) return;

  let userCart = await db.cart.findUnique({ where: { userId } });
  if (!userCart) {
    userCart = await db.cart.update({ where: { id: guestCart.id }, data: { userId, guestToken: null } });
    return;
  }

  for (const item of guestCart.items) {
    await db.cartItem.create({
      data: {
        cartId: userCart.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        customization: item.customization ?? undefined,
        customizationPriceDelta: item.customizationPriceDelta,
        savedForLater: item.savedForLater,
      },
    });
  }
  await db.cart.delete({ where: { id: guestCart.id } });
}
