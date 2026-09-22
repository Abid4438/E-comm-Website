import { Discount } from '../../types/discount';

export interface IDiscountService {
  getDiscounts(): Promise<Discount[]>;
  validateDiscount(code: string, currentSubtotal: number): Promise<{ isValid: boolean; discount?: Discount; message?: string }>;
  createDiscount(discount: Omit<Discount, 'id' | 'usageCount'>): Promise<Discount>;
  updateDiscount(id: string, updates: Partial<Discount>): Promise<Discount>;
  deleteDiscount(id: string): Promise<boolean>;
}
