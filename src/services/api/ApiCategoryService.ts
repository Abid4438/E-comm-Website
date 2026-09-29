import { ICategoryService } from '../interfaces/ICategoryService';
import { Category } from '../../types/category';

const API_BASE = '/api/categories';

export class ApiCategoryService implements ICategoryService {
  async getCategories(): Promise<Category[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const res = await fetch(`${API_BASE}/slug/${slug}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch category');
    return res.json();
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  }

  async deleteCategory(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return true;
  }
}
