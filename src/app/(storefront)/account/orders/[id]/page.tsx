import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOrderByIdForUser } from "@/server/queries/orders";
import { AccountShell } from "@/components/storefront/account/account-shell";
import { OrderTimeline } from "@/components/storefront/orders/order-timeline";
import { formatDate, formatMoney } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Order Details" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const order = await getOrderByIdForUser(id, session.user.id);
  if (!order) notFound();

  const address = order.shippingAddress as { fullName: string; addressLine1: string; city: string; country: string; phone: string };
  const whatsappHref = buildWhatsAppLink(`Hi AELIA, I have a question about order #${order.orderNumber}.`);

  return (
    <AccountShell title={`Order #${order.orderNumber}`}>
      <p className="mb-8 text-sm text-taupe">Placed {formatDate(order.createdAt)}</p>

      <div className="mb-10 border border-line p-6">
        <OrderTimeline status={order.status} />
      </div>

      <div className="divide-y divide-line border-y border-line">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4 py-5">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-ivory">
              <Image src={item.product.images[0]?.url ?? "/images/placeholder.jpg"} alt={item.productName} fill sizes="80px" className="object-cover" />
            </div>
            <div className="flex flex-1 justify-between">
              <div>
                <p className="font-display text-base">{item.productName}</p>
                <p className="mt-1 text-xs text-taupe">
                  {item.variantLabel} · Qty {item.quantity}
                </p>
              </div>
              <p className="text-sm">{formatMoney(item.lineTotal, order.currency)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <div>
          <p className="kicker mb-2">Shipping Address</p>
          <p className="text-sm text-charcoal/80">
            {address.fullName}
            <br />
            {address.addressLine1}
            <br />
            {address.city}, {address.country}
            <br />
            {address.phone}
          </p>
        </div>
        <div>
          <p className="kicker mb-2">Order Total</p>
          <p className="text-sm text-charcoal/80">{formatMoney(order.total, order.currency)}</p>
          <p className="kicker mb-2 mt-4">Need Help?</p>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-sm underline">
            Ask on WhatsApp
          </a>
        </div>
      </div>

      <Link href="/account/orders" className="mt-10 inline-block text-xs uppercase tracking-editorial underline">
        ← Back to Orders
      </Link>
    </AccountShell>
  );
}
