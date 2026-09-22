import { create } from 'zustand';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type?: 'success' | 'info' | 'error';
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastItem = { ...toast, id };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    const duration = toast.duration || 3500;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
