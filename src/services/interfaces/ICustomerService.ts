import { Customer, Address } from '../../types/customer';

export interface ICustomerService {
  getCustomers(): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | null>;
  getCurrentCustomer(): Promise<Customer | null>;
  login(email: string, password?: string): Promise<{ customer: Customer; token: string }>;
  googleLogin(data: { email: string; firstName: string; lastName: string; avatar?: string; googleId?: string }): Promise<{ customer: Customer; token: string }>;
  register(data: { email: string; firstName: string; lastName: string; phone?: string; password?: string }): Promise<{ customer: Customer; token: string }>;
  logout(): Promise<void>;
  updateProfile(id: string, updates: Partial<Customer>): Promise<Customer>;
  addAddress(customerId: string, address: Omit<Address, 'id'>): Promise<Address>;
  updateAddress(customerId: string, addressId: string, address: Partial<Address>): Promise<Address>;
  deleteAddress(customerId: string, addressId: string): Promise<boolean>;
}
