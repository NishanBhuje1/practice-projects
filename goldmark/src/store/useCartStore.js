// src/store/useCartStore.js
import { create } from "zustand";

export const useCartStore = create((set) => ({
  cart: [],
  addToCart: (product) =>
    set((state) => {
      const updatedCart = [...state.cart, product];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return { cart: updatedCart };
    }),
  loadCart: () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      set({ cart: JSON.parse(savedCart) });
    }
  },
}));
