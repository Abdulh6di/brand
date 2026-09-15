import { create } from "zustand";

export type CartLine = {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  image: string;
  color?: string;
  size?: string;
  customizationLabel?: string;
  unitPrice: number;
  quantity: number;
  currency: string;
  maxQuantity: number;
};

export type CartSummary = {
  lines: CartLine[];
  subtotal: number;
  itemCount: number;
  discountAmount: number;
  couponCode: string | null;
};

type CartState = CartSummary & {
  hydrated: boolean;
  setSummary: (summary: CartSummary) => void;
  count: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  subtotal: 0,
  itemCount: 0,
  discountAmount: 0,
  couponCode: null,
  hydrated: false,
  setSummary: (summary) => set({ ...summary, hydrated: true }),
  count: () => get().itemCount,
}));
