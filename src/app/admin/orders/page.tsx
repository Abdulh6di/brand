import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader, AdminBadge, AdminSelect } from "@/components/admin/ui";
import { formatMoney, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders — Admin" };

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  DELIVERED: "success",
  PAID: "success",
  CANCELLED: "danger",
  REFUNDED: "danger",
  RETURNED: "danger",
  PENDING: "warning",
  CONFIRMED: "info",
};

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requirePermission("orders.read");
  const { status, q } = await searchParams;

  const orders = await db.order.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(q ? { OR: [{ orderNumber: { contains: q, mode: "insensitive" } }, { guestEmail: { contains: q, mode: "insensitive" } }] } : {}),
    },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <AdminPageHeader title="Orders" description={`${orders.length} orders`} />

      <form className="mb-4 flex gap-3">
        <input name="q" defaultValue={q} placeholder="Search order # or email..." className="h-9 w-64 rounded-md border border-neutral-300 bg-white px-3 text-sm" />
        <AdminSelect name="status" defaultValue={status ?? ""} className="w-48">
          <option value="">All Statuses</option>
          {["PENDING", "CONFIRMED", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </AdminSelect>
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-500">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-neutral-100 last:border-none hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                    #{order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600">{order.user?.name ?? order.guestEmail}</td>
                <td className="px-4 py-3 text-neutral-500">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3">{formatMoney(order.total, order.currency)}</td>
                <td className="px-4 py-3">
                  <AdminBadge tone={STATUS_TONE[order.status] ?? "neutral"}>{order.status.replace(/_/g, " ")}</AdminBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
