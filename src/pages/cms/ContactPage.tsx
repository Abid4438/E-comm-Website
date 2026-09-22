import React, { useState } from 'react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SEOHead } from '../../components/ui/SEOHead';
import { Button } from '../../components/ui/Button';
import { useToastStore } from '../../store/useToastStore';
import { Mail, Phone, MapPin, Clock, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('orders');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToastStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast({ title: 'Missing Info', message: 'Please fill out all fields.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      showToast({
        title: 'Message Sent',
        message: 'A MOSS client concierge will respond within 24 hours.',
        type: 'success',
      });
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEOHead title="Contact Client Concierge | MOSS" description="Get in touch with the MOSS concierge team." />

      <Breadcrumbs items={[{ label: 'Client Care', href: '/contact' }, { label: 'Contact Us' }]} />

      <div className="pt-4 pb-8 border-b border-sand-200">
        <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
          Client Care
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-charcoal-900 tracking-tight">
          Concierge & Support
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-charcoal-600 max-w-2xl font-light">
          Have an inquiry regarding object dimensions, order status, private trade orders, or bespoke hospitality gifting? Our Portland studio concierge is at your service.
        </p>
      </div>

      <div className="py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Contact Form */}
        <div className="lg:col-span-7 bg-[#FAF8F5] border border-sand-300 p-8 sm:p-10 shadow-sm">
          {isSent ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-moss-100 text-moss-900 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
                Message Dispatched
              </h3>
              <p className="text-xs text-charcoal-600 font-light max-w-sm mx-auto leading-relaxed">
                Thank you for reaching out, {name}. A member of our concierge team will review your inquiry and follow up at <strong>{email}</strong> shortly.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSent(false);
                  setMessage('');
                }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Camille Dubois"
                    className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="camille@example.com"
                    className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                  Inquiry Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                >
                  <option value="orders">Order Status & Tracking</option>
                  <option value="sizing">Product Sizing & Materials</option>
                  <option value="returns">Returns & Exchanges</option>
                  <option value="trade">Trade, Architecture & Hospitality</option>
                  <option value="press">Press & Editorial Inquiries</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe how we can assist you..."
                  className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                />
              </div>

              <Button
                type="submit"
                variant="dark"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Send Message
              </Button>
            </form>
          )}
        </div>

        {/* Right Column: Direct Channels & Studio Hours */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 bg-sand-100/70 border border-sand-300 space-y-6">
            <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
              Direct Contact
            </h3>

            <div className="space-y-4 text-xs text-charcoal-700 font-light">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-moss-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-charcoal-900 block">Email Concierge</span>
                  <a href="mailto:concierge@mosslifestyle.com" className="hover:underline">
                    concierge@mosslifestyle.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-moss-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-charcoal-900 block">Telephone</span>
                  <span>+1 (800) 555-MOSS (6677)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-moss-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-charcoal-900 block">Support Hours</span>
                  <span>Monday – Friday: 8:00 AM – 6:00 PM PST</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-sand-200">
                <MapPin className="w-4 h-4 text-moss-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-charcoal-900 block">Flagship Showroom</span>
                  <span>450 NW 10th Ave, Pearl District, Portland, OR 97209</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
