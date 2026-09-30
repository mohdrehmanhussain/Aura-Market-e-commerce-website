import React from 'react';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import { Product, StudioImage, formatINR, getDiscountPercent } from '../types.ts';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, qty?: number) => void;
  onToggleWishlist: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onSelectProduct,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
}) => {
  const discountPct = getDiscountPercent(product.price, product.discount_price);
  const outOfStock = product.stock <= 0;

  return (
    <article className="group relative flex flex-col bg-[#F4F3EF]/70 dark:bg-[#1A1A1E] rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.07] transition-transform duration-200 ease-out hover:-translate-y-0.5">
      {/* Image Zone (68% of card height, solid neutral studio backdrop) */}
      <div
        onClick={() => onSelectProduct(product)}
        className="relative aspect-[4/3] w-full bg-[#F9F9F8] dark:bg-[#18181B] overflow-hidden cursor-pointer"
      >
        <StudioImage
          src={product.image}
          alt={product.name}
          fallbackLabel={product.name}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />

        {/* Subtle 1-text status label (no candy badge clusters) */}
        <div className="absolute top-3 left-3.5 flex items-center gap-2">
          {outOfStock ? (
            <span className="text-[11px] font-medium tracking-wide text-red-700 dark:text-red-400 bg-white/90 dark:bg-black/80 px-2 py-0.5 rounded">
              Currently Unavailable
            </span>
          ) : product.tag ? (
            <span className="text-[11px] font-medium tracking-wide text-[#141413] dark:text-[#F5F5F3] bg-white/90 dark:bg-[#18181B]/90 px-2 py-0.5 rounded">
              {product.tag}
            </span>
          ) : null}
        </div>

        {/* Wishlist Heart Affordance */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className="absolute top-3 right-3.5 w-9 h-9 rounded-full bg-white/90 dark:bg-[#18181B]/90 flex items-center justify-center text-[#141413] dark:text-[#F5F5F3] transition-transform duration-150 hover:scale-105 cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 ${
              isWishlisted ? 'fill-[#9A3412] text-[#9A3412] dark:fill-[#EA580C] dark:text-[#EA580C]' : ''
            }`}
          />
        </button>

        {/* Hover Action Bar: Quick View & Add to Cart */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
        >
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => onAddToCart(product, 1)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold whitespace-nowrap disabled:opacity-40 cursor-pointer hover:opacity-95 transition-opacity"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>{outOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
          <button
            type="button"
            onClick={() => onQuickView(product)}
            title="Quick View"
            className="w-9 h-9 rounded-lg bg-white/95 dark:bg-[#222227]/95 text-[#141413] dark:text-[#F5F5F3] flex items-center justify-center hover:bg-white cursor-pointer shrink-0"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Zone: Strict Field Order & Unboxed Metadata */}
      <div className="flex flex-col flex-1 p-4 justify-between gap-2.5">
        <div>
          {/* Unboxed Metadata: Brand · Category · Rating */}
          <div className="flex items-center justify-between gap-2 text-[12px] text-[#575653] dark:text-[#A6A6A2]">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-medium text-[#141413] dark:text-[#F5F5F3] truncate">
                {product.brand}
              </span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{product.category_name}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0 tabular-nums">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="font-medium text-[#141413] dark:text-[#F5F5F3]">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-[#85847F]">({product.review_count})</span>
            </div>
          </div>

          {/* Product Name (16px SemiBold) */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="mt-1.5 text-[16px] font-semibold leading-snug text-[#141413] dark:text-[#F5F5F3] line-clamp-1 cursor-pointer hover:text-[#9A3412] dark:hover:text-[#EA580C] transition-colors"
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="mt-1 text-[13px] text-[#575653] dark:text-[#A6A6A2] line-clamp-1">
            {product.description}
          </p>
        </div>

        {/* Baseline-aligned Price Row with Tabular Numerals */}
        <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.06] flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2 font-mono-tabular">
            <span className="text-[15px] font-semibold text-[#141413] dark:text-[#F5F5F3]">
              {formatINR(product.discount_price)}
            </span>
            {discountPct > 0 && (
              <>
                <span className="text-[12px] text-[#85847F] line-through">
                  {formatINR(product.price)}
                </span>
                <span className="text-[12px] font-medium text-[#9A3412] dark:text-[#EA580C]">
                  {discountPct}% off
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={() => onAddToCart(product, 1)}
            className="md:hidden text-xs font-semibold text-[#9A3412] dark:text-[#EA580C] whitespace-nowrap disabled:opacity-40"
          >
            {outOfStock ? 'Unavailable' : '+ Add'}
          </button>
        </div>
      </div>
    </article>
  );
};
