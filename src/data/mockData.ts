import { Order } from '../types/order';
import { Customer } from '../types/customer';
import { Review } from '../types/review';
import { Discount } from '../types/discount';
import { INITIAL_PRODUCTS } from './productsData';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    email: 'elena.rostova@example.com',
    firstName: 'Elena',
    lastName: 'Rostova',
    phone: '+1 (555) 234-8901',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    registeredAt: '2025-11-12T10:00:00Z',
    status: 'VIP',
    totalOrders: 6,
    totalSpent: 1420,
    defaultAddressId: 'addr-001',
    addresses: [
      {
        id: 'addr-001',
        firstName: 'Elena',
        lastName: 'Rostova',
        addressLine1: '742 Evergreen Terrace',
        addressLine2: 'Apt 4B',
        city: 'Portland',
        state: 'OR',
        postalCode: '97201',
        country: 'United States',
        phone: '+1 (555) 234-8901',
        isDefault: true
      }
    ]
  },
  {
    id: 'cust-002',
    email: 'marcus.vance@example.com',
    firstName: 'Marcus',
    lastName: 'Vance',
    phone: '+1 (555) 876-5432',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    registeredAt: '2026-01-04T14:20:00Z',
    status: 'Active',
    totalOrders: 3,
    totalSpent: 625,
    defaultAddressId: 'addr-002',
    addresses: [
      {
        id: 'addr-002',
        firstName: 'Marcus',
        lastName: 'Vance',
        addressLine1: '128 Hudson Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10013',
        country: 'United States',
        phone: '+1 (555) 876-5432',
        isDefault: true
      }
    ]
  },
  {
    id: 'admin-001',
    email: 'admin@moss.com',
    firstName: 'Moss',
    lastName: 'Curator',
    phone: '+1 (800) 555-MOSS',
    role: 'admin',
    registeredAt: '2025-01-01T00:00:00Z',
    status: 'Active',
    totalOrders: 0,
    totalSpent: 0,
    addresses: []
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'MOS-2026-9812',
    date: '2026-09-18T14:32:00Z',
    customer: {
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena.rostova@example.com',
      phone: '+1 (555) 234-8901'
    },
    customerId: 'cust-001',
    shippingAddress: {
      id: 'addr-001',
      firstName: 'Elena',
      lastName: 'Rostova',
      addressLine1: '742 Evergreen Terrace',
      addressLine2: 'Apt 4B',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
      country: 'United States',
      phone: '+1 (555) 234-8901'
    },
    items: [
      {
        id: 'prod-ac-001-Cognac-One Size',
        productId: 'prod-ac-001',
        product: INITIAL_PRODUCTS[4], // Everyday Leather Tote
        selectedColor: 'Cognac',
        selectedSize: 'One Size',
        quantity: 1,
        price: 345
      },
      {
        id: 'prod-es-001-Matte White Vessel-280g (10oz)',
        productId: 'prod-es-001',
        product: INITIAL_PRODUCTS[8], // Hinoki Candle
        selectedColor: 'Matte White Vessel',
        selectedSize: '280g (10oz)',
        quantity: 2,
        price: 48
      }
    ],
    subtotal: 441,
    shipping: 0,
    tax: 35.28,
    discount: 44.10,
    discountCode: 'WELCOME10',
    total: 432.18,
    status: 'Processing',
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    deliveryMethod: 'Express Courier (1-2 business days)',
    trackingNumber: 'TRK-9928174US',
    carrier: 'DHL Express',
    estimatedDelivery: '2026-09-24'
  },
  {
    id: 'MOS-2026-9810',
    date: '2026-09-16T11:15:00Z',
    customer: {
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus.vance@example.com',
      phone: '+1 (555) 876-5432'
    },
    customerId: 'cust-002',
    shippingAddress: {
      id: 'addr-002',
      firstName: 'Marcus',
      lastName: 'Vance',
      addressLine1: '128 Hudson Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10013',
      country: 'United States',
      phone: '+1 (555) 876-5432'
    },
    items: [
      {
        id: 'prod-ap-001-Moss-M',
        productId: 'prod-ap-001',
        product: INITIAL_PRODUCTS[2], // Relaxed Linen Shirt
        selectedColor: 'Moss',
        selectedSize: 'M',
        quantity: 1,
        price: 125
      }
    ],
    subtotal: 125,
    shipping: 0,
    tax: 11.09,
    discount: 0,
    total: 136.09,
    status: 'Shipped',
    paymentMethod: 'Apple Pay',
    paymentStatus: 'Paid',
    deliveryMethod: 'Standard Ground',
    trackingNumber: 'UPS-3849102948',
    carrier: 'UPS Ground',
    estimatedDelivery: '2026-09-22'
  },
  {
    id: 'MOS-2026-9798',
    date: '2026-09-12T09:40:00Z',
    customer: {
      firstName: 'Soren',
      lastName: 'Kjaer',
      email: 'soren.kjaer@example.com',
      phone: '+1 (555) 349-1102'
    },
    shippingAddress: {
      id: 'addr-003',
      firstName: 'Soren',
      lastName: 'Kjaer',
      addressLine1: '450 Mission Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'United States',
      phone: '+1 (555) 349-1102'
    },
    items: [
      {
        id: 'prod-hm-001-Raw Sand-Standard',
        productId: 'prod-hm-001',
        product: INITIAL_PRODUCTS[0], // Hasami Ceramic Vase
        selectedColor: 'Raw Sand',
        selectedSize: 'Standard',
        quantity: 1,
        price: 185
      }
    ],
    subtotal: 185,
    shipping: 0,
    tax: 15.73,
    discount: 0,
    total: 200.73,
    status: 'Delivered',
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    deliveryMethod: 'Standard Ground',
    trackingNumber: 'FEDEX-948192841',
    carrier: 'FedEx Home Delivery',
    estimatedDelivery: '2026-09-15'
  }
];

