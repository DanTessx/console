import { ArrowRight } from 'lucide-react';
import { ProductArtwork } from './ProductArtwork';

interface HeroBannerProps {
  totalUnits: number;
  onExploreCatalog: () => void;
  onOpenInventory: () => void;
}

export function HeroBanner({
  totalUnits,
  onExploreCatalog,
  onOpenInventory,
}: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#1F1B18] text-[#FAF8F5]">
      {/* Subtle crimson radial studio accent inspired by the attached showcase card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -bottom-16 w-72 h-72 md:w-[440px] md:h-[440px] rounded-full bg-[#8F1D1D] opacity-90 blur-[2px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-10 top-8 w-44 h-44 rounded-full bg-[#B9382C]/25 blur-2xl"
      />

      <div className="relative grid grid-cols-1 md:grid-cols-12 items-stretch">
        <div className="md:col-span-7 p-6 sm:p-8 lg:p-12 flex flex-col justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <p className="text-xs font-medium tracking-wide text-[#FAF8F5]/70">
              Verified Pre-Owned &amp; Factory Sealed · <span className="tabular-nums">{totalUnits}</span> Units Ready
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] text-balance text-[#FAF8F5]">
              Curated consoles &amp; physical classics
            </h1>
            <p className="text-sm sm:text-base text-[#FAF8F5]/75 leading-relaxed max-w-lg">
              Bench-tested hardware and sealed editions with live warehouse stock sync and encrypted checkout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onExploreCatalog}
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#FAF8F5] text-[#1F1B18] text-sm font-semibold hover:bg-[#EFE7DC] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF8F5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F1B18]"
            >
              Start exploring
            </button>
            <button
              type="button"
              onClick={onOpenInventory}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-2 text-sm font-medium text-[#FAF8F5]/85 hover:text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF8F5] rounded-md"
            >
              <span>Manage live stock</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="md:col-span-5 relative flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[190px] md:min-h-[280px]">
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64 transform md:translate-x-2">
            <ProductArtwork variant="retro-pocket" className="w-full h-full drop-shadow-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
