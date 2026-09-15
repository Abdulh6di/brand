import { db } from "@/lib/db";

export async function getOrderByNumber(orderNumber: string) {
  return db.order.findUnique({
    where: { orderNumber },
    include: {
      items: { include: { product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } } } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      payments: true,
      shipments: true,
    },
  });
}

export async function getOrderByIdForUser(id: string, userId: string) {
  return db.order.findFirst({
    where: { id, userId },
    include: {
      items: { include: { product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } } } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      payments: true,
      shipments: true,
    },
  });
}

export async function getOrdersForUser(userId: string) {
  return db.order.findMany({
    where: { userId },
    include: { items: { include: { product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } } } } },
    orderBy: { createdAt: "desc" },
  });
}
