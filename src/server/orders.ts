import "server-only";
import { db } from "@/lib/db";
import { getCartWithItems } from "@/server/cart";
import { validateCoupon } from "@/server/coupons";
import { getShippingOptions } from "@/server/shipping";
import { getPaymentGateway } from "@/server/payments";
import { sendEmail } from "@/server/email";
import { orderConfirmationEmail } from "@/emails/templates";
import type { CheckoutInput } from "@/validations/checkout";

async function generateOrderNumber() {
  const count = await db.order.count();
  const sequence = String(100000 + count + 1);
  return `AEL-${sequence}`;
}

export class CheckoutError extends Error {}

export async function cancelUnpaidOrder(orderId: string, reason: string) {
  await db.$transaction(async (tx) => {
    const items = await tx.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      if (!item.variantId) continue;
      const before = await tx.productVariant.findUniqueOrThrow({ where: { id: item.variantId } });
      const variant = await tx.productVariant.update({
        where: { id: item.variantId },
        data: { reservedStock: { decrement: item.quantity } },
      });
      await tx.inventoryTransaction.create({
        data: {
          variantId: item.variantId,
          type: "ORDER_CANCELLATION_RESTOCK",
          quantity: item.quantity,
          previousStock: before.stock - before.reservedStock,
          newStock: variant.stock - variant.reservedStock,
          orderId,
          reason,
        },
      });
    }
    await tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED", cancelledAt: new Date(), cancelReason: reason } });
    await tx.orderStatusHistory.create({ data: { orderId, status: "CANCELLED", note: reason } });
  });
}

export async function createOrderFromCart(params: { cartId: string; userId?: string; input: CheckoutInput }) {
  const { cartId, userId, input } = params;

  const cart = await getCartWithItems(cartId);
  const activeItems = cart?.items.filter((i) => !i.savedForLater) ?? [];
  if (!cart || activeItems.length === 0) throw new CheckoutError("Your bag is empty");

  for (const item of activeItems) {
    if (item.product.status !== "ACTIVE") throw new CheckoutError(`${item.product.name} is no longer available`);
    if (item.variant && item.variant.stock - item.variant.reservedStock < item.quantity) {
      throw new CheckoutError(`${item.product.name} no longer has enough stock`);
    }
  }

  const subtotal = activeItems.reduce((sum, item) => {
    const base = item.variant?.priceOverride ?? item.product.salePrice ?? item.product.price;
    return sum + (base + item.customizationPriceDelta) * item.quantity;
  }, 0);

  let discountAmount = 0;
  let couponId: string | null = null;
  const dbCart = await db.cart.findUnique({ where: { id: cartId } });
  if (dbCart?.couponCode) {
    const result = await validateCoupon(dbCart.couponCode, subtotal, userId);
    if (result.valid) {
      discountAmount = result.discountAmount;
      couponId = result.coupon.id;
    }
  }

  const shippingOptions = await getShippingOptions(input.country, subtotal - discountAmount);
  const shippingOption = shippingOptions.find((o) => o.method === input.shippingMethod) ?? shippingOptions[0];
  if (!shippingOption) throw new CheckoutError("Invalid delivery method");

  const total = Math.max(subtotal - discountAmount, 0) + shippingOption.price;
  const currency = activeItems[0]?.product.currency ?? "USD";
  const orderNumber = await generateOrderNumber();

  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId,
        guestEmail: userId ? undefined : input.email,
        status: "PENDING",
        subtotal,
        discountAmount,
        shippingAmount: shippingOption.price,
        taxAmount: 0,
        total,
        currency,
        couponId: couponId ?? undefined,
        paymentMethod: input.paymentMethod,
        shippingMethod: input.shippingMethod,
        shippingAddress: {
          fullName: input.fullName,
          phone: input.phone,
          country: input.country,
          city: input.city,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2,
          postalCode: input.postalCode,
        },
        customerNote: input.customerNote,
        items: {
          create: activeItems.map((item) => {
            const base = item.variant?.priceOverride ?? item.product.salePrice ?? item.product.price;
            return {
              productId: item.productId,
              variantId: item.variantId,
              productName: item.product.name,
              variantLabel: item.variant ? [item.variant.color, item.variant.size].filter(Boolean).join(" / ") : null,
              sku: item.variant?.sku ?? item.product.sku,
              unitPrice: base,
              quantity: item.quantity,
              customization: item.customization ?? undefined,
              customizationPriceDelta: item.customizationPriceDelta,
              lineTotal: (base + item.customizationPriceDelta) * item.quantity,
            };
          }),
        },
        statusHistory: { create: [{ status: "PENDING", note: "Order placed" }] },
      },
      include: { items: true },
    });

    for (const item of activeItems) {
      if (!item.variantId) continue;
      const variant = await tx.productVariant.update({
        where: { id: item.variantId },
        data: { reservedStock: { increment: item.quantity } },
      });
      await tx.inventoryTransaction.create({
        data: {
          variantId: item.variantId,
          type: "ORDER_DEDUCTION",
          quantity: -item.quantity,
          previousStock: variant.stock - variant.reservedStock + item.quantity,
          newStock: variant.stock - variant.reservedStock,
          orderId: created.id,
        },
      });
    }

    if (couponId) {
      await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
      await tx.couponUsage.create({
        data: { couponId, userId, orderId: created.id, discountAmount },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId, savedForLater: false } });
    await tx.cart.update({ where: { id: cartId }, data: { couponCode: null } });

    return created;
  });

  const gateway = getPaymentGateway(input.paymentMethod);
  let intent;
  try {
    intent = await gateway.createPaymentIntent({ orderId: order.id, amount: total, currency });
  } catch (err) {
    await cancelUnpaidOrder(order.id, "Payment initialization failed");
    throw new CheckoutError(err instanceof Error ? err.message : "Unable to initialize payment");
  }

  await db.payment.create({
    data: {
      orderId: order.id,
      provider: input.paymentMethod === "CARD" ? "STRIPE" : input.paymentMethod,
      transactionId: intent.transactionId,
      amount: total,
      currency,
      status: intent.status === "succeeded" ? "SUCCESS" : "PENDING",
      method: input.paymentMethod,
    },
  });

  if (input.paymentMethod !== "CARD") {
    await db.order.update({
      where: { id: order.id },
      data: { status: "CONFIRMED" },
    });
    await db.orderStatusHistory.create({ data: { orderId: order.id, status: "CONFIRMED", note: "Awaiting payment collection" } });

    await sendEmail({
      to: input.email,
      subject: `Order ${order.orderNumber} confirmed`,
      html: orderConfirmationEmail({ orderNumber: order.orderNumber, customerName: input.fullName, total, currency }),
    });
  }

  return { orderNumber: order.orderNumber, orderId: order.id, clientSecret: intent.clientSecret };
}
