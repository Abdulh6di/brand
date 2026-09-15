"use client";

import { useEffect } from "react";
import { useCartStore } from "@/hooks/use-cart-store";
import { useWishlistStore } from "@/hooks/use-wishlist-store";

export function StoreHydrator() {
  const setSummary = useCartStore((s) => s.setSummary);
  const setWishlistItems = useWishlistStore((s) => s.setItems);

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((res) => res.data && setSummary(res.data))
      .catch(() => {});

    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((res) => setWishlistItems(res.data?.items ?? []))
      .catch(() => {});
  }, [setSummary, setWishlistItems]);

  return null;
}
