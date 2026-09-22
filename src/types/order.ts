import { CartItem } from './cart';
import { Address } from './customer';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded';

export type PaymentMethod = 'Credit Card' | 'Apple Pay' | 'Klarna' | 'Shop Pay';

export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded' | 'Failed';

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string; // e.g. MOS-2026-9812
  date: string;
  customer: OrderCustomer;
  customerId?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  discountCode?: string;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryMethod: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  deliveryMethod: 'standard' | 'express' | 'overnight';
  paymentMethod: 'credit_card' | 'apple_pay' | 'klarna';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  cardName?: string;
  saveInfo?: boolean;
  notes?: string;
  discountCode?: string;
}
