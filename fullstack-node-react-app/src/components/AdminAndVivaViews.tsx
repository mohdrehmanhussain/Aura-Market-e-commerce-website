import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Check,
  Code2,
  Copy,
  Database,
  Download,
  Edit3,
  FileCode,
  FolderArchive,
  Layers,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  Users,
} from 'lucide-react';
import {
  Category,
  Order,
  OrderStatus,
  Product,
  StudioImage,
  User,
  downloadFullProjectZip,
  formatINR,
} from '../types.ts';

interface AnalyticsPayload {
  total_sales: number;
  total_orders: number;
  total_users: number;
  total_products: number;
  pending_orders: number;
  delivered_orders: number;
  category_breakdown: Array<{ category: string; products: number; stock: number }>;
  popular_products: Product[];
  recent_orders: Order[];
}

export const AdminDashboardView: React.FC<{
  products: Product[];
  categories: Category[];
  onRefreshCatalog: () => void;
  onNotify: (title: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ products, categories, onRefreshCatalog, onNotify }) => {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'products' | 'categories' | 'orders' | 'users'
  >('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  // Product modal / form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: 'Aura Studio',
    category_id: categories[0]?.id || 1,
    price: 9999,
    discount_price: 7999,
    stock: 20,
    description: '',
    image: '',
    tag: 'New Release',
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  const fetchAdminData = async () => {
    try {
      const [anRes, usRes, ordRes] = await Promise.all([
        fetch('/api/admin/analytics/'),
        fetch('/api/admin/users/'),
        fetch('/api/orders/?all=true', {
          headers: { Authorization: 'Bearer demo_admin_token' },
        }),
      ]);
      if (anRes.ok) setAnalytics(await anRes.json());
      if (usRes.ok) setUsersList(await usRes.json());
      if (ordRes.ok) setAllOrders(await ordRes.json());
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [products.length, categories.length]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productForm),
        });
        if (!res.ok) throw new Error('Update failed');
        onNotify(`Updated ${productForm.name}`, 'success');
      } else {
        const res = await fetch('/api/products/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productForm),
        });
        if (!res.ok) throw new Error('Create failed');
        onNotify(`Added ${productForm.name} to catalog`, 'success');
      }
      setShowProductForm(false);
      setEditingProduct(null);
      onRefreshCatalog();
      fetchAdminData();
    } catch {
      onNotify('Could not save product.', 'error');
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    const res = await fetch(`/api/products/${id}/`, { method: 'DELETE' });
    if (res.ok) {
      onNotify(`Deleted "${name}"`, 'info');
      onRefreshCatalog();
      fetchAdminData();
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    const res = await fetch('/api/categories/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryForm),
    });
    if (res.ok) {
      setCategoryForm({ name: '', description: '' });
      onNotify('Category added.', 'success');
      onRefreshCatalog();
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const res = await fetch(`/api/categories/${id}/`, { method: 'DELETE' });
    if (res.ok) {
      onNotify('Category removed.', 'info');
      onRefreshCatalog();
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: OrderStatus) => {
    const res = await fetch(`/api/orders/${orderId}/status/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      onNotify(`Order status updated to ${status}`, 'success');
      fetchAdminData();
    }
  };

  const handleToggleUserStatus = async (u: User) => {
    const res = await fetch(`/api/admin/users/${u.id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !u.active }),
    });
    if (res.ok) {
      onNotify(`User @${u.username} ${!u.active ? 'enabled' : 'disabled'}`, 'info');
      fetchAdminData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Store Admin Dashboard</h1>
          <p className="text-xs text-[#575653] dark:text-[#A6A6A2] mt-1">
            Manage products, categories, inventory stock, customer orders, users, and store analytics
          </p>
        </div>

        {/* Admin Sub-Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#F4F3EF] dark:bg-[#1A1A1E]">
          {(
            [
              ['analytics', 'Analytics', BarChart3],
              ['products', `Products (${products.length})`, Package],
              ['categories', `Categories (${categories.length})`, Layers],
              ['orders', `Orders (${allOrders.length})`, ShoppingBag],
              ['users', `Users (${usersList.length})`, Users],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === key
                  ? 'bg-[#141413] text-[#FBFBF9] dark:bg-[#F5F5F3] dark:text-[#121214]'
                  : 'text-[#575653] dark:text-[#A6A6A2] hover:text-[#141413] dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
          {/* 6 KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              ['Total Sales', formatINR(analytics.total_sales)],
              ['Total Orders', String(analytics.total_orders)],
              ['Total Products', String(analytics.total_products)],
              ['Total Users', String(analytics.total_users)],
              ['Pending Orders', String(analytics.pending_orders)],
              ['Delivered Orders', String(analytics.delivered_orders)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="p-4 rounded-2xl bg-[#F4F3EF]/80 dark:bg-[#1A1A1E] border border-black/[0.06] dark:border-white/[0.07]"
              >
                <span className="text-xs text-[#575653] dark:text-[#A6A6A2] block">{label}</span>
                <span className="font-mono-tabular text-xl font-semibold mt-1.5 block">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Inventory Bar Chart */}
            <div className="p-6 rounded-2xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] space-y-4">
              <h2 className="font-display text-xl font-semibold">
                Inventory Distribution by Category
              </h2>
              <div className="space-y-3">
                {analytics.category_breakdown.map((item) => {
                  const pct = Math.min(100, Math.round((item.stock / 160) * 100));
                  return (
                    <div key={item.category} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{item.category}</span>
                        <span className="font-mono-tabular text-[#575653] dark:text-[#A6A6A2]">
                          {item.products} SKUs · {item.stock} units in stock
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-[#141413] dark:bg-[#F5F5F3]"
                          style={{ width: `${Math.max(8, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Most Popular Products Chart */}
            <div className="p-6 rounded-2xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] space-y-4">
              <h2 className="font-display text-xl font-semibold">Most Popular Products</h2>
              <div className="divide-y divide-black/[0.06] dark:divide-white/[0.07]">
                {analytics.popular_products.map((prod) => (
                  <div key={prod.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <StudioImage
                        src={prod.image}
                        alt={prod.name}
                        className="w-11 h-11 rounded-lg object-cover bg-white shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{prod.name}</p>
                        <p className="text-[11px] text-[#85847F]">
                          {prod.brand} · {prod.review_count} reviews ({prod.rating}★)
                        </p>
                      </div>
                    </div>
                    <span className="font-mono-tabular text-xs font-semibold shrink-0">
                      {formatINR(prod.discount_price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-2xl font-semibold">Catalog Inventory</h2>
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  name: '',
                  brand: 'Aura Studio',
                  category_id: categories[0]?.id || 1,
                  price: 12999,
                  discount_price: 9999,
                  stock: 25,
                  description: '',
                  image: '',
                  tag: 'New Release',
                });
                setShowProductForm(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {showProductForm && (
            <form
              onSubmit={handleSaveProduct}
              className="p-6 rounded-2xl bg-[#F4F3EF] dark:bg-[#1A1A1E] border border-black/10 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div className="sm:col-span-3 flex justify-between items-center">
                <h3 className="font-display text-xl font-semibold">
                  {editingProduct ? `Edit Product #${editingProduct.id}` : 'Create New Product'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="text-xs text-[#85847F] hover:underline"
                >
                  Cancel
                </button>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/15 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Brand</label>
                <input
                  type="text"
                  required
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/15 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Category</label>
                <select
                  value={productForm.category_id}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category_id: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/15 text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Original MRP (₹)</label>
                <input
                  type="number"
                  required
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/15 text-xs font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Selling Discount Price (₹)</label>
                <input
                  type="number"
                  required
                  value={productForm.discount_price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, discount_price: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/15 text-xs font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Stock Units</label>
                <input
                  type="number"
                  required
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/15 text-xs font-mono-tabular"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs mb-1">Image URL (Optional — defaults to studio category artwork)</label>
                <input
                  type="text"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="/src/assets/images/..."
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/15 text-xs"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/15 text-xs"
                />
              </div>
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#9A3412] text-white text-xs font-semibold cursor-pointer"
                >
                  {editingProduct ? 'Save Product Updates' : 'Create Product'}
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-2xl border border-black/[0.07] dark:border-white/[0.08]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F3EF] dark:bg-[#1A1A1E] text-[#575653] dark:text-[#A6A6A2] border-b border-black/[0.07] dark:border-white/[0.08]">
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-right">MRP</th>
                  <th className="p-3.5 text-right">Selling Price</th>
                  <th className="p-3.5 text-right">Stock</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.07]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F4F3EF]/40 dark:hover:bg-white/[0.02]">
                    <td className="p-3.5 flex items-center gap-3">
                      <StudioImage
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-white shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-[#141413] dark:text-[#F5F5F3]">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-[#85847F]">{p.brand}</p>
                      </div>
                    </td>
                    <td className="p-3.5">{p.category_name}</td>
                    <td className="p-3.5 text-right font-mono-tabular text-[#85847F]">
                      {formatINR(p.price)}
                    </td>
                    <td className="p-3.5 text-right font-mono-tabular font-semibold">
                      {formatINR(p.discount_price)}
                    </td>
                    <td className="p-3.5 text-right font-mono-tabular">
                      <span className={p.stock <= 5 ? 'text-red-600 font-semibold' : ''}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(p);
                          setProductForm({
                            name: p.name,
                            brand: p.brand,
                            category_id: p.category_id,
                            price: p.price,
                            discount_price: p.discount_price,
                            stock: p.stock,
                            description: p.description,
                            image: p.image,
                            tag: p.tag || '',
                          });
                          setShowProductForm(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F4F3EF] dark:bg-[#222227] hover:opacity-80 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-red-600 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleAddCategory}
            className="lg:col-span-4 p-6 rounded-2xl bg-[#F4F3EF]/70 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] space-y-4 h-fit"
          >
            <h2 className="font-display text-xl font-semibold">Add New Category</h2>
            <div>
              <label className="block text-xs mb-1">Category Name</label>
              <input
                type="text"
                required
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g. Smart Home"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/15 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Description</label>
              <textarea
                rows={2}
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/15 text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold cursor-pointer"
            >
              Create Category
            </button>
          </form>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-xl bg-[#F4F3EF]/50 dark:bg-[#1A1A1E] border border-black/[0.06] dark:border-white/[0.07] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StudioImage
                    src={cat.image}
                    alt={cat.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0 bg-white"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold truncate">{cat.name}</h3>
                    <p className="text-xs text-[#85847F] truncate">{cat.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-xs text-red-600 hover:underline shrink-0 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">Customer Order Fulfillment</h2>
          <div className="overflow-x-auto rounded-2xl border border-black/[0.07] dark:border-white/[0.08]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F3EF] dark:bg-[#1A1A1E] text-[#575653] dark:text-[#A6A6A2] border-b border-black/[0.07] dark:border-white/[0.08]">
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Customer & City</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.07]">
                {allOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="p-3.5 font-mono-tabular font-semibold">#{o.order_number}</td>
                    <td className="p-3.5">
                      <p className="font-semibold">{o.shipping_address?.full_name}</p>
                      <p className="text-[11px] text-[#85847F]">
                        {o.shipping_address?.city} · {o.shipping_address?.phone}
                      </p>
                    </td>
                    <td className="p-3.5 font-mono-tabular">
                      {new Date(o.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5">{o.payment_method}</td>
                    <td className="p-3.5 text-right font-mono-tabular font-semibold">
                      {formatINR(o.total_amount)}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={o.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#222227] border border-black/15 dark:border-white/15 text-xs font-medium cursor-pointer"
                      >
                        {(
                          [
                            'Order Placed',
                            'Order Confirmed',
                            'Processing',
                            'Shipped',
                            'Out for Delivery',
                            'Delivered',
                            'Cancelled',
                          ] as OrderStatus[]
                        ).map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">Registered Store Accounts</h2>
          <div className="overflow-x-auto rounded-2xl border border-black/[0.07] dark:border-white/[0.08]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F3EF] dark:bg-[#1A1A1E] text-[#575653] dark:text-[#A6A6A2] border-b border-black/[0.07]">
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Name & Username</th>
                  <th className="p-3.5">Email & Phone</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.07]">
                {usersList.map((u) => (
                  <tr key={u.id}>
                    <td className="p-3.5 font-mono-tabular">#{u.id}</td>
                    <td className="p-3.5">
                      <p className="font-semibold">
                        {u.first_name} {u.last_name}
                      </p>
                      <p className="text-[11px] text-[#85847F]">@{u.username}</p>
                    </td>
                    <td className="p-3.5">
                      <p>{u.email}</p>
                      <p className="text-[11px] text-[#85847F] font-mono-tabular">{u.phone}</p>
                    </td>
                    <td className="p-3.5 capitalize font-medium">{u.role}</td>
                    <td className="p-3.5">
                      <span
                        className={
                          u.active
                            ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                            : 'text-red-600 font-semibold'
                        }
                      >
                        {u.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {u.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u)}
                          className="px-3 py-1 rounded-lg border border-black/15 dark:border-white/15 text-xs font-medium cursor-pointer"
                        >
                          {u.active ? 'Disable User' : 'Enable User'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COLLEGE PROJECT DELIVERABLES & ZIP DOWNLOAD CENTER (#38)
// ============================================================================
export const ProjectDeliverablesView: React.FC<{
  onNotify: (title: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ onNotify }) => {
  const [files, setFiles] = useState<{
    django_models: string;
    django_views: string;
    sql_schema: string;
    readme: string;
    all_files?: Record<string, string>;
  } | null>(null);
  const [activeDoc, setActiveDoc] = useState<'readme' | 'models' | 'views' | 'sql' | 'tree'>('readme');
  const [selectedTreeFile, setSelectedTreeFile] = useState<string>('ecommerce/README.md');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch('/api/project-files/')
      .then((r) => r.json())
      .then((data) => {
        setFiles(data);
        if (data?.all_files) {
          const firstKey = Object.keys(data.all_files)[0];
          if (firstKey) setSelectedTreeFile(firstKey);
        }
      })
      .catch(() => null);
  }, []);

  const fileList = files?.all_files ? Object.keys(files.all_files) : [];

  const currentCode =
    activeDoc === 'readme'
      ? files?.readme || ''
      : activeDoc === 'models'
      ? files?.django_models || ''
      : activeDoc === 'views'
      ? files?.django_views || ''
      : activeDoc === 'sql'
      ? files?.sql_schema || ''
      : files?.all_files?.[selectedTreeFile] || '';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    onNotify('Copied source code to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerDownload = async () => {
    setDownloading(true);
    await downloadFullProjectZip(onNotify);
    setDownloading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Top Banner with Direct Client-Side JSZip Download Button */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#F4F3EF] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#9A3412] dark:text-[#EA580C]">
            <FolderArchive className="w-4 h-4" />
            <span>
              Complete College Mini-Project Deliverables ({fileList.length || 43} Non-Empty Source Files)
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold">
            Download Full Source Code ZIP Package
          </h1>
          <p className="text-sm text-[#575653] dark:text-[#A6A6A2] leading-relaxed">
            Bundles both the modular <code className="font-mono-tabular">ecommerce/</code> directory (
            <strong>Django + Django REST Framework</strong> backend, <strong>HTML5 / CSS3 / Vanilla JS</strong> frontend,{' '}
            <code className="font-mono-tabular">schema.sql</code>, <code className="font-mono-tabular">requirements.txt</code>,{' '}
            <code className="font-mono-tabular">README.md</code>) AND the complete{' '}
            <code className="font-mono-tabular">fullstack-node-react-app/</code> source code into a verified ZIP archive.
          </p>
        </div>

        <button
          type="button"
          disabled={downloading}
          onClick={handleTriggerDownload}
          className="px-6 py-4 rounded-xl bg-[#9A3412] dark:bg-[#EA580C] text-white text-sm font-semibold inline-flex items-center justify-center gap-2.5 hover:opacity-95 shrink-0 shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>
            {downloading
              ? 'Generating ZIP Archive...'
              : `Download Project ZIP (${fileList.length || 43} Files)`}
          </span>
        </button>
      </div>

      {/* Quick Viva Credentials & Commands Reference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] space-y-2">
          <h3 className="text-sm font-semibold">Sample Login Credentials</h3>
          <div className="text-xs font-mono-tabular space-y-1 text-[#575653] dark:text-[#A6A6A2]">
            <p>
              <strong className="text-[#141413] dark:text-white">Customer:</strong> aarav_sharma / customer123
            </p>
            <p>
              <strong className="text-[#141413] dark:text-white">Admin:</strong> admin / admin123
            </p>
            <p>
              <strong className="text-[#141413] dark:text-white">Coupons:</strong> SAVE10, SAVE20, WELCOME, CAMPUS25
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] space-y-2">
          <h3 className="text-sm font-semibold">Django Migration Commands</h3>
          <pre className="text-[11px] font-mono-tabular text-[#575653] dark:text-[#A6A6A2] overflow-x-auto">
            {`pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 8000`}
          </pre>
        </div>

        <div className="p-5 rounded-2xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] space-y-2">
          <h3 className="text-sm font-semibold">12 Relational Models Implemented</h3>
          <p className="text-xs text-[#575653] dark:text-[#A6A6A2] leading-relaxed">
            User · Category · Product · ProductImage · Cart · CartItem · Wishlist · Order · OrderItem · Review · Address · Coupon
          </p>
        </div>
      </div>

      {/* Code Inspector for Viva Presentation */}
      <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden bg-[#18181B] text-[#F5F5F3]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-white/10 bg-[#121214]">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ['tree', `All ZIP Files (${fileList.length || 43})`, FolderArchive],
                ['readme', 'README.md & API Docs', FileCode],
                ['models', 'Django ORM (models.py)', Database],
                ['views', 'DRF REST APIs (views.py)', Code2],
                ['sql', 'SQLite Schema (schema.sql)', Layers],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveDoc(key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                  activeDoc === key ? 'bg-white text-[#121214]' : 'text-[#A6A6A2] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        {activeDoc === 'tree' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/10 max-h-[600px] overflow-y-auto p-3 space-y-1 bg-[#141417]">
              {fileList.map((fPath) => (
                <button
                  key={fPath}
                  type="button"
                  onClick={() => setSelectedTreeFile(fPath)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono-tabular truncate cursor-pointer ${
                    selectedTreeFile === fPath
                      ? 'bg-[#9A3412] text-white font-semibold'
                      : 'text-[#A6A6A2] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {fPath}
                </button>
              ))}
            </div>
            <div className="lg:col-span-8">
              <div className="px-5 py-2.5 border-b border-white/10 text-xs font-mono-tabular text-[#A6A6A2] flex justify-between">
                <span>{selectedTreeFile}</span>
                <span>{(currentCode.length / 1024).toFixed(1)} KB</span>
              </div>
              <pre className="p-6 text-xs font-mono-tabular leading-relaxed overflow-x-auto max-h-[550px]">
                {currentCode}
              </pre>
            </div>
          </div>
        ) : (
          <pre className="p-6 text-xs font-mono-tabular leading-relaxed overflow-x-auto max-h-[600px]">
            {currentCode || 'Loading project files...'}
          </pre>
        )}
      </div>
    </div>
  );
};
