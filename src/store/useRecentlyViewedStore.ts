import { create } from 'zustand';
import { Product } from '../types/product';

const STORAGE_KEY = 'moss_recently_viewed';

interface RecentlyViewedState {
  items: Product[];
  addProduct: (product: Product) => void;
  clearAll: () => void;
}

const loadSaved = (): Product[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return [];
};

const saveItems = (items: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // fallback
  }
};

export const useRecentlyViewedStore = create<RecentlyViewedState>((set) => ({
  items: loadSaved(),

  addProduct: (product) => {
    set((state) => {
      const filtered = state.items.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 8); // Keep last 8 items
      saveItems(updated);
      return { items: updated };
    });
  },

  clearAll: () => {
    saveItems([]);
    set({ items: [] });
  },
}));
