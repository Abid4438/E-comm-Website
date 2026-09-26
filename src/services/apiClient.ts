import { IProductService } from './interfaces/IProductService';
import { ICategoryService } from './interfaces/ICategoryService';
import { IOrderService } from './interfaces/IOrderService';
import { ICustomerService } from './interfaces/ICustomerService';
import { IReviewService } from './interfaces/IReviewService';
import { IDiscountService } from './interfaces/IDiscountService';

import { MockProductService } from './mock/MockProductService';
import { MockCategoryService } from './mock/MockCategoryService';
import { MockOrderService } from './mock/MockOrderService';
import { MockCustomerService } from './mock/MockCustomerService';
import { MockReviewService } from './mock/MockReviewService';
import { MockDiscountService } from './mock/MockDiscountService';

// Service Factory / Registry
// Allows simple swap to Magento or other e-commerce backend (Shopify / BigCommerce / Medusa)
const USE_MAGENTO = import.meta.env.VITE_USE_MAGENTO === 'true';

export const productService: IProductService = new MockProductService();
export const categoryService: ICategoryService = new MockCategoryService();
export const orderService: IOrderService = new MockOrderService();
export const customerService: ICustomerService = new MockCustomerService();
export const reviewService: IReviewService = new MockReviewService();
export const discountService: IDiscountService = new MockDiscountService();

export const sendVerificationEmail = async (email: string) => ({ sent: true, email });

export const API_CONFIG = {
  isMock: !USE_MAGENTO,
  currency: 'USD',
  currencySymbol: '$',
  taxRate: 0.08, // 8% estimated tax
  freeShippingThreshold: 100, // Orders over $100 get free standard shipping
  standardShippingFee: 12,
  expressShippingFee: 25,
  overnightShippingFee: 40,
};
