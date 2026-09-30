import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Heart,
  KeyRound,
  LogOut,
  MapPin,
  Package,
  ShoppingBag,
  Trash2,
  User as UserIcon,
  XCircle,
} from 'lucide-react';
import {
  Address,
  Order,
  OrderStatus,
  PageRoute,
  Product,
  StudioImage,
  User,
  WishlistItem,
  formatINR,
} from '../types.ts';

const ORDER_TIMELINE_STEPS: OrderStatus[] = [
  'Order Placed',
  'Order Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

// ============================================================================
// 1. MY ORDERS & VISUAL ORDER TRACKING TIMELINE (#16 & #17)
// ============================================================================
export const OrdersView: React.FC<{
  orders: Order[];
  onCancelOrder: (orderId: number) => void;
  onNavigate: (page: PageRoute) => void;
  onSelectProductById: (productId: number) => void;
}> = ({ orders, onCancelOrder, onNavigate, onSelectProductById }) => {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(
    orders[0]?.id || null
  );

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Package className="w-10 h-10 mx-auto text-[#85847F] stroke-[1.5]" />
        <h1 className="font-display text-3xl font-semibold">No Orders Found</h1>
        <p className="text-sm text-[#575653] dark:text-[#A6A6A2]">
          You have not placed any orders yet. Start exploring our catalog.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('products')}
          className="px-6 py-3 rounded-xl bg-[#141413] text-white text-xs font-semibold cursor-pointer"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">My Orders & Live Tracking</h1>
        <p className="text-xs text-[#575653] dark:text-[#A6A6A2] mt-1">
          Track real-time shipment milestones, inspect invoices, or cancel active orders.
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const isCancelled = order.status === 'Cancelled';
          const currentStageIdx = ORDER_TIMELINE_STEPS.indexOf(order.status);

          return (
            <div
              key={order.id}
              className="rounded-2xl bg-[#F4F3EF]/70 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] overflow-hidden"
            >
              {/* Order Summary Header */}
              <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.07]">
                <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs">
                  <div>
                    <span className="text-[#85847F] block">Order ID</span>
                    <span className="font-mono-tabular font-semibold text-sm">
                      #{order.order_number}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#85847F] block">Placed On</span>
                    <span className="font-mono-tabular font-medium">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#85847F] block">Total Amount</span>
                    <span className="font-mono-tabular font-semibold text-[#9A3412] dark:text-[#EA580C]">
                      {formatINR(order.total_amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#85847F] block">Payment</span>
                    <span className="font-medium">{order.payment_method}</span>
                  </div>
                  <div>
                    <span className="text-[#85847F] block">Current Status</span>
                    <span
                      className={`font-semibold ${
                        isCancelled
                          ? 'text-red-600 dark:text-red-400'
                          : order.status === 'Delivered'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-[#141413] dark:text-[#F5F5F3]'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="px-3.5 py-2 rounded-lg border border-black/15 dark:border-white/15 text-xs font-semibold cursor-pointer"
                  >
                    {isExpanded ? 'Hide Details' : 'Track / View Details'}
                  </button>
                  {!isCancelled && order.status !== 'Delivered' && (
                    <button
                      type="button"
                      onClick={() => onCancelOrder(order.id)}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-500/10 cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Visual Tracking Timeline & Order Items */}
              {isExpanded && (
                <div className="p-5 sm:p-6 space-y-6 bg-white/60 dark:bg-[#222227]/50">
                  {/* Visual Order Tracking Timeline */}
                  <div>
                    <h3 className="text-xs font-semibold text-[#575653] dark:text-[#A6A6A2] mb-4">
                      Order Tracking Timeline
                    </h3>
                    {isCancelled ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-red-600 p-3 rounded-xl bg-red-500/10">
                        <XCircle className="w-4 h-4" />
                        <span>
                          This order was cancelled and product stock has been restored to inventory.
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                        {ORDER_TIMELINE_STEPS.map((stage, idx) => {
                          const completed = idx <= currentStageIdx;
                          return (
                            <div
                              key={stage}
                              className={`p-3 rounded-xl border ${
                                completed
                                  ? 'border-emerald-600/40 bg-emerald-500/10 text-[#141413] dark:text-[#F5F5F3]'
                                  : 'border-black/10 dark:border-white/10 opacity-50'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 text-xs font-semibold">
                                {completed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-[#85847F] shrink-0" />
                                )}
                                <span className="truncate">{stage}</span>
                              </div>
                              <p className="text-[10px] text-[#85847F] mt-1 font-mono-tabular">
                                Step 0{idx + 1}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-black/[0.06] dark:divide-white/[0.07]">
                    {(order.items || []).map((item) => (
                      <div
                        key={item.id}
                        className="py-3 flex items-center justify-between gap-4"
                      >
                        <div
                          onClick={() => onSelectProductById(item.product_id)}
                          className="flex items-center gap-3.5 cursor-pointer"
                        >
                          <StudioImage
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-14 h-14 rounded-xl object-cover bg-white"
                          />
                          <div>
                            <p className="text-[11px] text-[#85847F]">{item.brand}</p>
                            <p className="text-sm font-semibold hover:underline">
                              {item.product_name}
                            </p>
                            <p className="text-xs font-mono-tabular text-[#575653] dark:text-[#A6A6A2]">
                              Qty: {item.quantity} × {formatINR(item.price)}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono-tabular text-sm font-semibold">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address & Financial Breakdown */}
                  <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.07] flex flex-wrap justify-between gap-4 text-xs text-[#575653] dark:text-[#A6A6A2]">
                    <div>
                      <span className="font-semibold text-[#141413] dark:text-white block">
                        Shipping Address
                      </span>
                      <span>
                        {order.shipping_address?.full_name} · {order.shipping_address?.address},{' '}
                        {order.shipping_address?.city}, {order.shipping_address?.state} —{' '}
                        {order.shipping_address?.pincode}
                      </span>
                    </div>
                    <div className="font-mono-tabular text-right">
                      <span>Subtotal: {formatINR(order.subtotal)}</span>
                      {order.discount > 0 && <span> · Discount: -{formatINR(order.discount)}</span>}
                      <span> · Total: </span>
                      <strong className="text-[#141413] dark:text-white">
                        {formatINR(order.total_amount)}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 2. WISHLIST PAGE (#11)
// ============================================================================
export const WishlistView: React.FC<{
  wishlist: WishlistItem[];
  onRemoveWishlist: (product: Product) => void;
  onMoveToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onNavigate: (page: PageRoute) => void;
}> = ({ wishlist, onRemoveWishlist, onMoveToCart, onSelectProduct, onNavigate }) => {
  if (wishlist.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Heart className="w-10 h-10 mx-auto text-[#85847F] stroke-[1.5]" />
        <h1 className="font-display text-3xl font-semibold">
          You haven't saved any products yet.
        </h1>
        <p className="text-sm text-[#575653] dark:text-[#A6A6A2]">
          Tap the heart icon on any product card to curate your personal wishlist.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('products')}
          className="px-6 py-3 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold cursor-pointer"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Saved Wishlist</h1>
        <p className="text-xs text-[#575653] dark:text-[#A6A6A2] mt-1">
          {wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'} ready to move to your shopping bag
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map(({ product }) => (
          <div
            key={product.id}
            className="flex flex-col rounded-xl bg-[#F4F3EF]/70 dark:bg-[#1A1A1E] border border-black/[0.06] dark:border-white/[0.07] overflow-hidden"
          >
            <div
              onClick={() => onSelectProduct(product)}
              className="aspect-[4/3] bg-white dark:bg-[#18181B] cursor-pointer overflow-hidden"
            >
              <StudioImage
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
              <div>
                <p className="text-[11px] text-[#85847F]">
                  {product.brand} · {product.category_name}
                </p>
                <h3
                  onClick={() => onSelectProduct(product)}
                  className="text-sm font-semibold mt-1 line-clamp-1 cursor-pointer hover:underline"
                >
                  {product.name}
                </h3>
                <p className="font-mono-tabular text-sm font-semibold mt-1.5">
                  {formatINR(product.discount_price)}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => onMoveToCart(product)}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveWishlist(product)}
                  aria-label="Remove from wishlist"
                  className="w-9 h-9 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center text-[#85847F] hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 3. USER PROFILE DASHBOARD (#13)
// ============================================================================
export const ProfileView: React.FC<{
  user: User;
  token: string;
  addresses: Address[];
  ordersCount: number;
  wishlistCount: number;
  onUserUpdated: (user: User) => void;
  onRefreshAddresses: () => void;
  onLogout: () => void;
  onNavigate: (page: PageRoute) => void;
  onNotify: (title: string, type?: 'success' | 'error' | 'info') => void;
}> = ({
  user,
  token,
  addresses,
  ordersCount,
  wishlistCount,
  onUserUpdated,
  onRefreshAddresses,
  onLogout,
  onNavigate,
  onNotify,
}) => {
  const [tab, setTab] = useState<'settings' | 'addresses' | 'password'>('settings');
  const [profileForm, setProfileForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
  });
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      onUserUpdated(data.user);
      onNotify('Profile settings saved.', 'success');
    } catch {
      onNotify('Failed to update profile.', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile/password/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwords),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error || 'Could not update password', 'error');
        return;
      }
      setPasswords({ current_password: '', new_password: '' });
      onNotify(data.message, 'success');
    } catch {
      onNotify('Error changing password.', 'error');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    await fetch(`/api/addresses/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    onRefreshAddresses();
    onNotify('Address removed.', 'info');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="p-6 sm:p-8 rounded-2xl bg-[#F4F3EF]/80 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] font-display text-2xl font-semibold flex items-center justify-center">
            {user.first_name?.[0] || user.username[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-[#85847F]">
              <span>@{user.username}</span>
              <span aria-hidden="true">·</span>
              <span>
                Member since{' '}
                {new Date(user.created_at).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-xs text-[#575653] dark:text-[#A6A6A2]">
              {user.email} · {user.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#222227] border border-black/10 dark:border-white/10 text-xs font-semibold cursor-pointer"
          >
            My Orders ({ordersCount})
          </button>
          <button
            type="button"
            onClick={() => onNavigate('wishlist')}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#222227] border border-black/10 dark:border-white/10 text-xs font-semibold cursor-pointer"
          >
            Wishlist ({wishlistCount})
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-red-600/10 text-red-600 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-black/[0.07] dark:border-white/[0.08] pb-3">
        <button
          type="button"
          onClick={() => setTab('settings')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            tab === 'settings'
              ? 'bg-[#141413] text-white dark:bg-[#F5F5F3] dark:text-[#121214]'
              : 'text-[#575653]'
          }`}
        >
          Account Settings
        </button>
        <button
          type="button"
          onClick={() => setTab('addresses')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            tab === 'addresses'
              ? 'bg-[#141413] text-white dark:bg-[#F5F5F3] dark:text-[#121214]'
              : 'text-[#575653]'
          }`}
        >
          Saved Addresses ({addresses.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('password')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            tab === 'password'
              ? 'bg-[#141413] text-white dark:bg-[#F5F5F3] dark:text-[#121214]'
              : 'text-[#575653]'
          }`}
        >
          Change Password
        </button>
      </div>

      {tab === 'settings' && (
        <form
          onSubmit={handleSaveProfile}
          className="max-w-xl p-6 rounded-2xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] space-y-4"
        >
          <h2 className="font-display text-xl font-semibold">Edit Personal Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#575653] mb-1">First Name</label>
              <input
                type="text"
                value={profileForm.first_name}
                onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/10 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-[#575653] mb-1">Last Name</label>
              <input
                type="text"
                value={profileForm.last_name}
                onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/10 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-[#575653] mb-1">Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/10 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-[#575653] mb-1">Phone Number</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/10 text-xs"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold cursor-pointer"
          >
            Save Changes
          </button>
        </form>
      )}

      {tab === 'addresses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-5 rounded-2xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] flex justify-between items-start"
            >
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#9A3412]" />
                  <h3 className="text-sm font-semibold">{addr.full_name}</h3>
                </div>
                <p className="text-xs text-[#575653] dark:text-[#A6A6A2] mt-1.5">
                  {addr.address}, {addr.city}, {addr.state} — {addr.pincode}, {addr.country}
                </p>
                <p className="text-xs font-mono-tabular text-[#85847F] mt-1">{addr.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteAddress(addr.id)}
                className="text-xs text-red-600 hover:underline cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'password' && (
        <form
          onSubmit={handleChangePassword}
          className="max-w-md p-6 rounded-2xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] space-y-4"
        >
          <h2 className="font-display text-xl font-semibold">Update Password</h2>
          <div>
            <label className="block text-xs text-[#575653] mb-1">Current Password</label>
            <input
              type="password"
              value={passwords.current_password}
              onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/10 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-[#575653] mb-1">New Password (min 6 chars)</label>
            <input
              type="password"
              required
              value={passwords.new_password}
              onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/10 text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold cursor-pointer"
          >
            Update Password
          </button>
        </form>
      )}
    </div>
  );
};

// ============================================================================
// 4. AUTHENTICATION VIEWS (Login, Register, Forgot Password) (#12)
// ============================================================================
export const AuthView: React.FC<{
  mode: 'login' | 'register' | 'forgot-password';
  onNavigate: (page: PageRoute) => void;
  onAuthSuccess: (token: string, user: User) => void;
  onNotify: (title: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ mode, onNavigate, onAuthSuccess, onNotify }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+91 98450 72190');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error || 'Invalid login credentials', 'error');
        return;
      }
      onAuthSuccess(data.token, data.user);
      onNotify(`Welcome back, ${data.user.first_name || data.user.username}!`, 'success');
    } catch {
      onNotify('Network error during sign in.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      onNotify('Passwords do not match.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error || 'Registration failed', 'error');
        return;
      }
      onAuthSuccess(data.token, data.user);
      onNotify('Account created! Welcome to Aura Market.', 'success');
    } catch {
      onNotify('Network error during registration.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error || 'Account not found', 'error');
        return;
      }
      onNotify(data.message, 'success');
      if (password.length >= 6) onNavigate('login');
    } catch {
      onNotify('Error resetting password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="p-6 sm:p-8 rounded-2xl bg-[#F4F3EF]/80 dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold">
            {mode === 'login'
              ? 'Sign In to Aura Market'
              : mode === 'register'
              ? 'Create Customer Account'
              : 'Reset Your Password'}
          </h1>
          <p className="text-xs text-[#575653] dark:text-[#A6A6A2] mt-1">
            {mode === 'login'
              ? 'Access your orders, wishlist, and saved addresses'
              : mode === 'register'
              ? 'Join Aura Curated Market for express checkout'
              : 'Enter your registered email or username and new password'}
          </p>
        </div>

        {/* One-Click Demo Login Helper for College Project Viva Evaluator */}
        {mode === 'login' && (
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#222227] border border-black/10 dark:border-white/10 space-y-2">
            <span className="block text-[11px] font-semibold text-[#85847F]">
              Instant Viva Demo Credentials (Click to auto-fill):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setUsername('aarav_sharma');
                  setPassword('customer123');
                }}
                className="py-1.5 px-2.5 rounded-lg bg-[#F4F3EF] dark:bg-[#1A1A1E] text-xs font-medium flex items-center justify-center gap-1.5 hover:opacity-85 cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Customer Demo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPassword('admin123');
                }}
                className="py-1.5 px-2.5 rounded-lg bg-[#F4F3EF] dark:bg-[#1A1A1E] text-xs font-medium flex items-center justify-center gap-1.5 hover:opacity-85 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Store Admin</span>
              </button>
            </div>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1">Username or Email</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="aarav_sharma or aarav@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#222227] border border-black/15 dark:border-white/15 text-xs"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-[11px] text-[#9A3412] dark:text-[#EA580C] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#222227] border border-black/15 dark:border-white/15 text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold cursor-pointer"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#222227] border border-black/15 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#222227] border border-black/15 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#222227] border border-black/15 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#222227] border border-black/15 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#222227] border border-black/15 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#222227] border border-black/15 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#222227] border border-black/15 text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {mode === 'forgot-password' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1">Registered Email or Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="aarav@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#222227] border border-black/15 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">New Password (min 6 characters)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#222227] border border-black/15 text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold cursor-pointer"
            >
              Reset Password
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-black/[0.07] dark:border-white/[0.08] text-center text-xs text-[#575653] dark:text-[#A6A6A2]">
          {mode === 'login' ? (
            <span>
              New to Aura Market?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="font-semibold text-[#141413] dark:text-white hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="font-semibold text-[#141413] dark:text-white hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
