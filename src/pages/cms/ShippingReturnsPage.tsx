import React, { useState } from 'react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SEOHead } from '../../components/ui/SEOHead';
import { Button } from '../../components/ui/Button';
import { useToastStore } from '../../store/useToastStore';
import { Truck, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ShippingReturnsPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [rmaGenerated, setRmaGenerated] = useState(false);
  const { showToast } = useToastStore();

  const handleStartReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !email) return;

    setRmaGenerated(true);
    showToast({
      title: 'Return Authorized',
      message: 'A prepaid printable return label and RMA slip have been generated.',
      type: 'success',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEOHead title="Shipping & Returns Policy | MOSS" description="Complimentary delivery, international transit, and 30-day returns." />

      <Breadcrumbs items={[{ label: 'Client Care', href: '/shipping-returns' }, { label: 'Shipping & Returns' }]} />

      <div className="pt-4 pb-8 border-b border-sand-200">
        <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
          Policies & Logistics
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-charcoal-900 tracking-tight">
          Shipping & Global Returns
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-charcoal-600 max-w-2xl font-light">
          We treat the delivery of our objects as an integral part of the craft experience. Every parcel is safely wrapped in 100% recyclable, plastic-free biodegradable packaging.
        </p>
      </div>

      {/* Shipping Options Table */}
      <div className="py-12 space-y-6">
        <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
          Domestic Shipping Rates (US)
        </h3>

        <div className="overflow-x-auto border border-sand-300">
          <table className="w-full text-left text-xs">
            <thead className="bg-sand-200/70 border-b border-sand-300 text-charcoal-900 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Delivery Service</th>
                <th className="p-4">Estimated Transit Time</th>
                <th className="p-4">Order Value &lt; $100</th>
                <th className="p-4">Order Value $100+</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 bg-[#FAF8F5] text-charcoal-700">
              <tr>
                <td className="p-4 font-medium text-charcoal-900">Standard Ground</td>
                <td className="p-4">3 to 5 business days</td>
                <td className="p-4">$12.00</td>
                <td className="p-4 font-semibold text-moss-900">Complimentary (Free)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-charcoal-900">DHL Express Courier</td>
                <td className="p-4">1 to 2 business days</td>
                <td className="p-4">$25.00</td>
                <td className="p-4">$25.00</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-charcoal-900">Overnight Priority</td>
                <td className="p-4">Next business day by 12:00 PM</td>
                <td className="p-4">$40.00</td>
                <td className="p-4">$40.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Returns Policy Section */}
      <div id="returns" className="py-12 border-t border-sand-200 space-y-8">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
            Guaranteed Satisfaction
          </span>
          <h3 className="font-serif text-3xl text-charcoal-900 font-normal">
            30-Day Sleep & Trial Guarantee
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed max-w-3xl">
            We want you to feel confident that MOSS objects belong in your living environment. We accept returns of unworn apparel and unused home objects within 30 days of receipt. All linen bedding sets are backed by a 60-day trial.
          </p>
        </div>

        {/* Self-Service Return Portal Simulator */}
        <div className="p-8 bg-sand-100 border border-sand-300">
          <h4 className="font-serif text-2xl text-charcoal-900 font-normal mb-2">
            Online Return Portal
          </h4>
          <p className="text-xs text-charcoal-600 font-light mb-6">
            Enter your order number and email address to generate an instant printable prepaid return shipping label.
          </p>

          {rmaGenerated ? (
            <div className="p-6 bg-emerald-50 border border-emerald-300 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>Return Authorization #RMA-849102-US Created</span>
              </div>
              <p className="text-xs text-emerald-800">
                A prepaid DHL return label has been emailed to <strong>{email}</strong>. Attach the label to your original packaging and hand it to any authorized drop-off location.
              </p>
            </div>
          ) : (
            <form onSubmit={handleStartReturn} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Order Number (e.g. MOS-2026-9812)"
                className="bg-white border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Purchaser Email"
                className="bg-white border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
              <Button type="submit" variant="dark" size="md">
                Look Up Order
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
