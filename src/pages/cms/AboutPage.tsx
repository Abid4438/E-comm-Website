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
        title="Our Story & The MOSS Approach | MOSS"
        description="Learn about the philosophy, craftsmanship, and materials behind MOSS lifestyle essentials."
      />

      {/* Hero Header */}
      <section className="relative h-[65vh] min-h-[420px] bg-sand-900 text-white flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85"
          alt="MOSS Atelier Interior"
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.75]"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-4">
          <span className="text-[11px] uppercase tracking-[0.25em] text-sand-300 font-semibold">
            Brand Manifesto
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight uppercase leading-tight">
            THE MOSS APPROACH
          </h1>
          <p className="text-sm sm:text-base text-sand-100 font-light max-w-xl mx-auto leading-relaxed">
            Simple things, thoughtfully made. We create objects with enduring restraint, meant to be lived with and cherished for a lifetime.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs items={[{ label: 'About', href: '/about' }, { label: 'Our Philosophy' }]} />

        {/* Section 1: Philosophy */}
        <div className="py-16 max-w-4xl mx-auto space-y-8 text-center sm:text-left">
          <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block">
            Philosophy
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-charcoal-900 font-normal tracking-tight leading-tight">
            We believe everyday objects should quiet the mind rather than compete for attention.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 text-xs sm:text-sm text-charcoal-700 leading-relaxed font-light">
            <p>
              In an era dominated by hyper-speed disposable trends, MOSS was conceived as an intentional retreat. We examine the fundamental physical objects that touch our daily routines—the morning linen shirt, the ceramic vessel holding warm water, the leather carry holding notebooks and pens.
            </p>
            <p>
              By eliminating unnecessary ornament and focusing entirely on tactile raw textures, ergonomic weight, and honest production methods, our objects settle into your living spaces with quiet dignity.
            </p>
          </div>
        </div>

        {/* Section 2: Craftsmanship Origins */}
        <div id="materials" className="py-16 border-t border-sand-200">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
              Global Workshops
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal">
              Direct From Master Ateliers
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2 font-light">
              We travel globally to partner directly with generational craft communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#FAF8F5] border border-sand-300 space-y-4">
              <Compass className="w-6 h-6 text-moss-800" />
              <h4 className="font-serif text-2xl text-charcoal-900 font-normal">
                Hasami Stoneware
              </h4>
              <p className="text-xs text-moss-900 uppercase tracking-wider font-semibold">
                Nagasaki, Japan
              </p>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-light">
                Utilizing 400-year-old Japanese ceramic techniques, our ceramics blend raw sandstone and unglazed clay to produce tactile, stackable monolithic forms.
              </p>
            </div>

            <div className="p-8 bg-[#FAF8F5] border border-sand-300 space-y-4">
              <Feather className="w-6 h-6 text-moss-800" />
              <h4 className="font-serif text-2xl text-charcoal-900 font-normal">
                Normandy Flax Linen
              </h4>
              <p className="text-xs text-moss-900 uppercase tracking-wider font-semibold">
                Northern France & Portugal
              </p>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-light">
                Grown with zero artificial irrigation, our long-staple European flax is stonewashed in fresh mountain water for supreme lived-in softness from day one.
              </p>
            </div>

            <div className="p-8 bg-[#FAF8F5] border border-sand-300 space-y-4">
              <ShieldCheck className="w-6 h-6 text-moss-800" />
              <h4 className="font-serif text-2xl text-charcoal-900 font-normal">
                Vegetable-Tanned Leather
              </h4>
              <p className="text-xs text-moss-900 uppercase tracking-wider font-semibold">
                Tuscany, Italy
              </p>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-light">
                Tanned using natural plant tannins (chestnut, mimosa, and quebracho) without toxic chromium. Each piece reacts to daily touch and develops a golden patina.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Flagship Showroom */}
        <div id="flagship" className="py-16 border-t border-sand-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block">
                Sanctuary & Studio
              </span>
              <h3 className="font-serif text-3xl sm:text-5xl text-charcoal-900 font-normal tracking-tight">
                The Flagship Showroom
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed font-light">
                Designed as a tranquil gallery of natural light, lime-washed walls, and tactile stone pedestals. Visit us to experience materials in person and enjoy custom fragrance blending.
              </p>

              <div className="p-4 bg-sand-100 border border-sand-300 space-y-2 text-xs text-charcoal-800">
                <div className="flex items-center gap-2 font-semibold">
                  <MapPin className="w-4 h-4 text-moss-800" />
                  <span>450 NW 10th Ave, Pearl District, Portland, OR 97209</span>
                </div>
                <p className="text-charcoal-500">
                  Open Tuesday – Sunday: 10:00 AM – 6:00 PM · Private appointments available.
                </p>
              </div>

              <div className="pt-2">
                <Link to="/contact">
                  <Button variant="dark" size="md">
                    Book Private Consultation
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 aspect-[4/3] bg-sand-200 border border-sand-300 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                alt="MOSS Portland Flagship Studio"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
