import { PaymentMethodOption } from '../../types/payment';
import { getJsonAuthHeaders } from './auth';

const PAYMENT_METHODS_URL = '/api/settings/payment-methods';

export async function getPaymentMethods(): Promise<PaymentMethodOption[]> {
  const response = await fetch(PAYMENT_METHODS_URL);
  if (!response.ok) throw new Error('Unable to load payment methods');
  const methods = await response.json() as PaymentMethodOption[];
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
