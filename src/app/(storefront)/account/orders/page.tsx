import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOrdersForUser } from "@/server/queries/orders";
import { AccountShell } from "@/components/storefront/account/account-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Order History" };

export default async function OrdersPage() {
  const session = await auth();
  const orders = session?.user?.id ? await getOrdersForUser(session.user.id) : [];

  return (
    <AccountShell title="Order History">
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Your order history will appear here." actionLabel="Shop Now" actionHref="/shop" />
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="flex items-center justify-between py-5 text-sm hover:bg-ivory/50">
              <div>
                <p className="font-display text-lg">#{order.orderNumber}</p>
                <p className="mt-1 text-taupe">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p>{formatMoney(order.total, order.currency)}</p>
                <p className="mt-1 text-xs uppercase tracking-editorial text-taupe">{order.status.replace(/_/g, " ")}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
