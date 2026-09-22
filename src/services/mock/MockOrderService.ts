import { IOrderService } from '../interfaces/IOrderService';
import { Order, OrderStatus, CheckoutFormData } from '../../types/order';
import { CartItem } from '../../types/cart';
import { INITIAL_ORDERS } from '../../data/mockData';

const STORAGE_KEY = 'moss_orders_db';

export class MockOrderService implements IOrderService {
  private getStoredOrders(): Order[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    this.saveOrders(INITIAL_ORDERS);
    return INITIAL_ORDERS;
  }

  private saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // fallback
    }
  }

  async getOrders(): Promise<Order[]> {
    return this.getStoredOrders();
  }

  async getOrderById(id: string): Promise<Order | null> {
    const orders = this.getStoredOrders();
    return orders.find(o => o.id.toLowerCase() === id.toLowerCase()) || null;
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    const orders = this.getStoredOrders();
    return orders.filter(o => o.customerId === customerId || o.customer.email.toLowerCase() === customerId.toLowerCase());
  }

  async createOrder(
    checkoutData: CheckoutFormData,
    items: CartItem[],
    totals: { subtotal: number; shipping: number; tax: number; discount: number; total: number }
  ): Promise<Order> {
    const orders = this.getStoredOrders();
    const orderNumber = `${Date.now() % 100000}`.padStart(5, '0');
    const orderId = `MOS-2026-${orderNumber}`;

    const newOrder: Order = {
      id: orderId,
      date: new Date().toISOString(),
      customer: {
        firstName: checkoutData.firstName,
        lastName: checkoutData.lastName,
        email: checkoutData.email,
        phone: checkoutData.phone,
      },
      shippingAddress: {
        id: `addr-${Date.now()}`,
        firstName: checkoutData.firstName,
        lastName: checkoutData.lastName,
        addressLine1: checkoutData.addressLine1,
        addressLine2: checkoutData.addressLine2,
        city: checkoutData.city,
        state: checkoutData.state,
        postalCode: checkoutData.postalCode,
        country: checkoutData.country,
        phone: checkoutData.phone,
      },
      items: [...items],
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      discount: totals.discount,
      discountCode: checkoutData.discountCode,
      total: totals.total,
      status: 'Processing',
      paymentMethod: checkoutData.paymentMethod === 'apple_pay' ? 'Apple Pay' : checkoutData.paymentMethod === 'klarna' ? 'Klarna' : 'Credit Card',
      paymentStatus: 'Paid',
      deliveryMethod: checkoutData.deliveryMethod === 'express' ? 'Express Courier (1-2 business days)' : checkoutData.deliveryMethod === 'overnight' ? 'Overnight Priority' : 'Standard Ground (3-5 business days)',
      trackingNumber: `MOSS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      carrier: 'DHL Express',
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: checkoutData.notes,
    };

    const updated = [newOrder, ...orders];
    this.saveOrders(updated);
    return newOrder;
  }

  async updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string, carrier?: string): Promise<Order> {
    const orders = this.getStoredOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) throw new Error('Order not found');

    const updatedOrder: Order = {
      ...orders[idx],
      status,
      ...(trackingNumber ? { trackingNumber } : {}),
      ...(carrier ? { carrier } : {}),
    };
    orders[idx] = updatedOrder;
    this.saveOrders(orders);
    return updatedOrder;
  }

  async cancelOrder(id: string): Promise<Order> {
    return this.updateOrderStatus(id, 'Cancelled');
  }
}
