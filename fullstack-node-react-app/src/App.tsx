import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  FolderArchive,
  Heart,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Truck,
  X,
} from 'lucide-react';
import {
  Address,
  CartSummary,
  Category,
  Coupon,
  Order,
  PageRoute,
  Product,
  StudioImage,
  ToastMessage,
  User,
  WishlistItem,
  downloadFullProjectZip,
  formatINR,
  getDiscountPercent,
} from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailView } from './components/ProductDetailView.tsx';
import {
  CartView,
  CheckoutView,
  OrderConfirmationView,
} from './components/CartAndCheckoutViews.tsx';
import {
  AuthView,
  OrdersView,
  ProfileView,
  WishlistView,
} from './components/OrdersAndProfileViews.tsx';
import {
  AdminDashboardView,
  ProjectDeliverablesView,
} from './components/AdminAndVivaViews.tsx';

const HERO_SLIDES = [
  {
    id: 1,
    kicker: 'Autumn / Winter Flagship Collection',
    title: 'Precision-Engineered Objects for Modern Living',
    description:
      'Discover reference-grade acoustics, Swiss titanium horology, and anodized creator workstations curated with transparent domestic pricing and insured express delivery.',
    image: '/src/assets/images/hero_flagship_storefront_1790774703951.jpg',
    primaryCta: 'Shop Now',
    secondaryCta: 'Explore Products',
    targetCategory: 'All',
  },
  {
    id: 2,
    kicker: 'Studio Acoustics · Reference Series',
    title: 'Aether Studio ANC Wireless Headphones',
    description:
      '45mm beryllium-coated dynamic transducers with 48-hour battery life, lambskin memory foam cushions, and lossless USB-C DAC playback.',
    image: '/src/assets/images/product_audio_headphones_1790774721014.jpg',
    primaryCta: 'Shop Electronics',
    secondaryCta: 'Explore Audio',
    targetCategory: 'Electronics',
  },
  {
    id: 3,
    kicker: 'Mechanical Horology · Limited Edition',
    title: 'Chronos Grade-5 Titanium Field Chronograph',
    description:
      '80-hour mechanical power reserve housed in a 64-gram micro-blasted titanium case with anti-reflective box sapphire crystal.',
    image: '/src/assets/images/product_chronograph_watch_1790774735944.jpg',
    primaryCta: 'Shop Watches',
    secondaryCta: 'View Timepieces',
    targetCategory: 'Watches',
  },
];

