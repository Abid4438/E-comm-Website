export type CategoryType = 'home' | 'apparel' | 'accessories' | 'essentials';

export interface ProductColor {
  name: string;
  hex: string;
  inStock: boolean;
}

export interface ProductSize {
  name: string;
  inStock: boolean;
}

export type ProductBadge = 'NEW' | 'BESTSELLER' | 'LIMITED' | 'SALE' | 'ORGANIC' | 'HANDCRAFTED';

export type ProductStatus = 'active' | 'draft' | 'archived';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  tagline?: string;
  description: string;
  shortDescription: string;
  details: string[];
  materials: string[];
  dimensions?: string;
  shippingInfo: string;
  returnsInfo: string;
  price: number;
  compareAtPrice?: number;
  category: CategoryType;
  categoryName?: string;
  images: string[];
  colors: ProductColor[];
  sizes: ProductSize[];
  rating: number;
  reviewCount: number;
  stock: number;
  badge?: ProductBadge;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  status: ProductStatus;
  createdAt: string;
}

export interface ProductFilterOptions {
  category?: CategoryType | 'all';
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  availability?: 'all' | 'in-stock' | 'out-of-stock';
  rating?: number;
  search?: string;
  sortBy?: 'featured' | 'newest' | 'bestselling' | 'price-low' | 'price-high' | 'rating';
}
