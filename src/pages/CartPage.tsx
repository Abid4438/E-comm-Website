import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { QuantitySelector } from '../components/ui/QuantitySelector';
import { Button } from '../components/ui/Button';
import { SEOHead } from '../components/ui/SEOHead';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import { formatPrice } from '../utils/formatters';
import { discountService, API_CONFIG } from '../services/apiClient';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag, X, Truck } from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    appliedDiscount,
    applyDiscount,
    removeDiscount,
    orderNotes,
    setOrderNotes,
    getSubtotal,
    getShippingFee,
    getDiscountAmount,
    getTaxAmount,
    getTotal,
    getAmountUntilFreeShipping,
    getQualifiesForFreeShipping,
  } = useCartStore();

  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const discountAmount = getDiscountAmount();
  const taxAmount = getTaxAmount();
  const total = getTotal();
  const amountUntilFree = getAmountUntilFreeShipping();
  const qualifiesForFree = getQualifiesForFreeShipping();
  const progressPercent = Math.min(100, (subtotal / API_CONFIG.freeShippingThreshold) * 100);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setIsApplyingPromo(true);
    try {
      const res = await discountService.validateDiscount(promoInput, subtotal);
      if (res.isValid && res.discount) {
        applyDiscount(res.discount);
        showToast({
          title: 'Promo Applied',
          message: res.message || 'Promo code applied successfully.',
          type: 'success',
        });
        setPromoInput('');
      } else {
        showToast({
          title: 'Invalid Promo Code',
          message: res.message || 'Please check the code and try again.',
          type: 'error',
        });
      }
    } catch {
      showToast({
        title: 'Error',
        message: 'Could not validate promo code.',
        type: 'error',
      });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEOHead title="Shopping Bag | MOSS" description="Review your selected MOSS essentials." />

      <Breadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: 'Shopping Bag' }]} />

      <div className="pt-4 pb-8 border-b border-sand-200 flex items-baseline justify-between">
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-charcoal-900 tracking-tight">
          Shopping Bag
        </h1>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-charcoal-500 hover:text-red-700 underline uppercase tracking-wider transition-colors"
          >
            Clear Entire Bag
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-sand-200/60 flex items-center justify-center text-charcoal-400 mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 stroke-1" />
          </div>
          <h2 className="font-serif text-3xl text-charcoal-900 mb-2">Your Bag is Empty</h2>
          <p className="text-xs sm:text-sm text-charcoal-500 font-light mb-8">
            You haven't added any items to your shopping bag yet. Explore our handcrafted collections to begin.
          </p>
          <Link to="/shop">
            <Button variant="dark" size="lg">
              Explore All Objects
            </Button>
          </Link>
        </div>
      ) : (
        <div className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* LEFT: Items Table */}
          <div className="lg:col-span-8 space-y-6">
            {/* Free Shipping Progress Banner */}
            <div className="p-4 bg-sand-100 border border-sand-300">
              <div className="flex items-center gap-2 text-xs text-charcoal-900 font-medium mb-2">
                <Truck className="w-4 h-4 text-moss-800 shrink-0" />
                <span>
                  {qualifiesForFree ? (
                    <strong className="text-moss-900">
                      You've unlocked complimentary standard shipping!
                    </strong>
                  ) : (
                    <>
                      Add <strong>{formatPrice(amountUntilFree)}</strong> more to qualify for{' '}
                      <strong>FREE SHIPPING</strong>.
                    </>
                  )}
                </span>
              </div>
              <div className="h-1.5 w-full bg-sand-200 overflow-hidden">
                <div
                  className="h-full bg-moss-900 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="border border-sand-200 divide-y divide-sand-200 bg-[#FAF8F5]">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                  {/* Image */}
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="w-24 sm:w-28 aspect-[4/5] bg-sand-100 border border-sand-200 shrink-0 overflow-hidden"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="font-serif text-lg sm:text-xl text-charcoal-900 hover:text-moss-900 font-normal leading-tight"
                        >
                          {item.product.name}
                        </Link>
                        <span className="font-serif text-lg font-medium text-charcoal-900">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Options */}
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-charcoal-500">
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        {item.selectedSize && <span>· Size: {item.selectedSize}</span>}
                        <span>· Unit: {formatPrice(item.price)}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <QuantitySelector
                        quantity={item.quantity}
                        max={item.product.stock}
                        size="sm"
                        onChange={(qty) => updateQuantity(item.id, qty)}
                      />

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order notes */}
            <div className="p-6 bg-sand-100/60 border border-sand-200">
              <label
                htmlFor="order-notes"
                className="block text-xs uppercase tracking-wider font-semibold text-charcoal-800 mb-2"
              >
                Add Special Instructions or Gift Note
              </label>
              <textarea
                id="order-notes"
                rows={3}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Include a handwritten message or delivery instructions..."
                className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-4">
            <div className="p-6 sm:p-8 bg-sand-100/70 border border-sand-300 sticky top-24 space-y-6">
              <h3 className="font-serif text-2xl font-normal text-charcoal-900 tracking-tight pb-4 border-b border-sand-200">
                Order Summary
              </h3>

              {/* Promo Code Form */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-charcoal-700 mb-2">
                  Promotion Code
                </label>

                {appliedDiscount ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-300 text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        <strong>{appliedDiscount.code}</strong> ({appliedDiscount.percentage}% off)
                      </span>
                    </div>
                    <button
                      onClick={removeDiscount}
                      className="text-emerald-700 hover:text-red-700 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="e.g. WELCOME10"
                      className="flex-1 bg-white border border-sand-300 px-3 py-2 text-xs uppercase text-charcoal-900 focus:outline-none focus:border-moss-900"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isApplyingPromo}
                    >
                      Apply
                    </Button>
                  </form>
                )}
                <p className="text-[10px] text-charcoal-400 mt-1">
                  Try codes: <strong>WELCOME10</strong> or <strong>MOSS20</strong>
                </p>
              </div>

              {/* Breakdown lines */}
              <div className="space-y-3 pt-4 border-t border-sand-200 text-xs">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal</span>
                  <span className="text-charcoal-900 font-medium">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span>Discount ({appliedDiscount?.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-charcoal-600">
                  <span>Standard Shipping</span>
                  <span className="text-charcoal-900 font-medium">
                    {shippingFee === 0 ? 'Complimentary (Free)' : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between text-charcoal-600">
                  <span>Estimated Tax (8%)</span>
                  <span className="text-charcoal-900 font-medium">{formatPrice(taxAmount)}</span>
                </div>

                <div className="pt-4 border-t border-sand-300 flex justify-between items-baseline">
                  <span className="text-sm font-semibold uppercase tracking-wider text-charcoal-900">
                    Estimated Total
                  </span>
                  <span className="font-serif text-3xl font-medium text-charcoal-900">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <div className="space-y-3 pt-2">
                <Button
                  variant="dark"
                  size="lg"
                  className="w-full justify-between"
                  onClick={() => navigate('/checkout')}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Link to="/shop" className="block text-center">
                  <span className="text-xs uppercase tracking-widest text-charcoal-600 hover:text-charcoal-900 underline underline-offset-4">
                    Continue Shopping
                  </span>
                </Link>
              </div>

              <div className="pt-4 border-t border-sand-200 flex items-center justify-center gap-2 text-[10px] text-charcoal-500 uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-moss-800" />
                <span>SSL Encrypted · 30-Day Returns Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
