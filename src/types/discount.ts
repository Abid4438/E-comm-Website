export interface Discount {
  id: string;
  code: string;
  percentage: number;
  minSpend?: number;
  expiresAt: string;
  usageCount: number;
  maxUses?: number;
  isActive: boolean;
  description: string;
}
