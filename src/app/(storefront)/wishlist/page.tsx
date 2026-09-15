import type { Metadata } from "next";
import { WishlistView } from "@/components/storefront/wishlist/wishlist-view";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <div className="container-editorial py-12 md:py-16">
      <h1 className="mb-10 font-display text-4xl">Your Wishlist</h1>
      <WishlistView />
    </div>
  );
}
