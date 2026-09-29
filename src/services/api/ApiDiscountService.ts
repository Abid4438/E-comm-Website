import { IDiscountService } from '../interfaces/IDiscountService';
import { Discount } from '../../types/discount';

const API_BASE = '/api/discounts';

export class ApiDiscountService implements IDiscountService {
  async getDiscounts(): Promise<Discount[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch discounts');
    return res.json();
  }

  async validateDiscount(code: string, currentSubtotal: number): Promise<{ isValid: boolean; discount?: Discount; message?: string }> {
    const res = await fetch(`${API_BASE}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, currentSubtotal }),
    });
    if (!res.ok) throw new Error('Failed to validate discount');
    return res.json();
  }

  async createDiscount(discount: Omit<Discount, 'id' | 'usageCount'>): Promise<Discount> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discount),
    });
    if (!res.ok) throw new Error('Failed to create discount');
    return res.json();
  }

  async updateDiscount(id: string, updates: Partial<Discount>): Promise<Discount> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update discount');
    return res.json();
  }

  async deleteDiscount(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete discount');
    return true;
  }
}