export const INITIAL_DISCOUNTS: Discount[] = [
  {
    id: 'disc-001',
    code: 'WELCOME10',
    percentage: 10,
    minSpend: 25000,
    expiresAt: '2026-12-31T23:59:59Z',
    usageCount: 142,
    maxUses: 1000,
    isActive: true,
    description: '10% off your first order over Rs 25,000'
  },
  {
    id: 'disc-002',
    code: 'MOSS20',
    percentage: 20,
    minSpend: 200,
    expiresAt: '2026-11-30T23:59:59Z',
    usageCount: 38,
    maxUses: 200,
    isActive: true,
    description: '20% seasonal off orders over $200'
  },
  {
    id: 'disc-003',
    code: 'FREESHIP',
    percentage: 100, // free shipping trigger
    minSpend: 0,
    expiresAt: '2026-12-31T23:59:59Z',
    usageCount: 89,
    isActive: true,
    description: 'Complimentary shipping code'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    productId: 'prod-hm-001',
    productName: 'Hasami Ceramic Vase',
    author: 'Camille Dubois',
    location: 'Paris, FR',
    rating: 5,
    title: 'An exquisite piece of sculpture',
    comment: 'The tactile texture of the unglazed clay is remarkable. It holds dried eucalyptus beautifully on my dining credenza. Packaged with extreme care.',
    date: '2026-08-20',
    verified: true,
    status: 'approved',
    helpfulCount: 24
  },
  {
    id: 'rev-002',
    productId: 'prod-hm-001',
    productName: 'Hasami Ceramic Vase',
    author: 'Julian Thorne',
    location: 'Brooklyn, NY',
    rating: 5,
    title: 'Understated perfection',
    comment: 'True master craftsmanship. You can feel the weight and quality immediately upon unboxing.',
    date: '2026-08-14',
    verified: true,
    status: 'approved',
    helpfulCount: 12
  },
  {
    id: 'rev-003',
    productId: 'prod-ap-001',
    productName: 'The Relaxed Linen Shirt',
    author: 'Tobias Lindqvist',
    location: 'Stockholm, SE',
    rating: 5,
    title: 'The best linen shirt I have ever owned',
    comment: 'The drape and weight are ideal. Doesn’t wrinkle into a mess like cheap linen, but stays crisp and cool all day.',
    date: '2026-08-10',
    verified: true,
    status: 'approved',
    helpfulCount: 45
  },
  {
    id: 'rev-004',
    productId: 'prod-ac-001',
    productName: 'Everyday Leather Tote',
    author: 'Astrid Vance',
    location: 'London, UK',
    rating: 5,
    title: 'The leather smells heavenly',
    comment: 'I use this daily for my laptop, sketchbook, and essentials. The vegetable tanned leather is already developing a wonderful golden honey hue.',
    date: '2026-07-29',
    verified: true,
    status: 'approved',
    helpfulCount: 31
  },
  {
    id: 'rev-005',
    productId: 'prod-es-001',
    productName: 'Hinoki Wood & Cedar Candle',
    author: 'Dr. Michael Chen',
    location: 'San Francisco, CA',
    rating: 5,
    title: 'Subtle, calming, never overpowering',
    comment: 'Unlike commercial synthetic candles, this fills the room with genuine hinoki and wood smoke notes that calm the nervous system. Burning my third one now.',
    date: '2026-09-02',
    verified: true,
    status: 'approved',
    helpfulCount: 19
  }
];
