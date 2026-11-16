import { useMemo, useState } from 'react';
import { Minus, Plus, Search, Trash2, X } from 'lucide-react';
import {
  formatConditionLabel,
  type ArtworkVariant,
  type BackdropTone,
  type InventoryLogEntry,
  type Platform,
  type Product,
  type ProductCategory,
  type ProductCondition,
} from '../types/store';
import { formatCurrency } from '../utils/payment';
import { BACKDROP_STYLES, ProductArtwork } from './ProductArtwork';

interface InventoryManagerViewProps {
  products: Product[];
  logs: InventoryLogEntry[];
  sseConnected: boolean;
  onAdjustStock: (productId: string, stockDelta: number) => Promise<void>;
  onUpdateProduct: (
    productId: string,
    patch: { price?: number; condition?: ProductCondition }
  ) => Promise<void>;
  onCreateProduct: (payload: Partial<Product>) => Promise<boolean>;
  onDeleteProduct: (productId: string) => Promise<void>;
}

const PLATFORMS: Platform[] = [
  'PlayStation 5',
  'PlayStation 4',
  'PlayStation 3',
  'PlayStation 2',
  'PlayStation 1',
  'PSP / PS Vita',
  'Xbox Series X',
  'Xbox One',
  'Xbox 360',
  'Original Xbox',
  'Nintendo Switch',
  'Wii U',
  'Nintendo Wii',
  'GameCube',
  'Nintendo 3DS / DS',
  'Game Boy Advance',
  'Sega Dreamcast',
  'Steam Deck',
  'Retro Handheld',
  'Nintendo 64',
];

const ARTWORKS: Array<{ value: ArtworkVariant; label: string }> = [
  { value: 'ps5-slim', label: 'PS5 Console' },
  { value: 'ps4-pro', label: 'PS4 Pro Console' },
  { value: 'ps3-slim', label: 'PS3 Slim Console' },
  { value: 'ps2-console', label: 'PlayStation 2' },
  { value: 'ps1-console', label: 'PlayStation 1' },
  { value: 'psp-vita', label: 'PSP / PS Vita' },
  { value: 'xbox-series-x', label: 'Xbox Series X' },
  { value: 'xbox-one-x', label: 'Xbox One X' },
  { value: 'xbox-360', label: 'Xbox 360 S' },
  { value: 'xbox-original', label: 'Original Xbox' },
  { value: 'switch-oled', label: 'Switch OLED' },
  { value: 'wii-u', label: 'Nintendo Wii U' },
  { value: 'wii-console', label: 'Nintendo Wii' },
  { value: 'gamecube', label: 'Nintendo GameCube' },
  { value: 'n3ds-ds', label: 'Nintendo 3DS / DS' },
  { value: 'gba-sp', label: 'Game Boy Advance SP' },
  { value: 'dreamcast', label: 'Sega Dreamcast' },
  { value: 'steam-deck', label: 'Steam Deck OLED' },
  { value: 'retro-pocket', label: 'Retro Handheld' },
  { value: 'dualsense-edge', label: 'Remote Player Kit' },
  { value: 'game-zelda-totk', label: 'Switch Adventure Case' },
  { value: 'game-elden-ring', label: 'PS5 Action Case' },
  { value: 'game-mario-odyssey', label: 'Red Spine Switch Case' },
  { value: 'game-gt7', label: 'Racing Edition Case' },
  { value: 'game-chrono-cib', label: 'Retro Cartridge' },
  { value: 'game-hollow-knight', label: 'Indie Physical Case' },
];

