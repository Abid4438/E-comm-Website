import { IDiscountService } from '../interfaces/IDiscountService';
import { Discount } from '../../types/discount';
import { MockDiscountService } from '../mock/MockDiscountService';

const API_BASE = '/api/discounts';
const mockDiscountService = new MockDiscountService();

export class ApiDiscountService implements IDiscountService {
  async getDiscounts(): Promise<Discount[]> {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockDiscountService.getDiscounts();
  }

  async validateDiscount(code: string, currentSubtotal: number): Promise<{ isValid: boolean; discount?: Discount; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, currentSubtotal }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockDiscountService.validateDiscount(code, currentSubtotal);
  }

  async createDiscount(discount: Omit<Discount, 'id' | 'usageCount'>): Promise<Discount> {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discount),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockDiscountService.createDiscount(discount);
  }

  async updateDiscount(id: string, updates: Partial<Discount>): Promise<Discount> {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockDiscountService.updateDiscount(id, updates);
  }

  async deleteDiscount(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    return mockDiscountService.deleteDiscount(id);
  }
}
