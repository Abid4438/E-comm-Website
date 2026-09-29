import { create } from 'zustand';
import { Customer } from '../types/customer';
import { customerService } from '../services/apiClient';

interface GoogleLoginData {
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  googleId: string;
}

interface AuthState {
  user: Customer | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<Customer>;
  googleLogin: (data: GoogleLoginData) => Promise<Customer>;
  register: (data: { email: string; firstName: string; lastName: string; phone?: string; password?: string }) => Promise<Customer>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Customer>) => Promise<Customer>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,

  refreshUser: async () => {
    try {
      const user = await customerService.getCurrentCustomer();
      if (user) {
        set({
          user,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
          isLoading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { customer } = await customerService.login(email, password);
      set({
        user: customer,
        isAuthenticated: true,
        isAdmin: customer.role === 'admin',
        isLoading: false,
      });
      return customer;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  googleLogin: async (data) => {
    set({ isLoading: true });
    try {
      // Use the register flow which auto-logs in, or falls back to login if exists
      const { customer } = await customerService.register({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      // Update avatar if provided by Google
      if (data.avatar) {
        const updated = await customerService.updateProfile(customer.id, { avatar: data.avatar });
        set({
          user: updated,
          isAuthenticated: true,
          isAdmin: updated.role === 'admin',
          isLoading: false,
        });
        return updated;
      }

      set({
        user: customer,
        isAuthenticated: true,
        isAdmin: customer.role === 'admin',
        isLoading: false,
      });
      return customer;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const { customer } = await customerService.register(data);
      set({
        user: customer,
        isAuthenticated: true,
        isAdmin: customer.role === 'admin',
        isLoading: false,
      });
      return customer;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await customerService.logout();
    set({ user: null, isAuthenticated: false, isAdmin: false, isLoading: false });
  },

  updateProfile: async (updates) => {
    const current = get().user;
    if (!current) throw new Error('Not authenticated');
    const updated = await customerService.updateProfile(current.id, updates);
    set({ user: updated });
    return updated;
  },
}));
