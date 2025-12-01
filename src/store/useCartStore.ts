import { create } from 'zustand';
import { Product, Variant } from '@/types/inventory';
import { toast } from 'sonner'; // Import toast for feedback

export interface CartItem extends Variant {
  productName: string;
  cartId: string;
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  addToCart: (product: Product, variant: Variant) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  
  addToCart: (product, variant) => {
    // 1. Check if item has NO stock at all
    if (variant.stock_quantity <= 0) {
      toast.warning("This item cannot be added.");
      return;
    }

    const currentCart = get().cart;
    const existingItem = currentCart.find(item => item.id === variant.id);

    // 2. Check if adding 1 more would exceed stock
    const currentQty = existingItem ? existingItem.quantity : 0;
    if (currentQty + 1 > variant.stock_quantity) {
      toast.warning(
      `Only ${variant.stock_quantity} units available.` 
      );
      return;
    }

    if (existingItem) {
      set({
        cart: currentCart.map(item => 
          item.id === variant.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      });
    } else {
      const newItem: CartItem = {
        ...variant,
        productName: product.name,
        cartId: `${variant.id}-${Date.now()}`,
        quantity: 1,
      };
      set({ cart: [...currentCart, newItem] });
    }
  },

  removeFromCart: (cartId) => {
    set({ cart: get().cart.filter(item => item.cartId !== cartId) });
  },

  updateQuantity: (cartId, delta) => {
    const currentCart = get().cart;
    const item = currentCart.find(i => i.cartId === cartId);

    if (!item) return;

    const newQty = item.quantity + delta;

    // 3. Prevent going below 1
    if (newQty < 1) return;

    // 4. Prevent going above Available Stock
    if (newQty > item.stock_quantity) {
       toast.warning(`Cannot sell more than ${item.stock_quantity} units.` 
      );
      return;
    }

    set({
      cart: currentCart.map(i => {
        if (i.cartId === cartId) {
          return { ...i, quantity: newQty };
        }
        return i;
      })
    });
  },

  clearCart: () => set({ cart: [] }),

  cartTotal: () => {
    return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));