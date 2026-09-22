import React from 'react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SEOHead } from '../../components/ui/SEOHead';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEOHead title="Privacy Policy | MOSS" description="Privacy policy and data governance." />

      <Breadcrumbs items={[{ label: 'Legal', href: '/privacy' }, { label: 'Privacy Policy' }]} />

      <div className="pt-4 pb-8 border-b border-sand-200">
        <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
          Legal & Compliance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-charcoal-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs text-charcoal-500 font-light">
          Last revised: September 2026
        </p>
      </div>

      <div className="py-10 space-y-8 text-xs sm:text-sm text-charcoal-700 leading-relaxed font-light">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal-900 font-normal">
            1. Commitment to Your Privacy
          </h2>
          <p>
            MOSS Lifestyle Inc. ("MOSS", "we", "us", or "our") respects your personal integrity. We collect only the minimal necessary personal information required to fulfill your orders, provide dedicated customer support, and communicate relevant updates regarding new releases.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal-900 font-normal">
            2. Information We Collect
          </h2>
          <p>
            When you purchase from our storefront or register for a member account, we collect:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Contact details such as name, email address, phone number, and physical shipping address.</li>
            <li>Transaction history, order records, and wishlist selections.</li>
            <li>Technical device logs and browser cookies used exclusively to persist your shopping bag.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal-900 font-normal">
            3. Payment Data Security
          </h2>
          <p>
            We never store raw credit card numbers or security CVV codes on our servers. All payment transactions are encrypted and processed directly via Tier-1 PCI-DSS certified tokenized payment gateways.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal-900 font-normal">
            4. Your Rights Under GDPR / CCPA
          </h2>
          <p>
            You have the right to request a complete copy of all data associated with your account, or to request the permanent deletion of your customer records at any time by contacting privacy@mosslifestyle.com.
          </p>
        </section>
      </div>
    </div>
  );
};
