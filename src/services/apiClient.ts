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
  currency: 'PKR',
  currencySymbol: 'Rs',
  taxRate: 0.18, // 18% Pakistan GST
  freeShippingThreshold: 28000, // Orders over Rs 28000 get free standard shipping
  standardShippingFee: 3360,
  expressShippingFee: 7000,
  overnightShippingFee: 11200,
};
