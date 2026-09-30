import React, { useEffect, useRef, useState } from 'react';
import {
  Clock,
  FolderArchive,
  Grid,
  Heart,
  Home,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react';
import { Category, PageRoute, Product, StudioImage, User, formatINR } from '../types.ts';

interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute, categoryFilter?: string) => void;
  cartCount: number;
  wishlistCount: number;
  user: User | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  products: Product[];
  categories: Category[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectProduct: (product: Product) => void;
}

const POPULAR_SUGGESTIONS = [
  'wireless headphones',
  'titanium watch',
  'oled laptop',
  'running sneaker',
  '5G smartphone',
  'mechanical keyboard',
];

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  cartCount,
  wishlistCount,
  user,
  darkMode,
  onToggleDarkMode,
  products,
  categories,
  searchQuery,
  onSearchChange,
  onSelectProduct,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aura_search_history');
      return saved ? JSON.parse(saved) : ['wireless headphones', 'chronograph watch'];
    } catch {
      return [];
    }
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const saveSearchTerm = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    const updated = [clean, ...searchHistory.filter((h) => h.toLowerCase() !== clean.toLowerCase())].slice(
      0,
      6
    );
    setSearchHistory(updated);
    try {
      localStorage.setItem('aura_search_history', JSON.stringify(updated));
    } catch {
      // ignore storage quota errors
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('aura_search_history');
    } catch {
      // ignore
    }
  };

  const liveMatches =
    searchQuery.trim().length > 0
      ? products
          .filter((p) => {
            const q = searchQuery.toLowerCase();
            return (
              p.name.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q) ||
              p.category_name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q)
            );
          })
          .slice(0, 6)
      : [];

  const handleExecuteSearch = (term: string) => {
    onSearchChange(term);
    saveSearchTerm(term);
    setSearchOpen(false);
    onNavigate('products');
  };

  return (
    <>
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 h-16 w-full bg-[#FBFBF9]/95 dark:bg-[#121214]/95 backdrop-blur-md border-b border-black/[0.07] dark:border-white/[0.08] px-4 sm:px-8 flex items-center justify-between">
        {/* Zone 1: Single Text Element Brand Wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('home');
          }}
          className="font-display text-2xl font-semibold tracking-tight text-[#141413] dark:text-[#F5F5F3] whitespace-nowrap shrink-0"
        >
          Aura Market
        </a>

        {/* Zone 2: 5 Clean Single-Line Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#575653] dark:text-[#A6A6A2]">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              currentPage === 'home'
                ? 'border-[#141413] dark:border-[#F5F5F3] text-[#141413] dark:text-[#F5F5F3]'
                : 'border-transparent hover:text-[#141413] dark:hover:text-[#F5F5F3]'
            }`}
          >
            Storefront
          </button>
          <button
            type="button"
            onClick={() => onNavigate('products', 'All')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              currentPage === 'products'
                ? 'border-[#141413] dark:border-[#F5F5F3] text-[#141413] dark:text-[#F5F5F3]'
                : 'border-transparent hover:text-[#141413] dark:hover:text-[#F5F5F3]'
            }`}
          >
            Catalog
          </button>
          <button
            type="button"
            onClick={() => onNavigate('categories')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              currentPage === 'categories'
                ? 'border-[#141413] dark:border-[#F5F5F3] text-[#141413] dark:text-[#F5F5F3]'
                : 'border-transparent hover:text-[#141413] dark:hover:text-[#F5F5F3]'
            }`}
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              currentPage === 'orders'
                ? 'border-[#141413] dark:border-[#F5F5F3] text-[#141413] dark:text-[#F5F5F3]'
                : 'border-transparent hover:text-[#141413] dark:hover:text-[#F5F5F3]'
            }`}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() => onNavigate('admin')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              currentPage === 'admin'
                ? 'border-[#141413] dark:border-[#F5F5F3] text-[#141413] dark:text-[#F5F5F3]'
                : 'border-transparent hover:text-[#141413] dark:hover:text-[#F5F5F3]'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => onNavigate('project-zip')}
            className={`hidden xl:inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              currentPage === 'project-zip'
                ? 'border-[#9A3412] dark:border-[#EA580C] text-[#9A3412] dark:text-[#EA580C]'
                : 'border-transparent text-[#9A3412] dark:text-[#EA580C] hover:opacity-80'
            }`}
          >
            Project ZIP
          </button>
        </nav>

        {/* Zone 3: Primary Interactive Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search Products"
            className="h-10 px-3 rounded-lg bg-[#F4F3EF] dark:bg-[#1A1A1E] text-[#141413] dark:text-[#F5F5F3] flex items-center gap-2 text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline text-[#575653] dark:text-[#A6A6A2] whitespace-nowrap">
              {searchQuery ? `"${searchQuery.slice(0, 14)}"` : 'Search catalog...'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('wishlist')}
            aria-label="Wishlist"
            className="relative w-10 h-10 rounded-lg hover:bg-[#F4F3EF] dark:hover:bg-[#1A1A1E] flex items-center justify-center text-[#141413] dark:text-[#F5F5F3] transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute top-1.5 right-1.5 font-mono-tabular text-[10px] font-semibold text-[#9A3412] dark:text-[#EA580C]">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('cart')}
            aria-label="Shopping Cart"
            className="h-10 px-3.5 rounded-lg bg-[#141413] dark:bg-[#F5F5F3] text-[#FBFBF9] dark:text-[#121214] flex items-center gap-2 text-xs font-semibold whitespace-nowrap hover:opacity-90 transition-opacity cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="font-mono-tabular">{cartCount}</span>
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label="Toggle Dark Mode"
            className="w-10 h-10 rounded-lg hover:bg-[#F4F3EF] dark:hover:bg-[#1A1A1E] flex items-center justify-center text-[#141413] dark:text-[#F5F5F3] transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => onNavigate(user ? 'profile' : 'login')}
            className="hidden sm:inline-flex h-10 px-3 rounded-lg border border-black/10 dark:border-white/15 text-xs font-medium text-[#141413] dark:text-[#F5F5F3] items-center gap-1.5 whitespace-nowrap hover:bg-[#F4F3EF] dark:hover:bg-[#1A1A1E] transition-colors cursor-pointer"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span className="max-w-[90px] truncate">{user ? user.first_name : 'Sign In'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open Navigation Menu"
            className="md:hidden w-10 h-10 rounded-lg hover:bg-[#F4F3EF] dark:hover:bg-[#1A1A1E] flex items-center justify-center text-[#141413] dark:text-[#F5F5F3]"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* DYNAMIC INSTANT SEARCH OVERLAY (WITHOUT PAGE RELOAD) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
          <div className="w-full max-w-3xl bg-[#FBFBF9] dark:bg-[#1A1A1E] rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-black/[0.07] dark:border-white/[0.08]">
              <Search className="w-5 h-5 text-[#85847F] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExecuteSearch(searchQuery);
                  if (e.key === 'Escape') setSearchOpen(false);
                }}
                placeholder="Search by product name, brand (e.g. Sennheiser, Tissot, Apple), or category..."
                className="w-full bg-transparent text-sm sm:text-base text-[#141413] dark:text-[#F5F5F3] placeholder-[#85847F] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-xs text-[#85847F] hover:text-[#141413] dark:hover:text-white whitespace-nowrap cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close Search"
                className="w-8 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Instant Dynamic Product Results */}
              {searchQuery.trim().length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#575653] dark:text-[#A6A6A2]">
                      Instant Matches ({liveMatches.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleExecuteSearch(searchQuery)}
                      className="text-xs font-semibold text-[#9A3412] dark:text-[#EA580C] hover:underline cursor-pointer"
                    >
                      View all results in catalog →
                    </button>
                  </div>

                  {liveMatches.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-sm font-medium text-[#141413] dark:text-[#F5F5F3]">
                        No products found matching "{searchQuery}"
                      </p>
                      <p className="text-xs text-[#85847F] mt-1">
                        Try searching for "wireless headphones", "titanium", "OLED", or "sneaker".
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {liveMatches.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            saveSearchTerm(searchQuery);
                            setSearchOpen(false);
                            onSelectProduct(prod);
                          }}
                          className="flex items-center gap-3.5 p-2.5 rounded-xl bg-[#F4F3EF]/80 dark:bg-[#222227] hover:bg-[#F4F3EF] dark:hover:bg-[#2A2A30] cursor-pointer transition-colors"
                        >
                          <StudioImage
                            src={prod.image}
                            alt={prod.name}
                            className="w-14 h-14 rounded-lg object-cover shrink-0 bg-white dark:bg-[#18181B]"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-[#575653] dark:text-[#A6A6A2] truncate">
                              {prod.brand} · {prod.category_name}
                            </p>
                            <p className="text-sm font-semibold text-[#141413] dark:text-[#F5F5F3] truncate">
                              {prod.name}
                            </p>
                            <p className="text-xs font-mono-tabular font-semibold text-[#9A3412] dark:text-[#EA580C] mt-0.5">
                              {formatINR(prod.discount_price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Recent Search History */}
                  {searchHistory.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-semibold text-[#575653] dark:text-[#A6A6A2]">
                          Recent Searches
                        </span>
                        <button
                          type="button"
                          onClick={clearSearchHistory}
                          className="inline-flex items-center gap-1 text-xs text-[#85847F] hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear history</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleExecuteSearch(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F3EF] dark:bg-[#222227] text-xs text-[#141413] dark:text-[#F5F5F3] hover:opacity-85 cursor-pointer"
                          >
                            <Clock className="w-3 h-3 text-[#85847F]" />
                            <span>{item}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Curated Search Suggestions */}
                  <div>
                    <span className="block text-xs font-semibold text-[#575653] dark:text-[#A6A6A2] mb-2.5">
                      Popular Searches
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SUGGESTIONS.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => handleExecuteSearch(sug)}
                          className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-xs font-medium text-[#141413] dark:text-[#F5F5F3] hover:bg-[#F4F3EF] dark:hover:bg-[#222227] cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE SLIDE-OVER MENU */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-72 bg-[#FBFBF9] dark:bg-[#121214] h-full p-6 flex flex-col justify-between border-l border-black/10 dark:border-white/10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                <span className="font-display text-xl font-semibold">Aura Market</span>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                {(
                  [
                    ['home', 'Home Storefront'],
                    ['products', 'All Products (30)'],
                    ['categories', '10 Product Categories'],
                    ['orders', 'My Orders & Tracking'],
                    ['wishlist', `Saved Wishlist (${wishlistCount})`],
                    ['profile', user ? `Profile (${user.first_name})` : 'Sign In / Register'],
                    ['admin', 'Admin Dashboard'],
                    ['project-zip', 'Download College Project ZIP'],
                  ] as Array<[PageRoute, string]>
                ).map(([route, label]) => (
                  <button
                    key={route}
                    type="button"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      onNavigate(route);
                    }}
                    className={`text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === route
                        ? 'bg-[#141413] text-[#FBFBF9] dark:bg-[#F5F5F3] dark:text-[#121214]'
                        : 'text-[#575653] dark:text-[#A6A6A2] hover:bg-[#F4F3EF] dark:hover:bg-[#1A1A1E]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-black/10 dark:border-white/10">
                <p className="text-xs font-semibold text-[#85847F] mb-2">Quick Categories</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.slice(0, 8).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        onNavigate('products', c.name);
                      }}
                      className="text-left text-xs py-1.5 px-2 rounded hover:bg-[#F4F3EF] dark:hover:bg-[#1A1A1E] truncate"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileDrawerOpen(false);
                onNavigate('project-zip');
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-[#9A3412] text-white text-xs font-semibold flex items-center justify-center gap-2"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Get Complete Project ZIP</span>
            </button>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR (<= 15% Viewport Cap) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-[#FBFBF9]/95 dark:bg-[#121214]/95 backdrop-blur-md border-t border-black/[0.08] dark:border-white/[0.08] grid grid-cols-5 items-center px-2">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium ${
            currentPage === 'home'
              ? 'text-[#141413] dark:text-[#F5F5F3]'
              : 'text-[#85847F]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('categories')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium ${
            currentPage === 'categories'
              ? 'text-[#141413] dark:text-[#F5F5F3]'
              : 'text-[#85847F]'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Categories</span>
        </button>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium text-[#85847F]"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('cart')}
          className={`relative flex flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium ${
            currentPage === 'cart'
              ? 'text-[#141413] dark:text-[#F5F5F3]'
              : 'text-[#85847F]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Cart ({cartCount})</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate(user ? 'profile' : 'login')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium ${
            currentPage === 'profile' || currentPage === 'login'
              ? 'text-[#141413] dark:text-[#F5F5F3]'
              : 'text-[#85847F]'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile</span>
        </button>
      </nav>
    </>
  );
};
