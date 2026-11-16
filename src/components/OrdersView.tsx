import { Package, ShieldCheck } from 'lucide-react';
import { formatConditionLabel, type Order } from '../types/store';
import { formatCurrency } from '../utils/payment';
import { BACKDROP_STYLES, ProductArtwork } from './ProductArtwork';

interface OrdersViewProps {
  orders: Order[];
  onBrowseCatalog: () => void;
}

export function OrdersView({ orders, onBrowseCatalog }: OrdersViewProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#8F1D1D]">Verified Purchases</p>
          <h2 className="font-editorial text-2xl sm:text-3xl font-medium text-[#1F1B18]">
            Order History
          </h2>
        </div>
        <p className="text-xs text-[#1F1B18]/60 tabular-nums">
          {orders.length} order{orders.length === 1 ? '' : 's'} recorded
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="p-10 sm:p-14 rounded-3xl bg-white border border-[#1F1B18]/8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EFE7DC] text-[#1F1B18] flex items-center justify-center mx-auto">
            <Package className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="font-editorial text-xl text-[#1F1B18]">No orders placed yet</h3>
          <p className="text-sm text-[#1F1B18]/60 max-w-md mx-auto">
            Completed purchases through our encrypted payment gateway appear here immediately with authorization receipts.
          </p>
          <button
            type="button"
            onClick={onBrowseCatalog}
            className="mt-2 px-6 py-2.5 rounded-full bg-[#1F1B18] text-[#FAF8F5] text-sm font-medium hover:bg-[#8F1D1D] transition-colors"
          >
            Browse Consoles &amp; Games
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="p-5 sm:p-6 rounded-3xl bg-white border border-[#1F1B18]/10 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1F1B18]/8">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-mono text-sm font-semibold text-[#1F1B18]">
                      {order.orderNumber}
                    </h3>
                    <span className="text-xs text-[#8F1D1D] font-medium">
                      Confirmed · Preparing Shipment
                    </span>
                  </div>
                  <p className="text-xs text-[#1F1B18]/55 mt-0.5 tabular-nums">
                    {new Date(order.createdAt).toLocaleString()} <span aria-hidden="true">·</span>{' '}
                    {order.shippingAddress.fullName} ({order.shippingAddress.city},{' '}
                    {order.shippingAddress.state})
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-[#1F1B18]/70">
                    <ShieldCheck className="w-4 h-4 text-[#8F1D1D]" aria-hidden="true" />
                    <span>
                      {order.payment.brand} •••• {order.payment.last4}
                    </span>
                  </div>
                  <span className="text-base font-semibold font-mono tabular-nums text-[#1F1B18]">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {order.items.map((item) => (
                  <div
                    key={`${order.id}-${item.productId}`}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FAF8F5]"
                  >
                    <div
                      className={`w-14 h-14 rounded-xl p-1.5 shrink-0 flex items-center justify-center ${BACKDROP_STYLES[item.backdrop]}`}
                    >
                      <ProductArtwork variant={item.artwork} className="w-full h-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#1F1B18] truncate">{item.title}</p>
                      <p className="text-xs text-[#1F1B18]/55">
                        {formatConditionLabel(item.condition)} · Qty {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-mono tabular-nums font-semibold text-[#1F1B18]">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#1F1B18]/55">
                <span>
                  Gateway Ref: {order.payment.paymentId} · Auth {order.payment.authorizationCode}
                </span>
                <span>
                  Subtotal {formatCurrency(order.subtotal)} · Shipping{' '}
                  {order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)} · Tax{' '}
                  {formatCurrency(order.tax)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
