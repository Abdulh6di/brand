import { db } from "@/lib/db";
import { subDays, startOfDay, startOfMonth } from "date-fns";

const PAID_STATUSES = ["PAID", "PROCESSING", "CUSTOMIZATION", "IN_PRODUCTION", "READY", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

export async function getDashboardOverview() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);
  const thirtyDaysAgo = subDays(now, 30);

  const [
    totalSalesAgg,
    todaySalesAgg,
    monthSalesAgg,
    totalOrders,
    pendingOrders,
    totalCustomers,
    lowStockVariants,
    recentOrders,
    dailyRevenueRaw,
    topProductsRaw,
  ] = await Promise.all([
    db.order.aggregate({ where: { status: { in: [...PAID_STATUSES] } }, _sum: { total: true } }),
    db.order.aggregate({ where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: todayStart } }, _sum: { total: true } }),
    db.order.aggregate({ where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: monthStart } }, _sum: { total: true } }),
    db.order.count(),
    db.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "PAYMENT_PENDING"] } } }),
    db.user.count({ where: { role: { name: "CUSTOMER" } } }),
    db.productVariant.findMany({
      where: { stock: { lte: 5 } },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { stock: "asc" },
      take: 8,
    }),
    db.order.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.$queryRaw<{ day: Date; revenue: bigint }[]>`
      SELECT date_trunc('day', "createdAt") as day, SUM(total)::bigint as revenue
      FROM orders
      WHERE "createdAt" >= ${thirtyDaysAgo} AND status = ANY(${PAID_STATUSES}::"OrderStatus"[])
      GROUP BY day ORDER BY day ASC
    `,
    db.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { lineTotal: "desc" } },
      take: 5,
    }),
  ]);

  const totalSales = totalSalesAgg._sum.total ?? 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  return {
    totalSales,
    todaySales: todaySalesAgg._sum.total ?? 0,
    monthSales: monthSalesAgg._sum.total ?? 0,
    totalOrders,
    pendingOrders,
    totalCustomers,
    avgOrderValue,
    lowStockVariants,
    recentOrders,
    dailyRevenue: dailyRevenueRaw.map((r) => ({ day: r.day, revenue: Number(r.revenue) })),
    topProducts: topProductsRaw.map((p) => ({
      productId: p.productId,
      name: p.productName,
      quantity: p._sum.quantity ?? 0,
      revenue: p._sum.lineTotal ?? 0,
    })),
  };
}
