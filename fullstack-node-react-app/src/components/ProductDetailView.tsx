import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Edit3,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trash2,
  Truck,
  ZoomIn,
} from 'lucide-react';
import {
  Product,
  Review,
  StudioImage,
  User,
  formatINR,
  getDiscountPercent,
} from '../types.ts';
import { ProductCard } from './ProductCard.tsx';

interface ProductDetailViewProps {
  productId: number;
  user: User | null;
  token: string;
  wishlistIds: number[];
  recentlyViewed: Product[];
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, qty: number) => void;
  onBuyNow: (product: Product, qty: number) => void;
  onToggleWishlist: (product: Product) => void;
  onNotify: (title: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateCategory: (catName: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
  user,
  token,
  wishlistIds,
  recentlyViewed,
  onBack,
  onSelectProduct,
  onQuickView,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onNotify,
  onNavigateCategory,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'delivery'>('description');

  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/`);
      if (!res.ok) throw new Error('Product not found');
      const data: Product = await res.json();
      setProduct(data);
      setReviews(data.reviews || []);
      setSelectedImageIdx(0);
      setQuantity(1);
    } catch {
      onNotify('Could not load product details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 animate-pulse">
        <div className="h-6 w-40 bg-black/10 dark:bg-white/10 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 aspect-[4/3] bg-black/5 dark:bg-white/5 rounded-2xl" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-5 w-32 bg-black/10 dark:bg-white/10 rounded" />
            <div className="h-10 w-3/4 bg-black/10 dark:bg-white/10 rounded" />
            <div className="h-24 w-full bg-black/5 dark:bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-3xl font-semibold">Product Not Found</h2>
        <p className="text-sm text-[#575653] dark:text-[#A6A6A2] mt-2">
          The requested item may have been removed from the catalog.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 px-5 py-2.5 rounded-lg bg-[#141413] text-white text-xs font-semibold cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const gallery =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [{ id: 1, product_id: product.id, image: product.image, caption: 'Studio Front' }];
  const activeImage = gallery[selectedImageIdx] || gallery[0];
  const discountPct = getDiscountPercent(product.price, product.discount_price);
  const isWishlisted = wishlistIds.includes(product.id);
  const outOfStock = product.stock <= 0;

  // Rating breakdown distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { star, count, pct };
  });

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onNotify('Please sign in to submit a review.', 'error');
      return;
    }
    if (commentInput.trim().length < 4) {
      onNotify('Please write a brief review comment.', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      if (editingReviewId) {
        const res = await fetch(`/api/reviews/${editingReviewId}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating: ratingInput, comment: commentInput }),
        });
        if (!res.ok) throw new Error('Failed to update review');
        onNotify('Your review has been updated.', 'success');
        setEditingReviewId(null);
      } else {
        const res = await fetch(`/api/products/${product.id}/reviews/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating: ratingInput, comment: commentInput }),
        });
        if (!res.ok) throw new Error('Failed to post review');
        onNotify('Thank you! Your review has been published.', 'success');
      }
      setCommentInput('');
      setRatingInput(5);
      fetchProductDetails();
    } catch {
      onNotify('Could not submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (revId: number) => {
    try {
      const res = await fetch(`/api/reviews/${revId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onNotify('Review deleted.', 'info');
        fetchProductDetails();
      }
    } catch {
      onNotify('Failed to delete review.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb & Back navigation */}
      <div className="flex items-center justify-between text-xs text-[#575653] dark:text-[#A6A6A2]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 font-medium text-[#141413] dark:text-[#F5F5F3] hover:opacity-75 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateCategory(product.category_name)}
            className="hover:underline cursor-pointer"
          >
            {product.category_name}
          </button>
          <span aria-hidden="true">/</span>
          <span className="text-[#141413] dark:text-[#F5F5F3] font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </div>
      </div>

      {/* CONTIGUOUS PURCHASE MODULE: Left Gallery + Right Purchase Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* LEFT SIDE: Sticky Gallery + Thumbnails + Interactive Zoom */}
        <div className="lg:col-span-7 lg:sticky lg:top-24 space-y-4">
          <div
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              setZoomCoords({ x, y });
            }}
            className="relative aspect-[4/3] w-full rounded-2xl bg-[#F4F3EF] dark:bg-[#18181B] overflow-hidden border border-black/[0.07] dark:border-white/[0.08] cursor-zoom-in"
          >
            <div
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                      transform: 'scale(1.65)',
                    }
                  : undefined
              }
              className="w-full h-full transition-transform duration-150 ease-out"
            >
              <StudioImage
                src={activeImage.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-white/90 dark:bg-black/75 text-[11px] text-[#575653] dark:text-[#A6A6A2] flex items-center gap-1.5 pointer-events-none">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>{activeImage.caption || 'Hover to zoom'}</span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="grid grid-cols-3 gap-3">
            {gallery.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedImageIdx(idx)}
                className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F4F3EF] dark:bg-[#18181B] border-2 transition-all cursor-pointer ${
                  selectedImageIdx === idx
                    ? 'border-[#141413] dark:border-[#F5F5F3]'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <StudioImage src={img.image} alt={img.caption} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Sticky Contiguous Purchase Module */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 bg-[#F4F3EF]/60 dark:bg-[#1A1A1E] p-6 sm:p-8 rounded-2xl border border-black/[0.07] dark:border-white/[0.08] space-y-6">
          {/* Unboxed Metadata: Brand · Category · Stock */}
          <div className="flex items-center justify-between text-xs text-[#575653] dark:text-[#A6A6A2]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#141413] dark:text-[#F5F5F3]">
                {product.brand}
              </span>
              <span aria-hidden="true">·</span>
              <span>{product.category_name}</span>
            </div>
            <span
              className={`font-medium ${
                outOfStock
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {outOfStock ? 'Out of Stock' : `In Stock (${product.stock} available)`}
            </span>
          </div>

          {/* Product Title */}
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#141413] dark:text-[#F5F5F3] leading-tight">
              {product.name}
            </h1>

            {/* Rating & Review Count */}
            <div className="mt-2.5 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(product.rating) ? 'fill-amber-500' : 'opacity-30'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono-tabular font-semibold text-[#141413] dark:text-[#F5F5F3]">
                {product.rating.toFixed(1)} / 5.0
              </span>
              <span aria-hidden="true" className="text-[#85847F]">
                ·
              </span>
              <a href="#reviews-section" className="text-[#575653] dark:text-[#A6A6A2] hover:underline">
                {reviews.length} Verified Reviews
              </a>
            </div>
          </div>

          {/* Price Block (Tabular Numerals) */}
          <div className="py-4 border-y border-black/[0.07] dark:border-white/[0.08]">
            <div className="flex items-baseline gap-3 font-mono-tabular">
              <span className="text-2xl sm:text-3xl font-semibold text-[#141413] dark:text-[#F5F5F3]">
                {formatINR(product.discount_price)}
              </span>
              {discountPct > 0 && (
                <>
                  <span className="text-sm text-[#85847F] line-through">
                    {formatINR(product.price)}
                  </span>
                  <span className="text-xs font-semibold text-[#9A3412] dark:text-[#EA580C]">
                    Save {discountPct}% ({formatINR(product.price - product.discount_price)})
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[#85847F] mt-1">
              Inclusive of all taxes · Free insured delivery on orders above ₹1,999
            </p>
          </div>

          {/* Short Description */}
          <p className="text-sm text-[#575653] dark:text-[#A6A6A2] leading-relaxed">
            {product.description}
          </p>

          {/* Quantity Selector + Primary CTAs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#575653] dark:text-[#A6A6A2]">
                Quantity
              </span>
              <div className="inline-flex items-center rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#222227]">
                <button
                  type="button"
                  disabled={quantity <= 1 || outOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-mono-tabular text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stock || outOfStock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-9 h-9 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={outOfStock}
                onClick={() => onAddToCart(product, quantity)}
                className="py-3 px-5 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 cursor-pointer transition-opacity whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>{outOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>

              <button
                type="button"
                disabled={outOfStock}
                onClick={() => onBuyNow(product, quantity)}
                className="py-3 px-5 rounded-xl bg-[#9A3412] dark:bg-[#EA580C] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 cursor-pointer transition-opacity whitespace-nowrap"
              >
                <span>Buy Now</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onToggleWishlist(product)}
              className="w-full py-2.5 px-4 rounded-xl border border-black/10 dark:border-white/10 text-xs font-medium flex items-center justify-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted ? 'fill-[#9A3412] text-[#9A3412] dark:fill-[#EA580C] dark:text-[#EA580C]' : ''
                }`}
              />
              <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Delivery, Return & Warranty Summary */}
          <div className="pt-4 border-t border-black/[0.07] dark:border-white/[0.08] space-y-2.5 text-xs text-[#575653] dark:text-[#A6A6A2]">
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-[#141413] dark:text-[#F5F5F3] shrink-0 mt-0.5" />
              <span>{product.delivery_info}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#141413] dark:text-[#F5F5F3] shrink-0 mt-0.5" />
              <span>{product.return_policy}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#141413] dark:text-[#F5F5F3] shrink-0 mt-0.5" />
              <span>{product.warranty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCT INFORMATION TABS: Description & Features / Specifications / Delivery & Warranty */}
      <section className="border-t border-black/[0.08] dark:border-white/[0.08] pt-12">
        <div className="flex items-center gap-2 border-b border-black/[0.07] dark:border-white/[0.08] pb-3">
          {(
            [
              ['description', 'Features & Description'],
              ['specs', 'Technical Specifications'],
              ['delivery', 'Shipping, Returns & Warranty'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === key
                  ? 'bg-[#141413] text-[#FBFBF9] dark:bg-[#F5F5F3] dark:text-[#121214]'
                  : 'text-[#575653] dark:text-[#A6A6A2] hover:text-[#141413] dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="pt-8">
          {activeTab === 'description' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display text-xl font-semibold mb-3">Editorial Overview</h3>
                <p className="text-sm text-[#575653] dark:text-[#A6A6A2] leading-relaxed">
                  {product.description}
                </p>
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold mb-3">Key Highlights</h3>
                <ul className="space-y-2.5">
                  {(product.features || []).map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#141413] dark:text-[#F5F5F3]">
                      <Check className="w-4 h-4 text-[#9A3412] dark:text-[#EA580C] shrink-0 mt-1" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl">
              <h3 className="font-display text-xl font-semibold mb-4">Complete Specifications</h3>
              <div className="divide-y divide-black/[0.07] dark:divide-white/[0.08] border-y border-black/[0.07] dark:border-white/[0.08]">
                {Object.entries(product.specifications || {}).map(([label, val]) => (
                  <div key={label} className="py-3 flex justify-between gap-4 text-sm">
                    <span className="text-[#575653] dark:text-[#A6A6A2]">{label}</span>
                    <span className="font-mono-tabular font-medium text-[#141413] dark:text-[#F5F5F3] text-right">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E]">
                <h4 className="font-semibold text-sm mb-1.5">Dispatch & Transit</h4>
                <p className="text-xs text-[#575653] dark:text-[#A6A6A2] leading-relaxed">
                  {product.delivery_info}. Tracked real-time from our Bengaluru & Mumbai fulfillment centers.
                </p>
              </div>
              <div className="p-5 rounded-xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E]">
                <h4 className="font-semibold text-sm mb-1.5">Returns & Exchanges</h4>
                <p className="text-xs text-[#575653] dark:text-[#A6A6A2] leading-relaxed">
                  {product.return_policy}. Instant doorstep pickup with full refund to original payment mode.
                </p>
              </div>
              <div className="p-5 rounded-xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E]">
                <h4 className="font-semibold text-sm mb-1.5">Authorized Warranty</h4>
                <p className="text-xs text-[#575653] dark:text-[#A6A6A2] leading-relaxed">
                  {product.warranty}. GST invoice included with every order.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS & RATINGS SECTION */}
      <section
        id="reviews-section"
        className="border-t border-black/[0.08] dark:border-white/[0.08] pt-12 grid grid-cols-1 lg:grid-cols-12 gap-10"
      >
        {/* Rating Summary & Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h2 className="font-display text-2xl font-semibold">Customer Reviews</h2>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-mono-tabular text-4xl font-semibold">
                {product.rating.toFixed(1)}
              </span>
              <div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(product.rating) ? 'fill-amber-500' : 'opacity-30'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#85847F] mt-0.5">
                  Based on {reviews.length} customer ratings
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {ratingCounts.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3 text-xs font-mono-tabular">
                <span className="w-12 text-[#575653] dark:text-[#A6A6A2]">{star} ★</span>
                <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#141413] dark:bg-[#F5F5F3]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[#85847F]">{count}</span>
              </div>
            ))}
          </div>

          {/* Submit / Edit Review Form */}
          <form
            onSubmit={handleReviewSubmit}
            className="p-5 rounded-xl bg-[#F4F3EF]/80 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] space-y-4"
          >
            <h3 className="text-sm font-semibold">
              {editingReviewId ? 'Edit Your Review' : 'Write a Customer Review'}
            </h3>

            <div>
              <label className="block text-xs text-[#575653] dark:text-[#A6A6A2] mb-1.5">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingInput(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= ratingInput
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-[#85847F]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#575653] dark:text-[#A6A6A2] mb-1.5">
                Review Comment
              </label>
              <textarea
                rows={3}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share your experience with build quality, performance, and value..."
                className="w-full rounded-lg bg-white dark:bg-[#222227] border border-black/10 dark:border-white/10 p-3 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={submittingReview}
                className="flex-1 py-2.5 px-4 rounded-lg bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold cursor-pointer"
              >
                {editingReviewId ? 'Update Review' : 'Submit Review'}
              </button>
              {editingReviewId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingReviewId(null);
                    setCommentInput('');
                  }}
                  className="py-2.5 px-3 rounded-lg border border-black/15 text-xs"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Review List */}
        <div className="lg:col-span-8 space-y-4">
          {reviews.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#F4F3EF]/50 dark:bg-[#1A1A1E] text-center">
              <p className="text-sm font-medium">No customer reviews yet</p>
              <p className="text-xs text-[#85847F] mt-1">
                Be the first verified buyer to review {product.name}.
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-xl bg-[#F4F3EF]/50 dark:bg-[#1A1A1E] border border-black/[0.06] dark:border-white/[0.07] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-[#141413] dark:text-[#F5F5F3]">
                      {rev.user_name}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 dark:text-emerald-400">Verified Purchase</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#85847F] font-mono-tabular">
                      {new Date(rev.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {user && (user.id === rev.user_id || user.role === 'admin') && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReviewId(rev.id);
                          setRatingInput(rev.rating);
                          setCommentInput(rev.comment);
                        }}
                        className="text-xs text-[#575653] hover:text-[#141413] dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev.id)}
                        className="text-xs text-red-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-500' : 'opacity-25'}`}
                    />
                  ))}
                </div>

                <p className="text-sm text-[#141413] dark:text-[#F5F5F3] leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* RELATED PRODUCTS: You May Also Like */}
      {product.related_products && product.related_products.length > 0 && (
        <section className="border-t border-black/[0.08] dark:border-white/[0.08] pt-12">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-semibold">You May Also Like</h2>
              <p className="text-xs text-[#575653] dark:text-[#A6A6A2] mt-0.5">
                Curated alternatives from {product.category_name} and {product.brand}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.related_products.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                isWishlisted={wishlistIds.includes(rel.id)}
                onSelectProduct={onSelectProduct}
                onQuickView={onQuickView}
                onAddToCart={(p) => onAddToCart(p, 1)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </section>
      )}

      {/* RECENTLY VIEWED PRODUCTS */}
      {recentlyViewed.filter((p) => p.id !== product.id).length > 0 && (
        <section className="border-t border-black/[0.08] dark:border-white/[0.08] pt-12">
          <h2 className="font-display text-2xl font-semibold mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((rv) => (
                <ProductCard
                  key={rv.id}
                  product={rv}
                  isWishlisted={wishlistIds.includes(rv.id)}
                  onSelectProduct={onSelectProduct}
                  onQuickView={onQuickView}
                  onAddToCart={(p) => onAddToCart(p, 1)}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
          </div>
        </section>
      )}
    </div>
  );
};
