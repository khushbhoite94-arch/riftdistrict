"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ICartItem } from "@/types";

interface CartState {
  items: ICartItem[];
  isOpen: boolean;
  couponCode: string;
  discount: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: ICartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  subtotal: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: "",
      discount: 0,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.size === item.size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, item], isOpen: true };
        }),

      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size)
          ),
        })),

      updateQuantity: (productId, size, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) => !(i.productId === productId && i.size === size)
                )
              : state.items.map((i) =>
                  i.productId === productId && i.size === size
                    ? { ...i, quantity }
                    : i
                ),
        })),

      clearCart: () => set({ items: [], couponCode: "", discount: 0 }),

      setCoupon: (code, discount) => set({ couponCode: code, discount }),
      clearCoupon: () => set({ couponCode: "", discount: 0 }),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      total: () => {
        const sub = get().subtotal();
        const disc = get().discount;
        const shipping = sub >= 150 ? 0 : sub > 0 ? 12 : 0;
        return Math.max(0, sub - disc + shipping);
      },
    }),
    { name: "rift-cart" }
  )
);
