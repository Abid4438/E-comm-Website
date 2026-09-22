import { IProductService } from '../interfaces/IProductService';
import { Product, ProductFilterOptions } from '../../types/product';
import { INITIAL_PRODUCTS } from '../../data/productsData';

const STORAGE_KEY = 'moss_products_db';

export class MockProductService implements IProductService {
  private getStoredProducts(): Product[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    this.saveProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  }

  private saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {
      // quota or private mode fallback
    }
  }

  async getProducts(filters?: ProductFilterOptions): Promise<Product[]> {
    let products = this.getStoredProducts();

    if (!filters) return products;

    if (filters.category && filters.category !== 'all') {
      products = products.filter(p => p.category === filters.category);
    }

    if (filters.minPrice !== undefined) {
      products = products.filter(p => p.price >= (filters.minPrice ?? 0));
    }

    if (filters.maxPrice !== undefined) {
      products = products.filter(p => p.price <= (filters.maxPrice ?? Infinity));
    }

    if (filters.size) {
      products = products.filter(p => p.sizes.some(s => s.name.toLowerCase() === filters.size?.toLowerCase() && s.inStock));
    }

    if (filters.color) {
      products = products.filter(p => p.colors.some(c => c.name.toLowerCase() === filters.color?.toLowerCase()));
    }

    if (filters.availability) {
      if (filters.availability === 'in-stock') {
        products = products.filter(p => p.stock > 0);
      } else if (filters.availability === 'out-of-stock') {
        products = products.filter(p => p.stock === 0);
      }
    }

    if (filters.rating !== undefined && filters.rating > 0) {
      products = products.filter(p => p.rating >= (filters.rating ?? 0));
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.details.some(d => d.toLowerCase().includes(q))
      );
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'bestselling':
          products.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
          break;
        case 'price-low':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          products.sort((a, b) => b.rating - a.rating);
          break;
        case 'featured':
        default:
          products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    return products;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = this.getStoredProducts();
    const found = products.find(p => p.slug === slug);
    return found || null;
  }

  async getProductById(id: string): Promise<Product | null> {
    const products = this.getStoredProducts();
    const found = products.find(p => p.id === id);
    return found || null;
  }

  async getFeaturedProducts(limit = 4): Promise<Product[]> {
    const products = this.getStoredProducts();
    return products.filter(p => p.isFeatured).slice(0, limit);
  }

  async getNewArrivals(limit = 4): Promise<Product[]> {
    const products = this.getStoredProducts();
    return [...products]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getBestSellers(limit = 4): Promise<Product[]> {
    const products = this.getStoredProducts();
    return products
      .filter(p => p.isBestSeller || p.reviewCount > 100)
      .slice(0, limit);
  }

  async getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
    const products = this.getStoredProducts();
    const current = products.find(p => p.id === productId);
    if (!current) return products.slice(0, limit);

    return products
      .filter(p => p.id !== productId && p.category === current.category)
      .concat(products.filter(p => p.id !== productId && p.category !== current.category))
      .slice(0, limit);
  }

  async searchProducts(query: string): Promise<Product[]> {
    if (!query || query.trim() === '') return [];
    return this.getProducts({ search: query });
  }

  async createProduct(productInput: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const products = this.getStoredProducts();
    const newProduct: Product = {
      ...productInput,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newProduct, ...products];
    this.saveProducts(updated);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const products = this.getStoredProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');

    // Merge only defined fields to prevent stripping existing data with undefined
    const updatedProduct: Product = { ...products[index] };
    (Object.keys(updates) as (keyof Product)[]).forEach((key) => {
      const value = updates[key];
      if (value !== undefined) {
        (updatedProduct as any)[key] = value;
      }
    });
    products[index] = updatedProduct;
    this.saveProducts(products);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const products = this.getStoredProducts();
    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);
    return true;
  }
}
