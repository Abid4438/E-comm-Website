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
    const deliveryDate = new Date();
    const deliveryWorkingDays = checkoutData.deliveryMethod === 'overnight' ? 1 : checkoutData.deliveryMethod === 'express' ? 3 : 5;
    let daysAdded = 0;
    while (daysAdded < deliveryWorkingDays) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) daysAdded += 1;
    }

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
      paymentMethod: checkoutData.paymentMethodName || checkoutData.paymentMethod,
      paymentStatus: 'Paid',
      deliveryMethod: checkoutData.deliveryMethod === 'express' ? 'Express Courier (usually 1-3 working days; serviceability varies)' : checkoutData.deliveryMethod === 'overnight' ? 'Priority Courier (usually next working day in major cities; serviceability varies)' : 'Standard Pakistan Courier (usually 3-5 working days)',
      trackingNumber: `MOSS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      carrier: 'Local courier partner',
      estimatedDelivery: deliveryDate.toISOString().split('T')[0],
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
