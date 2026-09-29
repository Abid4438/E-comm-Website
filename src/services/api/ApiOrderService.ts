import { IOrderService } from '../interfaces/IOrderService';
import { Order, OrderStatus, CheckoutFormData } from '../../types/order';
import { CartItem } from '../../types/cart';

const API_BASE = '/api/orders';

export class ApiOrderService implements IOrderService {
  async getOrders(): Promise<Order[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  }

  async getOrderById(id: string): Promise<Order | null> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/customer/${customerId}`);
    if (!res.ok) throw new Error('Failed to fetch customer orders');
    return res.json();
  }

  async createOrder(
    checkoutData: CheckoutFormData,
    items: CartItem[],
    totals: { subtotal: number; shipping: number; tax: number; discount: number; total: number }
  ): Promise<Order> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutData, items, totals }),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  }

  async updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string, carrier?: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, trackingNumber, carrier }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  }

  async cancelOrder(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/${id}/cancel`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to cancel order');
    return res.json();
  }
}
