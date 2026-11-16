import { Heart, Home, Package, Search, ShoppingBag, SlidersHorizontal } from 'lucide-react';

export type ActiveTab = 'catalog' | 'consoles' | 'games' | 'saved' | 'orders' | 'inventory';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  bagCount: number;
  savedCount: number;
  onOpenBag: () => void;
  onFocusSearch: () => void;
}

export function Header({
  activeTab,
  onSelectTab,
  bagCount,
  savedCount,
  onOpenBag,
  onFocusSearch,
}: HeaderProps) {
  const navItems: Array<{ id: ActiveTab; label: string }> = [
    { id: 'catalog', label: 'Catalog' },
    { id: 'consoles', label: 'Consoles' },
    { id: 'games', label: 'Games' },
    { id: 'orders', label: 'Orders' },
    { id: 'inventory', label: 'Inventory' },
  ];

  return (
    <>
      {/* Desktop 3-Zone Top Bar */}
      <header className="hidden md:block sticky top-0 z-30 bg-[#FAF8F5]/92 backdrop-blur-md border-b border-[#1F1B18]/8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => onSelectTab('catalog')}
            className="font-editorial text-xl font-semibold tracking-tight text-[#1F1B18] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8F1D1D] rounded-md"
          >
            Cartridge &amp; Console
          </button>

          <nav className="flex items-center gap-7" aria-label="Primary navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-1 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8F1D1D] rounded-sm ${
                    isActive
                      ? 'text-[#8F1D1D]'
                      : 'text-[#1F1B18]/70 hover:text-[#1F1B18]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-[#8F1D1D] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenBag}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F1B18] text-[#FAF8F5] text-xs font-medium hover:bg-[#342E2A] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8F1D1D] focus-visible:ring-offset-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Bag</span>
              <span className="tabular-nums font-mono text-[11px] opacity-90">({bagCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Compact Header */}
      <header className="md:hidden sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#1F1B18]/8">
        <div className="px-4 h-14 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onSelectTab('catalog')}
            className="text-left focus-visible:outline-none"
          >
            <span className="font-editorial text-lg font-semibold tracking-tight text-[#1F1B18] whitespace-nowrap block">
              Cartridge &amp; Console
            </span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onFocusSearch}
              aria-label="Search catalog"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-white border border-[#1F1B18]/10 text-[#1F1B18] active:scale-95 transition-transform"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onOpenBag}
              aria-label={`Open shopping bag, ${bagCount} items`}
              className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-white border border-[#1F1B18]/10 text-[#1F1B18] active:scale-95 transition-transform"
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              {bagCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#8F1D1D] text-white text-[10px] font-mono font-semibold tabular-nums flex items-center justify-center">
                  {bagCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Thumb-Zone Navigation */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#1F1B18]/10"
      >
        <div className="grid grid-cols-5 h-[60px] items-center px-1">
          <button
            type="button"
            onClick={() => onSelectTab('catalog')}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'catalog' || activeTab === 'consoles' || activeTab === 'games'
                ? 'text-[#8F1D1D]'
                : 'text-[#1F1B18]/55'
            }`}
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px] font-medium whitespace-nowrap">Shop</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('saved')}
            className={`relative min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'saved' ? 'text-[#8F1D1D]' : 'text-[#1F1B18]/55'
            }`}
          >
            <Heart className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px] font-medium whitespace-nowrap">
              Saved{savedCount > 0 ? ` (${savedCount})` : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenBag}
            className="relative min-h-[44px] flex flex-col items-center justify-center gap-1 text-[#1F1B18]/75"
          >
            <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px] font-medium whitespace-nowrap">
              Bag{bagCount > 0 ? ` (${bagCount})` : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('orders')}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'orders' ? 'text-[#8F1D1D]' : 'text-[#1F1B18]/55'
            }`}
          >
            <Package className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px] font-medium whitespace-nowrap">Orders</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('inventory')}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'inventory' ? 'text-[#8F1D1D]' : 'text-[#1F1B18]/55'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px] font-medium whitespace-nowrap">Stock</span>
          </button>
        </div>
      </nav>
    </>
  );
}
