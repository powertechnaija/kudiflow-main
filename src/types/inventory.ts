export interface Product {
    id: string;
    name: string;
    description?: string;
    variants: ProductVariant[];
  }
  
  export interface ProductVariant {
    id: string;
    sku: string;
    price: number;
    cost_price: number;
    stock_quantity: number;
    size?: string;
    color?: string;
    barcode?: string;
  }
  