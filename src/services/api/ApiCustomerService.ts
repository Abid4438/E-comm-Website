import { ICustomerService } from '../interfaces/ICustomerService';
import { Customer, Address } from '../../types/customer';
const TOKEN_KEY = 'moss_auth_token';

export class ApiCustomerService implements ICustomerService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getCustomers(): Promise<Customer[]> {
    const res = await fetch('/api/customers', {
      headers: { ...this.getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const res = await fetch(`/api/customers/${id}`, {
      headers: { ...this.getAuthHeader() },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch customer');
    return res.json();
  }

  async getCurrentCustomer(): Promise<Customer | null> {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const res = await fetch('/api/customers/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }
      return res.json();
    } catch {
      return null;
    }
  }

  async login(email: string, password?: string): Promise<{ customer: Customer; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw Object.assign(new Error(err.error || 'Login failed'), { code: err.code });
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    return data;
  }

  async googleLogin(data: { email: string; firstName: string; lastName: string; avatar?: string; googleId?: string }): Promise<{ customer: Customer; token: string }> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json().catch(() => ({ error: 'Google sign-in failed. Please try again.' }));
    if (!res.ok) {
      throw Object.assign(new Error(resData.error || 'Google sign-in failed. Please try again.'), { code: resData.code });
    }
    if (resData.token) localStorage.setItem(TOKEN_KEY, resData.token);
    return resData;
  }

  async register(data: { email: string; firstName: string; lastName: string; phone?: string; password?: string }): Promise<{ customer: Customer; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw Object.assign(new Error(err.error || 'Registration failed'), { code: err.code });
    }
    const resData = await res.json();
    if (resData.token) {
      localStorage.setItem(TOKEN_KEY, resData.token);
    }
    return resData;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(TOKEN_KEY);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
  }

  private async authPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    if (!res.ok) throw new Error(data.error || 'Request failed. Please try again.');
    return data as T;
  }
  async forgotPassword(email: string): Promise<{ sent: boolean; resetUrl?: string | null; email: string; expiresIn: string }> {
    return this.authPost('/api/auth/forgot-password', { email });
  }
  async resendReset(email: string): Promise<{ sent: boolean; resetUrl?: string | null; email: string; expiresIn: string }> {
    return this.authPost('/api/auth/resend-reset', { email });
  }
  async resetPassword(token: string, email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return this.authPost('/api/auth/reset-password', { token, email, newPassword });
  }
  async verifyEmail(email: string): Promise<{ sent: boolean; verified: boolean; message: string; verifyUrl?: string; email: string; expiresIn: string }> {
    return this.authPost('/api/auth/verify-email', { email });
  }
  async resendVerification(email: string): Promise<{ sent: boolean; verifyUrl?: string | null; email: string; expiresIn: string }> {
    return this.authPost('/api/auth/resend-verification', { email });
  }
  async updateProfile(id: string, updates: Partial<Customer>): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  }

  async addAddress(customerId: string, address: Omit<Address, 'id'>): Promise<Address> {
    const res = await fetch(`/api/customers/${customerId}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(address),
    });
    if (!res.ok) throw new Error('Failed to add address');
    return res.json();
  }

  async updateAddress(customerId: string, addressId: string, address: Partial<Address>): Promise<Address> {
    const res = await fetch(`/api/customers/${customerId}/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(address),
    });
    if (!res.ok) throw new Error('Failed to update address');
    return res.json();
  }

  async deleteAddress(customerId: string, addressId: string): Promise<boolean> {
    const res = await fetch(`/api/customers/${customerId}/addresses/${addressId}`, {
      method: 'DELETE',
      headers: { ...this.getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete address');
    return true;
  }
}
