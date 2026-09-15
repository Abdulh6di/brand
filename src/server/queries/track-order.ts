import { db } from "@/lib/db";

export async function findOrderForTracking(orderNumber: string, email: string) {
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true, user: { select: { email: true } } },
  });

  if (!order) return null;
  const orderEmail = order.guestEmail ?? order.user?.email;
  if (orderEmail?.toLowerCase() !== email.toLowerCase()) return null;

  return order;
}
