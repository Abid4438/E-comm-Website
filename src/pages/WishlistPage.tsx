import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Button } from '../components/ui/Button';
import { SEOHead } from '../components/ui/SEOHead';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import { formatPrice } from '../utils/formatters';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const { showToast } = useToastStore();

  const handleMoveToCart = (product: any) => {
    addItem(product, 1);
    openCart();
    showToast({
      title: 'Moved to Bag',
      message: `${product.name} has been added to your shopping bag.`,
      type: 'success',
    });
  };

  const handleRemove = (productId: string, name: string) => {
    removeItem(productId);
    showToast({
      title: 'Removed',
      message: `${name} removed from your wishlist.`,
      type: 'info',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEOHead title="My Wishlist | MOSS" description="Your curated and saved MOSS essentials." />

      <Breadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: 'Wishlist' }]} />

      <div className="pt-4 pb-8 border-b border-sand-200 flex items-baseline justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
            Saved Objects
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-charcoal-900 tracking-tight">
            Curated Wishlist ({items.length})
          </h1>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs text-charcoal-500 hover:text-red-700 underline uppercase tracking-wider"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-sand-200/60 flex items-center justify-center text-charcoal-400 mx-auto mb-4">
            <Heart className="w-8 h-8 stroke-1" />
          </div>
          <h2 className="font-serif text-3xl text-charcoal-900 mb-2">Your Wishlist is Empty</h2>
          <p className="text-xs sm:text-sm text-charcoal-500 font-light mb-8">
            Click the heart icon on any essential to curate your personalized wishlist for later.
          </p>
          <Link to="/shop">
            <Button variant="dark" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Discover Essentials
            </Button>
          </Link>
        </div>
      ) : (
        <div className="py-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col bg-[#FAF8F5] border border-sand-300"
            >
              {/* Product Thumbnail */}
              <div className="relative aspect-[4/5] bg-sand-200 overflow-hidden">
                <Link to={`/product/${product.slug}`} className="block h-full w-full">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </Link>

                <button
                  onClick={() => handleRemove(product.id, product.name)}
                  className="absolute top-3 right-3 p-2 bg-[#FAF8F5]/90 rounded-full text-charcoal-500 hover:text-red-700 shadow-sm"
                  aria-label="Remove item from wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Info & Add to Cart */}
              <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-charcoal-400 font-medium">
                    {product.category}
                  </span>
                  <Link
                    to={`/product/${product.slug}`}
                    className="font-serif text-base text-charcoal-900 hover:text-moss-900 line-clamp-1 mt-0.5"
                  >
                    {product.name}
                  </Link>
                  <div className="text-xs font-semibold text-charcoal-900 mt-1">
                    {formatPrice(product.price)}
                  </div>
                </div>

                <Button
                  variant="dark"
                  size="sm"
                  className="w-full"
                  onClick={() => handleMoveToCart(product)}
                  leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Sold Out' : 'Add to Bag'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
