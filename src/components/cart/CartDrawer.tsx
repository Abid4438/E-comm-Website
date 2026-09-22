import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Drawer } from '../ui/Drawer';
import { QuantitySelector } from '../ui/QuantitySelector';
import { Button } from '../ui/Button';
import { useCartStore } from '../../store/useCartStore';
import { formatPrice } from '../../utils/formatters';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { API_CONFIG } from '../../services/apiClient';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getSubtotal,
    getAmountUntilFreeShipping,
    getQualifiesForFreeShipping,
  } = useCartStore();

  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const amountUntilFree = getAmountUntilFreeShipping();
  const qualifiesForFree = getQualifiesForFreeShipping();
  const progressPercent = Math.min(100, (subtotal / API_CONFIG.freeShippingThreshold) * 100);

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleViewCartClick = () => {
    closeCart();
    navigate('/cart');
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeCart}
      position="right"
      width="md"
      title={`Shopping Bag (${items.reduce((s, i) => s + i.quantity, 0)})`}
      footer={
        items.length > 0 ? (
          <div className="space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal-600 uppercase tracking-wider text-xs">
                Subtotal
              </span>
              <span className="font-serif text-xl font-medium text-charcoal-900">
                {formatPrice(subtotal)}
              </span>
            </div>

            <p className="text-[11px] text-charcoal-500 text-center">
              Taxes and shipping calculated at checkout.
            </p>

            {/* Action buttons */}
            <div className="space-y-2 pt-1">
              <Button
                variant="dark"
                size="lg"
                className="w-full justify-between"
                onClick={handleCheckoutClick}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <button
                type="button"
                onClick={handleViewCartClick}
                className="w-full text-center py-2 text-xs uppercase tracking-widest text-charcoal-600 hover:text-charcoal-900 underline underline-offset-4 transition-colors font-medium"
              >
                View Full Bag & Edit
              </button>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-charcoal-500 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-moss-800" />
              <span>Complimentary Carbon-Neutral Shipping & 30-Day Returns</span>
            </div>
          </div>
        ) : null
      }
    >
      {/* Free Shipping Progress bar */}
      <div className="mb-6 p-3.5 bg-sand-200/50 border border-sand-300/80">
        <div className="flex items-center gap-2 text-xs text-charcoal-800 font-medium mb-2">
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
        <div className="h-1.5 w-full bg-sand-300 overflow-hidden">
          <div
            className="h-full bg-moss-900 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Cart Items List */}
      {items.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-sand-200/60 flex items-center justify-center text-charcoal-400 mb-4">
            <ShoppingBag className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="font-serif text-2xl text-charcoal-900 mb-2">Your Bag is Empty</h3>
          <p className="text-xs text-charcoal-500 max-w-xs mb-6">
            Discover our curated collection of ceramics, luxury linens, and daily essentials.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              closeCart();
              navigate('/shop');
            }}
          >
            Explore Collection
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-sand-200">
          {items.map((item) => (
            <div key={item.id} className="py-4 flex gap-4">
              <Link
                to={`/product/${item.product.slug}`}
                onClick={closeCart}
                className="w-20 h-24 bg-sand-200 shrink-0 border border-sand-300 overflow-hidden"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </Link>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/product/${item.product.slug}`}
                      onClick={closeCart}
                      className="font-serif text-base text-charcoal-900 hover:text-moss-900 truncate font-normal leading-tight"
                    >
                      {item.product.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-charcoal-400 hover:text-red-700 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Options */}
                  <div className="text-[11px] text-charcoal-500 mt-1 space-x-2">
                    {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                    {item.selectedSize && <span>· Size: {item.selectedSize}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <QuantitySelector
                    quantity={item.quantity}
                    max={item.product.stock}
                    size="sm"
                    onChange={(qty) => updateQuantity(item.id, qty)}
                  />
                  <span className="text-xs font-sans font-medium text-charcoal-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
};
