import { create } from 'zustand';
import { Product } from '../types/product';

const STORAGE_KEY = 'moss_wishlist_db';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => boolean; // returns true if added, false if removed
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const loadSavedWishlist = (): Product[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return [];
};

const saveWishlist = (items: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // fallback
  }
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: loadSavedWishlist(),

  addItem: (product) => {
    set((state) => {
      if (state.items.some((item) => item.id === product.id)) return state;
      const updated = [product, ...state.items];
      saveWishlist(updated);
      return { items: updated };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const updated = state.items.filter((item) => item.id !== productId);
      saveWishlist(updated);
      return { items: updated };
    });
  },

  toggleItem: (product) => {
    const exists = get().items.some((item) => item.id === product.id);
    if (exists) {
      get().removeItem(product.id);
      return false;
    } else {
      get().addItem(product);
      return true;
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((item) => item.id === productId);
  },

  clearWishlist: () => {
    saveWishlist([]);
    set({ items: [] });
  },
}));
