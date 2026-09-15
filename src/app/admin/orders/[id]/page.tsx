import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/admin-auth";
import { AdminPageHeader, AdminCard, AdminBadge } from "@/components/admin/ui";
import { OrderStatusPanel } from "@/components/admin/order-status-panel";
import { formatMoney, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Order Detail — Admin" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("orders.read");
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      payments: true,
    },
  });

  if (!order) notFound();

  const address = order.shippingAddress as { fullName: string; phone: string; addressLine1: string; city: string; country: string };

  return (
    <div>
      <AdminPageHeader title={`Order #${order.orderNumber}`} description={formatDate(order.createdAt)} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AdminCard>
            <p className="mb-4 text-sm font-medium">Items</p>
            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-neutral-500">
                      {item.variantLabel} · SKU {item.sku} · Qty {item.quantity}
                    </p>
                  </div>
                  <p>{formatMoney(item.lineTotal, order.currency)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 border-t border-neutral-100 pt-4 text-sm">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal, order.currency)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-neutral-500">
                  <span>Discount</span>
                  <span>-{formatMoney(order.discountAmount, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500">
                <span>Shipping</span>
                <span>{formatMoney(order.shippingAmount, order.currency)}</span>
              </div>
              <div className="flex justify-between text-base font-medium">
                <span>Total</span>
                <span>{formatMoney(order.total, order.currency)}</span>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <p className="mb-4 text-sm font-medium">Status History</p>
            <div className="space-y-3">
              {order.statusHistory.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-sm">
                  <AdminBadge>{h.status.replace(/_/g, " ")}</AdminBadge>
                  <span className="text-xs text-neutral-500">{formatDate(h.createdAt)}</span>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard>
            <p className="mb-4 text-sm font-medium">Payments</p>
            <div className="space-y-2 text-sm">
              {order.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <span>
                    {p.provider} · {p.method}
                  </span>
                  <AdminBadge tone={p.status === "SUCCESS" ? "success" : p.status === "FAILED" ? "danger" : "neutral"}>{p.status}</AdminBadge>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard>
            <p className="mb-3 text-sm font-medium">Customer</p>
            <p className="text-sm">{order.user?.name ?? address.fullName}</p>
            <p className="text-sm text-neutral-500">{order.user?.email ?? order.guestEmail}</p>
            <p className="mt-4 text-xs uppercase tracking-wide text-neutral-400">Shipping Address</p>
            <p className="mt-1 text-sm text-neutral-600">
              {address.addressLine1}
              <br />
              {address.city}, {address.country}
              <br />
              {address.phone}
            </p>
          </AdminCard>

          <OrderStatusPanel order={order} />
        </div>
      </div>
    </div>
  );
}
