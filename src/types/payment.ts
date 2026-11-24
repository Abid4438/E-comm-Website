export interface PaymentMethodOption {
  id: string;
  label: string;
}

export interface DeliveryMethodOption {
  id: string;
  label: string;
  timing: string;
  fee: number;
}
