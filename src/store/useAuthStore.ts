import { create } from 'zustand';
import { Customer } from '../types/customer';
import { customerService } from '../services/apiClient';

interface GoogleLoginData {
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  googleId?: string;
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
  forgotPassword: (email: string) => Promise<{ sent: boolean; resetUrl?: string | null; email: string; expiresIn: string }>;
  resetPassword: (token: string, email: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (email: string) => Promise<{ sent: boolean; verified: boolean; message: string; verifyUrl?: string; email: string; expiresIn: string }>;
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
      const { customer } = await customerService.googleLogin(data);
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

  forgotPassword: async (email) => {
    const result = await customerService.forgotPassword(email);
    return result;
  },
  resetPassword: async (token, email, newPassword) => {
    const result = await customerService.resetPassword(token, email, newPassword);
    return result;
  },
  verifyEmail: async (email) => {
    const result = await customerService.verifyEmail(email);
    return result;
  },

  updateProfile: async (updates) => {
    const current = get().user;
    if (!current) throw new Error('Not authenticated');
    const updated = await customerService.updateProfile(current.id, updates);
    set({ user: updated });
    return updated;
  },
}));
