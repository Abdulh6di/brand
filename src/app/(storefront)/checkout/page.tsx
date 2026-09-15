import type { Metadata } from "next";
import { CheckoutForm } from "@/components/storefront/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="container-editorial py-12 md:py-16">
      <h1 className="mb-10 font-display text-4xl">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
