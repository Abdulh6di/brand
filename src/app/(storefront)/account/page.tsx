import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOrdersForUser } from "@/server/queries/orders";
import { AccountShell } from "@/components/storefront/account/account-shell";
import { OrderTimeline } from "@/components/storefront/orders/order-timeline";
import { formatDate, formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await auth();
  const orders = session?.user?.id ? await getOrdersForUser(session.user.id) : [];
  const recentOrders = orders.slice(0, 3);

  return (
    <AccountShell title={`Welcome back, ${session?.user?.name?.split(" ")[0] ?? "there"}`}>
      <div className="mb-10">
        <p className="kicker mb-4">Recent Orders</p>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-charcoal/70">
            You haven&apos;t placed an order yet.{" "}
            <Link href="/shop" className="underline">
              Start shopping
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-6">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="block border border-line p-5">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="font-display text-lg">#{order.orderNumber}</span>
                  <span className="text-taupe">{formatDate(order.createdAt)}</span>
                </div>
                <OrderTimeline status={order.status} />
                <p className="mt-4 text-sm text-charcoal/70">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {formatMoney(order.total, order.currency)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AccountShell>
  );
}
