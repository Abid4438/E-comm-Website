import { ICustomerService } from '../interfaces/ICustomerService';
import { Customer, Address } from '../../types/customer';
import { INITIAL_CUSTOMERS } from '../../data/mockData';

const CUSTOMERS_KEY = 'moss_customers_db';
const AUTH_KEY = 'moss_auth_user';

export class MockCustomerService implements ICustomerService {
  private getStoredCustomers(): Customer[] {
    try {
      const stored = localStorage.getItem(CUSTOMERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    this.saveCustomers(INITIAL_CUSTOMERS);
    return INITIAL_CUSTOMERS;
  }

  private saveCustomers(customers: Customer[]): void {
    try {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    } catch {
      // fallback
    }
  }

  async getCustomers(): Promise<Customer[]> {
    return this.getStoredCustomers();
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const customers = this.getStoredCustomers();
    return customers.find(c => c.id === id) || null;
  }

  async getCurrentCustomer(): Promise<Customer | null> {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return null;
  }

  async login(email: string, _password?: string): Promise<{ customer: Customer; token: string }> {
    const customers = this.getStoredCustomers();
    let customer = customers.find(c => c.email.toLowerCase() === email.toLowerCase());

    if (!customer) {
      // Auto-create demo customer if email does not exist
      customer = {
        id: `cust-${Date.now()}`,
        email,
        firstName: email.split('@')[0],
        lastName: 'Member',
        phone: '+1 (555) 000-0000',
        role: email.includes('admin') ? 'admin' : 'customer',
        registeredAt: new Date().toISOString(),
        status: 'Active',
        totalOrders: 0,
        totalSpent: 0,
        addresses: [],
      };
      customers.push(customer);
      this.saveCustomers(customers);
    }

    const token = `moss_jwt_${btoa(customer.id)}_${Date.now()}`;
    localStorage.setItem(AUTH_KEY, JSON.stringify(customer));
    localStorage.setItem('moss_auth_token', token);

    return { customer, token };
  }

  async googleLogin(data: { email: string; firstName: string; lastName: string; avatar?: string; googleId?: string }): Promise<{ customer: Customer; token: string }> {
    const customers = this.getStoredCustomers();
    let customer = customers.find(c => c.email.toLowerCase() === data.email.toLowerCase());

    if (!customer) {
      customer = {
        id: `cust-${Date.now()}`,
        email: data.email,
        firstName: data.firstName || data.email.split('@')[0],
        lastName: data.lastName || 'Member',
        phone: '',
        role: data.email.includes('admin') ? 'admin' : 'customer',
        avatar: data.avatar,
        registeredAt: new Date().toISOString(),
        status: 'Active',
        totalOrders: 0,
        totalSpent: 0,
        addresses: [],
      };
      customers.push(customer);
      this.saveCustomers(customers);
    } else {
      if (data.avatar) customer.avatar = data.avatar;
      this.saveCustomers(customers);
    }

    const token = `moss_jwt_${btoa(customer.id)}_${Date.now()}`;
    localStorage.setItem(AUTH_KEY, JSON.stringify(customer));
    localStorage.setItem('moss_auth_token', token);

    return { customer, token };
  }

  async register(data: { email: string; firstName: string; lastName: string; phone?: string; password?: string }): Promise<{ customer: Customer; token: string }> {
    const customers = this.getStoredCustomers();
    const existing = customers.find(c => c.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return this.login(data.email);
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || '',
      role: data.email.includes('admin') ? 'admin' : 'customer',
      registeredAt: new Date().toISOString(),
      status: 'Active',
      totalOrders: 0,
      totalSpent: 0,
      addresses: [],
    };

    customers.push(newCustomer);
    this.saveCustomers(customers);

    const token = `moss_jwt_${btoa(newCustomer.id)}_${Date.now()}`;
    localStorage.setItem(AUTH_KEY, JSON.stringify(newCustomer));
    localStorage.setItem('moss_auth_token', token);

    return { customer: newCustomer, token };
  }

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('moss_auth_token');
  }

  async updateProfile(id: string, updates: Partial<Customer>): Promise<Customer> {
    const customers = this.getStoredCustomers();
    const idx = customers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Customer not found');

    const updated = { ...customers[idx], ...updates };
    customers[idx] = updated;
    this.saveCustomers(customers);

    // If current logged in customer, update session too
    const current = await this.getCurrentCustomer();
    if (current && current.id === id) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
    }

    return updated;
  }

  async addAddress(customerId: string, addressData: Omit<Address, 'id'>): Promise<Address> {
    const customers = this.getStoredCustomers();
    const idx = customers.findIndex(c => c.id === customerId);
    if (idx === -1) throw new Error('Customer not found');

    const newAddress: Address = {
      ...addressData,
      id: `addr-${Date.now()}`,
    };

    if (newAddress.isDefault || customers[idx].addresses.length === 0) {
      customers[idx].addresses.forEach(a => { a.isDefault = false; });
      newAddress.isDefault = true;
      customers[idx].defaultAddressId = newAddress.id;
    }

    customers[idx].addresses.push(newAddress);
    this.saveCustomers(customers);

    const current = await this.getCurrentCustomer();
    if (current && current.id === customerId) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(customers[idx]));
    }

    return newAddress;
  }

  async updateAddress(customerId: string, addressId: string, updates: Partial<Address>): Promise<Address> {
    const customers = this.getStoredCustomers();
    const cIdx = customers.findIndex(c => c.id === customerId);
    if (cIdx === -1) throw new Error('Customer not found');

    const aIdx = customers[cIdx].addresses.findIndex(a => a.id === addressId);
    if (aIdx === -1) throw new Error('Address not found');

    if (updates.isDefault) {
      customers[cIdx].addresses.forEach(a => { a.isDefault = false; });
      customers[cIdx].defaultAddressId = addressId;
    }

    const updatedAddress = { ...customers[cIdx].addresses[aIdx], ...updates };
    customers[cIdx].addresses[aIdx] = updatedAddress;
    this.saveCustomers(customers);

    const current = await this.getCurrentCustomer();
    if (current && current.id === customerId) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(customers[cIdx]));
    }

    return updatedAddress;
  }

  async deleteAddress(customerId: string, addressId: string): Promise<boolean> {
    const customers = this.getStoredCustomers();
    const cIdx = customers.findIndex(c => c.id === customerId);
    if (cIdx === -1) throw new Error('Customer not found');

    customers[cIdx].addresses = customers[cIdx].addresses.filter(a => a.id !== addressId);
    this.saveCustomers(customers);

    const current = await this.getCurrentCustomer();
    if (current && current.id === customerId) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(customers[cIdx]));
    }

    return true;
  }
}
