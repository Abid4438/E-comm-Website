import { IOrderService } from '../interfaces/IOrderService';
import { Order, OrderStatus, CheckoutFormData } from '../../types/order';
import { CartItem } from '../../types/cart';

const API_BASE = '/api/orders';
const TOKEN_KEY = 'moss_auth_token';

export class ApiOrderService implements IOrderService {
  private getAuthHeaders(): Record<string, string> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  private async getApiError(res: Response, fallback: string): Promise<Error> {
    const data = await res.json().catch(() => ({ error: fallback }));
    return new Error(data.error || fallback);
  }

  async getOrders(): Promise<Order[]> {
    const res = await fetch(API_BASE, { headers: this.getAuthHeaders() });
    if (!res.ok) throw await this.getApiError(res, 'Could not load orders.');
    return res.json();
  }

  async getOrderById(id: string): Promise<Order | null> {
    const res = await fetch(API_BASE + '/' + encodeURIComponent(id), { headers: this.getAuthHeaders() });
    if (res.status === 404) return null;
    if (!res.ok) throw await this.getApiError(res, 'Could not load this order.');
    return res.json();
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    const res = await fetch(API_BASE + '/customer/' + encodeURIComponent(customerId), {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw await this.getApiError(res, 'Could not load your order history.');
    return res.json();
  }

  async createOrder(
    checkoutData: CheckoutFormData,
    items: CartItem[],
    totals: { subtotal: number; shipping: number; tax: number; discount: number; total: number }
  ): Promise<Order> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({ checkoutData, items, totals }),
    });
    if (!res.ok) throw await this.getApiError(res, 'Could not save your order. Please try again.');
    return res.json();
  }

  async updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string, carrier?: string): Promise<Order> {
    const res = await fetch(API_BASE + '/' + encodeURIComponent(id) + '/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({ status, trackingNumber, carrier }),
    });
    if (!res.ok) throw await this.getApiError(res, 'Could not update order status.');
    return res.json();
  }

  async cancelOrder(id: string): Promise<Order> {
    const res = await fetch(API_BASE + '/' + encodeURIComponent(id) + '/cancel', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw await this.getApiError(res, 'Could not cancel this order.');
    return res.json();
  }
}
