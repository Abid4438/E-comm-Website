import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useToastStore();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast({
        title: 'Please enter a valid email',
        message: 'A valid email address is required to join our community.',
        type: 'error',
      });
      return;
    }

    setSubscribed(true);
    showToast({
      title: 'Welcome to MOSS',
      message: 'Thank you for joining our community. Check your inbox for your 10% welcome gift.',
      type: 'success',
    });
    setEmail('');
  };

  return (
    <footer className="bg-[#141F16] text-[#FAF8F5] pt-16 pb-12 border-t border-[#253828]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-16 border-b border-sand-900/60">
          {/* Brand Manifesto column */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="inline-block">
              <span className="font-serif text-3xl tracking-[0.18em] text-[#FAF8F5] uppercase">
                MOSS
              </span>
            </Link>
            <p className="text-sand-300 text-sm leading-relaxed max-w-sm font-light">
              Thoughtfully designed everyday essentials. We craft timeless ceramics, European linens, and tactile objects designed to ground your daily living in quiet luxury.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <span className="block text-[11px] uppercase tracking-[0.2em] text-sand-400 font-semibold mb-2">
                Stay In The Loop
              </span>
              <p className="text-xs text-sand-300/80 mb-3">
                Receive private release previews, editorial essays, and special invitations.
              </p>
              {subscribed ? (
                <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-moss-900/80 p-3 border border-moss-700">
                  <Check className="w-4 h-4" />
                  <span>You're on the list. Welcome to MOSS.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-md">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 bg-moss-900/60 border border-sand-800 px-4 py-2.5 text-xs text-[#FAF8F5] placeholder:text-sand-500 focus:outline-none focus:border-sand-400"
                  />
                  <button
                    type="submit"
                    className="bg-[#FAF8F5] text-charcoal-900 hover:bg-sand-200 px-5 py-2.5 text-xs font-medium uppercase tracking-widest transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-sand-400 font-semibold">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-sand-300">
              <li>
                <Link to="/category/home" className="hover:text-white transition-colors">
                  Home & Living
                </Link>
              </li>
              <li>
                <Link to="/category/apparel" className="hover:text-white transition-colors">
                  Linen Apparel
                </Link>
              </li>
              <li>
                <Link to="/category/accessories" className="hover:text-white transition-colors">
                  Leather & Accessories
                </Link>
              </li>
              <li>
                <Link to="/category/essentials" className="hover:text-white transition-colors">
                  Everyday Essentials
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=newest" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=bestselling" className="hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-sand-400 font-semibold">
              Client Care
            </h4>
            <ul className="space-y-2.5 text-xs text-sand-300">
              <li>
                <Link to="/shipping-returns" className="hover:text-white transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="/shipping-returns#returns" className="hover:text-white transition-colors">
                  30-Day Returns Policy
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Concierge Support
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Studio */}
          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-sand-400 font-semibold">
              The Brand
            </h4>
            <ul className="space-y-2.5 text-xs text-sand-300">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  The MOSS Approach
                </Link>
              </li>
              <li>
                <Link to="/about#materials" className="hover:text-white transition-colors">
                  Materials & Sustainability
                </Link>
              </li>
              <li>
                <Link to="/about#flagship" className="hover:text-white transition-colors">
                  Flagship Showroom
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-gold-500 hover:text-white transition-colors font-medium">
                  Admin Dashboard Demo
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sand-400">
          <p>© {new Date().getFullYear()} MOSS Lifestyle Inc. All rights reserved.</p>

          <div className="flex items-center space-x-4 text-[11px]">
            <span>PKR (Rs) · Pakistan</span>
            <span>·</span>
            <span>Carbon Neutral Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
