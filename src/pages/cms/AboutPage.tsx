import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SEOHead } from '../../components/ui/SEOHead';
import { Button } from '../../components/ui/Button';
import { Compass, Feather, ShieldCheck, MapPin } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full">
      <SEOHead
        title="About MOSS | Thoughtful Everyday Shopping"
        description="Learn about MOSS, our simple approach to online shopping, and the tools that help customers manage orders and delivery details."
      />

      <section className="relative h-[65vh] min-h-[420px] bg-sand-900 text-white flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85"
          alt="Calm, thoughtfully arranged home interior"
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.75]"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-4">
          <span className="text-[11px] uppercase tracking-[0.25em] text-sand-300 font-semibold">
            About MOSS
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight uppercase leading-tight">
            A CALMER WAY TO SHOP
          </h1>
          <p className="text-sm sm:text-base text-sand-100 font-light max-w-xl mx-auto leading-relaxed">
            We want finding the right everyday essentials to feel clear, considered, and straightforward—from browsing products to managing your orders.
          </p>
          <div className="pt-3">
            <Link to="/shop">
              <Button variant="dark" size="md">Explore the Shop</Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs items={[{ label: 'About', href: '/about' }, { label: 'Our Approach' }]} />

        <section className="py-16 max-w-4xl mx-auto space-y-8 text-center sm:text-left">
          <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block">
            Our approach
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-charcoal-900 font-normal tracking-tight leading-tight">
            Good shopping starts with clear choices and a simple experience.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 text-xs sm:text-sm text-charcoal-700 leading-relaxed font-light">
            <p>
              MOSS is an online store for home and everyday essentials. Our aim is to make it easy to explore the collection, understand the product information available, and choose what works for you.
            </p>
            <p>
              We keep the shopping experience focused and practical. Customers can create an account, review order history, and keep delivery addresses together for future purchases.
            </p>
          </div>
        </section>

        <section className="py-16 border-t border-sand-200">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
              What matters to us
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal">
              Simple by design
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#FAF8F5] border border-sand-300 space-y-4">
              <Compass className="w-6 h-6 text-moss-800" />
              <h4 className="font-serif text-2xl text-charcoal-900 font-normal">Easy to explore</h4>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-light">
                Browse the shop and collections, then open a product page to review its description, options, price, and availability.
              </p>
            </div>

            <div className="p-8 bg-[#FAF8F5] border border-sand-300 space-y-4">
              <Feather className="w-6 h-6 text-moss-800" />
              <h4 className="font-serif text-2xl text-charcoal-900 font-normal">Clear information</h4>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-light">
                We aim to present useful product details in a straightforward way, helping you make a choice that fits your needs.
              </p>
            </div>

            <div className="p-8 bg-[#FAF8F5] border border-sand-300 space-y-4">
              <ShieldCheck className="w-6 h-6 text-moss-800" />
              <h4 className="font-serif text-2xl text-charcoal-900 font-normal">Your account, organized</h4>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-light">
                Use your customer account to review your order history and manage saved delivery addresses in one place.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-sand-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block">
                Here to help
              </span>
              <h3 className="font-serif text-3xl sm:text-5xl text-charcoal-900 font-normal tracking-tight">
                Questions? Let’s talk.
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed font-light">
                Need help with a product, an order, or the shopping process? Visit our contact page and send us your question. We’ll use your message to understand what you need and help where we can.
              </p>
              <div className="p-4 bg-sand-100 border border-sand-300 space-y-2 text-xs text-charcoal-800">
                <div className="flex items-center gap-2 font-semibold">
                  <MapPin className="w-4 h-4 text-moss-800" />
                  <span>Online store and customer support</span>
                </div>
                <p className="text-charcoal-500">
                  For current product, shipping, or returns information, check the relevant page or contact us directly.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link to="/contact">
                  <Button variant="dark" size="md">Contact MOSS</Button>
                </Link>
                <Link to="/shipping-returns">
                  <Button variant="outline" size="md">Shipping & Returns</Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 aspect-[4/3] bg-sand-200 border border-sand-300 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                alt="Warm, minimal home interior"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
