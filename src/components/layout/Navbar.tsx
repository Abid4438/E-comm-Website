import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, ChevronDown, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuthStore } from '../../store/useAuthStore';
import { INITIAL_CATEGORIES } from '../../data/categoriesData';
import { MobileDrawer } from './MobileDrawer';
import { SearchModal } from '../search/SearchModal';
import { cn } from '../../utils/cn';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCollectionsHovered, setIsCollectionsHovered] = useState(false);

  const { openCart, getItemCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  const cartCount = getItemCount();
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close hover menu on route change
  useEffect(() => {
    setIsCollectionsHovered(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-xs uppercase tracking-[0.18em] font-medium transition-colors hover:text-moss-900 py-1 relative',
      isActive ? 'text-moss-900 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-moss-900' : 'text-charcoal-700'
    );

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300',
          isScrolled
            ? 'bg-[#FAF8F5]/95 backdrop-blur-md border-b border-sand-200/80 shadow-[0_2px_15px_rgba(0,0,0,0.02)] py-3'
            : 'bg-[#FAF8F5] border-b border-sand-200/50 py-4'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Left: Hamburger */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-charcoal-800 hover:text-moss-900 transition-colors focus:outline-none"
                aria-label="Open mobile menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop Left: Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="group flex items-center space-x-2 text-left"
                aria-label="MOSS Home"
              >
                <span className="font-serif text-2xl sm:text-3xl font-medium tracking-[0.15em] text-moss-950 uppercase transition-colors group-hover:text-moss-800">
                  MOSS
                </span>
                <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-gold-500 mb-1" />
              </Link>
            </div>

            {/* Desktop Center: Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
              <NavLink to="/shop" className={navLinkClass}>
                Shop
              </NavLink>

              <NavLink to="/shop?sort=newest" className={navLinkClass}>
                New Arrivals
              </NavLink>

              {/* Collections Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setIsCollectionsHovered(true)}
                onMouseLeave={() => setIsCollectionsHovered(false)}
              >
                <button
                  type="button"
                  className={cn(
                    'flex items-center text-xs uppercase tracking-[0.18em] font-medium transition-colors hover:text-moss-900 py-1 text-charcoal-700 gap-1'
                  )}
                >
                  <span>Collections</span>
                  <ChevronDown className="w-3 h-3 text-charcoal-400 group-hover:text-moss-900 transition-transform group-hover:rotate-180" />
                </button>

                {/* Dropdown Menu */}
                {isCollectionsHovered && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[460px] animate-slide-up z-50">
                    <div className="bg-[#FAF8F5] border border-sand-300 shadow-xl p-5 grid grid-cols-2 gap-4">
                      {INITIAL_CATEGORIES.map((category) => (
                        <Link
                          key={category.id}
                          to={`/category/${category.slug}`}
                          className="flex items-center space-x-3 p-2 hover:bg-sand-200/50 transition-colors border border-transparent hover:border-sand-300"
                        >
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-12 h-14 object-cover shrink-0 bg-sand-200"
                          />
                          <div>
                            <h4 className="font-serif text-sm font-semibold text-charcoal-900">
                              {category.name}
                            </h4>
                            <p className="text-[10px] text-charcoal-500 line-clamp-1 mt-0.5">
                              {category.tagline}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <NavLink to="/about" className={navLinkClass}>
                About
              </NavLink>
            </nav>

            {/* Right: Actions (Search, Wishlist, Account, Cart) */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search trigger */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-charcoal-700 hover:text-moss-900 transition-colors"
                aria-label="Search products"
              >
                <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-2 text-charcoal-700 hover:text-moss-900 transition-colors relative"
                aria-label="View wishlist"
              >
                <Heart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-clay-600 px-1 text-[9px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                className="hidden sm:inline-flex p-2 text-charcoal-700 hover:text-moss-900 transition-colors"
                aria-label={isAuthenticated ? `Account: ${user?.firstName}` : 'Sign in'}
                title={isAuthenticated ? user?.email : 'Sign in'}
              >
                <User className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </Link>

              {/* Admin Panel Button (visible only to admins) */}
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-moss-900 text-sand-50 text-[10px] uppercase tracking-wider font-semibold hover:bg-moss-800 transition-colors border border-gold-500/40"
                  aria-label="Open Admin Dashboard"
                  title="Admin Dashboard"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="p-2 text-charcoal-700 hover:text-moss-900 transition-colors relative"
                aria-label={`Shopping bag with ${cartCount} items`}
              >
                <ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-moss-900 px-1 text-[9px] font-bold text-sand-50 animate-fade-in">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