export function InventoryManagerView({
  products,
  logs,
  sseConnected,
  onAdjustStock,
  onUpdateProduct,
  onCreateProduct,
  onDeleteProduct,
}: InventoryManagerViewProps) {
  const [query, setQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Add New Listing form state
  const [newTitle, setNewTitle] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('console');
  const [newCondition, setNewCondition] = useState<ProductCondition>('used-mint');
  const [newPlatform, setNewPlatform] = useState<Platform>('PlayStation 5');
  const [newPrice, setNewPrice] = useState('299.00');
  const [newStock, setNewStock] = useState('3');
  const [newBackdrop, setNewBackdrop] = useState<BackdropTone>('clay');
  const [newArtwork, setNewArtwork] = useState<ArtworkVariant>('ps5-slim');
  const [newSummary, setNewSummary] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockCount = products.filter((p) => p.stock <= 2).length;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    return {
      totalSkus: products.length,
      totalUnits,
      lowStockCount,
      totalValue,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.platform.toLowerCase().includes(q)
    );
  }, [products, query]);

  const handleStockStep = async (productId: string, delta: number) => {
    setBusyId(productId);
    await onAdjustStock(productId, delta);
    setBusyId(null);
  };

  const handleSavePrice = async (productId: string) => {
    const parsed = Number.parseFloat(priceDraft);
    if (Number.isFinite(parsed) && parsed > 0) {
      setBusyId(productId);
      await onUpdateProduct(productId, { price: parsed });
      setBusyId(null);
    }
    setEditingPriceId(null);
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsedPrice = Number.parseFloat(newPrice);
    const parsedStock = Number.parseInt(newStock, 10);
    if (!newTitle.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setFormError('Please provide a product title and positive price.');
      return;
    }

    const ok = await onCreateProduct({
      title: newTitle.trim(),
      sku: newSku.trim() || undefined,
      category: newCategory,
      condition: newCondition,
      platform: newPlatform,
      price: parsedPrice,
      stock: Number.isFinite(parsedStock) ? Math.max(0, parsedStock) : 1,
      backdrop: newBackdrop,
      artwork: newArtwork,
      summary: newSummary.trim() || undefined,
      featured: true,
    });

    if (ok) {
      setShowAddModal(false);
      setNewTitle('');
      setNewSku('');
      setNewSummary('');
    } else {
      setFormError('Unable to create listing. Check input values.');
    }
  };

  return (
    <section className="space-y-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                sseConnected ? 'bg-emerald-600' : 'bg-amber-600'
              }`}
              aria-hidden="true"
            />
            <span className="text-[#1F1B18]/70">
              {sseConnected
                ? 'Live SSE Warehouse Sync Active'
                : 'Reconnecting to Live Warehouse Stream...'}
            </span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-medium text-[#1F1B18]">
            Real-Time Inventory Control
          </h2>
          <p className="text-sm text-[#1F1B18]/65">
            Adjust stock levels, update trade-in grades, or intake consoles &amp; games — updates push instantaneously to every storefront session.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#1F1B18] text-[#FAF8F5] text-sm font-medium hover:bg-[#8F1D1D] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Listing</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1F1B18]/10">
          <p className="text-xs text-[#1F1B18]/60">Active Listings</p>
          <p className="mt-1 text-2xl font-semibold font-mono tabular-nums text-[#1F1B18]">
            {metrics.totalSkus}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1F1B18]/10">
          <p className="text-xs text-[#1F1B18]/60">Total Units Ready</p>
          <p className="mt-1 text-2xl font-semibold font-mono tabular-nums text-[#1F1B18]">
            {metrics.totalUnits}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1F1B18]/10">
          <p className="text-xs text-[#1F1B18]/60">Low / Out of Stock</p>
          <p className="mt-1 text-2xl font-semibold font-mono tabular-nums text-[#8F1D1D]">
            {metrics.lowStockCount}
          </p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1F1B18]/10">
          <p className="text-xs text-[#1F1B18]/60">Warehouse Value</p>
          <p className="mt-1 text-2xl font-semibold font-mono tabular-nums text-[#1F1B18]">
            {formatCurrency(metrics.totalValue)}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search
          className="w-4 h-4 text-[#1F1B18]/45 absolute left-3.5 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Filter by title, SKU, or platform..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#1F1B18]/12 text-sm text-[#1F1B18] placeholder:text-[#1F1B18]/45 focus:outline-none focus:border-[#8F1D1D]"
        />
      </div>

      {/* Main Split: Inventory Ledger + Live Audit Stream */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Inventory Table / Mobile List */}
        <div className="xl:col-span-8 rounded-3xl bg-white border border-[#1F1B18]/10 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1F1B18]/10 text-[11px] font-medium text-[#1F1B18]/55">
                  <th className="py-3.5 px-5">Product &amp; SKU</th>
                  <th className="py-3.5 px-3">Condition</th>
                  <th className="py-3.5 px-3">Price</th>
                  <th className="py-3.5 px-3">Live Stock</th>
                  <th className="py-3.5 px-5 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1B18]/8 text-sm">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#FAF8F5]/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl p-1.5 shrink-0 flex items-center justify-center ${BACKDROP_STYLES[product.backdrop]}`}
                        >
                          <ProductArtwork variant={product.artwork} className="w-full h-full" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1F1B18] truncate max-w-[240px]">
                            {product.title}
                          </p>
                          <p className="text-xs text-[#1F1B18]/55 font-mono">
                            {product.sku} · {product.platform}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <select
                        aria-label={`Condition for ${product.title}`}
                        value={product.condition}
                        disabled={busyId === product.id}
                        onChange={(e) =>
                          onUpdateProduct(product.id, {
                            condition: e.target.value as ProductCondition,
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#1F1B18]/10 text-xs font-medium text-[#1F1B18] focus:outline-none focus:border-[#8F1D1D]"
                      >
                        <option value="new">New Sealed</option>
                        <option value="used-mint">Used · Mint</option>
                        <option value="used-good">Used · Tested</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-3">
                      {editingPriceId === product.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="1"
                            value={priceDraft}
                            onChange={(e) => setPriceDraft(e.target.value)}
                            onBlur={() => handleSavePrice(product.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSavePrice(product.id);
                              if (e.key === 'Escape') setEditingPriceId(null);
                            }}
                            autoFocus
                            className="w-24 px-2 py-1 rounded-lg border border-[#8F1D1D] text-xs font-mono tabular-nums"
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPriceId(product.id);
                            setPriceDraft(product.price.toFixed(2));
                          }}
                          title="Click to edit price"
                          className="font-mono tabular-nums font-medium text-[#1F1B18] hover:text-[#8F1D1D] underline decoration-dotted underline-offset-4"
                        >
                          {formatCurrency(product.price)}
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="inline-flex items-center gap-1.5 border border-[#1F1B18]/12 rounded-full px-1.5 py-1 bg-[#FAF8F5]">
                        <button
                          type="button"
                          disabled={product.stock <= 0 || busyId === product.id}
                          onClick={() => handleStockStep(product.id, -1)}
                          aria-label={`Decrease stock for ${product.title}`}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white disabled:opacity-30"
                        >
                          <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <span
                          className={`w-8 text-center font-mono tabular-nums text-xs font-semibold ${
                            product.stock <= 2 ? 'text-[#8F1D1D]' : 'text-[#1F1B18]'
                          }`}
                        >
                          {product.stock}
                        </span>
                        <button
                          type="button"
                          disabled={busyId === product.id}
                          onClick={() => handleStockStep(product.id, 1)}
                          aria-label={`Increase stock for ${product.title}`}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(product.id)}
                        aria-label={`Delete ${product.title}`}
                        className="p-2 rounded-lg text-[#1F1B18]/45 hover:text-[#8F1D1D] hover:bg-[#8F1D1D]/8 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-[#1F1B18]/8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl p-1.5 shrink-0 flex items-center justify-center ${BACKDROP_STYLES[product.backdrop]}`}
                  >
                    <ProductArtwork variant={product.artwork} className="w-full h-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1F1B18] truncate">{product.title}</p>
                    <p className="text-xs text-[#1F1B18]/55">
                      {product.sku} · {formatConditionLabel(product.condition)}
                    </p>
                  </div>
                  <span className="font-mono tabular-nums text-sm font-semibold">
                    {formatCurrency(product.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 border border-[#1F1B18]/12 rounded-full px-1.5 py-1 bg-[#FAF8F5]">
                    <button
                      type="button"
                      disabled={product.stock <= 0 || busyId === product.id}
                      onClick={() => handleStockStep(product.id, -1)}
                      aria-label={`Decrease stock for ${product.title}`}
                      className="min-h-[36px] min-w-[36px] rounded-full flex items-center justify-center hover:bg-white disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <span className="w-8 text-center font-mono tabular-nums text-xs font-semibold">
                      {product.stock}
                    </span>
                    <button
                      type="button"
                      disabled={busyId === product.id}
                      onClick={() => handleStockStep(product.id, 1)}
                      aria-label={`Increase stock for ${product.title}`}
                      className="min-h-[36px] min-w-[36px] rounded-full flex items-center justify-center hover:bg-white disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteProduct(product.id)}
                    className="min-h-[40px] px-3 rounded-full text-xs text-[#8F1D1D] hover:bg-[#8F1D1D]/8"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Audit Stream */}
        <aside className="xl:col-span-4 rounded-3xl bg-white border border-[#1F1B18]/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1F1B18]">Live Inventory Ledger</h3>
            <span className="text-xs font-mono text-[#1F1B18]/50 tabular-nums">
              {logs.length} events
            </span>
          </div>

          <div className="divide-y divide-[#1F1B18]/8 max-h-[480px] overflow-y-auto pr-1">
            {logs.slice(0, 18).map((entry) => (
              <div key={entry.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-medium text-[#1F1B18] truncate">{entry.productTitle}</p>
                  <p className="text-[#1F1B18]/55 mt-0.5">
                    {entry.reason === 'sale'
                      ? 'Checkout Sale'
                      : entry.reason === 'intake'
                        ? 'New Intake'
                        : entry.reason === 'restock'
                          ? 'Warehouse Restock'
                          : 'Manual Adjustment'}{' '}
                    · {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
                <div className="text-right shrink-0 font-mono tabular-nums">
                  <span
                    className={`font-semibold ${
                      entry.delta < 0 ? 'text-[#8F1D1D]' : 'text-[#1F1B18]'
                    }`}
                  >
                    {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                  </span>
                  <p className="text-[11px] text-[#1F1B18]/50">Bal: {entry.newStock}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Add New Listing Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F1B18]/45 backdrop-blur-sm p-4"
          onClick={() => setShowAddModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Add new console or video game listing"
        >
          <div
            className="w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-white border-b border-[#1F1B18]/10 flex items-center justify-between">
              <h3 className="font-editorial text-xl font-medium text-[#1F1B18]">
                Intake Console or Game
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close modal"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full hover:bg-[#1F1B18]/5"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <p className="text-xs font-medium text-[#8F1D1D] bg-[#8F1D1D]/10 p-3 rounded-xl">
                  {formError}
                </p>
              )}

              <div>
                <label className="block text-xs font-medium text-[#1F1B18]/75 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PlayStation 5 Pro 2TB or Metroid Dread"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm focus:outline-none focus:border-[#8F1D1D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1F1B18]/75 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm focus:outline-none focus:border-[#8F1D1D]"
                  >
                    <option value="console">Console</option>
                    <option value="game">Video Game</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1F1B18]/75 mb-1">
                    Condition
                  </label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as ProductCondition)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm focus:outline-none focus:border-[#8F1D1D]"
                  >
                    <option value="new">New Sealed</option>
                    <option value="used-mint">Used · Mint</option>
                    <option value="used-good">Used · Tested</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1F1B18]/75 mb-1">
                    Platform
                  </label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as Platform)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm focus:outline-none focus:border-[#8F1D1D]"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1F1B18]/75 mb-1">
                    SKU (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm font-mono focus:outline-none focus:border-[#8F1D1D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1F1B18]/75 mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm font-mono tabular-nums focus:outline-none focus:border-[#8F1D1D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1F1B18]/75 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm font-mono tabular-nums focus:outline-none focus:border-[#8F1D1D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1F1B18]/75 mb-1">
                    Studio Backdrop
                  </label>
                  <select
                    value={newBackdrop}
                    onChange={(e) => setNewBackdrop(e.target.value as BackdropTone)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm focus:outline-none focus:border-[#8F1D1D]"
                  >
                    <option value="crimson">Crimson Lacquer</option>
                    <option value="clay">Warm Clay</option>
                    <option value="mist">Slate Mist</option>
                    <option value="sand">Pale Sand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1F1B18]/75 mb-1">
                    Hardware Artwork
                  </label>
                  <select
                    value={newArtwork}
                    onChange={(e) => setNewArtwork(e.target.value as ArtworkVariant)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm focus:outline-none focus:border-[#8F1D1D]"
                  >
                    {ARTWORKS.map((art) => (
                      <option key={art.value} value={art.value}>
                        {art.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1F1B18]/75 mb-1">
                  Inspection Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Condition notes, included cables, or seal verification..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm focus:outline-none focus:border-[#8F1D1D]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="min-h-[44px] px-5 rounded-full border border-[#1F1B18]/15 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 rounded-full bg-[#8F1D1D] text-white text-sm font-semibold hover:bg-[#741616]"
                >
                  Publish Live Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
