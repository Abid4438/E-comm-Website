import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { SEOHead } from '../components/ui/SEOHead';
import { productService, categoryService } from '../services/apiClient';
import { Product, CategoryType } from '../types/product';
import { Category } from '../types/category';
import { ChevronDown } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'bestselling' | 'price-low' | 'price-high'>('featured');

  useEffect(() => {
    const loadCategoryData = async () => {
      setIsLoading(true);
      try {
        if (slug) {
          const cat = await categoryService.getCategoryBySlug(slug);
          setCategory(cat);

          const prods = await productService.getProducts({
            category: slug as CategoryType,
            sortBy,
          });
          setProducts(prods);
        }
      } catch (err) {
        console.error('Error fetching category:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryData();
  }, [slug, sortBy]);

  if (!isLoading && !category) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-3xl text-charcoal-900 mb-4">Collection Not Found</h2>
        <p className="text-sm text-charcoal-600 mb-6">The requested collection does not exist.</p>
        <Link to="/shop" className="text-xs uppercase tracking-widest text-moss-900 underline font-semibold">
          Return to All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <SEOHead
        title={`${category?.name || 'Collection'} | MOSS`}
        description={category?.description}
        ogImage={category?.heroImage || category?.image}
      />

      {/* Category Hero Banner */}
      <section className="relative h-72 sm:h-96 w-full overflow-hidden bg-sand-900 text-white flex items-center justify-center">
        {category?.heroImage && (
          <img
            src={category.heroImage}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.75]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-3">
          <span className="text-[11px] uppercase tracking-[0.25em] text-sand-300 font-medium">
            MOSS Curated Collection
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight uppercase">
            {category?.name}
          </h1>
          <p className="text-xs sm:text-sm text-sand-100 font-light max-w-xl mx-auto leading-relaxed">
            {category?.description}
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Breadcrumbs
          items={[
            { label: 'Shop', href: '/shop' },
            { label: category?.name || 'Collection' },
          ]}
        />

        {/* Sort & Count Header */}
        <div className="py-5 flex items-center justify-between border-b border-sand-200 mb-8">
          <span className="text-xs text-charcoal-500">
            Showing <strong className="text-charcoal-900">{products.length}</strong> objects
          </span>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-charcoal-500 uppercase tracking-wider hidden sm:inline">
              Sort by:
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-sand-100 border border-sand-300 pl-3 pr-8 py-2 text-xs uppercase tracking-wider text-charcoal-900 focus:outline-none focus:border-moss-900 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="bestselling">Best Selling</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-serif text-xl text-charcoal-900">No products currently in this collection.</p>
          </div>
        )}
      </div>
    </div>
  );
};
