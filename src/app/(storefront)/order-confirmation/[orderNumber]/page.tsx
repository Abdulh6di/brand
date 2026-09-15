import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { getOrderByNumber } from "@/server/queries/orders";
import { OrderTimeline } from "@/components/storefront/orders/order-timeline";
import { Button } from "@/components/ui/button";
import { formatMoney, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Order Confirmed" };

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const address = order.shippingAddress as { fullName: string; city: string; country: string; addressLine1: string };

  return (
    <div className="container-editorial max-w-3xl py-16 md:py-24">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-success-soft">
          <Check className="h-6 w-6 text-success" strokeWidth={1.5} />
        </div>
        <p className="kicker mb-3">Order Confirmed</p>
        <h1 className="font-display text-4xl">Thank you, {address.fullName.split(" ")[0]}</h1>
        <p className="mt-3 text-sm text-charcoal/70">
          Order #{order.orderNumber} · Placed {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="mb-12 border border-line p-6">
        <OrderTimeline status={order.status} />
      </div>

      <div className="divide-y divide-line border-y border-line">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4 py-5">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-ivory">
              <Image
                src={item.product.images[0]?.url ?? "/images/placeholder.jpg"}
                alt={item.productName}
                fill
                sizes="80px"
                className="object-cover"
              />
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

      <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-charcoal/70">Subtotal</span>
          <span>{formatMoney(order.subtotal, order.currency)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-success">
            <span>Discount</span>
            <span>-{formatMoney(order.discountAmount, order.currency)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-charcoal/70">Shipping</span>
          <span>{order.shippingAmount === 0 ? "Free" : formatMoney(order.shippingAmount, order.currency)}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-2 text-base font-medium">
          <span>Total</span>
          <span>{formatMoney(order.total, order.currency)}</span>
        </div>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        <div>
          <p className="kicker mb-2">Shipping Address</p>
          <p className="text-sm text-charcoal/80">
            {address.fullName}
            <br />
            {address.addressLine1}
            <br />
            {address.city}, {address.country}
          </p>
        </div>
        <div>
          <p className="kicker mb-2">Need Help?</p>
          <p className="text-sm text-charcoal/80">
            Track this order anytime, or reach out to our concierge team via WhatsApp for anything you need.
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg" variant="outline">
          <Link href={`/track-order?orderNumber=${order.orderNumber}`}>Track Order</Link>
        </Button>
        <Button asChild size="lg">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
