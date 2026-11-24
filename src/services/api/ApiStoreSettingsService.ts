import { DeliveryMethodOption, PaymentMethodOption } from '../../types/payment';
import { getJsonAuthHeaders } from './auth';

const PAYMENT_METHODS_URL = '/api/settings/payment-methods';
const DELIVERY_METHODS_URL = '/api/settings/delivery-methods';

export async function getPaymentMethods(): Promise<PaymentMethodOption[]> {
  const response = await fetch(PAYMENT_METHODS_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load payment methods');
  const methods = await response.json() as PaymentMethodOption[];
  return Array.isArray(methods) ? methods : [];
}

export async function getDeliveryMethods(): Promise<DeliveryMethodOption[]> {
  const response = await fetch(DELIVERY_METHODS_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load delivery methods');
  const methods = await response.json() as DeliveryMethodOption[];
  return Array.isArray(methods) ? methods : [];
}

export async function savePaymentMethods(methods: PaymentMethodOption[]): Promise<void> {
  const response = await fetch(PAYMENT_METHODS_URL, {
    method: 'PUT',
    headers: getJsonAuthHeaders(),
    body: JSON.stringify({ paymentMethods: methods }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || 'Unable to save payment methods');
  }
}

export async function saveDeliveryMethods(methods: DeliveryMethodOption[]): Promise<void> {
  const response = await fetch(DELIVERY_METHODS_URL, {
    method: 'PUT',
    headers: getJsonAuthHeaders(),
    body: JSON.stringify({ deliveryMethods: methods }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || 'Unable to save delivery methods');
  }
}
