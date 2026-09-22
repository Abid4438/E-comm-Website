export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'customer' | 'admin';
  avatar?: string;
  registeredAt: string;
  addresses: Address[];
  defaultAddressId?: string;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'Inactive' | 'VIP';
}

export interface AuthState {
  user: Customer | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
