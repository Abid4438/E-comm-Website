import { ICategoryService } from '../interfaces/ICategoryService';
import { Category } from '../../types/category';
import { MockCategoryService } from '../mock/MockCategoryService';

const API_BASE = '/api/categories';
const mockCategoryService = new MockCategoryService();

export class ApiCategoryService implements ICategoryService {
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockCategoryService.getCategories();
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const res = await fetch(`${API_BASE}/slug/${slug}`);
      if (res.status === 404) return mockCategoryService.getCategoryBySlug(slug);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockCategoryService.getCategoryBySlug(slug);
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return mockCategoryService.createCategory(category);
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
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
    return mockCategoryService.updateCategory(id, updates);
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    return mockCategoryService.deleteCategory(id);
  }
}
