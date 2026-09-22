import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { SEOHead } from '../components/ui/SEOHead';
import { productService } from '../services/apiClient';
import { Product } from '../types/product';
import { Search } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setInputValue(query);
    const executeSearch = async () => {
      if (!query.trim()) {
        setProducts([]);
        return;
      }
      setIsLoading(true);
      try {
        const hits = await productService.searchProducts(query);
        setProducts(hits);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    executeSearch();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEOHead
        title={query ? `Search: "${query}" | MOSS` : 'Search Essentials | MOSS'}
        description={`Search results for ${query} at MOSS Lifestyle.`}
      />

      <Breadcrumbs items={[{ label: 'Search', href: '/search' }, { label: query || 'Inquiry' }]} />

      <div className="pt-4 pb-8 border-b border-sand-200">
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-charcoal-900 tracking-tight">
          Search Results
        </h1>

        {/* Big Search Input */}
        <form onSubmit={handleSearchSubmit} className="mt-6 max-w-xl flex items-center border border-sand-300 bg-sand-100 p-2">
          <Search className="w-5 h-5 text-charcoal-400 ml-2 mr-3" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search ceramics, linens, apparel, fragrances..."
            className="flex-1 bg-transparent text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-charcoal-900 text-sand-50 text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors"
          >
            Search
          </button>
        </form>

        {query && (
          <p className="mt-4 text-xs text-charcoal-500">
            Showing {products.length} results for <strong className="text-charcoal-900">"{query}"</strong>
          </p>
        )}
      </div>

      {/* Results grid */}
      <div className="py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} showCategory />
            ))}
          </div>
        ) : query ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <h3 className="font-serif text-2xl text-charcoal-900 mb-2">No Matching Objects</h3>
            <p className="text-xs sm:text-sm text-charcoal-500 font-light mb-6">
              We couldn't find any objects matching "{query}". Try checking your spelling or searching for broad terms like "linen" or "tote".
            </p>
          </div>
        ) : (
          <div className="py-20 text-center max-w-md mx-auto">
            <h3 className="font-serif text-2xl text-charcoal-900 mb-2">Search MOSS Catalog</h3>
            <p className="text-xs text-charcoal-500 font-light">
              Enter a search keyword above to explore handcrafted items, apparel, and lifestyle essentials.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
