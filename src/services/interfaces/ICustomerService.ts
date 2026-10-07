import { Customer, Address } from '../../types/customer';

export interface ICustomerService {
  getCustomers(): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | null>;
  getCurrentCustomer(): Promise<Customer | null>;
  login(email: string, password?: string): Promise<{ customer: Customer; token: string }>;
  googleLogin(data: { email: string; firstName: string; lastName: string; avatar?: string; googleId?: string }): Promise<{ customer: Customer; token: string }>;
  register(data: { email: string; firstName: string; lastName: string; phone?: string; password?: string }): Promise<{ customer: Customer; token: string }>;
  logout(): Promise<void>;
  forgotPassword(email: string): Promise<{ sent: boolean; resetUrl?: string | null; email: string; expiresIn: string }>;
  resendReset(email: string): Promise<{ sent: boolean; resetUrl?: string | null; email: string; expiresIn: string }>;
  resetPassword(token: string, email: string, newPassword: string): Promise<{ success: boolean; message: string }>;
  verifyEmail(email: string): Promise<{ sent: boolean; verified: boolean; message: string; verifyUrl?: string; email: string; expiresIn: string }>;
  resendVerification(email: string): Promise<{ sent: boolean; verifyUrl?: string | null; email: string; expiresIn: string }>;
  updateProfile(id: string, updates: Partial<Customer>): Promise<Customer>;
  addAddress(customerId: string, address: Omit<Address, 'id'>): Promise<Address>;
  updateAddress(customerId: string, addressId: string, address: Partial<Address>): Promise<Address>;
  deleteAddress(customerId: string, addressId: string): Promise<boolean>;
}
