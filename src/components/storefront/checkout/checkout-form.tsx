"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { checkoutSchema, type CheckoutInput } from "@/validations/checkout";
import { formatMoney, cn } from "@/lib/utils";
import { useCartStore } from "@/hooks/use-cart-store";
import { StripePaymentForm } from "@/components/storefront/checkout/stripe-payment-form";
import { trackEvent } from "@/lib/analytics";

const COUNTRIES = ["United States", "United Kingdom", "Canada", "United Arab Emirates", "Pakistan"];

type ShippingOption = { method: string; price: number; estimatedDaysMin: number; estimatedDaysMax: number };

export function CheckoutForm() {
  const router = useRouter();
  const { lines, subtotal, discountAmount, couponCode, hydrated } = useCartStore();
  const [shippingOptions, setShippingOptions] = React.useState<ShippingOption[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [orderResult, setOrderResult] = React.useState<{ orderNumber: string; clientSecret?: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: "United States", paymentMethod: "COD" },
  });

  const country = watch("country");
  const shippingMethod = watch("shippingMethod");
  const paymentMethod = watch("paymentMethod");

  React.useEffect(() => {
    if (!country) return;
    fetch(`/api/checkout/shipping-options?country=${encodeURIComponent(country)}&subtotal=${subtotal - discountAmount}`)
      .then((r) => r.json())
      .then((res) => {
        const options: ShippingOption[] = res.data?.options ?? [];
        setShippingOptions(options);
        if (options.length && !options.some((o) => o.method === shippingMethod)) {
          setValue("shippingMethod", options[0].method);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, subtotal, discountAmount]);

  const shippingPrice = shippingOptions.find((o) => o.method === shippingMethod)?.price ?? 0;
  const total = Math.max(subtotal - discountAmount, 0) + shippingPrice;
  const currency = lines[0]?.currency ?? "USD";

  React.useEffect(() => {
    if (lines.length > 0) trackEvent("begin_checkout", { value: subtotal / 100, currency, itemCount: lines.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(data: CheckoutInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Unable to place order");

      if (json.data.clientSecret) {
        setOrderResult(json.data);
      } else {
        trackEvent("purchase", { transactionId: json.data.orderNumber, value: total / 100, currency });
        router.push(`/order-confirmation/${json.data.orderNumber}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (orderResult?.clientSecret) {
    return (
      <div className="mx-auto max-w-md">
        <h2 className="mb-6 font-display text-2xl">Complete Payment</h2>
        <StripePaymentForm clientSecret={orderResult.clientSecret} orderNumber={orderResult.orderNumber} />
      </div>
    );
  }

  if (hydrated && lines.length === 0) {
    return <p className="text-center text-sm text-charcoal/70">Your bag is empty. Add something beautiful before checking out.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-12 md:grid-cols-3 md:gap-16">
      <div className="space-y-10 md:col-span-2">
        <section>
          <h2 className="mb-5 font-display text-xl">1. Contact Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" {...register("fullName")} />
              {errors.fullName && <p className="mt-1 text-xs text-error">{errors.fullName.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone.message}</p>}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-5 font-display text-xl">2. Shipping Address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="country">Country</Label>
              <select id="country" {...register("country")} className="h-12 w-full border border-line bg-warm-white px-4 text-sm">
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} />
              {errors.city && <p className="mt-1 text-xs text-error">{errors.city.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="addressLine1">Address</Label>
              <Input id="addressLine1" {...register("addressLine1")} />
              {errors.addressLine1 && <p className="mt-1 text-xs text-error">{errors.addressLine1.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="addressLine2">Apartment, suite, etc. (optional)</Label>
              <Input id="addressLine2" {...register("addressLine2")} />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" {...register("postalCode")} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-5 font-display text-xl">3. Delivery Method</h2>
          <div className="space-y-2">
            {shippingOptions.map((option) => (
              <label
                key={option.method}
                className={cn(
                  "flex cursor-pointer items-center justify-between border px-4 py-3 text-sm",
                  shippingMethod === option.method ? "border-ink" : "border-line-strong",
                )}
              >
                <span className="flex items-center gap-3">
                  <input type="radio" value={option.method} {...register("shippingMethod")} className="accent-ink" />
                  <span>
                    {option.method}
                    <span className="ml-2 text-xs text-taupe">
                      {option.estimatedDaysMin}–{option.estimatedDaysMax} business days
                    </span>
                  </span>
                </span>
                <span>{option.price === 0 ? "Free" : formatMoney(option.price, currency)}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-5 font-display text-xl">4. Payment Method</h2>
          <div className="space-y-2">
            {(["COD", "BANK_TRANSFER", "CARD"] as const).map((method) => (
              <label
                key={method}
                className={cn(
                  "flex cursor-pointer items-center gap-3 border px-4 py-3 text-sm",
                  paymentMethod === method ? "border-ink" : "border-line-strong",
                )}
              >
                <input type="radio" value={method} {...register("paymentMethod")} className="accent-ink" />
                {method === "COD" ? "Cash on Delivery" : method === "BANK_TRANSFER" ? "Bank Transfer" : "Credit / Debit Card"}
              </label>
            ))}
          </div>
        </section>

        <section>
          <Label htmlFor="customerNote">Order Notes (optional)</Label>
          <Textarea id="customerNote" {...register("customerNote")} placeholder="Delivery instructions, gift notes..." />
        </section>
      </div>

      <div className="h-fit border border-line p-6 md:sticky md:top-28">
        <h2 className="mb-6 font-display text-xl">Order Summary</h2>
        <div className="max-h-64 space-y-4 overflow-y-auto border-b border-line pb-4">
          {lines.map((line) => (
            <div key={line.id} className="flex justify-between text-sm">
              <span className="text-charcoal/75">
                {line.name} × {line.quantity}
              </span>
              <span>{formatMoney(line.unitPrice * line.quantity, line.currency)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 text-sm">
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
            <span>{shippingPrice === 0 ? "Free" : formatMoney(shippingPrice, currency)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
            <span>Total</span>
            <span>{formatMoney(total, currency)}</span>
          </div>
        </div>
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Place Order"}
        </Button>
      </div>
    </form>
  );
}
