import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // Corresponds to variant_id
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  cartTotal: () => number;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (item) => set((state) => {
        const existingItem = state.cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
          return {
            cart: state.cart.map(cartItem =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            )
          };
        } else {
          return { cart: [...state.cart, { ...item, quantity: 1 }] };
        }
      }),
      removeFromCart: (itemId) => set((state) => ({
        cart: state.cart.filter(item => item.id !== itemId)
      })),
      updateQuantity: (itemId, quantity) => set((state) => {
        if (quantity < 1) {
          return { cart: state.cart.filter(item => item.id !== itemId) };
        }
        return {
          cart: state.cart.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        };
      }),
      cartTotal: () => get().cart.reduce((total, item) => total + item.price * item.quantity, 0),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
