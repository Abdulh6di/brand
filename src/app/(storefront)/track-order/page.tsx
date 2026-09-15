"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderTimeline } from "@/components/storefront/orders/order-timeline";
import { formatDate, formatMoney } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";

type TrackedOrder = {
  orderNumber: string;
  status: OrderStatus;
  trackingCourier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: string;
  total: number;
  currency: string;
  itemCount: number;
};

function TrackOrderForm() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = React.useState(searchParams.get("orderNumber") ?? "");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [order, setOrder] = React.useState<TrackedOrder | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOrder(null);
    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setOrder(json.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Order not found");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-10 text-center">
        <p className="kicker mb-3">Order Status</p>
        <h1 className="font-display text-4xl">Track Your Order</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="orderNumber">Order Number</Label>
          <Input id="orderNumber" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="AEL-100000" required />
        </div>
        <div>
          <Label htmlFor="email">Email used at checkout</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Searching..." : "Track Order"}
        </Button>
      </form>

      {order && (
        <div className="mt-12 border border-line p-6">
          <div className="mb-6 flex items-center justify-between">
            <p className="font-display text-lg">#{order.orderNumber}</p>
            <p className="text-xs text-taupe">{formatDate(order.createdAt)}</p>
          </div>
          <OrderTimeline status={order.status} />
          {order.trackingNumber && (
            <p className="mt-6 text-sm text-charcoal/75">
              {order.trackingCourier} — {order.trackingNumber}
            </p>
          )}
          <p className="mt-4 text-sm text-charcoal/75">
            {order.itemCount} item{order.itemCount !== 1 ? "s" : ""} · {formatMoney(order.total, order.currency)}
          </p>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="container-editorial py-16 md:py-24">
      <Suspense fallback={null}>
        <TrackOrderForm />
      </Suspense>
    </div>
  );
}
