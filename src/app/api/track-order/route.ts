import { NextRequest } from "next/server";
import { z } from "zod";
import { findOrderForTracking } from "@/server/queries/track-order";
import { apiSuccess, apiError, handleApiError } from "@/server/api-response";
import { rateLimit, getClientIp } from "@/server/rate-limit";

const schema = z.object({ orderNumber: z.string().min(1), email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const { success } = await rateLimit(`track-order:${getClientIp(req)}`, 10, 60);
    if (!success) return apiError("Too many requests", 429);

    const { orderNumber, email } = schema.parse(await req.json());
    const order = await findOrderForTracking(orderNumber.trim().toUpperCase(), email);
    if (!order) return apiError("We couldn't find an order matching those details", 404);

    return apiSuccess({
      orderNumber: order.orderNumber,
      status: order.status,
      trackingCourier: order.trackingCourier,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      createdAt: order.createdAt,
      total: order.total,
      currency: order.currency,
      itemCount: order.items.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
