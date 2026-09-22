import React from 'react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SEOHead } from '../../components/ui/SEOHead';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEOHead title="Terms & Conditions | MOSS" description="Terms and conditions of sale and site usage." />

      <Breadcrumbs items={[{ label: 'Legal', href: '/terms' }, { label: 'Terms & Conditions' }]} />

      <div className="pt-4 pb-8 border-b border-sand-200">
        <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
          Legal & Compliance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-charcoal-900 tracking-tight">
          Terms & Conditions
        </h1>
        <p className="mt-2 text-xs text-charcoal-500 font-light">
          Last revised: September 2026
        </p>
      </div>

      <div className="py-10 space-y-8 text-xs sm:text-sm text-charcoal-700 leading-relaxed font-light">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal-900 font-normal">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or purchasing from MOSS, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal-900 font-normal">
            2. Product Natural Variations
          </h2>
          <p>
            Because our ceramics are hand-thrown from raw unglazed stoneware, and our leathers are vegetable-tanned, subtle variations in texture, tone, grain, and weight are intentional hallmarks of artisanal production, not manufacturing defects.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal-900 font-normal">
            3. Pricing and Availability
          </h2>
          <p>
            All prices are quoted in US Dollars (USD). We reserve the right to correct typographical errors or discontinue items with limited studio release runs without prior notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal-900 font-normal">
            4. Governing Law
          </h2>
          <p>
            These terms are governed by the laws of the State of Oregon, United States, without regard to its conflict of law principles.
          </p>
        </section>
      </div>
    </div>
  );
};
