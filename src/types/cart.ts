import { Product } from './product';

export interface CartItem {
  id: string; // Composite key: `${productId}-${color || 'default'}-${size || 'default'}`
  productId: string;
  product: Product;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
  price: number;
}

export interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  discountCode?: string;
  total: number;
  itemCount: number;
  freeShippingThreshold: number;
  amountUntilFreeShipping: number;
  qualifiesForFreeShipping: boolean;
}
