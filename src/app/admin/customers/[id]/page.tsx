import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader, AdminCard, AdminBadge } from "@/components/admin/ui";
import { formatDate, formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Customer Detail — Admin" };

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("customers.read");
  const { id } = await params;

  const customer = await db.user.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: "desc" } }, addresses: true, reviews: true },
  });

  if (!customer) notFound();

  const totalSpent = customer.orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = customer.orders.length > 0 ? Math.round(totalSpent / customer.orders.length) : 0;

  return (
    <div>
      <AdminPageHeader title={customer.name ?? customer.email} description={customer.email} />

      <div className="mb-6 grid grid-cols-3 gap-4">
        <AdminCard>
          <p className="text-xs text-neutral-500">Total Spent</p>
          <p className="mt-1 text-xl font-semibold">{formatMoney(totalSpent, "USD")}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-xs text-neutral-500">Orders</p>
          <p className="mt-1 text-xl font-semibold">{customer.orders.length}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-xs text-neutral-500">Avg. Order Value</p>
          <p className="mt-1 text-xl font-semibold">{formatMoney(avgOrderValue, "USD")}</p>
        </AdminCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminCard className="lg:col-span-2">
          <p className="mb-4 text-sm font-medium">Order History</p>
          <div className="divide-y divide-neutral-100">
            {customer.orders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between py-3 text-sm hover:bg-neutral-50">
                <div>
                  <p className="font-medium">#{order.orderNumber}</p>
                  <p className="text-xs text-neutral-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p>{formatMoney(order.total, order.currency)}</p>
                  <AdminBadge>{order.status.replace(/_/g, " ")}</AdminBadge>
                </div>
              </Link>
            ))}
            {customer.orders.length === 0 && <p className="text-sm text-neutral-400">No orders yet</p>}
          </div>
        </AdminCard>

        <AdminCard>
          <p className="mb-4 text-sm font-medium">Addresses</p>
          <div className="space-y-4 text-sm">
            {customer.addresses.map((addr) => (
              <div key={addr.id}>
                <p className="font-medium">{addr.fullName}</p>
                <p className="text-neutral-500">
                  {addr.addressLine1}, {addr.city}, {addr.country}
                </p>
              </div>
            ))}
            {customer.addresses.length === 0 && <p className="text-neutral-400">No saved addresses</p>}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
