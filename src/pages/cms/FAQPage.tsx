import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Accordion, AccordionItem } from '../../components/ui/Accordion';
import { SEOHead } from '../../components/ui/SEOHead';
import { Button } from '../../components/ui/Button';

export const FAQPage: React.FC = () => {
  const faqItems: AccordionItem[] = [
    {
      id: 'shipping-times',
      title: 'What are your standard shipping times and costs?',
      defaultOpen: true,
      content: (
        <p>
          We offer complimentary carbon-neutral standard shipping on all US domestic orders over $100. For orders under $100, standard shipping is a flat $12. Standard deliveries typically arrive within 3 to 5 business days. Express shipping (1-2 business days) is available at checkout for $25.
        </p>
      ),
    },
    {
      id: 'returns-policy',
      title: 'How does your 30-day trial and return policy work?',
      content: (
        <p>
          We want you to live with our objects in your own home. You may return any unused item in its original condition and packaging within 30 days of receipt for a full refund or exchange. For organic bedding, we provide a 60-day sleep guarantee—even if washed.
        </p>
      ),
    },
    {
      id: 'materials-origin',
      title: 'Where are MOSS products sourced and manufactured?',
      content: (
        <p>
          Our ceramics are hand-thrown in Hasami (Nagasaki Prefecture, Japan). Our linen is woven from European flax cultivated in Northern France and crafted in Portugal. Our leather accessories are handcrafted in Tuscany using certified vegetable tanning methods that eliminate toxic chromium.
        </p>
      ),
    },
    {
      id: 'leather-care',
      title: 'How do I care for vegetable-tanned leather?',
      content: (
        <p>
          Vegetable-tanned leather is living material that naturally absorbs sunlight and oils from your hands, developing an organic golden patina over time. We recommend treating the leather once every six months with natural organic beeswax or lanolin-based leather balm.
        </p>
      ),
    },
    {
      id: 'linen-wash',
      title: 'What are the washing guidelines for French linen apparel?',
      content: (
        <p>
          Machine wash in cool or lukewarm water (max 30°C / 85°F) on a gentle cycle with mild liquid detergent. Tumble dry on low heat or line dry in the shade. Embracing natural relaxed creases is part of the MOSS aesthetic; light steam ironing while damp is optional.
        </p>
      ),
    },
    {
      id: 'trade-program',
      title: 'Do you offer a trade program for interior designers and architects?',
      content: (
        <p>
          Yes. We partner with interior designers, architects, boutique hotels, and restaurant curators worldwide. Please contact us via concierge@mosslifestyle.com with your portfolio or credentials for custom tiered trade pricing and dedicated samples.
        </p>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEOHead title="Frequently Asked Questions | MOSS" description="Answers regarding orders, materials, shipping, and care." />

      <Breadcrumbs items={[{ label: 'Client Care', href: '/faq' }, { label: 'FAQ' }]} />

      <div className="pt-4 pb-8 border-b border-sand-200">
        <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
          Help Center
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-charcoal-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-charcoal-600 max-w-xl font-light">
          Find answers to common questions about ordering, sustainable materials, international shipping, and object maintenance.
        </p>
      </div>

      <div className="py-10">
        <Accordion items={faqItems} allowMultiple />
      </div>

      {/* Still need help CTA */}
      <div className="mt-12 p-8 bg-sand-100/70 border border-sand-300 text-center space-y-3">
        <h3 className="font-serif text-2xl text-charcoal-900 font-normal">
          Have a unique question?
        </h3>
        <p className="text-xs text-charcoal-600 max-w-sm mx-auto font-light">
          Our studio concierge is available Monday through Friday to assist with custom styling or order inquiries.
        </p>
        <div className="pt-2">
          <Link to="/contact">
            <Button variant="dark" size="sm">
              Contact Concierge
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
