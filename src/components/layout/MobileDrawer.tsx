import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Drawer } from '../ui/Drawer';
import { INITIAL_CATEGORIES } from '../../data/categoriesData';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { Heart, User, ShieldAlert, Phone, HelpCircle, Package, ArrowRight } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} position="left" width="md" title="MOSS">
      <div className="flex flex-col space-y-8 pb-10">
        {/* Main Navigation Links */}
        <div className="flex flex-col space-y-4">
          <span className="text-[10px] uppercase tracking-widest text-charcoal-400 font-semibold">
            Explore
          </span>
          <NavLink
            to="/shop"
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `text-xl font-serif tracking-tight transition-colors py-1 ${
                isActive ? 'text-moss-900 font-semibold pl-2 border-l-2 border-moss-900' : 'text-charcoal-800 hover:text-moss-800'
              }`
            }
          >
            All Products
          </NavLink>
          <NavLink
            to="/shop?sort=newest"
            onClick={handleLinkClick}
            className="text-xl font-serif text-charcoal-800 hover:text-moss-800 tracking-tight transition-colors py-1"
          >
            New Arrivals
          </NavLink>
          <NavLink
            to="/about"
            onClick={handleLinkClick}
            className="text-xl font-serif text-charcoal-800 hover:text-moss-800 tracking-tight transition-colors py-1"
          >
            Our Story & Manifesto
          </NavLink>
        </div>

        {/* Categories Section */}
        <div className="flex flex-col space-y-3 pt-4 border-t border-sand-200">
          <span className="text-[10px] uppercase tracking-widest text-charcoal-400 font-semibold">
            Collections
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {INITIAL_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                onClick={handleLinkClick}
                className="group relative overflow-hidden bg-sand-200/50 p-3 border border-sand-300/60 hover:border-moss-800 transition-all"
              >
                <div className="font-serif text-base text-charcoal-900 font-medium group-hover:text-moss-900">
                  {cat.name}
                </div>
                <div className="text-[10px] text-charcoal-500 mt-0.5">
                  {cat.itemCount} essentials
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* User Account & Wishlist */}
        <div className="flex flex-col space-y-3 pt-4 border-t border-sand-200">
          <span className="text-[10px] uppercase tracking-widest text-charcoal-400 font-semibold">
            My MOSS
          </span>

          <Link
            to="/wishlist"
            onClick={handleLinkClick}
            className="flex items-center justify-between py-2 text-sm text-charcoal-800 hover:text-moss-900 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Heart className="w-4 h-4 text-charcoal-500" />
              <span>Wishlist</span>
            </div>
            {wishlistItems.length > 0 && (
              <span className="text-xs bg-sand-200 text-charcoal-800 px-2 py-0.5 font-medium">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <Link
              to="/account"
              onClick={handleLinkClick}
              className="flex items-center justify-between py-2 text-sm text-charcoal-800 hover:text-moss-900 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-charcoal-500" />
                <span>Account ({user?.firstName})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-charcoal-400" />
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 py-2 text-sm text-charcoal-800 hover:text-moss-900 transition-colors"
            >
              <User className="w-4 h-4 text-charcoal-500" />
              <span>Sign In / Register</span>
            </Link>
          )}

          <Link
            to="/admin"
            onClick={handleLinkClick}
            className="flex items-center space-x-3 py-2 text-sm text-moss-900 font-medium hover:text-moss-800 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-moss-800" />
            <span>Store Admin Console</span>
          </Link>
        </div>

        {/* Customer Care */}
        <div className="flex flex-col space-y-2.5 pt-4 border-t border-sand-200 text-xs text-charcoal-600">
          <Link
            to="/shipping-returns"
            onClick={handleLinkClick}
            className="flex items-center space-x-2.5 py-1 hover:text-charcoal-900"
          >
            <Package className="w-3.5 h-3.5 text-charcoal-400" />
            <span>Shipping & Global Returns</span>
          </Link>
          <Link
            to="/faq"
            onClick={handleLinkClick}
            className="flex items-center space-x-2.5 py-1 hover:text-charcoal-900"
          >
            <HelpCircle className="w-3.5 h-3.5 text-charcoal-400" />
            <span>Frequently Asked Questions</span>
          </Link>
          <Link
            to="/contact"
            onClick={handleLinkClick}
            className="flex items-center space-x-2.5 py-1 hover:text-charcoal-900"
          >
            <Phone className="w-3.5 h-3.5 text-charcoal-400" />
            <span>Concierge & Support</span>
          </Link>
        </div>
      </div>
    </Drawer>
  );
};
