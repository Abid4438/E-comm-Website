import { create } from 'zustand';
import { CartItem } from '../types/cart';
import { Product } from '../types/product';
import { Discount } from '../types/discount';
import { getStoreConfig } from '../services/apiClient';

const STORAGE_KEY = 'moss_cart_state';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  appliedDiscount: Discount | null;
  shippingOption: 'standard' | 'express' | 'overnight';
  orderNotes: string;

  // Actions
  addItem: (product: Product, quantity?: number, color?: string, size?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  applyDiscount: (discount: Discount) => void;
  removeDiscount: () => void;
  setShippingOption: (option: 'standard' | 'express' | 'overnight') => void;
  setOrderNotes: (notes: string) => void;

  // Getters / Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingFee: () => number;
  getDiscountAmount: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;
  getAmountUntilFreeShipping: () => number;
  getQualifiesForFreeShipping: () => boolean;
}

const loadSavedCart = (): { items: CartItem[]; discount: Discount | null; shippingOption: 'standard' | 'express' | 'overnight'; orderNotes: string } => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        items: parsed.items || [],
        discount: parsed.appliedDiscount || null,
        shippingOption: parsed.shippingOption || 'standard',
        orderNotes: parsed.orderNotes || '',
      };
    }
  } catch {
    // fallback
  }
  return { items: [], discount: null, shippingOption: 'standard', orderNotes: '' };
};

const saveCart = (items: CartItem[], appliedDiscount: Discount | null, shippingOption: 'standard' | 'express' | 'overnight' = 'standard', orderNotes: string = '') => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, appliedDiscount, shippingOption, orderNotes }));
  } catch {
    // fallback
  }
};

const initialData = loadSavedCart();

export const useCartStore = create<CartState>((set, get) => ({
  items: initialData.items,
  isOpen: false,
  appliedDiscount: initialData.discount,
  shippingOption: initialData.shippingOption,
  orderNotes: initialData.orderNotes,

  addItem: (product, quantity = 1, color, size) => {
    if (product.stock <= 0 || quantity <= 0) return;
    // Determine selected values with fallbacks
    const selectedColor = color || (product.colors.length > 0 ? product.colors[0].name : undefined);
    const selectedSize = size || (product.sizes.length > 0 ? product.sizes[0].name : undefined);
    const itemId = `${product.id}-${selectedColor || 'default'}-${selectedSize || 'default'}`;

    set((state) => {
      const existingIndex = state.items.findIndex((item) => item.id === itemId);
      let updatedItems: CartItem[];

      if (existingIndex > -1) {
        updatedItems = [...state.items];
        const newQty = updatedItems[existingIndex].quantity + quantity;
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: Math.min(newQty, product.stock),
        };
      } else {
        const newItem: CartItem = {
          id: itemId,
          productId: product.id,
          product,
          selectedColor,
          selectedSize,
          quantity: Math.min(quantity, product.stock),
          price: product.price,
        };
        updatedItems = [newItem, ...state.items];
      }

      saveCart(updatedItems, state.appliedDiscount);
      return { items: updatedItems, isOpen: true };
    });
  },

  removeItem: (itemId) => {
    set((state) => {
      const updated = state.items.filter((item) => item.id !== itemId);
      saveCart(updated, state.appliedDiscount, state.shippingOption, state.orderNotes);
      return { items: updated };
    });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }

    set((state) => {
      const updated = state.items
        .filter((item) => item.id !== itemId || item.product.stock > 0)
        .map((item) => item.id === itemId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock)) }
          : item);
      saveCart(updated, state.appliedDiscount, state.shippingOption, state.orderNotes);
      return { items: updated };
    });
  },

  clearCart: () => {
    saveCart([], null, 'standard', '');
    set({ items: [], appliedDiscount: null, orderNotes: '', shippingOption: 'standard' });
  },

  setIsOpen: (isOpen) => set({ isOpen }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  applyDiscount: (discount) => {
    set((state) => {
      saveCart(state.items, discount, state.shippingOption, state.orderNotes);
      return { appliedDiscount: discount };
    });
  },

  removeDiscount: () => {
    set((state) => {
      saveCart(state.items, null, state.shippingOption, state.orderNotes);
      return { appliedDiscount: null };
    });
  },

  setShippingOption: (option) => {
    set({ shippingOption: option });
    const s = get();
    saveCart(s.items, s.appliedDiscount, option, s.orderNotes);
  },
  setOrderNotes: (notes) => {
    set({ orderNotes: notes });
    const s = get();
    saveCart(s.items, s.appliedDiscount, s.shippingOption, notes);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getQualifiesForFreeShipping: () => {
    const option = get().shippingOption;
    return option === 'standard' && get().getSubtotal() >= getStoreConfig().freeShippingThreshold;
  },

  getAmountUntilFreeShipping: () => {
    const subtotal = get().getSubtotal();
    return Math.max(0, getStoreConfig().freeShippingThreshold - subtotal);
  },

  getDiscountAmount: () => {
    const discount = get().appliedDiscount;
    const subtotal = get().getSubtotal();
    if (!discount || subtotal <= 0) return 0;

    if (discount.percentage === 100) {
      return 0; // Handled as free shipping code
    }

    return Math.round((subtotal * discount.percentage) / 100 * 100) / 100;
  },

  getShippingFee: () => {
    const option = get().shippingOption;
    const discount = get().appliedDiscount;
    const subtotal = get().getSubtotal();
    const config = getStoreConfig();

    if (subtotal === 0) return 0;
    if (discount && discount.code === 'FREESHIP') return 0;

    if (option === 'express') return config.expressShippingFee;
    if (option === 'overnight') return config.overnightShippingFee;

    // Standard
    return subtotal >= config.freeShippingThreshold ? 0 : config.standardShippingFee;
  },

  getTaxAmount: () => {
    const subtotal = get().getSubtotal();
    const discountAmount = get().getDiscountAmount();
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    return Math.round(taxableAmount * getStoreConfig().taxRate * 100) / 100;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    const discount = get().getDiscountAmount();
    const shipping = get().getShippingFee();
    const tax = get().getTaxAmount();
    return Math.round(Math.max(0, subtotal - discount + shipping + tax) * 100) / 100;
  },
}));
