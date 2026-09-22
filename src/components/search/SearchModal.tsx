import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { productService } from '../../services/apiClient';
import { Product } from '../../types/product';
import { formatPrice } from '../../utils/formatters';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = ['Linen', 'Ceramic', 'Tote', 'Hinoki', 'Cardigan', 'Watch', 'Olive Soap'];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const hits = await productService.searchProducts(query);
        setResults(hits);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handlePopularClick = (term: string) => {
    setQuery(term);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Search Header Container */}
      <div className="relative min-h-screen flex flex-col justify-start items-center pt-8 sm:pt-16 px-4">
        <div className="relative w-full max-w-3xl bg-[#FAF8F5] border border-sand-300 shadow-2xl overflow-hidden animate-slide-down">
          {/* Top search bar */}
          <form onSubmit={handleSubmit} className="relative flex items-center border-b border-sand-200 px-6 py-4">
            <Search className="w-5 h-5 text-charcoal-400 mr-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for essentials, linens, ceramics, apparel..."
              className="w-full bg-transparent text-base sm:text-lg font-serif text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none tracking-wide"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-charcoal-400 hover:text-charcoal-900 mr-2"
                aria-label="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-xs uppercase tracking-widest text-charcoal-500 hover:text-charcoal-900 font-medium ml-2 px-2 py-1"
            >
              ESC
            </button>
          </form>

          {/* Search Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Quick popular tags */}
            {!query && (
              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-charcoal-400 font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-moss-800" />
                  <span>Popular Inquiries</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => handlePopularClick(term)}
                      className="px-3 py-1.5 text-xs bg-sand-200/60 hover:bg-sand-300 text-charcoal-800 transition-colors border border-sand-300/80"
                    >
                      {term}
                    </button>
                  ))}
                </div>

                {/* Categories Shortcut */}
                <div className="mt-8 pt-6 border-t border-sand-200">
                  <div className="text-[11px] uppercase tracking-widest text-charcoal-400 font-semibold mb-3">
                    Explore By Category
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { name: 'Home Objects', slug: 'home' },
                      { name: 'Apparel', slug: 'apparel' },
                      { name: 'Accessories', slug: 'accessories' },
                      { name: 'Everyday Essentials', slug: 'essentials' },
                    ].map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/category/${cat.slug}`}
                        onClick={onClose}
                        className="p-3 bg-sand-100 border border-sand-200 hover:border-moss-900 transition-colors text-center"
                      >
                        <span className="font-serif text-sm text-charcoal-900">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {query && (
              <div>
                {isLoading ? (
                  <div className="py-12 text-center text-xs uppercase tracking-widest text-charcoal-500">
                    Searching MOSS catalog...
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-charcoal-500 border-b border-sand-200 pb-2">
                      <span>Found {results.length} results for "{query}"</span>
                      <button
                        onClick={handleSubmit}
                        className="text-moss-900 font-medium hover:underline flex items-center gap-1"
                      >
                        <span>View all in shop</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {results.slice(0, 6).map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-2.5 bg-sand-100/60 hover:bg-sand-200/70 border border-sand-200 transition-all group"
                        >
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-14 h-16 object-cover bg-sand-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] uppercase tracking-wider text-charcoal-400 font-medium">
                              {product.category}
                            </span>
                            <h4 className="font-serif text-sm text-charcoal-900 truncate group-hover:text-moss-900 transition-colors font-medium">
                              {product.name}
                            </h4>
                            <span className="text-xs font-sans text-charcoal-700 font-medium">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="font-serif text-xl text-charcoal-900 mb-1">No matches found</p>
                    <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
                      We couldn't find any products matching "{query}". Try checking for spelling or searching for general categories like "linen" or "ceramics".
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
