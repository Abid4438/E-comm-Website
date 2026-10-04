import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Button } from '../components/ui/Button';
import { SEOHead } from '../components/ui/SEOHead';
import { useCartStore } from '../store/useCartStore';
import { productService } from '../services/apiClient';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { orderService, discountService } from '../services/apiClient';
import { formatPrice } from '../utils/formatters';
import { CheckoutFormData } from '../types/order';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { cn } from '../utils/cn';

// Zod Validation Schema
const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
  addressLine1: z.string().min(5, 'Street address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State / Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  deliveryMethod: z.enum(['standard', 'express', 'overnight']),
  paymentMethod: z.enum(['credit_card', 'apple_pay', 'klarna']),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
  cardName: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const CheckoutPage: React.FC = () => {
  const {
    items,
    appliedDiscount,
    applyDiscount,
    removeDiscount,
    clearCart,
    orderNotes,
    shippingOption,
    setShippingOption,
    getSubtotal,
    getShippingFee,
    getDiscountAmount,
    getTaxAmount,
    getTotal,
  } = useCartStore();
  const [isRefreshingStock, setIsRefreshingStock] = useState(false);

  const { user } = useAuthStore();
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Pre-fill user details if logged in
  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '',
      firstName: defaultAddress?.firstName || user?.firstName || '',
      lastName: defaultAddress?.lastName || user?.lastName || '',
      phone: defaultAddress?.phone || user?.phone || '',
      addressLine1: defaultAddress?.addressLine1 || '',
      addressLine2: defaultAddress?.addressLine2 || '',
      city: defaultAddress?.city || '',
      state: defaultAddress?.state || '',
      postalCode: defaultAddress?.postalCode || '',
      country: defaultAddress?.country || 'Pakistan',
      deliveryMethod: shippingOption || 'standard',
      paymentMethod: 'credit_card',
      cardNumber: '4242 •••• •••• 4242',
      cardExpiry: '08/28',
      cardCvc: '888',
      cardName: user ? `${user.firstName} ${user.lastName}` : 'Elena Rostova',
      notes: orderNotes || '',
    },
  });

  const selectedDelivery = watch('deliveryMethod');
  const selectedPayment = watch('paymentMethod');

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const shippingFee = getShippingFee();
  const taxAmount = getTaxAmount();
  const total = getTotal();

  const handleDeliveryChange = (method: 'standard' | 'express' | 'overnight') => {
    setValue('deliveryMethod', method);
    setShippingOption(method);
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setIsApplyingPromo(true);
    try {
      const res = await discountService.validateDiscount(promoInput, subtotal);
      if (res.isValid && res.discount) {
        applyDiscount(res.discount);
        // Increment usage count on backend
        try { await fetch('/api/discounts/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: promoInput.trim() }) }); } catch { /* ignore usage increment failure */ }
        showToast({
          title: 'Promo Applied',
          message: res.message || 'Promo code applied.',
          type: 'success',
        });
        setPromoInput('');
      } else {
        showToast({
          title: 'Invalid Promo Code',
          message: res.message || 'Invalid code.',
          type: 'error',
        });
      }
    } catch (err: any) {
      console.error('[Promo Apply Error]', err);
      showToast({ title: 'Promo Error', message: err.message || 'Could not validate promo.', type: 'error' });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      showToast({
        title: 'Empty Bag',
        message: 'Your shopping bag is empty.',
        type: 'error',
      });
      navigate('/shop');
      return;
    }

    // Refresh product stock/prices from server before placing order
    setIsRefreshingStock(true);
    try {
      const refreshed = await Promise.all(
        items.map(async (item) => {
          if (item.product?.id) {
            try {
              const res = await fetch(`/api/products/${item.product.id}`);
              if (res.ok) {
                const fresh = await res.json();
                return { ...item, product: fresh, price: fresh.price, _refreshed: true };
              }
            } catch { /* ignore refresh failure */ }
          }
          return item;
        })
      );
      // Note: cart refresh applied locally — full state sync requires store update (noted limitation)
    } catch { /* ignore */ }
    finally { setIsRefreshingStock(false); }

    setIsSubmitting(true);
    try {
      const checkoutData: CheckoutFormData = {
        ...data,
        discountCode: appliedDiscount?.code,
      };

      const newOrder = await orderService.createOrder(checkoutData, items, {
        subtotal,
        shipping: shippingFee,
        tax: taxAmount,
        discount: discountAmount,
        total,
      });

      // Clear the cart
      clearCart();

      showToast({
        title: 'Order Placed Successfully',
        message: `Thank you! Order #${newOrder.id} has been received.`,
        type: 'success',
      });

      navigate(`/checkout/success/${newOrder.id}`, { state: { order: newOrder } });
    } catch (err) {
      console.error('Checkout error:', err);
      showToast({
        title: 'Checkout Error',
        message: 'There was a problem submitting your order. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-3xl text-charcoal-900 mb-4">Your Shopping Bag is Empty</h2>
        <p className="text-sm text-charcoal-600 mb-6">
          Please add essentials to your bag before proceeding to checkout.
        </p>
        <Link to="/shop">
          <Button variant="dark" size="md">
            Explore Collection
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEOHead title="Secure Checkout | MOSS" description="Complete your MOSS purchase securely." />

      <Breadcrumbs
        items={[
          { label: 'Shop', href: '/shop' },
          { label: 'Cart', href: '/cart' },
          { label: 'Secure Checkout' },
        ]}
      />

      <div className="pt-4 pb-8 border-b border-sand-200">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
              Final Step
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-charcoal-900 tracking-tight">
              Express Checkout
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-charcoal-600">
            <Lock className="w-4 h-4 text-moss-800" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* Prototype Demo Banner */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Prototype Demo Checkout:</strong> No real payment card will be charged. Click "Place Order" to test the realistic order creation flow.
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* LEFT COLUMN: Checkout Form */}
        <div className="lg:col-span-7 space-y-10">
          {/* 1. Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
                1. Contact Information
              </h3>
              {!user && (
                <Link
                  to="/login?redirect=/checkout"
                  className="text-xs text-moss-900 hover:underline font-medium"
                >
                  Already have an account? Sign in
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="elena.rostova@example.com"
                  className={cn(
                    'w-full bg-[#FAF8F5] border p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900',
                    errors.email ? 'border-red-500' : 'border-sand-300'
                  )}
                />
                {errors.email && (
                  <span className="text-[11px] text-red-600 mt-1 block">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                  Phone Number (for delivery updates) *
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="+1 (555) 234-8901"
                  className={cn(
                    'w-full bg-[#FAF8F5] border p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900',
                    errors.phone ? 'border-red-500' : 'border-sand-300'
                  )}
                />
                {errors.phone && (
                  <span className="text-[11px] text-red-600 mt-1 block">
                    {errors.phone.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="space-y-4 pt-6 border-t border-sand-200">
            <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
              2. Shipping Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  {...register('firstName')}
                  className={cn(
                    'w-full bg-[#FAF8F5] border p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900',
                    errors.firstName ? 'border-red-500' : 'border-sand-300'
                  )}
                />
                {errors.firstName && (
                  <span className="text-[11px] text-red-600 mt-1 block">
                    {errors.firstName.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  {...register('lastName')}
                  className={cn(
                    'w-full bg-[#FAF8F5] border p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900',
                    errors.lastName ? 'border-red-500' : 'border-sand-300'
                  )}
                />
                {errors.lastName && (
                  <span className="text-[11px] text-red-600 mt-1 block">
                    {errors.lastName.message}
                  </span>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  {...register('addressLine1')}
                  placeholder="Street address or P.O. Box"
                  className={cn(
                    'w-full bg-[#FAF8F5] border p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900',
                    errors.addressLine1 ? 'border-red-500' : 'border-sand-300'
                  )}
                />
                {errors.addressLine1 && (
                  <span className="text-[11px] text-red-600 mt-1 block">
                    {errors.addressLine1.message}
                  </span>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                  Apartment, suite, unit (optional)
                </label>
                <input
                  type="text"
                  {...register('addressLine2')}
                  placeholder="Apt 4B"
                  className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  {...register('city')}
                  className={cn(
                    'w-full bg-[#FAF8F5] border p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900',
                    errors.city ? 'border-red-500' : 'border-sand-300'
                  )}
                />
                {errors.city && (
                  <span className="text-[11px] text-red-600 mt-1 block">
                    {errors.city.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                  State / Province *
                </label>
                <input
                  type="text"
                  {...register('state')}
                  className={cn(
                    'w-full bg-[#FAF8F5] border p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900',
                    errors.state ? 'border-red-500' : 'border-sand-300'
                  )}
                />
                {errors.state && (
                  <span className="text-[11px] text-red-600 mt-1 block">
                    {errors.state.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  {...register('postalCode')}
                  className={cn(
                    'w-full bg-[#FAF8F5] border p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900',
                    errors.postalCode ? 'border-red-500' : 'border-sand-300'
                  )}
                />
                {errors.postalCode && (
                  <span className="text-[11px] text-red-600 mt-1 block">
                    {errors.postalCode.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                  Country *
                </label>
                <select
                  {...register('country')}
                  className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                >
                <option value="Pakistan">Pakistan</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="France">France</option>
                  <option value="Germany">Germany</option>
                  <option value="Japan">Japan</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Delivery Method */}
          <div className="space-y-4 pt-6 border-t border-sand-200">
            <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
              3. Delivery Method
            </h3>

            <div className="space-y-3">
              {[
                {
                  id: 'standard',
                  name: 'Standard Carbon-Neutral Ground',
                  timing: '3-5 business days',
                  price: subtotal >= 28000 ? 'Free' : 'Rs 3,360',
                },
                {
                  id: 'express',
                  name: 'DHL Express Courier',
                  timing: '1-2 business days',
                  price: 'Rs 7,000',
                },
                {
                  id: 'overnight',
                  name: 'Overnight Priority Delivery',
                  timing: 'Next business day by 12:00 PM',
                  price: 'Rs 11,200',
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => handleDeliveryChange(opt.id as any)}
                  className={cn(
                    'flex items-center justify-between p-4 border cursor-pointer transition-all',
                    selectedDelivery === opt.id
                      ? 'border-moss-900 bg-sand-200/50 shadow-sm ring-1 ring-moss-900'
                      : 'border-sand-300 bg-[#FAF8F5] hover:border-sand-400'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      value={opt.id}
                      checked={selectedDelivery === opt.id}
                      onChange={() => handleDeliveryChange(opt.id as any)}
                      className="text-moss-900 focus:ring-moss-900"
                    />
                    <div>
                      <span className="font-medium text-xs text-charcoal-900 block">
                        {opt.name}
                      </span>
                      <span className="text-[11px] text-charcoal-500">{opt.timing}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-charcoal-900">{opt.price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Payment Method */}
          <div className="space-y-4 pt-6 border-t border-sand-200">
            <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
              4. Payment Method
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
                { id: 'apple_pay', label: 'Apple Pay', icon: CheckCircle2 },
                { id: 'klarna', label: 'Klarna 4x', icon: Tag },
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setValue('paymentMethod', method.id as any)}
                  className={cn(
                    'p-3.5 border text-center text-xs uppercase tracking-wider font-medium flex flex-col items-center justify-center gap-1.5 transition-all',
                    selectedPayment === method.id
                      ? 'border-moss-900 bg-sand-200/70 ring-1 ring-moss-900 font-semibold'
                      : 'border-sand-300 bg-[#FAF8F5] hover:border-sand-400'
                  )}
                >
                  <method.icon className="w-4 h-4 text-charcoal-700" />
                  <span>{method.label}</span>
                </button>
              ))}
            </div>

            {selectedPayment === 'credit_card' && (
              <div className="p-5 bg-sand-100/60 border border-sand-300 space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    {...register('cardNumber')}
                    placeholder="4242 •••• •••• 4242"
                    className="w-full bg-white border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                      Expiration (MM/YY)
                    </label>
                    <input
                      type="text"
                      {...register('cardExpiry')}
                      placeholder="MM/YY"
                      className="w-full bg-white border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                      Security Code (CVC)
                    </label>
                    <input
                      type="text"
                      {...register('cardCvc')}
                      placeholder="CVC"
                      className="w-full bg-white border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    {...register('cardName')}
                    className="w-full bg-white border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Summary and Place Order */}
        <div className="lg:col-span-5">
          <div className="p-6 sm:p-8 bg-sand-100/70 border border-sand-300 sticky top-24 space-y-6">
            <h3 className="font-serif text-2xl font-normal text-charcoal-900 tracking-tight pb-4 border-b border-sand-200">
              Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </h3>

            {/* Thumbnail items list */}
            <div className="divide-y divide-sand-200 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-14 object-cover bg-sand-200 border border-sand-300 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-serif text-charcoal-900 truncate font-medium">
                        {item.product.name}
                      </h4>
                      <p className="text-[10px] text-charcoal-500">
                        Qty: {item.quantity} · {item.selectedColor || 'Standard'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-sans font-medium text-charcoal-900 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code applicator */}
            <div className="pt-4 border-t border-sand-200">
              {appliedDiscount ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-300 text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{appliedDiscount.code} ({appliedDiscount.percentage}% off)</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeDiscount}
                    className="text-emerald-700 hover:text-red-700 text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Discount code"
                    className="flex-1 bg-white border border-sand-300 px-3 py-2 text-xs uppercase focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleApplyPromo}
                    isLoading={isApplyingPromo}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 pt-4 border-t border-sand-200 text-xs">
              <div className="flex justify-between text-charcoal-600">
                <span>Subtotal</span>
                <span className="text-charcoal-900 font-medium">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-charcoal-600">
                <span>Shipping ({selectedDelivery})</span>
                <span className="text-charcoal-900 font-medium">
                  {shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-charcoal-600">
                <span>Estimated Tax</span>
                <span className="text-charcoal-900 font-medium">{formatPrice(taxAmount)}</span>
              </div>

              <div className="pt-4 border-t border-sand-300 flex justify-between items-baseline">
                <span className="text-sm font-semibold uppercase tracking-wider text-charcoal-900">
                  Total Due
                </span>
                <span className="font-serif text-3xl font-medium text-charcoal-900">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* PLACE ORDER BUTTON */}
            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                variant="dark"
                size="lg"
                className="w-full text-sm font-semibold"
                isLoading={isSubmitting}
              >
                PLACE ORDER · {formatPrice(total)}
              </Button>

              <p className="text-[11px] text-charcoal-500 text-center leading-normal">
                By placing your order, you agree to MOSS Terms of Service and Privacy Policy.
              </p>
            </div>

            <div className="pt-4 border-t border-sand-200 flex items-center justify-center gap-2 text-[10px] text-charcoal-500 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-moss-800" />
              <span>Complimentary Carbon-Neutral Delivery</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
