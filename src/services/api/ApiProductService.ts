import { IProductService } from '../interfaces/IProductService';
import { Product, ProductFilterOptions } from '../../types/product';

const API_BASE = '/api/products';

export class ApiProductService implements IProductService {
  async getProducts(filters?: ProductFilterOptions): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.size) params.append('size', filters.size);
      if (filters.color) params.append('color', filters.color);
      if (filters.availability && filters.availability !== 'all') params.append('availability', filters.availability);
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
    }

    const res = await fetch(`${API_BASE}?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const res = await fetch(`${API_BASE}/slug/${slug}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  }

  async getProductById(id: string): Promise<Product | null> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  }

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/featured?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch featured products');
    return res.json();
  }

  async getNewArrivals(limit = 8): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/new-arrivals?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch new arrivals');
    return res.json();
  }

  async getBestSellers(limit = 8): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/bestsellers?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch best sellers');
    return res.json();
  }

  async getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/${productId}/related?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch related products');
    return res.json();
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.getProducts({ search: query });
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  }

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return true;
  }
}
