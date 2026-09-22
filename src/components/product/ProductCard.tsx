import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../types/product';
import { Badge } from '../ui/Badge';
import { Rating } from '../ui/Rating';
import { formatPrice } from '../../utils/formatters';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { cn } from '../../utils/cn';

interface ProductCardProps {
  product: Product;
  className?: string;
  showCategory?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className,
  showCategory = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name);
  const [quickAdded, setQuickAdded] = useState(false);

  const { isInWishlist, toggleItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const { showToast } = useToastStore();

  const isFavorited = isInWishlist(product.id);
  const hasSecondaryImage = product.images.length > 1;
  const primaryImage = product.images[0];
  const secondaryImage = hasSecondaryImage ? product.images[1] : product.images[0];

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleItem(product);
    showToast({
      title: added ? 'Added to Wishlist' : 'Removed from Wishlist',
      message: `${product.name} ${added ? 'has been saved to your wishlist.' : 'has been removed from your wishlist.'}`,
      type: 'info',
    });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Default size and color
    const defaultSize = product.sizes.find(s => s.inStock)?.name || product.sizes[0]?.name;
    addItem(product, 1, selectedColor, defaultSize);

    setQuickAdded(true);
    setTimeout(() => setQuickAdded(false), 1500);

    showToast({
      title: 'Added to Bag',
      message: `${product.name} (${selectedColor || 'Default'}) added to your shopping bag.`,
      type: 'success',
    });
  };

  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div
      className={cn('group relative flex flex-col', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-sand-100 border border-sand-200/60">
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          {/* Primary image */}
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className={cn(
              'h-full w-full object-cover object-center transition-all duration-700 ease-out',
              hasSecondaryImage && isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            )}
          />

          {/* Secondary image on hover */}
          {hasSecondaryImage && (
            <img
              src={secondaryImage}
              alt={`${product.name} alternate angle`}
              loading="lazy"
              className={cn(
                'absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out',
                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              )}
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge && <Badge variant={product.badge} />}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="low-stock">Only {product.stock} Left</Badge>
          )}
          {product.stock === 0 && <Badge variant="out-of-stock">Sold Out</Badge>}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          className={cn(
            'absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF8F5]/90 backdrop-blur-sm transition-all duration-300 shadow-sm',
            'hover:bg-[#FAF8F5] hover:scale-110 focus:outline-none',
            isFavorited ? 'text-clay-600' : 'text-charcoal-500 hover:text-charcoal-900'
          )}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={cn(
              'w-4 h-4 transition-transform',
              isFavorited && 'fill-clay-600 text-clay-600 scale-110'
            )}
          />
        </button>

        {/* Quick Add Overlay */}
        {product.stock > 0 && (
          <div
            className={cn(
              'absolute inset-x-3 bottom-3 z-10 transition-all duration-300',
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
            )}
          >
            <button
              onClick={handleQuickAdd}
              className={cn(
                'w-full py-2.5 px-4 text-center text-xs uppercase tracking-widest font-medium transition-all shadow-md flex items-center justify-center gap-2',
                quickAdded
                  ? 'bg-moss-900 text-sand-50'
                  : 'bg-[#FAF8F5]/95 hover:bg-charcoal-900 hover:text-sand-50 text-charcoal-900 backdrop-blur-sm border border-sand-300'
              )}
            >
              {quickAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Product metadata */}
      <div className="pt-3.5 pb-2 flex flex-col flex-1">
        {showCategory && (
          <span className="text-[10px] uppercase tracking-widest text-charcoal-400 font-medium mb-1">
            {product.category}
          </span>
        )}

        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/product/${product.slug}`}
            className="font-serif text-base sm:text-lg text-charcoal-900 hover:text-moss-800 transition-colors line-clamp-1 font-normal tracking-tight"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Rating */}
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium text-charcoal-900 font-sans">
              {formatPrice(product.price)}
            </span>
            {isOnSale && (
              <span className="text-xs text-charcoal-400 line-through font-sans">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          <Rating value={product.rating} count={product.reviewCount} showCount size="sm" />
        </div>

        {/* Color swatches */}
        {product.colors && product.colors.length > 1 && (
          <div className="mt-2.5 flex items-center gap-1.5">
            {product.colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedColor(color.name);
                }}
                className={cn(
                  'h-3.5 w-3.5 rounded-full border transition-all p-0.5',
                  selectedColor === color.name
                    ? 'border-charcoal-900 ring-1 ring-charcoal-900 ring-offset-1'
                    : 'border-sand-300 hover:border-charcoal-500'
                )}
                title={color.name}
              >
                <span
                  className="block h-full w-full rounded-full"
                  style={{ backgroundColor: color.hex }}
                />
              </button>
            ))}
            <span className="text-[10px] text-charcoal-400 ml-1">
              {product.colors.length} colors
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
