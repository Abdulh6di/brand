import "server-only";
import { db } from "@/lib/db";
import type { OrderStatus } from "@/generated/prisma/client";

const FINALIZED_STATUSES: OrderStatus[] = ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
const TERMINAL_RETURN_STATUSES: OrderStatus[] = ["CANCELLED", "RETURNED"];

/**
 * Inventory lifecycle: `reservedStock` is set aside at checkout. Moving an
 * order into a finalized (shipped+) status converts that reservation into a
 * permanent deduction from `stock`. Cancelling or returning an order before
 * it shipped simply releases the reservation; cancelling/returning after it
 * shipped restocks the physical inventory.
 */
export async function updateOrderStatus(params: {
  orderId: string;
  newStatus: OrderStatus;
  note?: string;
  createdById?: string;
  trackingCourier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}) {
  const { orderId, newStatus, note, createdById, trackingCourier, trackingNumber, trackingUrl } = params;

  await db.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
    const wasFinalized = FINALIZED_STATUSES.includes(order.status);
    const willFinalize = FINALIZED_STATUSES.includes(newStatus) && !wasFinalized;
    const willReturn = TERMINAL_RETURN_STATUSES.includes(newStatus) && !TERMINAL_RETURN_STATUSES.includes(order.status);

    if (willFinalize) {
      for (const item of order.items) {
        if (!item.variantId) continue;
        const before = await tx.productVariant.findUniqueOrThrow({ where: { id: item.variantId } });
        const variant = await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity }, reservedStock: { decrement: item.quantity } },
        });
        await tx.inventoryTransaction.create({
          data: {
            variantId: item.variantId,
            type: "ORDER_DEDUCTION",
            quantity: -item.quantity,
            previousStock: before.stock - before.reservedStock,
            newStock: variant.stock - variant.reservedStock,
            orderId,
            performedById: createdById,
            reason: "Order shipped — inventory finalized",
          },
        });
      }
    } else if (willReturn) {
      for (const item of order.items) {
        if (!item.variantId) continue;
        const before = await tx.productVariant.findUniqueOrThrow({ where: { id: item.variantId } });
        const restockData = wasFinalized
          ? { stock: { increment: item.quantity } }
          : { reservedStock: { decrement: item.quantity } };
        const variant = await tx.productVariant.update({ where: { id: item.variantId }, data: restockData });
        await tx.inventoryTransaction.create({
          data: {
            variantId: item.variantId,
            type: wasFinalized ? "RETURN_RESTOCK" : "ORDER_CANCELLATION_RESTOCK",
            quantity: item.quantity,
            previousStock: before.stock - before.reservedStock,
            newStock: variant.stock - variant.reservedStock,
            orderId,
            performedById: createdById,
            reason: note ?? `Order ${newStatus.toLowerCase()}`,
          },
        });
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        trackingCourier: trackingCourier ?? undefined,
        trackingNumber: trackingNumber ?? undefined,
        trackingUrl: trackingUrl ?? undefined,
        shippedAt: newStatus === "SHIPPED" ? new Date() : undefined,
        deliveredAt: newStatus === "DELIVERED" ? new Date() : undefined,
        cancelledAt: newStatus === "CANCELLED" ? new Date() : undefined,
        cancelReason: newStatus === "CANCELLED" ? note : undefined,
      },
    });

    await tx.orderStatusHistory.create({ data: { orderId, status: newStatus, note, createdById } });
  });
}
