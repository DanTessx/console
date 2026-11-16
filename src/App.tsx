import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Search, ShieldCheck, X } from 'lucide-react';
import { CheckoutDrawer } from './components/CheckoutDrawer';
import { Header, type ActiveTab } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { InventoryManagerView } from './components/InventoryManagerView';
import { OrdersView } from './components/OrdersView';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import type {
  CartItem,
  InventoryLogEntry,
  Order,
  Product,
  ProductCondition,
} from './types/store';

type ConditionFilter = 'all' | 'new' | 'used';
type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'stock-desc';

const STORAGE_CART_KEY = 'cc_shopping_bag_v1';
const STORAGE_SAVED_KEY = 'cc_saved_items_v1';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<InventoryLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CART_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_KEY);
      return raw ? (JSON.parse(raw) as string[]) : ['switch-oled-new', 'zelda-totk-new'];
    } catch {
      return [];
    }
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const catalogRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  }, []);

  // Persist cart and wishlist locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedIds]);

  // Initial fetch + real-time SSE synchronization
  useEffect(() => {
    let cancelled = false;

    fetch('/api/catalog')
      .then((res) => res.json())
      .then((data: { products?: Product[]; orders?: Order[]; logs?: InventoryLogEntry[] }) => {
        if (cancelled) return;
        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.orders)) setOrders(data.orders);
        if (Array.isArray(data.logs)) setLogs(data.logs);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    const source = new EventSource('/api/events');

    source.onopen = () => {
      if (!cancelled) setSseConnected(true);
    };

    source.onerror = () => {
      if (!cancelled) setSseConnected(false);
    };

    source.addEventListener('inventory:sync', (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as {
        products: Product[];
        orders: Order[];
        logs: InventoryLogEntry[];
      };
      if (cancelled) return;
      setProducts(payload.products);
      setOrders(payload.orders);
      setLogs(payload.logs);
      setSseConnected(true);
      setIsLoading(false);
    });

    source.addEventListener('inventory:updated', (event) => {
      const updated = JSON.parse((event as MessageEvent).data) as Product;
      if (cancelled) return;
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSelectedProduct((prev) => (prev && prev.id === updated.id ? updated : prev));
    });

    source.addEventListener('inventory:created', (event) => {
      const created = JSON.parse((event as MessageEvent).data) as Product;
      if (cancelled) return;
      setProducts((prev) => {
        if (prev.some((p) => p.id === created.id)) return prev;
        return [created, ...prev];
      });
    });

    source.addEventListener('inventory:deleted', (event) => {
      const { id } = JSON.parse((event as MessageEvent).data) as { id: string };
      if (cancelled) return;
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setCart((prev) => prev.filter((item) => item.productId !== id));
      setSelectedProduct((prev) => (prev && prev.id === id ? null : prev));
    });

    source.addEventListener('order:created', (event) => {
      const order = JSON.parse((event as MessageEvent).data) as Order;
      if (cancelled) return;
      setOrders((prev) => {
        if (prev.some((o) => o.id === order.id)) return prev;
        return [order, ...prev];
      });
    });

    source.addEventListener('log:added', (event) => {
      const entry = JSON.parse((event as MessageEvent).data) as InventoryLogEntry;
      if (cancelled) return;
      setLogs((prev) => {
        if (prev.some((l) => l.id === entry.id)) return prev;
        return [entry, ...prev].slice(0, 60);
      });
    });

    return () => {
      cancelled = true;
      source.close();
    };
  }, []);

  const totalUnitsAvailable = useMemo(
    () => products.reduce((sum, p) => sum + p.stock, 0),
    [products]
  );

  const bagCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const availablePlatforms = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.platform));
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      if (activeTab === 'consoles' && p.category !== 'console') return false;
      if (activeTab === 'games' && p.category !== 'game') return false;
      if (activeTab === 'saved' && !savedIds.includes(p.id)) return false;

      if (conditionFilter === 'new' && p.condition !== 'new') return false;
      if (conditionFilter === 'used' && p.condition === 'new') return false;

      if (platformFilter !== 'all' && p.platform !== platformFilter) return false;

      if (q) {
        const hay = `${p.title} ${p.platform} ${p.sku} ${p.summary}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'stock-desc') return b.stock - a.stock;
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.stock - a.stock;
    });
  }, [products, activeTab, savedIds, conditionFilter, platformFilter, searchQuery, sortBy]);

  const toggleSave = useCallback((productId: string) => {
    setSavedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const addToBag = useCallback(
    (product: Product, quantity = 1) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        const currentQty = existing ? existing.quantity : 0;
        const targetQty = Math.min(product.stock, currentQty + quantity);
        if (targetQty <= currentQty) {
          showToast(`Maximum available stock (${product.stock}) already in bag`);
          return prev;
        }
        showToast(`Added ${product.title} to bag`);
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id ? { ...i, quantity: targetQty } : i
          );
        }
        return [...prev, { productId: product.id, quantity: targetQty }];
      });
    },
    [showToast]
  );

  const updateCartQuantity = useCallback((productId: string, nextQty: number) => {
    if (nextQty <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: nextQty } : i))
    );
  }, []);

  const removeCartItem = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const handleOrderConfirmed = useCallback((order: Order) => {
    setCart([]);
    setOrders((prev) => (prev.some((o) => o.id === order.id) ? prev : [order, ...prev]));
  }, []);

  // Inventory manager API actions
  const handleAdjustStock = useCallback(
    async (productId: string, stockDelta: number) => {
      const res = await fetch(`/api/inventory/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockDelta }),
      });
      if (res.ok) {
        const data = (await res.json()) as { product: Product };
        setProducts((prev) =>
          prev.map((p) => (p.id === data.product.id ? data.product : p))
        );
      }
    },
    []
  );

  const handleUpdateProduct = useCallback(
    async (
      productId: string,
      patch: { price?: number; condition?: ProductCondition }
    ) => {
      const res = await fetch(`/api/inventory/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = (await res.json()) as { product: Product };
        setProducts((prev) =>
          prev.map((p) => (p.id === data.product.id ? data.product : p))
        );
        showToast(`Updated ${data.product.title}`);
      }
    },
    [showToast]
  );

  const handleCreateProduct = useCallback(
    async (payload: Partial<Product>): Promise<boolean> => {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { product: Product };
      setProducts((prev) =>
        prev.some((p) => p.id === data.product.id) ? prev : [data.product, ...prev]
      );
      showToast(`Published ${data.product.title}`);
      return true;
    },
    [showToast]
  );

  const handleDeleteProduct = useCallback(
    async (productId: string) => {
      const res = await fetch(`/api/inventory/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        showToast('Listing removed from warehouse');
      }
    },
    [showToast]
  );

  const isStorefrontTab =
    activeTab === 'catalog' ||
    activeTab === 'consoles' ||
    activeTab === 'games' ||
    activeTab === 'saved';

  const sectionHeading =
    activeTab === 'consoles'
      ? 'New & Pre-Owned Consoles'
      : activeTab === 'games'
        ? 'Physical Video Games'
        : activeTab === 'saved'
          ? 'Saved Favorites'
          : 'Featured Drops';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1F1B18] pb-20 md:pb-0">
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        bagCount={bagCount}
        savedCount={savedIds.length}
        onOpenBag={() => setIsBagOpen(true)}
        onFocusSearch={() => {
          setActiveTab('catalog');
          setShowMobileSearch(true);
          window.setTimeout(() => searchInputRef.current?.focus(), 60);
        }}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8 sm:space-y-10">
        {isStorefrontTab && (
          <>
            {activeTab === 'catalog' && (
              <HeroBanner
                totalUnits={totalUnitsAvailable}
                onExploreCatalog={() => {
                  catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenInventory={() => setActiveTab('inventory')}
              />
            )}

            <section ref={catalogRef} className="space-y-5">
              {/* Section Header echoing the reference image's "Local Favorites  View all >" */}
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-medium text-[#1F1B18]">
                    {sectionHeading}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#1F1B18]/60 mt-0.5 tabular-nums">
                    {filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'} ·{' '}
                    Live warehouse inventory
                  </p>
                </div>

                {activeTab !== 'catalog' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('catalog');
                      setConditionFilter('all');
                      setPlatformFilter('all');
                      setSearchQuery('');
                    }}
                    className="inline-flex items-center gap-0.5 text-xs sm:text-sm font-medium text-[#8F1D1D] hover:underline whitespace-nowrap shrink-0"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setConditionFilter('all');
                      setPlatformFilter('all');
                      setSearchQuery('');
                    }}
                    className="inline-flex items-center gap-0.5 text-xs sm:text-sm font-medium text-[#8F1D1D] hover:underline whitespace-nowrap shrink-0"
                  >
                    <span>Reset filters</span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Cross-Platform Filter & Search Toolbar */}
              <div
                className={`${
                  showMobileSearch ? 'flex' : 'hidden md:flex'
                } flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1`}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Category Tabs (quick toggle on mobile too) */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-[#EFE7DC]">
                    {(
                      [
                        { id: 'catalog', label: 'All' },
                        { id: 'consoles', label: 'Consoles' },
                        { id: 'games', label: 'Games' },
                      ] as const
                    ).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveTab(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                          activeTab === cat.id
                            ? 'bg-white text-[#1F1B18] shadow-sm'
                            : 'text-[#1F1B18]/65 hover:text-[#1F1B18]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Condition Segmented Control */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-[#EFE7DC]">
                    {(
                      [
                        { id: 'all', label: 'All Conditions' },
                        { id: 'new', label: 'New Sealed' },
                        { id: 'used', label: 'Used' },
                      ] as const
                    ).map((cond) => (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => setConditionFilter(cond.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                          conditionFilter === cond.id
                            ? 'bg-white text-[#1F1B18] shadow-sm'
                            : 'text-[#1F1B18]/65 hover:text-[#1F1B18]'
                        }`}
                      >
                        {cond.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                  <div className="relative flex-1 sm:w-60">
                    <Search
                      className="w-4 h-4 text-[#1F1B18]/45 absolute left-3.5 top-1/2 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <input
                      ref={searchInputRef}
                      type="search"
                      placeholder="Search console, game, SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 rounded-full bg-white border border-[#1F1B18]/12 text-xs sm:text-sm text-[#1F1B18] placeholder:text-[#1F1B18]/45 focus:outline-none focus:border-[#8F1D1D]"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1F1B18]/45 hover:text-[#1F1B18]"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <select
                    aria-label="Filter by platform"
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-full bg-white border border-[#1F1B18]/12 text-xs font-medium text-[#1F1B18] focus:outline-none focus:border-[#8F1D1D]"
                  >
                    <option value="all">All Platforms</option>
                    {availablePlatforms.map((plat) => (
                      <option key={plat} value={plat}>
                        {plat}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Sort products"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3.5 py-2 rounded-full bg-white border border-[#1F1B18]/12 text-xs font-medium text-[#1F1B18] focus:outline-none focus:border-[#8F1D1D]"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="stock-desc">Highest Stock</option>
                  </select>
                </div>
              </div>

              {/* Mobile quick condition strip when search is collapsed */}
              {!showMobileSearch && (
                <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1">
                  {(
                    [
                      { id: 'all', label: 'All' },
                      { id: 'new', label: 'New Sealed' },
                      { id: 'used', label: 'Used Tested' },
                    ] as const
                  ).map((cond) => (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => setConditionFilter(cond.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        conditionFilter === cond.id
                          ? 'bg-[#1F1B18] text-[#FAF8F5]'
                          : 'bg-white border border-[#1F1B18]/10 text-[#1F1B18]/75'
                      }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab((prev) => (prev === 'consoles' ? 'catalog' : 'consoles'))
                    }
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      activeTab === 'consoles'
                        ? 'bg-[#8F1D1D] text-white'
                        : 'bg-white border border-[#1F1B18]/10 text-[#1F1B18]/75'
                    }`}
                  >
                    Consoles
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab((prev) => (prev === 'games' ? 'catalog' : 'games'))
                    }
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      activeTab === 'games'
                        ? 'bg-[#8F1D1D] text-white'
                        : 'bg-white border border-[#1F1B18]/10 text-[#1F1B18]/75'
                    }`}
                  >
                    Games
                  </button>
                </div>
              )}

              {/* Product Grid: 2-col Mobile (matching reference) -> 3-col Tablet/Desktop -> 4-col Wide Desktop */}
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div key={idx} className="space-y-3 animate-pulse">
                      <div className="aspect-square rounded-2xl bg-[#EFE7DC]" />
                      <div className="h-3 w-24 rounded bg-[#EFE7DC]" />
                      <div className="h-4 w-3/4 rounded bg-[#EFE7DC]" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-10 rounded-3xl bg-white border border-[#1F1B18]/8 text-center space-y-2.5">
                  <p className="font-editorial text-xl text-[#1F1B18]">
                    {activeTab === 'saved'
                      ? 'No saved items yet'
                      : 'No matching consoles or games found'}
                  </p>
                  <p className="text-sm text-[#1F1B18]/60">
                    {activeTab === 'saved'
                      ? 'Tap the heart icon on any item to save it for later.'
                      : 'Try clearing your search or switching condition filters.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('catalog');
                      setConditionFilter('all');
                      setPlatformFilter('all');
                      setSearchQuery('');
                    }}
                    className="mt-2 px-5 py-2 rounded-full bg-[#1F1B18] text-[#FAF8F5] text-xs font-medium"
                  >
                    Show All Listings
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-8 lg:gap-x-7 lg:gap-y-9">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isSaved={savedIds.includes(product.id)}
                      onToggleSave={toggleSave}
                      onOpenDetail={setSelectedProduct}
                      onQuickAdd={(p) => addToBag(p, 1)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Concise Trust & Guarantee Strip */}
            <section className="pt-4 border-t border-[#1F1B18]/10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#1F1B18]">
                  24-Point Hardware Inspection
                </h3>
                <p className="text-xs text-[#1F1B18]/65 leading-relaxed">
                  Every pre-owned console undergoes thermal stress testing, drive calibration, and controller drift diagnostics before listing.
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#1F1B18]">
                  Live Warehouse Stock Lock
                </h3>
                <p className="text-xs text-[#1F1B18]/65 leading-relaxed">
                  Real-time server synchronization ensures accurate availability across mobile and desktop browsers during checkout.
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#8F1D1D]" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-[#1F1B18]">
                    Encrypted Gateway &amp; 180-Day Warranty
                  </h3>
                </div>
                <p className="text-xs text-[#1F1B18]/65 leading-relaxed">
                  Tokenized card checkout with 3D Secure verification and a 180-day protection guarantee on all used hardware.
                </p>
              </div>
            </section>
          </>
        )}

        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            onBrowseCatalog={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManagerView
            products={products}
            logs={logs}
            sseConnected={sseConnected}
            onAdjustStock={handleAdjustStock}
            onUpdateProduct={handleUpdateProduct}
            onCreateProduct={handleCreateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="hidden md:block border-t border-[#1F1B18]/10 mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex items-center justify-between text-xs text-[#1F1B18]/55">
          <span>Cartridge &amp; Console · Certified Hardware &amp; Physical Editions</span>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className="hover:text-[#1F1B18] transition-colors"
            >
              Order Lookup
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className="hover:text-[#1F1B18] transition-colors"
            >
              Warehouse Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isSaved={selectedProduct ? savedIds.includes(selectedProduct.id) : false}
        cartQuantity={
          selectedProduct
            ? cart.find((c) => c.productId === selectedProduct.id)?.quantity ?? 0
            : 0
        }
        onClose={() => setSelectedProduct(null)}
        onToggleSave={toggleSave}
        onAddToBag={addToBag}
      />

      {/* Slide-Over Bag & Secure Payment Gateway Drawer */}
      <CheckoutDrawer
        isOpen={isBagOpen}
        cart={cart}
        products={products}
        onClose={() => setIsBagOpen(false)}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeCartItem}
        onOrderConfirmed={handleOrderConfirmed}
        onViewOrders={() => setActiveTab('orders')}
      />

      {/* Subtle Action Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#1F1B18] text-[#FAF8F5] text-xs font-medium shadow-lg whitespace-nowrap"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
