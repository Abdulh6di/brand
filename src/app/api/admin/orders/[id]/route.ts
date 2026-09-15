import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { updateOrderStatus } from "@/server/admin-orders";
import { sendEmail } from "@/server/email";
import { orderShippedEmail } from "@/emails/templates";
import { recordAuditLog } from "@/server/audit-log";
import { apiSuccess, handleApiError } from "@/server/api-response";
import { getClientIp } from "@/server/rate-limit";

const statusSchema = z.object({
  status: z.enum([
    "PENDING", "CONFIRMED", "PAYMENT_PENDING", "PAID", "PROCESSING", "CUSTOMIZATION",
    "IN_PRODUCTION", "READY", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
    "RETURN_REQUESTED", "RETURNED", "REFUNDED",
  ]),
  note: z.string().optional(),
  trackingCourier: z.string().optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
  internalNote: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("orders.update");
    const { id } = await params;
    const input = statusSchema.parse(await req.json());

    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) return handleApiError(new Error("Order not found"));

    if (input.internalNote !== undefined) {
      await db.order.update({ where: { id }, data: { internalNote: input.internalNote } });
    }

    if (input.status !== existing.status) {
      await updateOrderStatus({
        orderId: id,
        newStatus: input.status,
        note: input.note,
        createdById: session.user.id,
        trackingCourier: input.trackingCourier,
        trackingNumber: input.trackingNumber,
        trackingUrl: input.trackingUrl,
      });

      if (input.status === "SHIPPED") {
        const recipient = existing.guestEmail ?? (await db.user.findUnique({ where: { id: existing.userId ?? "" } }))?.email;
        if (recipient) {
          await sendEmail({
            to: recipient,
            subject: `Order ${existing.orderNumber} has shipped`,
            html: orderShippedEmail({ orderNumber: existing.orderNumber, trackingUrl: input.trackingUrl }),
          });
        }
      }

      await recordAuditLog({
        userId: session.user.id,
        action: "STATUS_UPDATE",
        entity: "Order",
        entityId: id,
        oldValue: { status: existing.status },
        newValue: { status: input.status },
        ipAddress: getClientIp(req),
      });
    }

    const order = await db.order.findUnique({ where: { id } });
    return apiSuccess({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
