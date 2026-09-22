import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { SEOHead } from '../components/ui/SEOHead';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-6 py-28 text-center space-y-6">
      <SEOHead title="Page Not Found | MOSS" />
      <span className="text-xs uppercase tracking-[0.3em] text-moss-800 font-semibold">
        404 — Page Not Located
      </span>
      <h1 className="font-serif text-4xl sm:text-6xl font-normal text-charcoal-900 tracking-tight">
        A Quiet Absence
      </h1>
      <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed max-w-md mx-auto">
        The page or object you are seeking may have moved or is temporarily unavailable. Let us guide you back to our curated collections.
      </p>
      <div className="pt-4 flex justify-center gap-4">
        <Link to="/">
          <Button variant="outline" size="md" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Home
          </Button>
        </Link>
        <Link to="/shop">
          <Button variant="dark" size="md">
            Explore Shop
          </Button>
        </Link>
      </div>
    </div>
  );
};
