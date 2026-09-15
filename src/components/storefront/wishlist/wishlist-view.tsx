"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatMoney } from "@/lib/utils";
import { useWishlistStore } from "@/hooks/use-wishlist-store";
import { useCartStore } from "@/hooks/use-cart-store";

export function WishlistView() {
  const { items, setItems } = useWishlistStore();
  const setCartSummary = useCartStore((s) => s.setSummary);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function removeItem(productId: string) {
    setBusyId(productId);
    try {
      const res = await fetch("/api/wishlist/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error();
      setItems(items.filter((i) => i.productId !== productId));
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function moveToCart(productId: string) {
    setBusyId(productId);
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCartSummary(json.data);
      await removeItem(productId);
      toast.success("Moved to bag");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to add to bag");
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Save the pieces you love to come back to later."
        actionLabel="Shop the Collection"
        actionHref="/shop"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">
      {items.map((item) => (
        <div key={item.id} className="group relative">
          <Link href={`/product/${item.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-ivory">
            <Image src={item.image} alt={item.name} fill sizes="25vw" className="object-cover" />
            {!item.inStock && (
              <div className="absolute inset-x-0 bottom-0 bg-ink/90 py-2 text-center text-[10px] uppercase tracking-editorial text-warm-white">
                Sold Out
              </div>
            )}
          </Link>
          <button
            aria-label="Remove from wishlist"
            onClick={() => removeItem(item.productId)}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-warm-white/90"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <div className="mt-3 space-y-1">
            <Link href={`/product/${item.slug}`} className="font-display text-base">
              {item.name}
            </Link>
            <p className="text-sm">
              {item.salePrice ? (
                <>
                  <span className="text-error">{formatMoney(item.salePrice, item.currency)}</span>{" "}
                  <span className="text-taupe line-through">{formatMoney(item.price, item.currency)}</span>
                </>
              ) : (
                formatMoney(item.price, item.currency)
              )}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full"
              disabled={!item.inStock || busyId === item.productId}
              onClick={() => moveToCart(item.productId)}
            >
              {busyId === item.productId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Move to Bag"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
