import { ICategoryService } from '../interfaces/ICategoryService';
import { Category } from '../../types/category';
import { INITIAL_CATEGORIES } from '../../data/categoriesData';

const STORAGE_KEY = 'moss_categories_db';

export class MockCategoryService implements ICategoryService {
  private getStoredCategories(): Category[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    this.saveCategories(INITIAL_CATEGORIES);
    return INITIAL_CATEGORIES;
  }

  private saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch {
      // fallback
    }
  }

  async getCategories(): Promise<Category[]> {
    return this.getStoredCategories();
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const cats = this.getStoredCategories();
    return cats.find(c => c.slug === slug) || null;
  }

  async createCategory(categoryInput: Omit<Category, 'id'>): Promise<Category> {
    const cats = this.getStoredCategories();
    const newCategory: Category = {
      ...categoryInput,
      id: `cat-${Date.now()}`
    };
    cats.push(newCategory);
    this.saveCategories(cats);
    return newCategory;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const cats = this.getStoredCategories();
    const idx = cats.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    const updated = { ...cats[idx], ...updates };
    cats[idx] = updated;
    this.saveCategories(cats);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const cats = this.getStoredCategories();
    const filtered = cats.filter(c => c.id !== id);
    this.saveCategories(filtered);
    return true;
  }
}
