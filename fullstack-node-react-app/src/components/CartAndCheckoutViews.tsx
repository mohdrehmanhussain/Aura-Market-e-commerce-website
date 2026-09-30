import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Tag,
  Trash2,
  Truck,
  Wallet,
} from 'lucide-react';
import {
  Address,
  CartSummary,
  Coupon,
  Order,
  PageRoute,
  Product,
  StudioImage,
  User,
  formatINR,
} from '../types.ts';

interface CartViewProps {
  cart: CartSummary;
  onUpdateQty: (productId: number, qty: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigate: (page: PageRoute) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onSelectProduct,
  onNavigate,
}) => {
  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F4F3EF] dark:bg-[#1A1A1E] flex items-center justify-center text-[#85847F]">
          <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold">Your cart is empty</h1>
          <p className="text-sm text-[#575653] dark:text-[#A6A6A2] mt-1.5">
            Explore our 30 studio-curated products across Electronics, Horology, Footwear, and Living.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('products')}
          className="px-6 py-3 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold cursor-pointer hover:opacity-90"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Shopping Cart</h1>
          <p className="text-xs text-[#575653] dark:text-[#A6A6A2] mt-1">
            {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'} in your bag · Live AJAX/Fetch synchronization
          </p>
        </div>
        <button
          type="button"
          onClick={onClearCart}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Itemized Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-[#85847F] border-b border-black/[0.06] dark:border-white/[0.07]">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {cart.items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 rounded-2xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E] border border-black/[0.06] dark:border-white/[0.07]"
            >
              <div className="sm:col-span-6 flex items-center gap-4">
                <div
                  onClick={() => onSelectProduct(item.product)}
                  className="w-20 h-20 rounded-xl overflow-hidden bg-white dark:bg-[#18181B] shrink-0 cursor-pointer"
                >
                  <StudioImage
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#575653] dark:text-[#A6A6A2]">
                    {item.product.brand} · {item.product.category_name}
                  </p>
                  <h3
                    onClick={() => onSelectProduct(item.product)}
                    className="text-sm font-semibold text-[#141413] dark:text-[#F5F5F3] truncate cursor-pointer hover:underline"
                  >
                    {item.product.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.product_id)}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs text-[#85847F] hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 flex items-center sm:justify-center">
                <div className="inline-flex items-center rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#222227]">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.product_id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-mono-tabular text-xs font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    disabled={item.quantity >= item.product.stock}
                    onClick={() => onUpdateQty(item.product_id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 sm:text-right font-mono-tabular text-xs">
                <span className="sm:hidden text-[#85847F] mr-2">Unit Price:</span>
                <span>{formatINR(item.unit_price)}</span>
                {item.original_price > item.unit_price && (
                  <span className="block text-[11px] text-[#85847F] line-through">
                    {formatINR(item.original_price)}
                  </span>
                )}
              </div>

              <div className="sm:col-span-2 sm:text-right font-mono-tabular text-sm font-semibold">
                <span className="sm:hidden text-[#85847F] mr-2 font-normal text-xs">Line Total:</span>
                {formatINR(item.line_total)}
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary Box */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 p-6 rounded-2xl bg-[#F4F3EF]/80 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] space-y-5">
          <h2 className="font-display text-2xl font-semibold">Order Summary</h2>

          <div className="space-y-3 text-sm border-y border-black/[0.07] dark:border-white/[0.08] py-4 font-mono-tabular">
            <div className="flex justify-between">
              <span className="font-sans text-[#575653] dark:text-[#A6A6A2]">Subtotal</span>
              <span>{formatINR(cart.subtotal)}</span>
            </div>
            {cart.product_savings > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                <span className="font-sans">Catalog Savings</span>
                <span>-{formatINR(cart.product_savings)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-sans text-[#575653] dark:text-[#A6A6A2]">Delivery Charges</span>
              <span>{cart.delivery_charge === 0 ? 'FREE' : formatINR(cart.delivery_charge)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-[#575653] dark:text-[#A6A6A2]">Estimated GST (5%)</span>
              <span>{formatINR(cart.tax)}</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between font-mono-tabular">
            <span className="font-sans text-base font-semibold">Total Amount</span>
            <span className="text-xl font-semibold">{formatINR(cart.total)}</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('checkout')}
            className="w-full py-3.5 px-5 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer transition-opacity"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-center text-[#85847F]">
            Have a promo code like SAVE10 or SAVE20? Apply it in Step 2 of Checkout.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MULTI-STEP CHECKOUT PAGE (Step 1: Address -> Step 2: Summary & Coupon -> Step 3: Payment -> Step 4: Place Order)
// ============================================================================
interface CheckoutViewProps {
  cart: CartSummary;
  user: User | null;
  token: string;
  addresses: Address[];
  coupons: Coupon[];
  onRefreshAddresses: () => void;
  onOrderSuccess: (order: Order) => void;
  onNavigate: (page: PageRoute) => void;
  onNotify: (title: string, type?: 'success' | 'error' | 'info') => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  user,
  token,
  addresses,
  coupons,
  onRefreshAddresses,
  onOrderSuccess,
  onNavigate,
  onNotify,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    addresses[0]?.id || null
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(addresses.length === 0);
  const [addressForm, setAddressForm] = useState({
    full_name: user ? `${user.first_name} ${user.last_name}`.trim() : 'Aarav Sharma',
    phone: user?.phone || '+91 98450 72190',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    country: 'India',
  });

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<
    'Cash on Delivery' | 'UPI' | 'Credit/Debit Card'
  >('UPI');
  const [upiId, setUpiId] = useState('aarav@okicici');
  const [cardDetails, setCardDetails] = useState({
    number: '4532 •••• •••• 8891',
    name: 'AARAV SHARMA',
    expiry: '09/29',
    cvv: '842',
  });
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
      setShowNewAddressForm(false);
    }
  }, [addresses]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display text-3xl font-semibold">Sign In Required for Checkout</h2>
        <p className="text-sm text-[#575653] dark:text-[#A6A6A2]">
          Please sign in to your customer account to select your delivery address and place your order.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="px-6 py-3 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold cursor-pointer"
        >
          Sign In to Continue
        </button>
      </div>
    );
  }

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.full_name || !addressForm.address || !addressForm.pincode) {
      onNotify('Please complete all required address fields.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/addresses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressForm),
      });
      if (!res.ok) throw new Error('Failed to save address');
      const created: Address = await res.json();
      onRefreshAddresses();
      setSelectedAddressId(created.id);
      setShowNewAddressForm(false);
      onNotify('Delivery address saved.', 'success');
    } catch {
      onNotify('Could not save address.', 'error');
    }
  };

  const handleApplyCoupon = async (codeToTry?: string) => {
    const code = (codeToTry ?? couponInput).trim().toUpperCase();
    if (!code) return;
    try {
      const res = await fetch('/api/coupons/validate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: cart.subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error || 'Invalid coupon', 'error');
        return;
      }
      setAppliedCoupon({ code: data.coupon.code, discount: data.discount_amount });
      setCouponInput(data.coupon.code);
      onNotify(data.message, 'success');
    } catch {
      onNotify('Error validating coupon code.', 'error');
    }
  };

  const activeAddress =
    addresses.find((a) => a.id === selectedAddressId) ||
    ({
      id: 0,
      user_id: user.id,
      ...addressForm,
    } as Address);

  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(
    0,
    cart.subtotal - couponDiscount + cart.delivery_charge + cart.tax
  );

  const handlePlaceOrder = async () => {
    if (!activeAddress || !activeAddress.address) {
      onNotify('Please select or add a delivery address first.', 'error');
      setStep(1);
      return;
    }
    setPlacingOrder(true);
    try {
      const res = await fetch('/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipping_address: activeAddress,
          payment_method: paymentMethod,
          coupon_code: appliedCoupon?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error || 'Could not place order', 'error');
        return;
      }
      onOrderSuccess(data);
    } catch {
      onNotify('Network error while placing order.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Secure Checkout</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold">
          {(
            [
              [1, '01. Delivery Address'],
              [2, '02. Order Summary & Coupons'],
              [3, '03. Payment & Place Order'],
            ] as const
          ).map(([s, label]) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                step === s
                  ? 'bg-[#141413] text-[#FBFBF9] dark:bg-[#F5F5F3] dark:text-[#121214]'
                  : 'bg-[#F4F3EF] dark:bg-[#1A1A1E] text-[#575653] dark:text-[#A6A6A2]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: SHIPPING ADDRESS */}
          <div className="p-6 rounded-2xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#9A3412] dark:text-[#EA580C]" />
                <h2 className="font-display text-xl font-semibold">Step 1 — Delivery Address</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowNewAddressForm((v) => !v)}
                className="text-xs font-semibold text-[#9A3412] dark:text-[#EA580C] hover:underline cursor-pointer"
              >
                {showNewAddressForm ? 'Select Saved Address' : '+ Add New Address'}
              </button>
            </div>

            {!showNewAddressForm && addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-[#141413] dark:border-[#F5F5F3] bg-white dark:bg-[#222227]'
                        : 'border-black/10 dark:border-white/10 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <p className="text-sm font-semibold">{addr.full_name}</p>
                    <p className="text-xs text-[#575653] dark:text-[#A6A6A2] mt-1 leading-relaxed">
                      {addr.address}, {addr.city}, {addr.state} — {addr.pincode}, {addr.country}
                    </p>
                    <p className="text-xs font-mono-tabular text-[#85847F] mt-2">
                      Phone: {addr.phone}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSaveNewAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#575653] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={addressForm.full_name}
                    onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/10 dark:border-white/10 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#575653] mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/10 dark:border-white/10 text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#575653] mb-1">Street Address / Flat / Landmark</label>
                  <input
                    type="text"
                    required
                    placeholder="House No., Building, Street, Area"
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/10 dark:border-white/10 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#575653] mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/10 dark:border-white/10 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#575653] mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/10 dark:border-white/10 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#575653] mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/10 dark:border-white/10 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#575653] mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/10 dark:border-white/10 text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold cursor-pointer"
                  >
                    Save & Deliver Here
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* STEP 2: ORDER SUMMARY & COUPON SYSTEM */}
          <div className="p-6 rounded-2xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] space-y-5">
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-[#9A3412] dark:text-[#EA580C]" />
              <h2 className="font-display text-xl font-semibold">
                Step 2 — Itemized Summary & Promotional Coupons
              </h2>
            </div>

            <div className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {cart.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <StudioImage
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-white"
                    />
                    <div>
                      <p className="font-semibold text-[#141413] dark:text-[#F5F5F3]">
                        {item.product.name}
                      </p>
                      <p className="text-[#85847F] font-mono-tabular">
                        Qty: {item.quantity} × {formatINR(item.unit_price)}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono-tabular font-semibold">
                    {formatINR(item.line_total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Input & Available Coupons */}
            <div className="pt-3 border-t border-black/[0.07] dark:border-white/[0.08] space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code (SAVE10, SAVE20, WELCOME)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#222227] border border-black/15 dark:border-white/15 text-xs font-mono-tabular uppercase"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="px-5 py-2.5 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold cursor-pointer whitespace-nowrap"
                >
                  Apply Coupon
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {coupons.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleApplyCoupon(c.code)}
                    className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                      appliedCoupon?.code === c.code
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-[#222227]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono-tabular font-semibold">
                      <span className="text-[#9A3412] dark:text-[#EA580C]">{c.code}</span>
                      <span>{c.discount_percentage}% OFF</span>
                    </div>
                    <p className="text-[11px] text-[#575653] dark:text-[#A6A6A2] mt-1">
                      {c.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 3: PAYMENT METHOD */}
          <div className="p-6 rounded-2xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] space-y-5">
            <div className="flex items-center gap-2.5">
              <Wallet className="w-4 h-4 text-[#9A3412] dark:text-[#EA580C]" />
              <h2 className="font-display text-xl font-semibold">Step 3 — Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  ['UPI', 'UPI Instant Pay', Smartphone],
                  ['Credit/Debit Card', 'Credit / Debit Card', CreditCard],
                  ['Cash on Delivery', 'Cash on Delivery (COD)', Truck],
                ] as const
              ).map(([method, title, Icon]) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    paymentMethod === method
                      ? 'border-[#141413] dark:border-[#F5F5F3] bg-white dark:bg-[#222227]'
                      : 'border-black/10 dark:border-white/10 opacity-75'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-2 text-[#9A3412] dark:text-[#EA580C]" />
                  <p className="text-xs font-semibold">{title}</p>
                </button>
              ))}
            </div>

            {paymentMethod === 'UPI' && (
              <div className="p-4 rounded-xl bg-white dark:bg-[#222227] border border-black/10 dark:border-white/10 space-y-2">
                <label className="block text-xs font-medium">Enter UPI ID (GPay / PhonePe / BHIM)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@okicici"
                  className="w-full sm:w-80 px-3 py-2 rounded-lg border border-black/15 dark:border-white/15 text-xs font-mono-tabular"
                />
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  ✓ Verified VPA: AARAV SHARMA (Simulated Instant College Project Gateway)
                </p>
              </div>
            )}

            {paymentMethod === 'Credit/Debit Card' && (
              <div className="p-4 rounded-xl bg-white dark:bg-[#222227] border border-black/10 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-[#575653] mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-black/15 dark:border-white/15 text-xs font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#575653] mb-1">Expiry / CVV</label>
                  <input
                    type="text"
                    value={`${cardDetails.expiry}  ·  ${cardDetails.cvv}`}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-black/15 dark:border-white/15 text-xs font-mono-tabular"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'Cash on Delivery' && (
              <div className="p-4 rounded-xl bg-white dark:bg-[#222227] border border-black/10 dark:border-white/10 text-xs text-[#575653] dark:text-[#A6A6A2]">
                Pay <strong className="font-mono-tabular text-[#141413] dark:text-white">{formatINR(finalTotal)}</strong> via Cash or UPI QR at the time of doorstep delivery to{' '}
                <strong>{activeAddress.full_name}</strong> ({activeAddress.phone}).
              </div>
            )}
          </div>
        </div>

        {/* STEP 4: PLACE ORDER STICKY SUMMARY */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 p-6 rounded-2xl bg-[#F4F3EF]/90 dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] space-y-5">
          <h2 className="font-display text-2xl font-semibold">Step 4 — Final Total</h2>

          <div className="space-y-3 text-sm border-y border-black/[0.08] dark:border-white/[0.08] py-4 font-mono-tabular">
            <div className="flex justify-between">
              <span className="font-sans text-[#575653] dark:text-[#A6A6A2]">
                Subtotal ({cart.item_count} items)
              </span>
              <span>{formatINR(cart.subtotal)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                <span className="font-sans">Coupon ({appliedCoupon.code})</span>
                <span>-{formatINR(appliedCoupon.discount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="font-sans text-[#575653] dark:text-[#A6A6A2]">Delivery Fee</span>
              <span>{cart.delivery_charge === 0 ? '₹0 (FREE)' : formatINR(cart.delivery_charge)}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-sans text-[#575653] dark:text-[#A6A6A2]">GST (5%)</span>
              <span>{formatINR(cart.tax)}</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between font-mono-tabular">
            <span className="font-sans text-base font-semibold">Payable Total</span>
            <span className="text-2xl font-semibold text-[#9A3412] dark:text-[#EA580C]">
              {formatINR(finalTotal)}
            </span>
          </div>

          <button
            type="button"
            disabled={placingOrder}
            onClick={handlePlaceOrder}
            className="w-full py-3.5 px-5 rounded-xl bg-[#9A3412] dark:bg-[#EA580C] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50 cursor-pointer transition-opacity"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{placingOrder ? 'Processing Order...' : `Place Order · ${formatINR(finalTotal)}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ORDER CONFIRMATION PAGE (#18)
// ============================================================================
export const OrderConfirmationView: React.FC<{
  order: Order | null;
  onNavigate: (page: PageRoute) => void;
}> = ({ order, onNavigate }) => {
  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <button
          type="button"
          onClick={() => onNavigate('orders')}
          className="px-5 py-2.5 rounded-lg bg-[#141413] text-white text-xs font-semibold"
        >
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-14 space-y-8">
      <div className="p-8 rounded-2xl bg-[#F4F3EF]/80 dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          ✓ Order Successfully Placed
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold">
          Thank you for your order, {order.shipping_address.full_name}
        </h1>
        <p className="text-sm text-[#575653] dark:text-[#A6A6A2]">
          Order ID <strong className="font-mono-tabular text-[#141413] dark:text-white">#{order.order_number}</strong> has been confirmed and stock has been reserved.
        </p>

        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-black/[0.07] dark:border-white/[0.08]">
          <div>
            <span className="text-[11px] text-[#85847F]">Order ID</span>
            <p className="font-mono-tabular text-xs font-semibold mt-0.5">#{order.order_number}</p>
          </div>
          <div>
            <span className="text-[11px] text-[#85847F]">Order Date</span>
            <p className="font-mono-tabular text-xs font-semibold mt-0.5">
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-[#85847F]">Payment Method</span>
            <p className="text-xs font-semibold mt-0.5">{order.payment_method}</p>
          </div>
          <div>
            <span className="text-[11px] text-[#85847F]">Total Paid</span>
            <p className="font-mono-tabular text-xs font-semibold text-[#9A3412] dark:text-[#EA580C] mt-0.5">
              {formatINR(order.total_amount)}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-black/[0.07] dark:border-white/[0.08] text-left">
          <span className="text-[11px] text-[#85847F]">Delivery Address</span>
          <p className="text-xs mt-0.5">
            {order.shipping_address.full_name} · {order.shipping_address.address},{' '}
            {order.shipping_address.city}, {order.shipping_address.state} —{' '}
            {order.shipping_address.pincode} ({order.shipping_address.phone})
          </p>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="px-5 py-2.5 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold cursor-pointer"
          >
            Track Order
          </button>
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="px-5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 text-xs font-semibold cursor-pointer"
          >
            View My Orders
          </button>
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="px-5 py-2.5 rounded-xl bg-[#9A3412] text-white text-xs font-semibold cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
