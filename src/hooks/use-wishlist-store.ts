import { create } from "zustand";

export type WishlistLine = {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice: number | null;
  currency: string;
  inStock: boolean;
};

type WishlistState = {
  items: WishlistLine[];
  setItems: (items: WishlistLine[]) => void;
  isWishlisted: (productId: string) => boolean;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  isWishlisted: (productId) => get().items.some((i) => i.productId === productId),
}));
