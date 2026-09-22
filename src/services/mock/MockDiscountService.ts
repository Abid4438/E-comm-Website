import { IDiscountService } from '../interfaces/IDiscountService';
import { Discount } from '../../types/discount';
import { INITIAL_DISCOUNTS } from '../../data/mockData';

const DISCOUNTS_KEY = 'moss_discounts_db';

export class MockDiscountService implements IDiscountService {
  private getStoredDiscounts(): Discount[] {
    try {
      const stored = localStorage.getItem(DISCOUNTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    this.saveDiscounts(INITIAL_DISCOUNTS);
    return INITIAL_DISCOUNTS;
  }

  private saveDiscounts(discounts: Discount[]): void {
    try {
      localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(discounts));
    } catch {
      // fallback
    }
  }

  async getDiscounts(): Promise<Discount[]> {
    return this.getStoredDiscounts();
  }

  async validateDiscount(code: string, currentSubtotal: number): Promise<{ isValid: boolean; discount?: Discount; message?: string }> {
    const discounts = this.getStoredDiscounts();
    const cleanCode = code.trim().toUpperCase();
    const discount = discounts.find(d => d.code.toUpperCase() === cleanCode);

    if (!discount) {
      return { isValid: false, message: 'Invalid promo code' };
    }

    if (!discount.isActive) {
      return { isValid: false, message: 'This promo code is no longer active' };
    }

    if (new Date(discount.expiresAt).getTime() < Date.now()) {
      return { isValid: false, message: 'This promo code has expired' };
    }

    if (discount.minSpend && currentSubtotal < discount.minSpend) {
      return { isValid: false, message: `Requires minimum order of $${discount.minSpend}` };
    }

    if (discount.maxUses && discount.usageCount >= discount.maxUses) {
      return { isValid: false, message: 'This promo code has reached its usage limit' };
    }

    return { isValid: true, discount, message: `${discount.percentage}% discount applied` };
  }

  async createDiscount(discountInput: Omit<Discount, 'id' | 'usageCount'>): Promise<Discount> {
    const discounts = this.getStoredDiscounts();
    const newDiscount: Discount = {
      ...discountInput,
      id: `disc-${Date.now()}`,
      usageCount: 0,
    };
    const updated = [newDiscount, ...discounts];
    this.saveDiscounts(updated);
    return newDiscount;
  }

  async updateDiscount(id: string, updates: Partial<Discount>): Promise<Discount> {
    const discounts = this.getStoredDiscounts();
    const idx = discounts.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Discount not found');

    discounts[idx] = { ...discounts[idx], ...updates };
    this.saveDiscounts(discounts);
    return discounts[idx];
  }

  async deleteDiscount(id: string): Promise<boolean> {
    const discounts = this.getStoredDiscounts();
    const filtered = discounts.filter(d => d.id !== id);
    this.saveDiscounts(filtered);
    return true;
  }
}
