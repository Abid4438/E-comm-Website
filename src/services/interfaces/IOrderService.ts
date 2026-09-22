import { Order, OrderStatus, CheckoutFormData } from '../../types/order';
import { CartItem } from '../../types/cart';

export interface IOrderService {
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  getCustomerOrders(customerId: string): Promise<Order[]>;
  createOrder(checkoutData: CheckoutFormData, items: CartItem[], totals: { subtotal: number; shipping: number; tax: number; discount: number; total: number }): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string, carrier?: string): Promise<Order>;
  cancelOrder(id: string): Promise<Order>;
}
