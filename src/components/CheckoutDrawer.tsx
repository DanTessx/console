import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
  X,
} from 'lucide-react';
import {
  formatConditionLabel,
  type CartItem,
  type Order,
  type PaymentIntent,
  type PaymentToken,
  type Product,
  type ShippingAddress,
} from '../types/store';
import {
  detectCardBrand,
  formatCardNumber,
  formatCurrency,
  formatExpiry,
  luhnCheck,
  validateExpiry,
} from '../utils/payment';
import { BACKDROP_STYLES, ProductArtwork } from './ProductArtwork';

interface CheckoutDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  products: Product[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onOrderConfirmed: (order: Order) => void;
  onViewOrders: () => void;
}

type CheckoutStep = 'bag' | 'payment' | 'receipt';

export function CheckoutDrawer({
  isOpen,
  cart,
  products,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onOrderConfirmed,
  onViewOrders,
}: CheckoutDrawerProps) {
  const [step, setStep] = useState<CheckoutStep>('bag');
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Shipping & Payment form state
  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'express-wallet'>('card');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [threeDSCode, setThreeDSCode] = useState('402819');

  const resolvedItems = useMemo(() => {
    return cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product ? { product, quantity: item.quantity } : null;
      })
      .filter((entry): entry is { product: Product; quantity: number } => entry !== null);
  }, [cart, products]);

  const bagSummary = useMemo(() => {
    const subtotal =
      Math.round(
        resolvedItems.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0) * 100
      ) / 100;
    const shippingCost = subtotal >= 150 || subtotal === 0 ? 0 : 8.5;
    const tax = Math.round(subtotal * 0.0825 * 100) / 100;
    const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;
    return { subtotal, shippingCost, tax, total };
  }, [resolvedItems]);

  const hasStockConflict = resolvedItems.some(
    (entry) => entry.product.stock < entry.quantity || entry.product.stock === 0
  );

  const detectedBrand = useMemo(() => {
    const digits = cardNumber.replace(/\D/g, '');
    return digits.length > 0 ? detectCardBrand(digits) : 'Visa';
  }, [cardNumber]);

  if (!isOpen) return null;

  const handleClose = () => {
    setErrorMsg(null);
    if (step === 'receipt') {
      setStep('bag');
      setConfirmedOrder(null);
      setIntent(null);
    }
    onClose();
  };

  const handleCreateIntent = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: resolvedItems.map((entry) => ({
            productId: entry.product.id,
            quantity: entry.quantity,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || 'Could not verify live stock for checkout.');
        return;
      }
      setIntent(data as PaymentIntent);
      setIdempotencyKey(`idem_${crypto.randomUUID()}`);
      setStep('payment');
    } catch {
      setErrorMsg('Network error reaching payment gateway. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillTestCard = () => {
    setPaymentMethod('card');
    setCardholderName(shipping.fullName || 'Nicky Mercer');
    setCardNumber('4242 4242 4242 4242');
    setExpiry('08/29');
    setCvc('424');
    if (!shipping.fullName) {
      setShipping({
        fullName: 'Nicky Mercer',
        email: 'nicky.mercer@example.com',
        street: '742 Evergreen Terrace',
        city: 'Portland',
        state: 'OR',
        postalCode: '97205',
      });
    }
    setErrorMsg(null);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent) return;
    setErrorMsg(null);

    if (
      !shipping.fullName.trim() ||
      !shipping.email.includes('@') ||
      !shipping.street.trim() ||
      !shipping.city.trim() ||
      !shipping.state.trim() ||
      shipping.postalCode.trim().length < 4
    ) {
      setErrorMsg('Please complete all shipping address fields.');
      return;
    }

    let token: PaymentToken;
    if (paymentMethod === 'card') {
      const digits = cardNumber.replace(/\D/g, '');
      if (!cardholderName.trim()) {
        setErrorMsg('Enter the cardholder name as shown on the card.');
        return;
      }
      if (!luhnCheck(digits)) {
        setErrorMsg('Card number failed Luhn security check. Verify digits or use Test Visa.');
        return;
      }
      if (!validateExpiry(expiry)) {
        setErrorMsg('Enter a valid future expiration date (MM/YY).');
        return;
      }
      if (!/^\d{3,4}$/.test(cvc.trim())) {
        setErrorMsg('Enter a valid 3 or 4 digit security code (CVC).');
        return;
      }
      const [expMonth, expYear] = expiry.split('/');
      token = {
        tokenId: `tok_${crypto.randomUUID().slice(0, 12)}`,
        method: 'card',
        brand: detectedBrand,
        last4: digits.slice(-4),
        expMonth,
        expYear,
        cardholderName: cardholderName.trim(),
      };
    } else {
      token = {
        tokenId: `tok_exp_${crypto.randomUUID().slice(0, 10)}`,
        method: 'express-wallet',
        brand: 'Express Pay',
        last4: '8812',
        expMonth: '12',
        expYear: '29',
        cardholderName: shipping.fullName.trim(),
      };
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          intentId: intent.intentId,
          clientSecret: intent.clientSecret,
          paymentToken: token,
          shippingAddress: shipping,
          threeDSecureCode: intent.requires3DS ? threeDSCode : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || 'Payment authorization declined.');
        return;
      }
      const confirmed = data.order as Order;
      setConfirmedOrder(confirmed);
      onOrderConfirmed(confirmed);
      setStep('receipt');
    } catch {
      setErrorMsg('Gateway communication error. No charge was captured.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#1F1B18]/45 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag and secure checkout"
    >
      <div
        className="w-full max-w-lg bg-[#FAF8F5] h-full shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#1F1B18]/10 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {step === 'payment' && (
              <button
                type="button"
                onClick={() => {
                  setStep('bag');
                  setErrorMsg(null);
                }}
                aria-label="Back to shopping bag"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full hover:bg-[#1F1B18]/5 text-[#1F1B18]"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            <div>
              <h2 className="font-editorial text-xl font-medium text-[#1F1B18]">
                {step === 'bag'
                  ? 'Your Shopping Bag'
                  : step === 'payment'
                    ? 'Encrypted Checkout'
                    : 'Order Confirmed'}
              </h2>
              <p className="text-xs text-[#1F1B18]/55">
                {step === 'bag'
                  ? `${resolvedItems.reduce((s, i) => s + i.quantity, 0)} item(s) · Live stock synced`
                  : step === 'payment'
                    ? 'Tokenized TLS gateway · Zero raw card storage'
                    : confirmedOrder?.orderNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close drawer"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-[#1F1B18]/5 text-[#1F1B18]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {errorMsg && (
            <div
              role="alert"
              className="mb-4 p-3.5 rounded-2xl bg-[#8F1D1D]/10 border border-[#8F1D1D]/25 text-[#8F1D1D] text-xs font-medium flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'bag' && (
            <>
              {resolvedItems.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <p className="font-editorial text-xl text-[#1F1B18]">Your bag is currently empty</p>
                  <p className="text-sm text-[#1F1B18]/60 max-w-xs mx-auto">
                    Browse factory-sealed consoles and bench-tested physical titles to get started.
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-2 px-6 py-2.5 rounded-full bg-[#1F1B18] text-[#FAF8F5] text-sm font-medium"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {resolvedItems.map(({ product, quantity }) => {
                    const overStock = quantity > product.stock;
                    return (
                      <div
                        key={product.id}
                        className="p-3.5 rounded-2xl bg-white border border-[#1F1B18]/8 flex gap-3.5"
                      >
                        <div
                          className={`w-20 h-20 rounded-xl p-2 shrink-0 flex items-center justify-center ${BACKDROP_STYLES[product.backdrop]}`}
                        >
                          <ProductArtwork variant={product.artwork} className="w-full h-full" />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] text-[#1F1B18]/55 truncate">
                                {product.platform} · {formatConditionLabel(product.condition)}
                              </p>
                              <h3 className="text-sm font-semibold text-[#1F1B18] truncate">
                                {product.title}
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(product.id)}
                              aria-label={`Remove ${product.title}`}
                              className="p-1.5 rounded-lg text-[#1F1B18]/45 hover:text-[#8F1D1D] hover:bg-[#8F1D1D]/8 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center border border-[#1F1B18]/12 rounded-full h-8 px-1">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                                aria-label="Decrease quantity"
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#1F1B18]/5"
                              >
                                <Minus className="w-3 h-3" aria-hidden="true" />
                              </button>
                              <span className="w-6 text-center text-xs font-mono tabular-nums font-medium">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                disabled={quantity >= product.stock}
                                onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                                aria-label="Increase quantity"
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#1F1B18]/5 disabled:opacity-35"
                              >
                                <Plus className="w-3 h-3" aria-hidden="true" />
                              </button>
                            </div>

                            <span className="text-sm font-semibold font-mono tabular-nums text-[#1F1B18]">
                              {formatCurrency(product.price * quantity)}
                            </span>
                          </div>

                          {overStock && (
                            <p className="mt-1.5 text-[11px] font-medium text-[#8F1D1D]">
                              {product.stock === 0
                                ? 'Sold out in live warehouse — remove to continue'
                                : `Live stock dropped to ${product.stock} — reduce quantity`}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {step === 'payment' && intent && (
            <form id="checkout-payment-form" onSubmit={handleSubmitPayment} className="space-y-6">
              {/* Shipping Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1F1B18]">Shipping Destination</h3>
                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    className="text-xs font-medium text-[#8F1D1D] hover:underline"
                  >
                    Fill Test Visa &amp; Address
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                    className="sm:col-span-2 w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm text-[#1F1B18] placeholder:text-[#1F1B18]/40 focus:outline-none focus:border-[#8F1D1D]"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Receipt email"
                    value={shipping.email}
                    onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                    className="sm:col-span-2 w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm text-[#1F1B18] placeholder:text-[#1F1B18]/40 focus:outline-none focus:border-[#8F1D1D]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street address"
                    value={shipping.street}
                    onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                    className="sm:col-span-2 w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm text-[#1F1B18] placeholder:text-[#1F1B18]/40 focus:outline-none focus:border-[#8F1D1D]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm text-[#1F1B18] placeholder:text-[#1F1B18]/40 focus:outline-none focus:border-[#8F1D1D]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm text-[#1F1B18] placeholder:text-[#1F1B18]/40 focus:outline-none focus:border-[#8F1D1D]"
                    />
                    <input
                      type="text"
                      required
                      placeholder="ZIP"
                      value={shipping.postalCode}
                      onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm font-mono text-[#1F1B18] placeholder:text-[#1F1B18]/40 focus:outline-none focus:border-[#8F1D1D]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Segmented Control */}
              <div className="space-y-3 pt-4 border-t border-[#1F1B18]/10">
                <h3 className="text-sm font-semibold text-[#1F1B18]">Payment Method</h3>
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#EFE7DC]">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                      paymentMethod === 'card'
                        ? 'bg-white text-[#1F1B18] shadow-sm'
                        : 'text-[#1F1B18]/65 hover:text-[#1F1B18]'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Card Payment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('express-wallet')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                      paymentMethod === 'express-wallet'
                        ? 'bg-white text-[#1F1B18] shadow-sm'
                        : 'text-[#1F1B18]/65 hover:text-[#1F1B18]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Express Pass</span>
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-3 pt-1">
                    <input
                      type="text"
                      placeholder="Cardholder name"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm text-[#1F1B18] placeholder:text-[#1F1B18]/40 focus:outline-none focus:border-[#8F1D1D]"
                    />
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Card number"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        className="w-full px-3.5 py-2.5 pr-24 rounded-xl bg-white border border-[#1F1B18]/12 text-sm font-mono tabular-nums text-[#1F1B18] placeholder:text-[#1F1B18]/40 focus:outline-none focus:border-[#8F1D1D]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#1F1B18]/55">
                        {detectedBrand}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm font-mono tabular-nums text-[#1F1B18] placeholder:text-[#1F1B18]/40 focus:outline-none focus:border-[#8F1D1D]"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="CVC"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1F1B18]/12 text-sm font-mono tabular-nums text-[#1F1B18] placeholder:text-[#1F1B18]/40 focus:outline-none focus:border-[#8F1D1D]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white border border-[#1F1B18]/10 text-xs text-[#1F1B18]/75 space-y-1.5">
                    <p className="font-semibold text-[#1F1B18]">Express Tokenized Pass</p>
                    <p>
                      Authorizes instantly via hardware-bound wallet token ending in{' '}
                      <span className="font-mono">8812</span>.
                    </p>
                  </div>
                )}

                {/* 3D Secure Challenge for orders >= $250 */}
                {intent.requires3DS && (
                  <div className="p-4 rounded-2xl bg-[#EFE7DC]/70 border border-[#1F1B18]/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#1F1B18]">
                      <ShieldCheck className="w-4 h-4 text-[#8F1D1D]" aria-hidden="true" />
                      <span>3D Secure Verification Required (Orders $250+)</span>
                    </div>
                    <p className="text-xs text-[#1F1B18]/70">
                      Enter the 6-digit issuer verification code (test code:{' '}
                      <span className="font-mono font-semibold text-[#1F1B18]">402819</span>; use{' '}
                      <span className="font-mono">000000</span> to simulate a decline).
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={threeDSCode}
                      onChange={(e) => setThreeDSCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      aria-label="3D Secure 6-digit code"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#1F1B18]/15 text-sm font-mono tracking-widest text-[#1F1B18] focus:outline-none focus:border-[#8F1D1D]"
                    />
                  </div>
                )}
              </div>
            </form>
          )}

          {step === 'receipt' && confirmedOrder && (
            <div className="space-y-6 py-2">
              <div className="p-5 rounded-2xl bg-white border border-[#1F1B18]/10 space-y-3">
                <div className="flex items-center gap-2.5 text-[#1F1B18]">
                  <CheckCircle2 className="w-6 h-6 text-[#8F1D1D]" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-[#1F1B18]/60">Payment Captured</p>
                    <h3 className="font-editorial text-xl font-medium">
                      {confirmedOrder.orderNumber} — Preparing Shipment
                    </h3>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1F1B18]/8 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-[#1F1B18]/55">Payment Method</p>
                    <p className="font-medium text-[#1F1B18] mt-0.5">
                      {confirmedOrder.payment.brand} •••• {confirmedOrder.payment.last4}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#1F1B18]/55">Auth Code</p>
                    <p className="font-mono font-medium text-[#1F1B18] mt-0.5">
                      {confirmedOrder.payment.authorizationCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#1F1B18]/55">Gateway Ref</p>
                    <p className="font-mono text-[#1F1B18] mt-0.5 truncate">
                      {confirmedOrder.payment.paymentId}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#1F1B18]/55">Security Check</p>
                    <p className="font-medium text-[#1F1B18] mt-0.5">
                      {confirmedOrder.payment.threeDSecureVerified
                        ? '3D Secure Verified'
                        : 'Tokenized TLS'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-[#1F1B18]/65">Items Purchased</h4>
                {confirmedOrder.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between py-2 border-b border-[#1F1B18]/8 text-sm"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-medium text-[#1F1B18] truncate">{item.title}</p>
                      <p className="text-xs text-[#1F1B18]/55">
                        Qty {item.quantity} · {formatConditionLabel(item.condition)}
                      </p>
                    </div>
                    <span className="font-mono tabular-nums font-medium text-[#1F1B18]">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-[#EFE7DC]/60 text-xs text-[#1F1B18]/75 space-y-1">
                <p className="font-semibold text-[#1F1B18]">Shipping To</p>
                <p>{confirmedOrder.shippingAddress.fullName}</p>
                <p>
                  {confirmedOrder.shippingAddress.street}, {confirmedOrder.shippingAddress.city},{' '}
                  {confirmedOrder.shippingAddress.state} {confirmedOrder.shippingAddress.postalCode}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-[#1F1B18]/10 bg-white space-y-3">
          {step === 'bag' && resolvedItems.length > 0 && (
            <>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#1F1B18]/65">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">{formatCurrency(bagSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#1F1B18]/65">
                  <span>Insured Shipping {bagSummary.shippingCost === 0 ? '(Free $150+)' : ''}</span>
                  <span className="font-mono tabular-nums">
                    {bagSummary.shippingCost === 0 ? 'Free' : formatCurrency(bagSummary.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-[#1F1B18]/65">
                  <span>Estimated Tax (8.25%)</span>
                  <span className="font-mono tabular-nums">{formatCurrency(bagSummary.tax)}</span>
                </div>
                <div className="pt-2 border-t border-[#1F1B18]/10 flex justify-between text-sm font-semibold text-[#1F1B18]">
                  <span>Total</span>
                  <span className="font-mono tabular-nums">{formatCurrency(bagSummary.total)}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isLoading || hasStockConflict}
                onClick={handleCreateIntent}
                className="w-full min-h-[46px] rounded-full bg-[#1F1B18] text-[#FAF8F5] text-sm font-semibold hover:bg-[#8F1D1D] disabled:bg-[#1F1B18]/25 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isLoading ? 'Verifying Live Stock...' : 'Proceed to Secure Checkout'}</span>
              </button>
            </>
          )}

          {step === 'payment' && intent && (
            <>
              <div className="flex justify-between items-baseline text-sm font-semibold text-[#1F1B18]">
                <span>Total Due</span>
                <span className="font-mono tabular-nums text-base">{formatCurrency(intent.total)}</span>
              </div>
              <button
                type="submit"
                form="checkout-payment-form"
                disabled={isLoading}
                className="w-full min-h-[46px] rounded-full bg-[#8F1D1D] text-white text-sm font-semibold hover:bg-[#741616] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {isLoading
                    ? 'Authorizing & Locking Stock...'
                    : `Authorize & Pay ${formatCurrency(intent.total)}`}
                </span>
              </button>
            </>
          )}

          {step === 'receipt' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="min-h-[44px] rounded-full border border-[#1F1B18]/15 text-sm font-medium text-[#1F1B18] hover:bg-[#1F1B18]/5"
              >
                Continue Shopping
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onViewOrders();
                }}
                className="min-h-[44px] rounded-full bg-[#1F1B18] text-[#FAF8F5] text-sm font-medium hover:bg-[#8F1D1D]"
              >
                View Orders
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
