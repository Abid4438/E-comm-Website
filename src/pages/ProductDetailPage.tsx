import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Rating } from '../components/ui/Rating';
import { Accordion, AccordionItem } from '../components/ui/Accordion';
import { QuantitySelector } from '../components/ui/QuantitySelector';
import { Modal } from '../components/ui/Modal';
import { SEOHead } from '../components/ui/SEOHead';
import { ProductCard } from '../components/product/ProductCard';
import { productService, reviewService } from '../services/apiClient';
import { Product } from '../types/product';
import { Review } from '../types/review';
import { formatPrice } from '../utils/formatters';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useRecentlyViewedStore } from '../store/useRecentlyViewedStore';
import { useToastStore } from '../store/useToastStore';
import {
  Heart,
  ShoppingBag,
  Share2,
  ZoomIn,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ThumbsUp,
} from 'lucide-react';
import { cn } from '../utils/cn';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // User Selections
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // New review form state
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { addItem, openCart } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { addProduct: trackRecentlyViewed, items: recentlyViewed } = useRecentlyViewedStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    // Live refresh: re-fetch product every 60s while viewing
  useEffect(() => {
    if (!slug) return;
    const interval = setInterval(() => {
      fetchProduct();
    }, 60000);
    return () => clearInterval(interval);
  }, [slug]);

  const fetchProduct = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const prod = await productService.getProductBySlug(slug);
        if (prod) {
          setProduct(prod);
          setSelectedColor(prod.colors[0]?.name || '');
          const availableSize = prod.sizes.find((s) => s.inStock)?.name || prod.sizes[0]?.name || '';
          setSelectedSize(availableSize);
          setSelectedImageIndex(0);
          setQuantity(1);

          // Track recently viewed
          trackRecentlyViewed(prod);

          // Related products & reviews
          const [related, revs] = await Promise.all([
            productService.getRelatedProducts(prod.id, 4),
            reviewService.getReviewsByProductId(prod.id),
          ]);
          setRelatedProducts(related);
          setReviews(revs);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug, trackRecentlyViewed]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 aspect-[4/5] bg-sand-200" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-6 w-1/3 bg-sand-200" />
            <div className="h-10 w-4/5 bg-sand-200" />
            <div className="h-6 w-1/4 bg-sand-200" />
            <div className="h-32 w-full bg-sand-200 mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-3xl text-charcoal-900 mb-4">Object Not Found</h2>
        <p className="text-sm text-charcoal-600 mb-6">The item you are looking for is unavailable.</p>
        <Link to="/shop" className="text-xs uppercase tracking-widest text-moss-900 underline font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity, selectedColor, selectedSize);
    openCart();
    showToast({
      title: 'Added to Bag',
      message: `${product.name} (${selectedColor}${selectedSize ? ` / ${selectedSize}` : ''}) added to bag.`,
      type: 'success',
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, quantity, selectedColor, selectedSize);
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    const added = toggleItem(product);
    showToast({
      title: added ? 'Added to Wishlist' : 'Removed from Wishlist',
      message: `${product.name} ${added ? 'saved to your wishlist.' : 'removed from your wishlist.'}`,
      type: 'info',
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast({
        title: 'Link Copied',
        message: 'Product link copied to clipboard.',
        type: 'info',
      });
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewTitle || !newReviewComment) {
      showToast({
        title: 'Missing Fields',
        message: 'Please fill in all review fields.',
        type: 'error',
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const created = await reviewService.createReview({
        productId: product.id,
        author: newReviewAuthor,
        rating: newReviewRating,
        title: newReviewTitle,
        comment: newReviewComment,
      });

      setReviews([created, ...reviews]);
      setIsReviewModalOpen(false);
      setNewReviewAuthor('');
      setNewReviewTitle('');
      setNewReviewComment('');
      showToast({
        title: 'Review Submitted',
        message: 'Thank you for your thoughtful feedback.',
        type: 'success',
      });
    } catch {
      showToast({
        title: 'Error',
        message: 'Could not submit review.',
        type: 'error',
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleHelpfulVote = async (reviewId: string) => {
    try {
      const updated = await reviewService.voteHelpful(reviewId);
      setReviews(reviews.map((r) => (r.id === reviewId ? updated : r)));
      showToast({
        title: 'Thank you',
        message: 'Your feedback was recorded.',
        type: 'info',
      });
    } catch {
      // ignore vote errors silently
    }
  };

  // Accordion Items
  const accordionItems: AccordionItem[] = [
    {
      id: 'description',
      title: 'Description & Craftsmanship',
      defaultOpen: true,
      content: (
        <div className="space-y-3">
          <p className="leading-relaxed">{product.description}</p>
          {product.details && product.details.length > 0 && (
            <ul className="list-disc list-inside space-y-1 pt-2 text-xs text-charcoal-700">
              {product.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
    {
      id: 'materials',
      title: 'Materials & Sustainability',
      content: (
        <div className="space-y-3">
          {product.materials && (
            <ul className="list-disc list-inside space-y-1 text-xs text-charcoal-700">
              {product.materials.map((mat, idx) => (
                <li key={idx}>{mat}</li>
              ))}
            </ul>
          )}
          {product.dimensions && (
            <div className="pt-2 text-xs text-charcoal-700">
              <strong>Dimensions & Fit:</strong> {product.dimensions}
            </div>
          )}
          <p className="text-xs text-charcoal-500 pt-2">
            Every material is ethically cultivated and traceable to ethical farms and workshops.
          </p>
        </div>
      ),
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      content: (
        <div className="space-y-2 text-xs leading-relaxed text-charcoal-700">
          <p>{product.shippingInfo}</p>
          <div className="p-3 bg-sand-200/50 border border-sand-300 space-y-1 mt-2">
            <div className="font-semibold text-charcoal-900">Complimentary Standard Delivery:</div>
            <div>Free on all US orders over $100. Delivered in 3-5 business days.</div>
          </div>
        </div>
      ),
    },
    {
      id: 'returns',
      title: '30-Day Returns & Care',
      content: (
        <div className="space-y-2 text-xs leading-relaxed text-charcoal-700">
          <p>{product.returnsInfo}</p>
          <p>
            Spot clean with a damp cloth or dry clean depending on fabric specifications. Store away from direct sunlight in a dry, ventilated environment.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEOHead
        title={`${product.name} | MOSS`}
        description={product.shortDescription}
        ogImage={product.images[0]}
        productSchema={product}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Shop', href: '/shop' },
          { label: product.category, href: `/category/${product.category}` },
          { label: product.name },
        ]}
      />

      {/* Main PDP Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* LEFT COLUMN: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[4/5] w-full bg-sand-100 border border-sand-200 overflow-hidden group">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
              onClick={() => setIsZoomOpen(true)}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {product.badge && <Badge variant={product.badge} />}
              {product.stock <= 5 && product.stock > 0 && (
                <Badge variant="low-stock">Only {product.stock} Left</Badge>
              )}
              {product.stock === 0 && <Badge variant="out-of-stock">Sold Out</Badge>}
            </div>

            {/* Zoom Button Trigger */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute bottom-4 right-4 p-2.5 bg-[#FAF8F5]/90 backdrop-blur-sm rounded-full text-charcoal-700 hover:text-charcoal-900 shadow-md transition-all hover:scale-110"
              aria-label="Zoom image"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={cn(
                    'relative w-20 h-24 shrink-0 overflow-hidden bg-sand-100 border transition-all',
                    selectedImageIndex === idx
                      ? 'border-moss-900 ring-1 ring-moss-900'
                      : 'border-sand-300 opacity-70 hover:opacity-100'
                  )}
                  aria-label={`Thumbnail view ${idx + 1}`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Product Details & Purchase Actions */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-xs text-charcoal-400 uppercase tracking-widest font-medium mb-1">
            <Link
              to={`/category/${product.category}`}
              className="hover:text-moss-900 transition-colors"
            >
              {product.category}
            </Link>
            <span>SKU: {product.sku}</span>
          </div>

          {/* Product Title */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal-900 tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Tagline */}
          {product.tagline && (
            <p className="text-xs uppercase tracking-[0.2em] text-moss-800 font-semibold mt-1">
              {product.tagline}
            </p>
          )}

          {/* Rating & Review summary link */}
          <div className="mt-3 flex items-center gap-3">
            <Rating value={product.rating} count={product.reviewCount} showCount size="md" />
            <a
              href="#reviews-section"
              className="text-xs text-charcoal-500 hover:text-charcoal-900 underline underline-offset-4 transition-colors"
            >
              Read {product.reviewCount} customer reviews
            </a>
          </div>

          {/* Price */}
          <div className="mt-5 flex items-baseline gap-3 pb-5 border-b border-sand-200">
            <span className="font-serif text-3xl font-medium text-charcoal-900">
              {formatPrice(product.price)}
            </span>
            {isOnSale && (
              <>
                <span className="text-base text-charcoal-400 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
                <span className="text-xs font-semibold text-[#8E3B29] bg-red-50 px-2 py-0.5 border border-red-200">
                  Save {formatPrice(product.compareAtPrice! - product.price)}
                </span>
              </>
            )}
          </div>

          {/* Short description */}
          <p className="mt-5 text-sm text-charcoal-700 leading-relaxed font-light">
            {product.shortDescription}
          </p>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="uppercase tracking-widest text-charcoal-500 font-semibold">
                  Color: <strong className="text-charcoal-900">{selectedColor}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={cn(
                      'relative h-8 w-8 rounded-full border p-0.5 transition-all focus:outline-none',
                      selectedColor === color.name
                        ? 'border-charcoal-900 ring-2 ring-charcoal-900 ring-offset-2'
                        : 'border-sand-300 hover:border-charcoal-400'
                    )}
                    title={color.name}
                  >
                    <span
                      className="block h-full w-full rounded-full"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="uppercase tracking-widest text-charcoal-500 font-semibold">
                  Size: <strong className="text-charcoal-900">{selectedSize}</strong>
                </span>
                <Link
                  to="/faq#sizing"
                  className="text-charcoal-500 hover:text-charcoal-900 underline underline-offset-2 text-[11px]"
                >
                  Size Guide
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    type="button"
                    disabled={!size.inStock}
                    onClick={() => setSelectedSize(size.name)}
                    className={cn(
                      'px-4 py-2 text-xs uppercase tracking-wider border font-medium transition-all',
                      !size.inStock
                        ? 'opacity-40 line-through cursor-not-allowed border-sand-300 bg-sand-100'
                        : selectedSize === size.name
                        ? 'bg-charcoal-900 text-sand-50 border-charcoal-900 shadow-sm'
                        : 'bg-sand-100/80 text-charcoal-800 border-sand-300 hover:border-charcoal-800'
                    )}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart Controls */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3">
              <QuantitySelector
                quantity={quantity}
                max={product.stock}
                onChange={setQuantity}
                size="lg"
                disabled={isOutOfStock}
              />

              <Button
                variant="dark"
                size="lg"
                className="flex-1"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                leftIcon={<ShoppingBag className="w-4 h-4" />}
              >
                {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
              </Button>

              <button
                type="button"
                onClick={handleWishlistToggle}
                className={cn(
                  'h-12 w-12 flex items-center justify-center border transition-all',
                  isFavorited
                    ? 'border-clay-600 bg-clay-50 text-clay-600'
                    : 'border-sand-300 hover:border-charcoal-800 text-charcoal-700'
                )}
                aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={cn('w-4 h-4', isFavorited && 'fill-clay-600')} />
              </button>
            </div>

            {/* Buy Now Button */}
            {!isOutOfStock && (
              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-sand-200 text-charcoal-900 hover:bg-sand-300 font-semibold"
                onClick={handleBuyNow}
              >
                Buy Now with 1-Click Checkout
              </Button>
            )}

            {/* Stock status indicator */}
            <div className="pt-2 flex items-center justify-between text-xs text-charcoal-600">
              <span className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    product.stock > 5
                      ? 'bg-emerald-600'
                      : product.stock > 0
                      ? 'bg-amber-500'
                      : 'bg-stone-400'
                  )}
                />
                <span>
                  {product.stock > 5
                    ? 'In Stock & Ready to Ship'
                    : product.stock > 0
                    ? `Low Stock: Only ${product.stock} units remaining`
                    : 'Currently Out of Stock'}
                </span>
              </span>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-charcoal-500 hover:text-charcoal-900"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Value Props Strip */}
          <div className="mt-8 p-4 bg-sand-100/60 border border-sand-200 grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-wider text-charcoal-700">
            <div className="flex flex-col items-center">
              <Truck className="w-4 h-4 text-moss-800 mb-1" />
              <span>Free US Shipping $100+</span>
            </div>
            <div className="flex flex-col items-center border-x border-sand-200">
              <RotateCcw className="w-4 h-4 text-moss-800 mb-1" />
              <span>30-Day Easy Returns</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-moss-800 mb-1" />
              <span>Ethically Crafted</span>
            </div>
          </div>

          {/* Accordion Information */}
          <div className="mt-8">
            <Accordion items={accordionItems} allowMultiple />
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <section id="reviews-section" className="mt-24 pt-16 border-t border-sand-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
              Customer Experiences
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
              Reviews & Reflections ({reviews.length})
            </h2>
          </div>

          <Button
            variant="outline"
            size="md"
            className="mt-4 md:mt-0"
            onClick={() => setIsReviewModalOpen(true)}
          >
            Write a Review
          </Button>
        </div>

        {/* Rating Breakdown Header */}
        <div className="p-8 bg-sand-100/60 border border-sand-200 mb-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-sand-200 pb-6 md:pb-0 md:pr-8">
            <div className="font-serif text-6xl font-normal text-charcoal-900">
              {product.rating.toFixed(1)}
            </div>
            <div className="mt-2 flex justify-center md:justify-start">
              <Rating value={product.rating} size="lg" />
            </div>
            <p className="text-xs text-charcoal-500 mt-2">
              Based on {product.reviewCount} customer reviews
            </p>
          </div>

          <div className="md:col-span-8 space-y-2 text-xs">
            {[
              { star: 5, pct: 85 },
              { star: 4, pct: 12 },
              { star: 3, pct: 3 },
              { star: 2, pct: 0 },
              { star: 1, pct: 0 },
            ].map((row) => (
              <div key={row.star} className="flex items-center gap-3">
                <span className="w-12 text-charcoal-600 font-medium">{row.star} Stars</span>
                <div className="flex-1 h-2 bg-sand-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-moss-900 rounded-full"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-charcoal-400">{row.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="py-12 text-center text-xs text-charcoal-500">
            No reviews yet for this object. Be the first to share your experience.
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 sm:p-8 bg-[#FAF8F5] border border-sand-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Rating value={rev.rating} size="sm" />
                    <span className="text-xs text-charcoal-400">{rev.date}</span>
                  </div>

                  <h4 className="font-serif text-xl font-normal text-charcoal-900 mt-3 mb-1">
                    "{rev.title}"
                  </h4>

                  <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-light mt-2">
                    {rev.comment}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-sand-200 flex items-center justify-between text-xs text-charcoal-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-charcoal-900">{rev.author}</span>
                    {rev.location && <span className="text-charcoal-400">· {rev.location}</span>}
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-moss-800 font-semibold bg-moss-50 px-2 py-0.5 border border-moss-200">
                        <Check className="w-3 h-3" /> Verified Buyer
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleHelpfulVote(rev.id)}
                    className="flex items-center gap-1.5 text-charcoal-500 hover:text-charcoal-900 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({rev.helpfulCount})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 pt-16 border-t border-sand-200">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block mb-1">
                Complementary Curations
              </span>
              <h2 className="font-serif text-3xl font-normal text-charcoal-900 tracking-tight">
                Pairs Well With
              </h2>
            </div>
            <Link
              to={`/category/${product.category}`}
              className="text-xs uppercase tracking-widest text-charcoal-900 hover:text-moss-800 font-semibold underline underline-offset-4"
            >
              View Collection
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* RECENTLY VIEWED */}
      {recentlyViewed.filter((p) => p.id !== product.id).length > 0 && (
        <section className="mt-24 pt-16 border-t border-sand-200">
          <h2 className="font-serif text-2xl font-normal text-charcoal-900 tracking-tight mb-8">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recentlyViewed
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
      )}

      {/* ZOOM MODAL */}
      <Modal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        maxWidth="4xl"
        className="p-0 bg-black/95 text-white border-none"
      >
        <div className="relative aspect-[4/5] sm:aspect-auto sm:h-[80vh] w-full flex items-center justify-center">
          <img
            src={product.images[selectedImageIndex]}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </Modal>

      {/* WRITE REVIEW MODAL */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Review "${product.name}"`}
        subtitle="Share your honest impressions with the MOSS community"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
              Your Overall Rating
            </label>
            <Rating
              value={newReviewRating}
              size="lg"
              interactive
              onChange={setNewReviewRating}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              value={newReviewAuthor}
              onChange={(e) => setNewReviewAuthor(e.target.value)}
              placeholder="e.g. Eleanor Vance"
              className="w-full bg-sand-100 border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
              Review Headline
            </label>
            <input
              type="text"
              required
              value={newReviewTitle}
              onChange={(e) => setNewReviewTitle(e.target.value)}
              placeholder="e.g. Exceptional tactile quality and texture"
              className="w-full bg-sand-100 border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal-700 mb-1">
              Detailed Impressions
            </label>
            <textarea
              required
              rows={4}
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              placeholder="How does it feel in your home? What do you think of the materials and finish?"
              className="w-full bg-sand-100 border border-sand-300 p-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="dark"
              size="md"
              isLoading={isSubmittingReview}
            >
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
