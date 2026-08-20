import { create } from "zustand";
import { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  discount: number;
  taxRate: number; // e.g. 0.07 for 7% VAT
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDiscount: (discount: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  taxRate: 0.07,

  addToCart: (product: Product) => {
    const { items } = get();
    const existingIndex = items.findIndex((i) => i.product.id === product.id);

    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      if (currentQty + 1 > product.stock) {
        alert(`Cannot add more. Available stock: ${product.stock}`);
        return;
      }
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      set({ items: newItems });
    } else {
      if (product.stock < 1) {
        alert("This product is out of stock.");
        return;
      }
      set({ items: [...items, { product, quantity: 1 }] });
    }
  },

  removeFromCart: (productId: string) => {
    set({ items: get().items.filter((i) => i.product.id !== productId) });
  },

  updateQuantity: (productId: string, quantity: number) => {
    const { items } = get();
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const item = items.find((i) => i.product.id === productId);
    if (item && quantity > item.product.stock) {
      alert(`Max available stock is ${item.product.stock}`);
      return;
    }
    set({
      items: items.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
    });
  },

  setDiscount: (discount: number) => {
    set({ discount: Math.max(0, discount) });
  },

  clearCart: () => {
    set({ items: [], discount: 0 });
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  },

  getTax: () => {
    const subtotalAfterDiscount = Math.max(0, get().getSubtotal() - get().discount);
    return Math.round(subtotalAfterDiscount * get().taxRate * 100) / 100;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().discount;
    const tax = get().getTax();
    return Math.max(0, subtotal - discount + tax);
  },
}));
