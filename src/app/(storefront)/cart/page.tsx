import type { Metadata } from "next";
import { CartView } from "@/components/storefront/cart/cart-view";

export const metadata: Metadata = { title: "Your Bag" };

export default function CartPage() {
  return (
    <div className="container-editorial py-12 md:py-16">
      <h1 className="mb-10 font-display text-4xl">Your Bag</h1>
      <CartView />
    </div>
  );
}
