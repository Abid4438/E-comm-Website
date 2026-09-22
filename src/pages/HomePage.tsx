import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Sparkles, Shield, RefreshCw, Feather } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/product/ProductCard';
import { SEOHead } from '../components/ui/SEOHead';
import { productService, reviewService } from '../services/apiClient';
import { Product } from '../types/product';
import { INITIAL_CATEGORIES } from '../data/categoriesData';
import { Review } from '../types/review';
import { Rating } from '../components/ui/Rating';
import { useToastStore } from '../store/useToastStore';

export const HomePage: React.FC = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterJoined, setNewsletterJoined] = useState(false);
  const { showToast } = useToastStore();

  useEffect(() => {
    const loadHomeData = async () => {
      const [arrivals, best, revs] = await Promise.all([
        productService.getNewArrivals(4),
        productService.getBestSellers(4),
        reviewService.getAllReviews(),
      ]);
      setNewArrivals(arrivals);
      setBestSellers(best);
      setReviews(revs.slice(0, 3));
    };

    loadHomeData();
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast({
        title: 'Valid Email Required',
        message: 'Please enter a valid email address to join.',
        type: 'error',
      });
      return;
    }
    setNewsletterJoined(true);
    showToast({
      title: 'Welcome to the MOSS Community',
      message: 'You have been added to our private editorial list.',
      type: 'success',
    });
    setNewsletterEmail('');
  };

  return (
    <div className="flex flex-col w-full">
      <SEOHead
        title="MOSS | Thoughtfully Designed Everyday Essentials"
        description="A premium modern lifestyle brand focused on thoughtfully designed everyday essentials. Live simply. Live MOSS."
      />

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center bg-sand-900 text-[#FAF8F5] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2200&q=85"
            alt="MOSS Editorial Living Space"
            className="w-full h-full object-cover object-center brightness-[0.78] scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF8F5]/15 backdrop-blur-md border border-white/20 text-xs uppercase tracking-[0.25em] text-sand-100 mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Autumn / Winter Collection</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight uppercase leading-[1.05] text-[#FAF8F5] max-w-3xl">
            LIVE SIMPLY. <br />
            <span className="italic font-light">LIVE MOSS.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-sand-200/90 font-light max-w-xl leading-relaxed">
            Thoughtfully designed essentials for everyday living. Tactile ceramics, breathable linens, and timeless objects crafted for quiet longevity.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link to="/shop" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-[#FAF8F5] text-charcoal-900 hover:bg-sand-200 border-none px-9 py-4 font-semibold"
              >
                SHOP COLLECTION
              </Button>
            </Link>
            <Link to="/about" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full text-[#FAF8F5] border-[#FAF8F5]/60 hover:bg-[#FAF8F5]/10 hover:border-[#FAF8F5] px-8 py-4"
              >
                EXPLORE MOSS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. VALUES / TRUST BAR */}
      <section className="border-b border-sand-200 bg-[#F5F2EB]/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Feather className="w-5 h-5 text-moss-800 mb-1.5" />
              <span className="text-[11px] uppercase tracking-widest font-semibold text-charcoal-900">
                100% Organic Fibers
              </span>
              <span className="text-[10px] text-charcoal-500">Sustainably sourced European linen</span>
            </div>

            <div className="flex flex-col items-center">
              <Shield className="w-5 h-5 text-moss-800 mb-1.5" />
              <span className="text-[11px] uppercase tracking-widest font-semibold text-charcoal-900">
                Master Craftsmanship
              </span>
              <span className="text-[10px] text-charcoal-500">Handcrafted in ethical ateliers</span>
            </div>

            <div className="flex flex-col items-center">
              <RefreshCw className="w-5 h-5 text-moss-800 mb-1.5" />
              <span className="text-[11px] uppercase tracking-widest font-semibold text-charcoal-900">
                30-Day Sleep & Trial
              </span>
              <span className="text-[10px] text-charcoal-500">Hassle-free global returns</span>
            </div>

            <div className="flex flex-col items-center">
              <Sparkles className="w-5 h-5 text-moss-800 mb-1.5" />
              <span className="text-[11px] uppercase tracking-widest font-semibold text-charcoal-900">
                Carbon Neutral
              </span>
              <span className="text-[10px] text-charcoal-500">100% offset packaging & transit</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CATEGORIES (Home, Apparel, Accessories, Everyday Essentials) */}
      <section className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
              Curated Collections
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-charcoal-900 tracking-tight">
              Designed For Mindful Living
            </h2>
          </div>
          <Link
            to="/shop"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-charcoal-900 hover:text-moss-800 font-semibold transition-colors group"
          >
            <span>Explore All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIAL_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-sand-200 border border-sand-300/80"
            >
              <img
                src={category.image}
                alt={category.name}
                loading="lazy"
                className="h-full w-full object-cover object-center brightness-[0.9] transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase tracking-widest text-sand-300 font-medium">
                  {category.itemCount} Curations
                </span>
                <h3 className="font-serif text-2xl font-normal tracking-tight text-white mt-1 group-hover:translate-x-1 transition-transform">
                  {category.name}
                </h3>
                <p className="text-xs text-sand-200/80 mt-1 line-clamp-1 font-light">
                  {category.tagline}
                </p>
                <div className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-sand-100 font-semibold">
                  <span>Shop Collection</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. NEW ARRIVALS */}
      <section className="py-20 bg-sand-100/60 border-y border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
                Fresh Releases
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/shop?sort=newest"
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-charcoal-900 hover:text-moss-800 font-semibold transition-colors group"
            >
              <span>View All New Releases</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. BRAND STORY (Two-Column Editorial Section) */}
      <section className="py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Big Editorial Imagery */}
          <div className="lg:col-span-6 relative">
            <div className="aspect-[4/5] bg-sand-200 border border-sand-300 overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80"
                alt="The MOSS Approach Craftsmanship"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="hidden sm:block absolute -bottom-8 -right-8 w-48 h-60 bg-[#FAF8F5] p-3 border border-sand-300 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=600&q=80"
                alt="Handcrafted Hasami Ceramic Detail"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Editorial Text */}
          <div className="lg:col-span-6 lg:pl-6 space-y-6">
            <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block">
              The MOSS Approach
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-charcoal-900 font-normal tracking-tight leading-[1.15]">
              Simple things, <br />
              <span className="italic font-light">thoughtfully made.</span>
            </h2>

            <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed font-light">
              We reject the cycle of seasonal disposable goods. At MOSS, every silhouette, ceramic glaze, and textile weave begins with a singular question: will this enrich your daily living ten years from now?
            </p>

            <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed font-light">
              By collaborating directly with master potters in Nagasaki, linen weavers in Normandy, and heritage leather tanners in Tuscany, we deliver uncompromising tactile luxury without artificial retail markups.
            </p>

            <div className="pt-4">
              <Link to="/about">
                <Button variant="primary" size="lg">
                  DISCOVER OUR STORY
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PROMOTIONAL EDITORIAL BANNER */}
      <section className="relative py-28 bg-[#1B2A1E] text-[#FAF8F5] overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=2000&q=80"
            alt="Minimalist Texture"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
          <span className="text-xs uppercase tracking-[0.3em] text-sand-300 font-semibold">
            Enduring Quality
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal uppercase tracking-tight leading-tight">
            EVERYDAY ESSENTIALS, <br />
            <span className="italic font-light">ELEVATED.</span>
          </h2>
          <p className="text-sm sm:text-base text-sand-200/80 max-w-xl mx-auto font-light leading-relaxed">
            From the morning pour of matcha to the evening glow of solid brass candlelight, celebrate the quiet beauty of intentional rituals.
          </p>
          <div className="pt-2">
            <Link to="/shop">
              <Button variant="outline" size="lg" className="border-[#FAF8F5] text-[#FAF8F5] hover:bg-[#FAF8F5] hover:text-charcoal-900">
                EXPLORE ALL OBJECTS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. BEST SELLERS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
              Customer Favorites
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/shop?sort=bestselling"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-charcoal-900 hover:text-moss-800 font-semibold transition-colors group"
          >
            <span>Browse All Best Sellers</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. LIFESTYLE IN CONTEXT SECTION */}
      <section className="py-20 bg-[#F5F2EB] border-y border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
              Living In Balance
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
              In The Natural Element
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2 font-light">
              MOSS essentials are designed to blend organically into warm architectural interiors and quiet morning spaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative group aspect-[3/4] overflow-hidden bg-sand-200 border border-sand-300">
              <img
                src="https://images.unsplash.com/photo-1608248597359-0010c2c1a84f?auto=format&fit=crop&w=1000&q=80"
                alt="Hinoki Morning Ritual"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] uppercase tracking-widest text-sand-300 font-semibold">
                  Sensory Rituals
                </span>
                <h4 className="font-serif text-xl font-normal mt-1">Hinoki Wood & Cedar</h4>
              </div>
            </div>

            <div className="relative group aspect-[3/4] overflow-hidden bg-sand-200 border border-sand-300">
              <img
                src="https://images.unsplash.com/photo-1629853925760-b0ff0739c9cb?auto=format&fit=crop&w=1000&q=80"
                alt="Tactile French Linen"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] uppercase tracking-widest text-sand-300 font-semibold">
                  Tactile Living
                </span>
                <h4 className="font-serif text-xl font-normal mt-1">Stonewashed Bedding</h4>
              </div>
            </div>

            <div className="relative group aspect-[3/4] overflow-hidden bg-sand-200 border border-sand-300">
              <img
                src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80"
                alt="Vegetable Tanned Leather Patina"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] uppercase tracking-widest text-sand-300 font-semibold">
                  Everyday Carry
                </span>
                <h4 className="font-serif text-xl font-normal mt-1">Vegetable-Tanned Patina</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CUSTOMER REVIEWS & TESTIMONIALS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
            Community Voices
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
            Loved By Thoughtful Individuals
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between p-8 bg-[#FAF8F5] border border-sand-300 shadow-sm"
            >
              <div>
                <Rating value={rev.rating} size="sm" />
                <h4 className="font-serif text-lg text-charcoal-900 font-semibold mt-4 mb-2">
                  "{rev.title}"
                </h4>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-light">
                  {rev.comment}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-sand-200 flex items-center justify-between text-xs text-charcoal-500">
                <div>
                  <span className="font-medium text-charcoal-900 block">{rev.author}</span>
                  <span className="text-[10px] text-charcoal-400">{rev.location}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-moss-800 font-semibold bg-moss-50 px-2 py-0.5 border border-moss-200">
                  Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. NEWSLETTER SECTION */}
      <section className="py-20 bg-sand-200/50 border-t border-sand-200">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-4">
          <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold">
            STAY IN THE LOOP
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal">
            Join The MOSS Community
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto font-light leading-relaxed">
            Join the Moss community for new collections, design essays, inspiration, and complimentary private sale invitations.
          </p>

          <div className="pt-4 max-w-md mx-auto">
            {newsletterJoined ? (
              <div className="p-4 bg-moss-900 text-sand-50 text-xs tracking-wider uppercase font-medium">
                Thank you for subscribing to MOSS.
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 bg-white border border-sand-300 px-4 py-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                />
                <Button variant="dark" size="md" type="submit">
                  JOIN
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 11. SOCIAL / GALLERY (FOLLOW THE MOSS JOURNEY) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
            @MOSSLIFESTYLE
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-charcoal-900">
            FOLLOW THE MOSS JOURNEY
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1608248597359-0010c2c1a84f?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
          ].map((imgUrl, idx) => (
            <div
              key={idx}
              className="group relative aspect-square overflow-hidden bg-sand-200 border border-sand-300 cursor-pointer"
            >
              <img
                src={imgUrl}
                alt="MOSS Lifestyle Instagram Feed"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <span className="text-white text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  View Post
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
