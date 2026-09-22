import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside aria-label="Announcement" className="bg-[#1B2A1E] text-[#FAF8F5] text-[11px] uppercase tracking-[0.2em] font-medium py-2 px-4 transition-all border-b border-[#253828]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center space-x-3 text-sand-300/80 text-[10px]">
          <span>COMPLIMENTARY GIFT WITH $150+</span>
        </div>

        <div className="flex-1 text-center flex items-center justify-center space-x-2">
          <Sparkles className="w-3 h-3 text-[#C4924A] animate-pulse" />
          <span>
            FREE SHIPPING ON ORDERS OVER $100 · USE CODE{' '}
            <span className="text-[#C4924A] font-semibold underline underline-offset-2">
              WELCOME10
            </span>{' '}
            FOR 10% OFF
          </span>
          <Link
            to="/shop"
            className="hidden sm:inline-block ml-2 text-sand-300 hover:text-white underline underline-offset-4 text-[10px]"
          >
            SHOP NOW
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/admin"
            className="hidden md:inline-flex items-center text-[10px] text-[#C4924A] hover:text-white transition-colors"
          >
            ADMIN DEMO
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="text-sand-400 hover:text-white transition-colors p-0.5"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
