import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { orderService } from '../services/apiClient';
import { Order } from '../types/order';
import { formatPrice, formatDate } from '../utils/formatters';
import { SEOHead } from '../components/ui/SEOHead';
import { Button } from '../components/ui/Button';
import { CheckCircle2, Printer, ArrowRight, Package, Truck, Clock } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>((location.state as any)?.order || null);
  const [isLoading, setIsLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderId) {
      const fetchOrder = async () => {
        setIsLoading(true);
        try {
          const found = await orderService.getOrderById(orderId);
          setOrder(found);
        } catch (err) {
          console.error('Error fetching order:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrder();
    }
  }, [order, orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-moss-900 border-t-transparent mx-auto mb-4" />
        <p className="text-xs uppercase tracking-widest text-charcoal-500">Retrieving Order Details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-3xl text-charcoal-900 mb-4">Order Not Found</h2>
        <p className="text-sm text-charcoal-600 mb-6">We could not locate this order record.</p>
        <Link to="/shop">
          <Button variant="dark" size="md">
            Return to Shop
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <SEOHead title={`Order ${order.id} Confirmed | MOSS`} description="Your order receipt and delivery status." />

      {/* Header Badge & Title */}
      <div className="text-center space-y-3 pb-10 border-b border-sand-200">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-moss-100 text-moss-900 mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block">
          Order Confirmed
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-charcoal-900 tracking-tight">
          Thank You, {order.customer.firstName}.
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 max-w-lg mx-auto font-light leading-relaxed">
          Your order <strong>#{order.id}</strong> has been confirmed. A receipt and carbon-neutral tracking link have been dispatched to <strong>{order.customer.email}</strong>.
        </p>

        <div className="pt-4 flex justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Receipt
          </Button>
          <Link to="/account">
            <Button variant="secondary" size="sm">
              View In Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Timeline Status */}
      <div className="py-8 border-b border-sand-200">
        <h3 className="text-xs uppercase tracking-widest font-semibold text-charcoal-900 mb-6">
          Fulfillment Timeline
        </h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-moss-900 text-sand-50 flex items-center justify-center text-xs font-bold mb-2">
              ✓
            </div>
            <span className="text-xs font-semibold text-charcoal-900">Confirmed</span>
            <span className="text-[10px] text-charcoal-500">{formatDate(order.date)}</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-moss-900 text-sand-50 flex items-center justify-center text-xs font-bold mb-2 animate-pulse">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-charcoal-900">Processing</span>
            <span className="text-[10px] text-charcoal-500">In Handcraft Studio</span>
          </div>

          <div className="flex flex-col items-center opacity-40">
            <div className="w-8 h-8 rounded-full bg-sand-300 text-charcoal-700 flex items-center justify-center text-xs font-bold mb-2">
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-charcoal-900">In Transit</span>
            <span className="text-[10px] text-charcoal-500">DHL Express</span>
          </div>

          <div className="flex flex-col items-center opacity-40">
            <div className="w-8 h-8 rounded-full bg-sand-300 text-charcoal-700 flex items-center justify-center text-xs font-bold mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-charcoal-900">Delivered</span>
            <span className="text-[10px] text-charcoal-500">Est. {order.estimatedDelivery}</span>
          </div>
        </div>
      </div>

      {/* Order Details Breakdown */}
      <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-sand-200">
        {/* Purchased Items list */}
        <div className="md:col-span-7 space-y-4">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-charcoal-900">
            Purchased Essentials
          </h3>
          <div className="divide-y divide-sand-200 border border-sand-200 bg-[#FAF8F5]">
            {order.items.map((item) => (
              <div key={item.id} className="p-4 flex items-center gap-4">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-20 object-cover bg-sand-200 shrink-0 border border-sand-300"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-base text-charcoal-900 truncate font-medium">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    {item.selectedColor && `Color: ${item.selectedColor}`}
                    {item.selectedSize && ` · Size: ${item.selectedSize}`}
                  </p>
                  <p className="text-xs text-charcoal-500">
                    Quantity: {item.quantity} · {formatPrice(item.price)} each
                  </p>
                </div>
                <span className="font-serif text-base font-medium text-charcoal-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment summary */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 bg-sand-100/70 border border-sand-200 space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-charcoal-900">
              Delivery Destination
            </h4>
            <div className="text-xs text-charcoal-700 leading-relaxed font-light">
              <p className="font-medium text-charcoal-900">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-1 text-charcoal-500">{order.shippingAddress.phone}</p>
            </div>

            <div className="pt-3 border-t border-sand-200 text-xs">
              <span className="text-charcoal-500 uppercase tracking-wider block mb-1">
                Carrier & Speed
              </span>
              <p className="font-medium text-charcoal-900">{order.deliveryMethod}</p>
              {order.trackingNumber && (
                <p className="text-[11px] text-moss-800 font-mono mt-0.5">
                  Tracking: {order.trackingNumber}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 bg-sand-100/70 border border-sand-200 space-y-3 text-xs">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-charcoal-900 pb-2 border-b border-sand-200">
              Payment Summary
            </h4>
            <div className="flex justify-between text-charcoal-600">
              <span>Subtotal</span>
              <span className="text-charcoal-900 font-medium">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-800 font-medium">
                <span>Discount ({order.discountCode || 'PROMO'})</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-charcoal-600">
              <span>Shipping</span>
              <span className="text-charcoal-900 font-medium">
                {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span>Estimated Tax</span>
              <span className="text-charcoal-900 font-medium">{formatPrice(order.tax)}</span>
            </div>
            <div className="pt-3 border-t border-sand-300 flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-wider font-semibold text-charcoal-900">
                Total Paid ({order.paymentMethod})
              </span>
              <span className="font-serif text-2xl font-medium text-charcoal-900">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="pt-10 text-center">
        <Link to="/shop">
          <Button variant="dark" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Continue Exploring Collections
          </Button>
        </Link>
      </div>
    </div>
  );
};
