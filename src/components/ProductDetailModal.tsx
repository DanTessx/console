import { useEffect, useState } from 'react';
import { Check, Heart, Minus, Plus, ShieldCheck, X } from 'lucide-react';
import { formatConditionLabel, type Product } from '../types/store';
import { formatCurrency } from '../utils/payment';
import { BACKDROP_STYLES, ProductArtwork } from './ProductArtwork';

interface ProductDetailModalProps {
  product: Product | null;
  isSaved: boolean;
  cartQuantity: number;
  onClose: () => void;
  onToggleSave: (productId: string) => void;
  onAddToBag: (product: Product, quantity: number) => void;
}

export function ProductDetailModal({
  product,
  isSaved,
  cartQuantity,
  onClose,
  onToggleSave,
  onAddToBag,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [product, onClose]);

  if (!product) return null;

  const remainingAvailable = Math.max(0, product.stock - cartQuantity);
  const outOfStock = remainingAvailable <= 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#1F1B18]/45 backdrop-blur-sm p-0 md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
    >
      <div
        className="w-full md:max-w-3xl bg-[#FAF8F5] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Sheet Grab Handle */}
        <div className="md:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-[#1F1B18]/20" aria-hidden="true" />
        </div>

        <div className="overflow-y-auto grid grid-cols-1 md:grid-cols-12">
          {/* Left Studio Gallery */}
          <div
            className={`md:col-span-6 p-8 flex flex-col justify-between min-h-[260px] md:min-h-[420px] relative ${BACKDROP_STYLES[product.backdrop]}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono opacity-75">{product.sku}</span>
              <button
                type="button"
                onClick={() => onToggleSave(product.id)}
                aria-label={isSaved ? 'Remove from saved' : 'Save item'}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/95 text-[#1F1B18] shadow-sm hover:scale-105 transition-transform"
              >
                <Heart
                  className={`w-4 h-4 ${isSaved ? 'text-[#8F1D1D]' : 'text-[#1F1B18]'}`}
                  fill={isSaved ? 'currentColor' : 'none'}
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="my-auto py-4 flex items-center justify-center">
              <ProductArtwork variant={product.artwork} className="w-52 h-52 sm:w-64 sm:h-64" />
            </div>

            <div className="text-xs opacity-75">
              {product.category === 'console' ? 'Hardware Unit' : 'Physical Edition'} <span aria-hidden="true">·</span>{' '}
              {product.platform}
            </div>
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-[#8F1D1D]">
                    {product.platform} <span aria-hidden="true">·</span> {formatConditionLabel(product.condition)}
                  </p>
                  <h2 id="pdp-title" className="font-editorial text-2xl sm:text-3xl font-medium text-[#1F1B18] leading-tight">
                    {product.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close product details"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full border border-[#1F1B18]/12 text-[#1F1B18] hover:bg-[#1F1B18]/5 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-semibold font-mono tabular-nums text-[#1F1B18]">
                  {formatCurrency(product.price)}
                </span>
                {product.msrp && product.msrp > product.price && (
                  <span className="text-sm font-mono tabular-nums text-[#1F1B18]/45 line-through">
                    {formatCurrency(product.msrp)}
                  </span>
                )}
                <span
                  className={`ml-auto text-xs font-medium tabular-nums ${
                    product.stock === 0
                      ? 'text-[#8F1D1D]'
                      : product.stock <= 2
                        ? 'text-[#8F1D1D]'
                        : 'text-[#1F1B18]/65'
                  }`}
                >
                  {product.stock === 0
                    ? 'Sold out'
                    : `${product.stock} in warehouse`}
                </span>
              </div>

              <p className="mt-4 text-sm text-[#1F1B18]/75 leading-relaxed">
                {product.summary}
              </p>

              {/* Inspection Checklist */}
              <div className="mt-6 pt-5 border-t border-[#1F1B18]/10">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1F1B18] mb-3">
                  <ShieldCheck className="w-4 h-4 text-[#8F1D1D]" aria-hidden="true" />
                  <span>
                    {product.condition === 'new'
                      ? 'Authenticity & Seal Verification'
                      : 'Bench-Test & Grading Report'}
                  </span>
                </div>
                <ul className="space-y-2">
                  {product.inspectionNotes.map((note) => (
                    <li key={note} className="flex items-start gap-2.5 text-xs text-[#1F1B18]/75">
                      <Check className="w-3.5 h-3.5 text-[#8F1D1D] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Purchase Actions */}
            <div className="pt-4 border-t border-[#1F1B18]/10 space-y-3">
              {cartQuantity > 0 && (
                <p className="text-xs text-[#1F1B18]/65 tabular-nums">
                  Currently in your bag: {cartQuantity} unit{cartQuantity > 1 ? 's' : ''}
                </p>
              )}

              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#1F1B18]/15 rounded-full bg-white h-11 px-1">
                  <button
                    type="button"
                    disabled={quantity <= 1 || outOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-9 h-9 flex items-center justify-center rounded-full text-[#1F1B18] disabled:opacity-35 hover:bg-[#1F1B18]/5"
                  >
                    <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <span className="w-8 text-center text-sm font-mono tabular-nums font-medium">
                    {outOfStock ? 0 : quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= remainingAvailable || outOfStock}
                    onClick={() => setQuantity((q) => Math.min(remainingAvailable, q + 1))}
                    aria-label="Increase quantity"
                    className="w-9 h-9 flex items-center justify-center rounded-full text-[#1F1B18] disabled:opacity-35 hover:bg-[#1F1B18]/5"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={() => {
                    onAddToBag(product, quantity);
                    onClose();
                  }}
                  className="flex-1 min-h-[44px] px-6 rounded-full bg-[#1F1B18] text-[#FAF8F5] text-sm font-semibold hover:bg-[#8F1D1D] disabled:bg-[#1F1B18]/25 disabled:cursor-not-allowed active:scale-[0.99] transition-all duration-150 whitespace-nowrap"
                >
                  {outOfStock
                    ? product.stock === 0
                      ? 'Out of Stock'
                      : 'Max Stock in Bag'
                    : `Add to Bag · ${formatCurrency(product.price * quantity)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