export default function App() {
  // Navigation & Route State
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Theme State (Dark Mode persisted in localStorage)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aura_theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      try {
        localStorage.setItem('aura_theme', 'dark');
      } catch {
        // ignore
      }
    } else {
      root.classList.remove('dark');
      try {
        localStorage.setItem('aura_theme', 'light');
      } catch {
        // ignore
      }
    }
  }, [darkMode]);

  // Auth State (Default to Demo Customer so cart/orders/reviews work immediately out of the box)
  const [token, setToken] = useState<string>(() => {
    try {
      return localStorage.getItem('aura_token') || 'demo_customer_token';
    } catch {
      return 'demo_customer_token';
    }
  });
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Store Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartSummary>({
    cart_id: 1,
    items: [],
    item_count: 0,
    subtotal: 0,
    product_savings: 0,
    delivery_charge: 0,
    tax: 0,
    total: 0,
  });
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(true);

  // Recently Viewed Products (stored in localStorage)
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    try {
      const raw = localStorage.getItem('aura_recently_viewed');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Home Hero Slider & Collection Filter Tab
  const [heroIndex, setHeroIndex] = useState(0);
  const [homeCollectionTab, setHomeCollectionTab] = useState<
    'featured' | 'new' | 'bestsellers' | 'offers' | 'trending'
  >('featured');

  // Product Catalog Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [brandFilter, setBrandFilter] = useState<string>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = (title: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // Automatic Hero Banner Slider (every 6 seconds)
  useEffect(() => {
    if (currentPage !== 'home') return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentPage]);

  // Fetch initial catalog, user session, cart, wishlist, orders, coupons
  const fetchCatalogAndCategories = async () => {
    setLoadingCatalog(true);
    try {
      const [prodRes, catRes, coupRes] = await Promise.all([
        fetch('/api/products/'),
        fetch('/api/categories/'),
        fetch('/api/coupons/'),
      ]);
      if (prodRes.ok) setProducts(await prodRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (coupRes.ok) setCoupons(await coupRes.json());
    } catch {
      notify('Network error loading catalog.', 'error');
    } finally {
      setLoadingCatalog(false);
    }
  };

  const fetchUserSessionData = async (activeToken = token) => {
    if (!activeToken) {
      setUser(null);
      setAddresses([]);
      return;
    }
    try {
      const [meRes, cartRes, wishRes, ordRes] = await Promise.all([
        fetch('/api/me/', { headers: { Authorization: `Bearer ${activeToken}` } }),
        fetch('/api/cart/', { headers: { Authorization: `Bearer ${activeToken}` } }),
        fetch('/api/wishlist/', { headers: { Authorization: `Bearer ${activeToken}` } }),
        fetch('/api/orders/', { headers: { Authorization: `Bearer ${activeToken}` } }),
      ]);
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
        setAddresses(meData.addresses || []);
      }
      if (cartRes.ok) setCart(await cartRes.json());
      if (wishRes.ok) setWishlist(await wishRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCatalogAndCategories();
    fetchUserSessionData(token);
  }, []);

  // Navigation Helper
  const handleNavigate = (page: PageRoute, categoryFilter?: string) => {
    if (categoryFilter !== undefined) {
      setSelectedCategory(categoryFilter);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setCurrentPage('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Record in Recently Viewed (localStorage)
    const updated = [
      product,
      ...recentlyViewed.filter((p) => p.id !== product.id),
    ].slice(0, 8);
    setRecentlyViewed(updated);
    try {
      localStorage.setItem('aura_recently_viewed', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Cart Handlers (AJAX / Fetch API without page reload)
  const handleAddToCart = async (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      notify(`${product.name} is currently out of stock`, 'error');
      return;
    }
    try {
      const res = await fetch('/api/cart/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: product.id, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || 'Could not add to cart', 'error');
        return;
      }
      setCart(data);
      notify(`Added ${product.name} to cart`, 'success');
    } catch {
      notify('Network error updating cart', 'error');
    }
  };

  const handleBuyNow = async (product: Product, quantity = 1) => {
    await handleAddToCart(product, quantity);
    handleNavigate('checkout');
  };

  const handleUpdateCartQty = async (productId: number, quantity: number) => {
    try {
      const res = await fetch('/api/cart/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || 'Could not update quantity', 'error');
        return;
      }
      setCart(data);
    } catch {
      notify('Error updating cart', 'error');
    }
  };

  const handleRemoveFromCart = async (productId: number) => {
    try {
      const res = await fetch('/api/cart/remove/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });
      if (res.ok) {
        setCart(await res.json());
        notify('Product removed from cart', 'info');
      }
    } catch {
      notify('Error removing item', 'error');
    }
  };

  const handleClearCart = async () => {
    const res = await fetch('/api/cart/clear/', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setCart(await res.json());
      notify('Shopping cart cleared', 'info');
    }
  };

  // Wishlist Handlers
  const wishlistIds = useMemo(() => wishlist.map((w) => w.product_id), [wishlist]);

  const handleToggleWishlist = async (product: Product) => {
    const isSaved = wishlistIds.includes(product.id);
    try {
      const res = await fetch(isSaved ? '/api/wishlist/remove/' : '/api/wishlist/add/', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: product.id }),
      });
      if (res.ok) {
        setWishlist(await res.json());
        notify(
          isSaved
            ? `Removed ${product.name} from wishlist`
            : `Saved ${product.name} to wishlist`,
          'info'
        );
      }
    } catch {
      notify('Error updating wishlist', 'error');
    }
  };

  const handleMoveWishlistToCart = async (product: Product) => {
    await handleAddToCart(product, 1);
    await handleToggleWishlist(product);
  };

  // Order Handlers
  const handleCancelOrder = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel/`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || 'Cannot cancel order', 'error');
        return;
      }
      notify(`Order #${data.order_number} cancelled & stock restored`, 'info');
      fetchUserSessionData(token);
      fetchCatalogAndCategories();
    } catch {
      notify('Error cancelling order', 'error');
    }
  };

  // Filtered & Sorted Products for Catalog View
  const allBrands = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.brand))).sort()],
    [products]
  );

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== 'All') {
      list = list.filter(
        (p) => p.category_name.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category_name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (priceFilter === 'under_500') list = list.filter((p) => p.discount_price < 500);
    else if (priceFilter === '500_1000')
      list = list.filter((p) => p.discount_price >= 500 && p.discount_price <= 1000);
    else if (priceFilter === '1000_5000')
      list = list.filter((p) => p.discount_price > 1000 && p.discount_price <= 5000);
    else if (priceFilter === 'above_5000') list = list.filter((p) => p.discount_price > 5000);

    if (ratingFilter > 0) {
      list = list.filter((p) => p.rating >= ratingFilter);
    }

    if (brandFilter !== 'All') {
      list = list.filter((p) => p.brand === brandFilter);
    }

    if (availabilityFilter === 'in_stock') list = list.filter((p) => p.stock > 0);
    else if (availabilityFilter === 'out_of_stock') list = list.filter((p) => p.stock === 0);

    if (sortBy === 'price_asc') list.sort((a, b) => a.discount_price - b.discount_price);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.discount_price - a.discount_price);
    else if (sortBy === 'newest')
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'popular') list.sort((a, b) => b.review_count - a.review_count);
    else if (sortBy === 'discount') {
      list.sort(
        (a, b) =>
          getDiscountPercent(b.price, b.discount_price) -
          getDiscountPercent(a.price, a.discount_price)
      );
    }

    return list;
  }, [
    products,
    selectedCategory,
    searchQuery,
    priceFilter,
    ratingFilter,
    brandFilter,
    availabilityFilter,
    sortBy,
  ]);

  // Curated Home Collection Subset
  const homeCollectionProducts = useMemo(() => {
    if (homeCollectionTab === 'featured') {
      return products.filter((p) => p.is_featured).slice(0, 6);
    }
    if (homeCollectionTab === 'new') {
      return products.filter((p) => p.is_new).slice(0, 6);
    }
    if (homeCollectionTab === 'bestsellers') {
      return products.filter((p) => p.is_bestseller).slice(0, 6);
    }
    if (homeCollectionTab === 'offers') {
      return [...products]
        .sort(
          (a, b) =>
            getDiscountPercent(b.price, b.discount_price) -
            getDiscountPercent(a.price, a.discount_price)
        )
        .slice(0, 6);
    }
    return [...products].sort((a, b) => b.review_count - a.review_count).slice(0, 6);
  }, [products, homeCollectionTab]);

  const resetCatalogFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setPriceFilter('all');
    setRatingFilter(0);
    setBrandFilter('All');
    setAvailabilityFilter('all');
    setSortBy('relevance');
  };

  const activeSlide = HERO_SLIDES[heroIndex] || HERO_SLIDES[0];

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      {/* Top Bar Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        cartCount={cart.item_count}
        wishlistCount={wishlist.length}
        user={user}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        products={products}
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectProduct={handleSelectProduct}
      />

      {/* MAIN PAGE ROUTER */}
      <main className="flex-1">
        {/* ================================================================
            1. HOME STOREFRONT (Section Ceiling: Hero -> Curated Collection -> Category Showcase -> Craftsmanship/ZIP Banner)
           ================================================================ */}
        {currentPage === 'home' && (
          <div className="space-y-20 pb-16">
            {/* Section 1: Storefront Hero Slider */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 sm:pt-10">
              <div className="relative rounded-2xl overflow-hidden bg-[#18181B] text-[#FBFBF9] border border-black/10 dark:border-white/10">
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] items-center">
                  {/* Left Editorial Copy */}
                  <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 space-y-6 z-10">
                    <div className="flex items-center gap-2 text-xs text-[#D6D3CD] tracking-wide">
                      <span>{activeSlide.kicker}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">0{heroIndex + 1} / 03</span>
                    </div>

                    <h1 className="font-display text-3xl sm:text-5xl font-semibold leading-[1.1] tracking-tight text-white">
                      {activeSlide.title}
                    </h1>

                    <p className="text-sm sm:text-base text-[#D6D3CD] leading-relaxed max-w-xl">
                      {activeSlide.description}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => handleNavigate('products', activeSlide.targetCategory)}
                        className="px-6 py-3 rounded-xl bg-[#FBFBF9] text-[#141413] text-xs font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
                      >
                        <span>{activeSlide.primaryCta}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavigate('categories')}
                        className="px-6 py-3 rounded-xl border border-white/25 text-white text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {activeSlide.secondaryCta}
                      </button>
                    </div>

                    {/* Slider Controls */}
                    <div className="pt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setHeroIndex((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                        }
                        aria-label="Previous slide"
                        className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-1.5">
                        {HERO_SLIDES.map((s, idx) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setHeroIndex(idx)}
                            aria-label={`Slide ${idx + 1}`}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                              heroIndex === idx ? 'w-7 bg-white' : 'w-2 bg-white/35'
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length)}
                        aria-label="Next slide"
                        className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right Studio Photography */}
                  <div className="lg:col-span-6 relative h-72 sm:h-96 lg:h-full min-h-[340px]">
                    <StudioImage
                      src={activeSlide.image}
                      alt={activeSlide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#18181B] via-[#18181B]/30 to-transparent" />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Curated Storefront Collection (Interactive Filter Tabs for Featured / New Arrivals / Best Sellers / Special Offers / Trending) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/[0.07] dark:border-white/[0.08] pb-5">
                <div>
                  <p className="text-xs text-[#85847F]">01. Curated Storefront Edit</p>
                  <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-1">
                    Signature Releases & Essentials
                  </h2>
                </div>

                {/* Interactive Segmented Filter Controls */}
                <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#F4F3EF] dark:bg-[#1A1A1E]">
                  {(
                    [
                      ['featured', 'Featured'],
                      ['new', 'New Arrivals'],
                      ['bestsellers', 'Best Sellers'],
                      ['offers', 'Special Offers'],
                      ['trending', 'Trending'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setHomeCollectionTab(key)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        homeCollectionTab === key
                          ? 'bg-white dark:bg-[#222227] text-[#141413] dark:text-[#F5F5F3] shadow-2xs'
                          : 'text-[#575653] dark:text-[#A6A6A2] hover:text-[#141413] dark:hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {loadingCatalog ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className="aspect-[4/4] rounded-xl bg-black/5 dark:bg-white/5 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                  {homeCollectionProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={wishlistIds.includes(product.id)}
                      onSelectProduct={handleSelectProduct}
                      onQuickView={setQuickViewProduct}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleNavigate('products', 'All')}
                  className="px-6 py-3 rounded-xl border border-black/15 dark:border-white/15 text-xs font-semibold inline-flex items-center gap-2 hover:bg-[#F4F3EF] dark:hover:bg-[#1A1A1E] cursor-pointer"
                >
                  <span>Explore All 30 Products in Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* Section 3: Popular Categories Showcase */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
              <div className="flex items-baseline justify-between border-b border-black/[0.07] dark:border-white/[0.08] pb-5">
                <div>
                  <p className="text-xs text-[#85847F]">02. Department Directory</p>
                  <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-1">
                    Shop by Category
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigate('categories')}
                  className="text-xs font-semibold text-[#9A3412] dark:text-[#EA580C] hover:underline cursor-pointer"
                >
                  View All 10 Categories →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleNavigate('products', cat.name)}
                    className="group rounded-xl overflow-hidden bg-[#F4F3EF]/70 dark:bg-[#1A1A1E] border border-black/[0.06] dark:border-white/[0.07] cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <div className="aspect-[4/3] bg-white dark:bg-[#18181B] overflow-hidden">
                      <StudioImage
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-sm font-semibold truncate">{cat.name}</h3>
                        <span className="font-mono-tabular text-[11px] text-[#85847F]">
                          {cat.product_count || 3} items
                        </span>
                      </div>
                      <p className="text-[11px] text-[#575653] dark:text-[#A6A6A2] line-clamp-1 mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4: Store Guarantees & College Project Source ZIP Callout */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-y border-black/[0.07] dark:border-white/[0.08]">
                <div className="flex items-start gap-4">
                  <Truck className="w-5 h-5 text-[#9A3412] dark:text-[#EA580C] shrink-0 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold">Complimentary Insured Shipping</h3>
                    <p className="text-xs text-[#575653] dark:text-[#A6A6A2] mt-1 leading-relaxed">
                      Free express doorstep delivery across India on all orders above ₹1,999 with real-time 6-stage tracking.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ShieldCheck className="w-5 h-5 text-[#9A3412] dark:text-[#EA580C] shrink-0 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold">100% Authorized Brand Warranty</h3>
                    <p className="text-xs text-[#575653] dark:text-[#A6A6A2] mt-1 leading-relaxed">
                      Every item ships factory-sealed with official manufacturer warranty and GST tax invoice.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <RotateCcw className="w-5 h-5 text-[#9A3412] dark:text-[#EA580C] shrink-0 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold">14-Day Hassle-Free Returns</h3>
                    <p className="text-xs text-[#575653] dark:text-[#A6A6A2] mt-1 leading-relaxed">
                      Easy size exchanges or full refunds with automated inventory restocking upon cancellation.
                    </p>
                  </div>
                </div>
              </div>

              {/*Recently Viewed on Home if available*/}
              {recentlyViewed.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-baseline justify-between">
                    <h2 className="font-display text-2xl font-semibold">Recently Viewed</h2>
                    <span className="text-xs text-[#85847F]">Stored in your browser session</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recentlyViewed.slice(0, 4).map((rv) => (
                      <ProductCard
                        key={rv.id}
                        product={rv}
                        isWishlisted={wishlistIds.includes(rv.id)}
                        onSelectProduct={handleSelectProduct}
                        onQuickView={setQuickViewProduct}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ================================================================
            2. PRODUCT LISTING / CATALOG & SEARCH RESULTS (#4, #7, #8, #9)
           ================================================================ */}
        {(currentPage === 'products' || currentPage === 'search') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
            {/* Catalog Header & Sort Bar */}
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#85847F]">
                  <span>Store Catalog</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedCategory}</span>
                  {searchQuery && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Search: "{searchQuery}"</span>
                    </>
                  )}
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-1">
                  {selectedCategory === 'All' ? 'All Curated Products' : selectedCategory}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden px-3.5 py-2 rounded-xl border border-black/15 dark:border-white/15 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>

                <div className="flex items-center gap-2 text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#85847F]" />
                  <span className="text-[#575653] dark:text-[#A6A6A2]">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#F4F3EF] dark:bg-[#1A1A1E] border border-black/10 dark:border-white/10 text-xs font-semibold cursor-pointer focus:outline-none"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="rating">Best Rated</option>
                    <option value="popular">Most Popular</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Filter Sidebar (Desktop) */}
              <aside className="hidden lg:block lg:col-span-3 space-y-6 p-5 rounded-2xl bg-[#F4F3EF]/60 dark:bg-[#1A1A1E] border border-black/[0.06] dark:border-white/[0.07]">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Filter Products</h2>
                  <button
                    type="button"
                    onClick={resetCatalogFilters}
                    className="text-xs text-[#9A3412] dark:text-[#EA580C] hover:underline cursor-pointer"
                  >
                    Reset All
                  </button>
                </div>

                {/* Category Filter */}
                <div className="space-y-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.07]">
                  <h3 className="text-xs font-semibold text-[#575653] dark:text-[#A6A6A2]">
                    Category
                  </h3>
                  <div className="space-y-1">
                    {['All', ...categories.map((c) => c.name)].map((catName) => (
                      <button
                        key={catName}
                        type="button"
                        onClick={() => setSelectedCategory(catName)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          selectedCategory === catName
                            ? 'bg-[#141413] text-white dark:bg-[#F5F5F3] dark:text-[#121214] font-semibold'
                            : 'text-[#575653] dark:text-[#A6A6A2] hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        {catName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter (in ₹) */}
                <div className="space-y-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.07]">
                  <h3 className="text-xs font-semibold text-[#575653] dark:text-[#A6A6A2]">
                    Price Range (₹)
                  </h3>
                  <div className="space-y-1">
                    {(
                      [
                        ['all', 'All Prices'],
                        ['under_500', 'Under ₹500'],
                        ['500_1000', '₹500 – ₹1,000'],
                        ['1000_5000', '₹1,000 – ₹5,000'],
                        ['above_5000', '₹5,000+'],
                      ] as const
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPriceFilter(val)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono-tabular transition-colors cursor-pointer ${
                          priceFilter === val
                            ? 'bg-[#141413] text-white dark:bg-[#F5F5F3] dark:text-[#121214] font-semibold'
                            : 'text-[#575653] dark:text-[#A6A6A2] hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Rating Filter */}
                <div className="space-y-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.07]">
                  <h3 className="text-xs font-semibold text-[#575653] dark:text-[#A6A6A2]">
                    Customer Rating
                  </h3>
                  <div className="space-y-1">
                    {[
                      [0, 'All Ratings'],
                      [4, '4★ & above'],
                      [3, '3★ & above'],
                    ].map(([stars, label]) => (
                      <button
                        key={String(stars)}
                        type="button"
                        onClick={() => setRatingFilter(Number(stars))}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          ratingFilter === Number(stars)
                            ? 'bg-[#141413] text-white dark:bg-[#F5F5F3] dark:text-[#121214] font-semibold'
                            : 'text-[#575653] dark:text-[#A6A6A2] hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="space-y-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.07]">
                  <h3 className="text-xs font-semibold text-[#575653] dark:text-[#A6A6A2]">
                    Brand
                  </h3>
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-[#222227] border border-black/10 dark:border-white/10 text-xs"
                  >
                    {allBrands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability Filter */}
                <div className="space-y-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.07]">
                  <h3 className="text-xs font-semibold text-[#575653] dark:text-[#A6A6A2]">
                    Availability
                  </h3>
                  <div className="space-y-1">
                    {(
                      [
                        ['all', 'All Items'],
                        ['in_stock', 'In Stock Only'],
                        ['out_of_stock', 'Out of Stock'],
                      ] as const
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAvailabilityFilter(val)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          availabilityFilter === val
                            ? 'bg-[#141413] text-white dark:bg-[#F5F5F3] dark:text-[#121214] font-semibold'
                            : 'text-[#575653] dark:text-[#A6A6A2] hover:bg-black/5'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Right Product Grid */}
              <div className="lg:col-span-9 space-y-6">
                <div className="flex items-center justify-between text-xs text-[#575653] dark:text-[#A6A6A2]">
                  <span>
                    Showing <strong className="font-mono-tabular text-[#141413] dark:text-white">{filteredProducts.length}</strong> products
                  </span>
                  {(selectedCategory !== 'All' ||
                    searchQuery ||
                    priceFilter !== 'all' ||
                    ratingFilter > 0 ||
                    brandFilter !== 'All' ||
                    availabilityFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={resetCatalogFilters}
                      className="text-[#9A3412] dark:text-[#EA580C] font-semibold hover:underline cursor-pointer"
                    >
                      Clear active filters
                    </button>
                  )}
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="p-16 rounded-2xl bg-[#F4F3EF]/50 dark:bg-[#1A1A1E] text-center space-y-4">
                    <h3 className="font-display text-2xl font-semibold">No products found.</h3>
                    <p className="text-xs text-[#575653] dark:text-[#A6A6A2] max-w-md mx-auto">
                      No items match your current filter combination. Try clearing filters or searching another keyword.
                    </p>
                    <button
                      type="button"
                      onClick={resetCatalogFilters}
                      className="px-5 py-2.5 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isWishlisted={wishlistIds.includes(product.id)}
                        onSelectProduct={handleSelectProduct}
                        onQuickView={setQuickViewProduct}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Filter Bottom Sheet */}
            {mobileFilterOpen && (
              <div className="fixed inset-0 z-50 lg:hidden bg-black/50 backdrop-blur-xs flex items-end">
                <div className="w-full max-h-[82vh] overflow-y-auto bg-[#FBFBF9] dark:bg-[#1A1A1E] rounded-t-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-black/10 pb-3">
                    <h3 className="font-display text-xl font-semibold">Filter Catalog</h3>
                    <button
                      type="button"
                      onClick={() => setMobileFilterOpen(false)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#222227] border border-black/15 text-xs"
                      >
                        {['All', ...categories.map((c) => c.name)].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">Price Range</label>
                      <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#222227] border border-black/15 text-xs"
                      >
                        <option value="all">All Prices</option>
                        <option value="under_500">Under ₹500</option>
                        <option value="500_1000">₹500 – ₹1,000</option>
                        <option value="1000_5000">₹1,000 – ₹5,000</option>
                        <option value="above_5000">₹5,000+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">Minimum Rating</label>
                      <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#222227] border border-black/15 text-xs"
                      >
                        <option value={0}>All Ratings</option>
                        <option value={4}>4★ & above</option>
                        <option value={3}>3★ & above</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">Brand</label>
                      <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#222227] border border-black/15 text-xs"
                      >
                        {allBrands.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        resetCatalogFilters();
                        setMobileFilterOpen(false);
                      }}
                      className="flex-1 py-3 rounded-xl border border-black/15 text-xs font-semibold"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileFilterOpen(false)}
                      className="flex-1 py-3 rounded-xl bg-[#141413] text-white text-xs font-semibold"
                    >
                      Apply ({filteredProducts.length})
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            3. CATEGORIES DIRECTORY PAGE (#5)
           ================================================================ */}
        {currentPage === 'categories' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold">
                Product Categories
              </h1>
              <p className="text-xs text-[#575653] dark:text-[#A6A6A2] mt-1">
                Select any of our 10 departments to browse products belonging to that category
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleNavigate('products', cat.name)}
                  className="group rounded-2xl overflow-hidden bg-[#F4F3EF]/70 dark:bg-[#1A1A1E] border border-black/[0.07] dark:border-white/[0.08] cursor-pointer transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="aspect-[16/10] bg-white dark:bg-[#18181B] overflow-hidden">
                    <StudioImage
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5 flex items-baseline justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-semibold">{cat.name}</h2>
                      <p className="text-xs text-[#575653] dark:text-[#A6A6A2] mt-1">
                        {cat.description}
                      </p>
                    </div>
                    <span className="font-mono-tabular text-xs font-semibold text-[#9A3412] dark:text-[#EA580C] shrink-0">
                      {cat.product_count || 3} SKUs →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================
            4. PRODUCT DETAILS PAGE (#6)
           ================================================================ */}
        {currentPage === 'product-details' && (
          <ProductDetailView
            productId={selectedProductId}
            user={user}
            token={token}
            wishlistIds={wishlistIds}
            recentlyViewed={recentlyViewed}
            onBack={() => handleNavigate('products')}
            onSelectProduct={handleSelectProduct}
            onQuickView={setQuickViewProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            onNotify={notify}
            onNavigateCategory={(catName) => handleNavigate('products', catName)}
          />
        )}

        {/* ================================================================
            5. SHOPPING CART PAGE (#10)
           ================================================================ */}
        {currentPage === 'cart' && (
          <CartView
            cart={cart}
            onUpdateQty={handleUpdateCartQty}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        )}

        {/* ================================================================
            6. MULTI-STEP CHECKOUT PAGE (#14)
           ================================================================ */}
        {currentPage === 'checkout' && (
          <CheckoutView
            cart={cart}
            user={user}
            token={token}
            addresses={addresses}
            coupons={coupons}
            onRefreshAddresses={() => fetchUserSessionData(token)}
            onOrderSuccess={(newOrder) => {
              setLastPlacedOrder(newOrder);
              fetchUserSessionData(token);
              fetchCatalogAndCategories();
              notify(`Order #${newOrder.order_number} placed successfully!`, 'success');
              handleNavigate('order-confirmation');
            }}
            onNavigate={handleNavigate}
            onNotify={notify}
          />
        )}

        {/* ================================================================
            7. ORDER CONFIRMATION PAGE (#18)
           ================================================================ */}
        {currentPage === 'order-confirmation' && (
          <OrderConfirmationView order={lastPlacedOrder} onNavigate={handleNavigate} />
        )}

        {/* ================================================================
            8. MY ORDERS & TRACKING PAGE (#16, #17)
           ================================================================ */}
        {currentPage === 'orders' && (
          <OrdersView
            orders={orders}
            onCancelOrder={handleCancelOrder}
            onNavigate={handleNavigate}
            onSelectProductById={(id) => {
              const found = products.find((p) => p.id === id);
              if (found) handleSelectProduct(found);
            }}
          />
        )}

        {/* ================================================================
            9. WISHLIST PAGE (#11)
           ================================================================ */}
        {currentPage === 'wishlist' && (
          <WishlistView
            wishlist={wishlist}
            onRemoveWishlist={handleToggleWishlist}
            onMoveToCart={handleMoveWishlistToCart}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        )}

        {/* ================================================================
            10. USER PROFILE DASHBOARD (#13)
           ================================================================ */}
        {currentPage === 'profile' &&
          (user ? (
            <ProfileView
              user={user}
              token={token}
              addresses={addresses}
              ordersCount={orders.length}
              wishlistCount={wishlist.length}
              onUserUpdated={setUser}
              onRefreshAddresses={() => fetchUserSessionData(token)}
              onLogout={() => {
                fetch('/api/logout/', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}` },
                });
                setToken('');
                setUser(null);
                try {
                  localStorage.removeItem('aura_token');
                } catch {
                  // ignore
                }
                notify('Logged out successfully', 'info');
                handleNavigate('login');
              }}
              onNavigate={handleNavigate}
              onNotify={notify}
            />
          ) : (
            <AuthView
              mode="login"
              onNavigate={handleNavigate}
              onAuthSuccess={(newTok, newUsr) => {
                setToken(newTok);
                setUser(newUsr);
                try {
                  localStorage.setItem('aura_token', newTok);
                } catch {
                  // ignore
                }
                fetchUserSessionData(newTok);
                handleNavigate('profile');
              }}
              onNotify={notify}
            />
          ))}

        {/* ================================================================
            11. AUTH PAGES: LOGIN / REGISTER / FORGOT PASSWORD (#12)
           ================================================================ */}
        {(currentPage === 'login' ||
          currentPage === 'register' ||
          currentPage === 'forgot-password') && (
          <AuthView
            mode={currentPage}
            onNavigate={handleNavigate}
            onAuthSuccess={(newTok, newUsr) => {
              setToken(newTok);
              setUser(newUsr);
              try {
                localStorage.setItem('aura_token', newTok);
              } catch {
                // ignore
              }
              fetchUserSessionData(newTok);
              handleNavigate('home');
            }}
            onNotify={notify}
          />
        )}

        {/* ================================================================
            12. STORE ADMIN DASHBOARD (#24)
           ================================================================ */}
        {currentPage === 'admin' && (
          <AdminDashboardView
            products={products}
            categories={categories}
            onRefreshCatalog={fetchCatalogAndCategories}
            onNotify={notify}
          />
        )}

        {/* ================================================================
            13. COLLEGE PROJECT DELIVERABLES & SOURCE ZIP DOWNLOAD (#38)
           ================================================================ */}
        {currentPage === 'project-zip' && <ProjectDeliverablesView onNotify={notify} />}
      </main>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div
          onClick={() => setQuickViewProduct(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-[#FBFBF9] dark:bg-[#1A1A1E] border border-black/10 dark:border-white/10 overflow-hidden grid grid-cols-1 sm:grid-cols-2 shadow-2xl"
          >
            <div className="aspect-[4/3] sm:aspect-auto bg-[#F4F3EF] dark:bg-[#18181B]">
              <StudioImage
                src={quickViewProduct.image}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-[#85847F]">
                  <span>
                    {quickViewProduct.brand} · {quickViewProduct.category_name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuickViewProduct(null)}
                    className="w-7 h-7 rounded-lg hover:bg-black/5 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-display text-2xl font-semibold mt-1">
                  {quickViewProduct.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs mt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span className="font-mono-tabular font-semibold">
                    {quickViewProduct.rating}
                  </span>
                  <span className="text-[#85847F]">
                    ({quickViewProduct.review_count} reviews)
                  </span>
                </div>
                <p className="font-mono-tabular text-xl font-semibold mt-3">
                  {formatINR(quickViewProduct.discount_price)}{' '}
                  {quickViewProduct.price > quickViewProduct.discount_price && (
                    <span className="text-xs text-[#85847F] line-through ml-1">
                      {formatINR(quickViewProduct.price)}
                    </span>
                  )}
                </p>
                <p className="text-xs text-[#575653] dark:text-[#A6A6A2] mt-2 leading-relaxed line-clamp-3">
                  {quickViewProduct.description}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={quickViewProduct.stock <= 0}
                  onClick={() => {
                    handleAddToCart(quickViewProduct, 1);
                    setQuickViewProduct(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const p = quickViewProduct;
                    setQuickViewProduct(null);
                    handleSelectProduct(p);
                  }}
                  className="w-full py-2 px-4 rounded-xl border border-black/15 dark:border-white/15 text-xs font-semibold cursor-pointer"
                >
                  View Full Specifications & Reviews
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATIONS (Modern non-blocking toasts) */}
      <div className="fixed bottom-16 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium transition-all ${
              t.type === 'error'
                ? 'bg-red-950 text-red-100 border-red-800'
                : 'bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] border-black/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 dark:text-emerald-600" />
              <span>{t.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* CLEAN EDITORIAL FOOTER */}
      <footer className="border-t border-black/[0.08] dark:border-white/[0.08] bg-[#F4F3EF]/50 dark:bg-[#16161A] py-12 px-4 sm:px-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-md">
            <span className="font-display text-2xl font-semibold">Aura Market</span>
            <p className="text-xs text-[#575653] dark:text-[#A6A6A2] leading-relaxed">
              Full-stack E-Commerce Shopping Platform with relational database, REST APIs, multi-step checkout, live order tracking, and Admin Dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#575653] dark:text-[#A6A6A2]">
            <button
              type="button"
              onClick={() => handleNavigate('products', 'All')}
              className="hover:text-[#141413] dark:hover:text-white cursor-pointer"
            >
              All 30 Products
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('categories')}
              className="hover:text-[#141413] dark:hover:text-white cursor-pointer"
            >
              10 Categories
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('orders')}
              className="hover:text-[#141413] dark:hover:text-white cursor-pointer"
            >
              Track Orders
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('admin')}
              className="hover:text-[#141413] dark:hover:text-white cursor-pointer"
            >
              Admin Dashboard
            </button>
            <button
              type="button"
              onClick={() => downloadFullProjectZip(notify)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#9A3412] text-white font-semibold hover:opacity-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Project ZIP</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
