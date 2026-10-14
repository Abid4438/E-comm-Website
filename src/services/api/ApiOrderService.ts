import { IOrderService } from '../interfaces/IOrderService';
import { Order, OrderStatus, CheckoutFormData } from '../../types/order';
import { CartItem } from '../../types/cart';
import { MockOrderService } from '../mock/MockOrderService';

const API_BASE = '/api/orders';
const mockOrderService = new MockOrderService();

export class ApiOrderService implements IOrderService {
  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockOrderService.getOrders();
  }

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (res.status === 404) return mockOrderService.getOrderById(id);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockOrderService.getOrderById(id);
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE}/customer/${customerId}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockOrderService.getCustomerOrders(customerId);
  }

  async createOrder(
    checkoutData: CheckoutFormData,
    items: CartItem[],
    totals: { subtotal: number; shipping: number; tax: number; discount: number; total: number }
  ): Promise<Order> {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutData, items, totals }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockOrderService.createOrder(checkoutData, items, totals);
  }

  async updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string, carrier?: string): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber, carrier }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockOrderService.updateOrderStatus(id, status, trackingNumber, carrier);
  }

  async cancelOrder(id: string): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/${id}/cancel`, {
        method: 'PUT',
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockOrderService.cancelOrder(id);
  }
}
