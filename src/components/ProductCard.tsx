import { Heart, Plus } from 'lucide-react';
import { formatConditionLabel, type Product } from '../types/store';
import { formatCurrency } from '../utils/payment';
import { BACKDROP_STYLES, ProductArtwork } from './ProductArtwork';

interface ProductCardProps {
  product: Product;
  isSaved: boolean;
  onToggleSave: (productId: string) => void;
  onOpenDetail: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export function ProductCard({
  product,
  isSaved,
  onToggleSave,
  onOpenDetail,
  onQuickAdd,
}: ProductCardProps) {
  const outOfStock = product.stock <= 0;

  return (
    <article className="group flex flex-col">
      {/* Studio Backdrop Tile inspired by attached image */}
      <div
        className={`relative aspect-square rounded-2xl overflow-hidden transition-transform duration-200 ease-out group-hover:-translate-y-0.5 ${BACKDROP_STYLES[product.backdrop]}`}
      >
        <button
          type="button"
          onClick={() => onOpenDetail(product)}
          aria-label={`Inspect ${product.title}`}
          className="w-full h-full p-5 sm:p-7 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8F1D1D] focus-visible:ring-inset"
        >
          <ProductArtwork
            variant={product.artwork}
            className={`w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.03] ${
              outOfStock ? 'opacity-45 grayscale-[35%]' : ''
            }`}
          />
        </button>

        {/* Floating Circular Heart Button (top-right) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(product.id);
          }}
          aria-label={isSaved ? `Remove ${product.title} from saved` : `Save ${product.title}`}
          aria-pressed={isSaved}
          className="absolute top-2 right-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none"
        >
          <span
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all duration-150 ${
              isSaved
                ? 'bg-[#8F1D1D] text-white'
                : 'bg-white/95 text-[#1F1B18] hover:bg-white'
            }`}
          >
            <Heart
              className="w-4 h-4"
              fill={isSaved ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          </span>
        </button>

        {/* Quiet Out of Stock Scrim */}
        {outOfStock && (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl bg-[#1F1B18]/88 text-[#FAF8F5] py-1.5 px-3 text-center text-xs font-medium">
            Sold Out
          </div>
        )}
      </div>

      {/* Unboxed Editorial Metadata & Price */}
      <div className="pt-3 flex flex-col gap-1 flex-1 justify-between">
        <div>
          <p className="text-[12px] text-[#1F1B18]/60 truncate">
            {product.platform} <span aria-hidden="true">·</span> {formatConditionLabel(product.condition)}
          </p>
          <button
            type="button"
            onClick={() => onOpenDetail(product)}
            className="mt-0.5 text-left text-[15px] font-semibold text-[#1F1B18] leading-snug line-clamp-2 hover:text-[#8F1D1D] transition-colors focus-visible:outline-none focus-visible:underline"
          >
            {product.title}
          </button>
        </div>

        <div className="pt-1.5 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-[15px] font-semibold text-[#1F1B18] tabular-nums font-mono">
              {formatCurrency(product.price)}
            </span>
            <span
              className={`text-xs tabular-nums whitespace-nowrap ${
                outOfStock
                  ? 'text-[#8F1D1D] font-medium'
                  : product.stock <= 2
                    ? 'text-[#8F1D1D]'
                    : 'text-[#1F1B18]/50'
              }`}
            >
              {outOfStock ? '0 left' : `${product.stock} left`}
            </span>
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={() => onQuickAdd(product)}
            aria-label={`Add ${product.title} to bag`}
            className={`min-h-[36px] px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1 transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8F1D1D] ${
              outOfStock
                ? 'bg-[#1F1B18]/8 text-[#1F1B18]/35 cursor-not-allowed'
                : 'bg-[#1F1B18] text-[#FAF8F5] hover:bg-[#8F1D1D] active:scale-[0.97]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}
