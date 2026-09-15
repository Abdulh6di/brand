"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { formatMoney, cn } from "@/lib/utils";
import { useCartStore } from "@/hooks/use-cart-store";

export function CartView() {
  const { lines, subtotal, discountAmount, couponCode, hydrated, setSummary } = useCartStore();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [couponInput, setCouponInput] = React.useState("");
  const [applyingCoupon, setApplyingCoupon] = React.useState(false);
  const router = useRouter();

  async function updateQuantity(id: string, quantity: number) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/cart/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSummary(json.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(id: string) {
    await updateQuantity(id, 0);
    toast.success("Removed from bag");
  }

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSummary(json.data);
      toast.success("Coupon applied");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  }

  async function removeCoupon() {
    const res = await fetch("/api/cart/coupon", { method: "DELETE" });
    const json = await res.json();
    if (res.ok) setSummary(json.data);
  }

  if (hydrated && lines.length === 0) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Discover pieces made to be worn, not just owned."
        actionLabel="Shop the Collection"
        actionHref="/shop"
      />
    );
  }

  const currency = lines[0]?.currency ?? "USD";
  const shippingEstimate = subtotal >= 50000 || subtotal === 0 ? 0 : 1500;
  const total = Math.max(subtotal - discountAmount, 0) + shippingEstimate;

  return (
    <div className="grid gap-12 md:grid-cols-3 md:gap-16">
      <div className="md:col-span-2">
        <div className="divide-y divide-line">
          {lines.map((line) => (
            <div key={line.id} className="flex gap-4 py-6 first:pt-0">
              <Link href={`/product/${line.slug}`} className="relative h-32 w-24 shrink-0 overflow-hidden bg-ivory">
                <Image src={line.image} alt={line.name} fill sizes="100px" className="object-cover" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link href={`/product/${line.slug}`} className="font-display text-lg">
                      {line.name}
                    </Link>
                    <p className="mt-1 text-xs text-taupe">
                      {[line.color, line.size].filter(Boolean).join(" / ")}
                      {line.customizationLabel && ` · ${line.customizationLabel}`}
                    </p>
                  </div>
                  <button aria-label="Remove item" onClick={() => removeItem(line.id)} className="h-fit text-taupe hover:text-ink">
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className={cn("flex items-center border border-line-strong", busyId === line.id && "opacity-50")}>
                    <button
                      aria-label="Decrease quantity"
                      disabled={busyId === line.id}
                      onClick={() => updateQuantity(line.id, line.quantity - 1)}
                      className="flex h-9 w-9 items-center justify-center"
                    >
                      <Minus className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                    <span className="w-7 text-center text-sm">{line.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      disabled={busyId === line.id || line.quantity >= line.maxQuantity}
                      onClick={() => updateQuantity(line.id, line.quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center disabled:opacity-30"
                    >
                      <Plus className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                  </div>
                  <p className="text-sm">{formatMoney(line.unitPrice * line.quantity, line.currency)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-fit border border-line p-6 md:sticky md:top-28">
        <h2 className="mb-6 font-display text-xl">Order Summary</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-charcoal/70">Subtotal</span>
            <span>{formatMoney(subtotal, currency)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount ({couponCode})</span>
              <span>-{formatMoney(discountAmount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-charcoal/70">Shipping</span>
            <span>{shippingEstimate === 0 ? "Free" : formatMoney(shippingEstimate, currency)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
            <span>Total</span>
            <span>{formatMoney(total, currency)}</span>
          </div>
        </div>

        {couponCode ? (
          <button onClick={removeCoupon} className="mt-4 text-xs text-taupe underline">
            Remove coupon {couponCode}
          </button>
        ) : (
          <form onSubmit={applyCoupon} className="mt-5 flex gap-2">
            <Input
              placeholder="Coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            />
            <Button type="submit" variant="outline" disabled={applyingCoupon} className="shrink-0">
              {applyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
            </Button>
          </form>
        )}

        <Button size="lg" className="mt-6 w-full" onClick={() => router.push("/checkout")}>
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
