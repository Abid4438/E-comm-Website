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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast({ title: 'Missing Info', message: 'Please fill out all required fields.', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), topic, message: message.trim() }),
      });
      const result = await response.json().catch(() => ({ error: 'The message could not be sent. Please try again.' }));
      if (!response.ok || result.success !== true) {
        throw new Error(result.error || 'The message could not be sent. Please try again.');
      }

      setIsSent(true);
      showToast({
        title: 'Message Sent',
        message: 'Your message has been emailed to MOSS support.',
        type: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Message Not Sent',
        message: error instanceof Error ? error.message : 'Please try again shortly.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
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
          Use this form to send your message directly to <strong>Abidaliaslam282@gmail.com</strong>. We'll reply to the email address you provide.
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
                Message Sent
              </h3>
              <p className="text-xs text-charcoal-600 font-light max-w-sm mx-auto leading-relaxed">
                Thank you for reaching out, {name}. Your message has been sent to our support inbox. We'll reply to <strong>{email}</strong>.
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
                  <a href="mailto:Abidaliaslam282@gmail.com" className="hover:underline">
                   Abidaliaslam282@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-moss-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-charcoal-900 block">Telephone</span>
                  <span>+923041454342</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-moss-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-charcoal-900 block">Support Hours</span>
                  <span>Monday – Sunday: 10:00 AM – 6:00 PM</span>
                  <span>Private appointments available.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-sand-200">
                <MapPin className="w-4 h-4 text-moss-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-charcoal-900 block">Flagship Showroom</span>
                  <span>Lahore, Pakistan</span>
                  <span>Replace with your studio address.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
