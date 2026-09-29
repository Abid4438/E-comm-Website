import { IProductService } from './interfaces/IProductService';
import { ICategoryService } from './interfaces/ICategoryService';
import { IOrderService } from './interfaces/IOrderService';
import { ICustomerService } from './interfaces/ICustomerService';
import { IReviewService } from './interfaces/IReviewService';
import { IDiscountService } from './interfaces/IDiscountService';

import { ApiProductService } from './api/ApiProductService';
import { ApiCategoryService } from './api/ApiCategoryService';
import { ApiOrderService } from './api/ApiOrderService';
import { ApiCustomerService } from './api/ApiCustomerService';
import { ApiReviewService } from './api/ApiReviewService';
import { ApiDiscountService } from './api/ApiDiscountService';

export const productService: IProductService = new ApiProductService();
export const categoryService: ICategoryService = new ApiCategoryService();
export const orderService: IOrderService = new ApiOrderService();
export const customerService: ICustomerService = new ApiCustomerService();
export const reviewService: IReviewService = new ApiReviewService();
export const discountService: IDiscountService = new ApiDiscountService();

export const sendVerificationEmail = async (email: string) => ({ sent: true, email });

export const API_CONFIG = {
  isMock: false,
  currency: 'USD',
  currencySymbol: '$',
  taxRate: 0.08, // 8% estimated tax
  freeShippingThreshold: 100, // Orders over $100 get free standard shipping
  standardShippingFee: 12,
  expressShippingFee: 25,
  overnightShippingFee: 40,
};
