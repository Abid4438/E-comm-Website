import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { SEOHead } from '../components/ui/SEOHead';
import { productService } from '../services/apiClient';
import { Product, CategoryType, ProductFilterOptions } from '../types/product';
import { SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';
import { Drawer } from '../components/ui/Drawer';
import { Button } from '../components/ui/Button';

const CATEGORIES: { label: string; value: CategoryType | 'all' }[] = [
  { label: 'All Collections', value: 'all' },
  { label: 'Home & Living', value: 'home' },
  { label: 'Linen Apparel', value: 'apparel' },
  { label: 'Leather & Accessories', value: 'accessories' },
  { label: 'Everyday Essentials', value: 'essentials' },
];

const PRICE_RANGES = [
  { label: 'All Prices', min: undefined, max: undefined },
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 to $100', min: 50, max: 100 },
  { label: '$100 to $200', min: 100, max: 200 },
  { label: '$200 and Above', min: 200, max: undefined },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Standard', 'Queen', 'King', 'One Size'];

const COLORS = [
  { name: 'Sand', hex: '#D2C8BC' },
  { name: 'Oatmeal', hex: '#E3D8CC' },
  { name: 'Moss', hex: '#3B4D3C' },
  { name: 'Charcoal', hex: '#2C2D2F' },
  { name: 'Vintage Black', hex: '#1C1C1E' },
  { name: 'Navy', hex: '#1B243B' },
  { name: 'Cognac', hex: '#874B2A' },
  { name: 'Olive', hex: '#5A6046' },
  { name: 'Brass', hex: '#C7A353' },
];

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // URL / State filter parameters
  const activeCategory: CategoryType | 'all' = (searchParams.get('category') as CategoryType | 'all') || 'all';
  const activeSort = (searchParams.get('sort') as ProductFilterOptions['sortBy']) || 'featured';
  const activeSize = searchParams.get('size') || undefined;
  const activeColor = searchParams.get('color') || undefined;
  const activeAvailability = searchParams.get('availability') || 'all';
  const minPriceParam = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPriceParam = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;

  const updateParam = (key: string, value: string | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setIsLoading(true);
      try {
        const filters: ProductFilterOptions = {
          category: activeCategory !== 'all' ? activeCategory : undefined,
          size: activeSize,
          color: activeColor,
          availability: activeAvailability === 'all' ? undefined : (activeAvailability as 'in-stock' | 'out-of-stock'),
          minPrice: minPriceParam,
          maxPrice: maxPriceParam,
          sortBy: activeSort,
        };

        const result = await productService.getProducts(filters);
        setProducts(result);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [activeCategory, activeSort, activeSize, activeColor, activeAvailability, minPriceParam, maxPriceParam]);

  const hasActiveFilters = useMemo(() => {
    return (
      activeCategory !== 'all' ||
      !!activeSize ||
      !!activeColor ||
      activeAvailability !== 'all' ||
      minPriceParam !== undefined ||
      maxPriceParam !== undefined
    );
  }, [activeCategory, activeSize, activeColor, activeAvailability, minPriceParam, maxPriceParam]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEOHead
        title="Shop All Curations | MOSS"
        description="Explore thoughtfully crafted stoneware ceramics, European washed linens, vegetable-tanned leather, and intentional lifestyle goods."
      />

      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Shop', href: '/shop' }]} />

      {/* Page Title & Header */}
      <div className="pt-4 pb-8 border-b border-sand-200">
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-charcoal-900 tracking-tight">
          {activeCategory === 'all'
            ? 'All Essentials & Curations'
            : CATEGORIES.find((c) => c.value === activeCategory)?.label || 'Shop'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-charcoal-600 max-w-2xl font-light">
          Objects created with enduring restraint. Every piece is developed from natural raw materials with an emphasis on tactile pleasure and longevity.
        </p>
      </div>

      {/* Filter and Sort Control Bar */}
      <div className="py-5 flex flex-wrap items-center justify-between gap-4 border-b border-sand-200">
        <div className="flex items-center space-x-3">
          {/* Filter button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sand-200/80 hover:bg-sand-300 text-charcoal-900 border border-sand-300 text-xs uppercase tracking-widest font-medium transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-moss-900 ml-1" />
            )}
          </button>

          <span className="text-xs text-charcoal-500">
            Showing <strong className="text-charcoal-900">{products.length}</strong> products
          </span>
        </div>

        {/* Sort Select */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sort-select" className="text-xs text-charcoal-500 uppercase tracking-wider hidden sm:inline">
            Sort by:
          </label>
          <div className="relative">
            <select
              id="sort-select"
              value={activeSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="appearance-none bg-sand-100 border border-sand-300 pl-3 pr-8 py-2 text-xs uppercase tracking-wider text-charcoal-900 focus:outline-none focus:border-moss-900 cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="bestselling">Best Selling</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-charcoal-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="py-4 flex flex-wrap items-center gap-2 border-b border-sand-200 animate-fade-in">
          <span className="text-[11px] uppercase tracking-wider text-charcoal-500 mr-2">
            Active Filters:
          </span>

          {activeCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sand-200 text-charcoal-900 text-xs border border-sand-300">
              Category: {CATEGORIES.find((c) => c.value === activeCategory)?.label}
              <button
                onClick={() => updateParam('category', 'all')}
                className="hover:text-red-700"
                aria-label="Remove category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeSize && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sand-200 text-charcoal-900 text-xs border border-sand-300">
              Size: {activeSize}
              <button
                onClick={() => updateParam('size', undefined)}
                className="hover:text-red-700"
                aria-label="Remove size filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeColor && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sand-200 text-charcoal-900 text-xs border border-sand-300">
              Color: {activeColor}
              <button
                onClick={() => updateParam('color', undefined)}
                className="hover:text-red-700"
                aria-label="Remove color filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeAvailability !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sand-200 text-charcoal-900 text-xs border border-sand-300">
              Status: {activeAvailability === 'in-stock' ? 'In Stock' : 'Out of Stock'}
              <button
                onClick={() => updateParam('availability', 'all')}
                className="hover:text-red-700"
                aria-label="Remove status filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(minPriceParam !== undefined || maxPriceParam !== undefined) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sand-200 text-charcoal-900 text-xs border border-sand-300">
              Price: ${minPriceParam || 0} - ${maxPriceParam || '+'}
              <button
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('minPrice');
                  newParams.delete('maxPrice');
                  setSearchParams(newParams);
                }}
                className="hover:text-red-700"
                aria-label="Remove price filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs uppercase tracking-wider text-moss-900 font-semibold underline underline-offset-4 ml-2 hover:text-black"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Product Grid */}
      <div className="py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} showCategory />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center max-w-md mx-auto">
            <h3 className="font-serif text-2xl text-charcoal-900 mb-2">No Matching Products</h3>
            <p className="text-xs sm:text-sm text-charcoal-500 mb-6 font-light">
              We couldn't find any essentials matching your exact filter selections. Try clearing your filters or selecting another category.
            </p>
            <Button variant="primary" size="md" onClick={clearAllFilters}>
              Reset All Filters
            </Button>
          </div>
        )}
      </div>

      {/* FILTER DRAWER */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Filter Essentials"
        width="md"
        footer={
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={clearAllFilters}
            >
              Reset
            </Button>
            <Button
              variant="dark"
              size="md"
              className="flex-1"
              onClick={() => setIsFilterDrawerOpen(false)}
            >
              Apply ({products.length})
            </Button>
          </div>
        }
      >
        <div className="space-y-8 divide-y divide-sand-200">
          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-charcoal-900">
              Collection
            </h4>
            <div className="space-y-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => updateParam('category', cat.value)}
                  className={`flex items-center justify-between w-full py-1.5 text-xs text-left transition-colors ${
                    activeCategory === cat.value
                      ? 'text-moss-900 font-semibold'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  <span>{cat.label}</span>
                  {activeCategory === cat.value && <Check className="w-3.5 h-3.5 text-moss-900" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-6 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-charcoal-900">
              Price Range
            </h4>
            <div className="space-y-1.5">
              {PRICE_RANGES.map((range, index) => {
                const isSelected =
                  minPriceParam === range.min && maxPriceParam === range.max;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      if (range.min !== undefined) newParams.set('minPrice', String(range.min));
                      else newParams.delete('minPrice');
                      if (range.max !== undefined) newParams.set('maxPrice', String(range.max));
                      else newParams.delete('maxPrice');
                      setSearchParams(newParams);
                    }}
                    className={`flex items-center justify-between w-full py-1.5 text-xs text-left transition-colors ${
                      isSelected
                        ? 'text-moss-900 font-semibold'
                        : 'text-charcoal-600 hover:text-charcoal-900'
                    }`}
                  >
                    <span>{range.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-moss-900" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color */}
          <div className="pt-6 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-charcoal-900">
              Color Palette
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {COLORS.map((col) => {
                const isSelected = activeColor?.toLowerCase() === col.name.toLowerCase();
                return (
                  <button
                    key={col.name}
                    onClick={() => updateParam('color', isSelected ? undefined : col.name)}
                    className={`flex items-center gap-2 p-2 border text-left text-xs transition-all ${
                      isSelected
                        ? 'border-moss-900 bg-sand-200 font-medium'
                        : 'border-sand-300 bg-sand-100 hover:border-sand-400'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span className="truncate">{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size */}
          <div className="pt-6 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-charcoal-900">
              Size
            </h4>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((sz) => {
                const isSelected = activeSize === sz;
                return (
                  <button
                    key={sz}
                    onClick={() => updateParam('size', isSelected ? undefined : sz)}
                    className={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-all ${
                      isSelected
                        ? 'bg-moss-900 text-sand-50 border-moss-900 font-medium'
                        : 'bg-sand-100 text-charcoal-800 border-sand-300 hover:border-charcoal-600'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div className="pt-6 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-charcoal-900">
              Stock Availability
            </h4>
            <div className="space-y-1.5">
              {[
                { label: 'All Items', value: 'all' },
                { label: 'In Stock Only', value: 'in-stock' },
                { label: 'Out of Stock / Sold Out', value: 'out-of-stock' },
              ].map((av) => (
                <button
                  key={av.value}
                  onClick={() => updateParam('availability', av.value)}
                  className={`flex items-center justify-between w-full py-1.5 text-xs text-left transition-colors ${
                    activeAvailability === av.value
                      ? 'text-moss-900 font-semibold'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  <span>{av.label}</span>
                  {activeAvailability === av.value && <Check className="w-3.5 h-3.5 text-moss-900" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
