import Link from "next/link";
import type { Metadata } from "next";
import { getDashboardOverview } from "@/server/queries/admin-analytics";
import { AdminCard, AdminPageHeader, AdminBadge } from "@/components/admin/ui";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Overview" };

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  DELIVERED: "success",
  PAID: "success",
  CANCELLED: "danger",
  REFUNDED: "danger",
  PENDING: "warning",
  CONFIRMED: "info",
};

export default async function AdminOverviewPage() {
  const data = await getDashboardOverview();

  const kpis = [
    { label: "Total Sales", value: formatMoney(data.totalSales, "USD") },
    { label: "Today's Sales", value: formatMoney(data.todaySales, "USD") },
    { label: "This Month", value: formatMoney(data.monthSales, "USD") },
    { label: "Avg. Order Value", value: formatMoney(data.avgOrderValue, "USD") },
    { label: "Total Orders", value: data.totalOrders.toLocaleString() },
    { label: "Pending Orders", value: data.pendingOrders.toLocaleString() },
    { label: "Customers", value: data.totalCustomers.toLocaleString() },
  ];

  const chartData = data.dailyRevenue.map((d) => ({
    day: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(d.day)),
    revenue: d.revenue / 100,
  }));

  return (
    <div>
      <AdminPageHeader title="Overview" description="Business performance at a glance" />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <AdminCard key={kpi.label}>
            <p className="text-xs text-neutral-500">{kpi.label}</p>
            <p className="mt-1 text-xl font-semibold">{kpi.value}</p>
          </AdminCard>
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <AdminCard className="lg:col-span-2">
          <p className="mb-4 text-sm font-medium">Revenue (Last 30 Days)</p>
          {chartData.length > 0 ? <RevenueChart data={chartData} /> : <p className="py-16 text-center text-sm text-neutral-400">No revenue data yet</p>}
        </AdminCard>

        <AdminCard>
          <p className="mb-4 text-sm font-medium">Low Stock</p>
          {data.lowStockVariants.length === 0 ? (
            <p className="text-sm text-neutral-400">All variants well stocked</p>
          ) : (
            <ul className="space-y-3">
              {data.lowStockVariants.map((v) => (
                <li key={v.id} className="flex items-center justify-between text-sm">
                  <Link href={`/admin/products/${v.productId}`} className="text-neutral-700 hover:underline">
                    {v.product.name} {v.color && `(${v.color}${v.size ? ` / ${v.size}` : ""})`}
                  </Link>
                  <AdminBadge tone={v.stock === 0 ? "danger" : "warning"}>{v.stock} left</AdminBadge>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <p className="mb-4 text-sm font-medium">Recent Orders</p>
          <div className="divide-y divide-neutral-100">
            {data.recentOrders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between py-3 text-sm hover:bg-neutral-50">
                <div>
                  <p className="font-medium">#{order.orderNumber}</p>
                  <p className="text-xs text-neutral-500">{order.user?.name ?? order.guestEmail}</p>
                </div>
                <div className="text-right">
                  <p>{formatMoney(order.total, order.currency)}</p>
                  <AdminBadge tone={STATUS_TONE[order.status] ?? "neutral"}>{order.status.replace(/_/g, " ")}</AdminBadge>
                </div>
              </Link>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <p className="mb-4 text-sm font-medium">Top Products</p>
          <div className="divide-y divide-neutral-100">
            {data.topProducts.map((p) => (
              <div key={p.productId} className="flex items-center justify-between py-3 text-sm">
                <p>{p.name}</p>
                <div className="text-right">
                  <p>{formatMoney(p.revenue, "USD")}</p>
                  <p className="text-xs text-neutral-500">{p.quantity} sold</p>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
