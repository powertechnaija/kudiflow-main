import { create } from 'zustand';
import { Product } from '@/types/inventory';

interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  isLoading: boolean;
  
  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  searchProducts: (query: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  filteredProducts: [],
  isLoading: false,

  setProducts: (products) => set({ products, filteredProducts: products }),
  
  setLoading: (isLoading) => set({ isLoading }),

  addProduct: (product) => set((state) => {
    const newProducts = [product, ...state.products];
    return { products: newProducts, filteredProducts: newProducts };
  }),

  updateProduct: (updatedProduct) => set((state) => {
    const newProducts = state.products.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    );
    return { products: newProducts, filteredProducts: newProducts };
  }),

  searchProducts: (query) => {
    const { products } = get();
    if (!query) {
      set({ filteredProducts: products });
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    // Advanced Search: Matches Name, SKU, or Barcode of any variant
    const filtered = products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(lowerQuery);
      const variantMatch = product.variants.some(v => 
        v.sku.toLowerCase().includes(lowerQuery) || 
        v.barcode?.toLowerCase().includes(lowerQuery)
      );
      return nameMatch || variantMatch;
    });

    set({ filteredProducts: filtered });
  }
}));