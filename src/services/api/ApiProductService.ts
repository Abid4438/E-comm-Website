import { IProductService } from '../interfaces/IProductService';
import { Product, ProductFilterOptions } from '../../types/product';
import { MockProductService } from '../mock/MockProductService';

const API_BASE = '/api/products';
const mockProductService = new MockProductService();

export class ApiProductService implements IProductService {
  async getProducts(filters?: ProductFilterOptions): Promise<Product[]> {
    try {
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
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockProductService.getProducts(filters);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const res = await fetch(`${API_BASE}/slug/${slug}`);
      if (res.status === 404) return mockProductService.getProductBySlug(slug);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockProductService.getProductBySlug(slug);
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (res.status === 404) return mockProductService.getProductById(id);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockProductService.getProductById(id);
  }

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE}/featured?limit=${limit}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockProductService.getFeaturedProducts(limit);
  }

  async getNewArrivals(limit = 8): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE}/new-arrivals?limit=${limit}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockProductService.getNewArrivals(limit);
  }

  async getBestSellers(limit = 8): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE}/bestsellers?limit=${limit}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockProductService.getBestSellers(limit);
  }

  async getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE}/${productId}/related?limit=${limit}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockProductService.getRelatedProducts(productId, limit);
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.getProducts({ search: query });
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockProductService.createProduct(product);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
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
    return mockProductService.updateProduct(id, updates);
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    return mockProductService.deleteProduct(id);
  }
}