import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  AddressRecord,
  CartItemRecord,
  CartRecord,
  CategoryRecord,
  CouponRecord,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_PRODUCTS,
  INITIAL_PRODUCT_IMAGES,
  INITIAL_REVIEWS,
  OrderItemRecord,
  OrderRecord,
  OrderStatus,
  ProductImageRecord,
  ProductRecord,
  ReviewRecord,
  UserRecord,
  WishlistRecord,
} from './seedData.ts';

export interface DatabaseState {
  users: UserRecord[];
  categories: CategoryRecord[];
  products: ProductRecord[];
  product_images: ProductImageRecord[];
  carts: CartRecord[];
  cart_items: CartItemRecord[];
  wishlists: WishlistRecord[];
  addresses: AddressRecord[];
  orders: OrderRecord[];
  order_items: OrderItemRecord[];
  reviews: ReviewRecord[];
  coupons: CouponRecord[];
  sessions: Record<string, number>; // token -> user_id
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'ecommerce_sqlite_store.json');

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`aura_salt_2026_${password}`).digest('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

function createInitialDatabase(): DatabaseState {
  const defaultAddresses: AddressRecord[] = [
    {
      id: 1,
      user_id: 2,
      full_name: 'Aarav Sharma',
      phone: '+91 98450 72190',
      address: 'Flat 402, Elmwood Residency, 12th Main Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      country: 'India',
      is_default: true,
    },
    {
      id: 2,
      user_id: 2,
      full_name: 'Aarav Sharma (Campus Hostel)',
      phone: '+91 98450 72190',
      address: 'Room 214, Block B, Tech Innovation Park, HITEC City',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      country: 'India',
      is_default: false,
    },
  ];

  const defaultUsers: UserRecord[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@auramarket.in',
      password_hash: hashPassword('admin123'),
      first_name: 'Vikram',
      last_name: 'Deshmukh',
      phone: '+91 98201 11000',
      profile_picture: '',
      role: 'admin',
      active: true,
      created_at: '2026-01-01T09:00:00Z',
    },
    {
      id: 2,
      username: 'aarav_sharma',
      email: 'aarav@example.com',
      password_hash: hashPassword('customer123'),
      first_name: 'Aarav',
      last_name: 'Sharma',
      phone: '+91 98450 72190',
      profile_picture: '',
      role: 'customer',
      active: true,
      created_at: '2026-01-15T11:30:00Z',
    },
    {
      id: 3,
      username: 'meera_nair',
      email: 'meera@example.com',
      password_hash: hashPassword('customer123'),
      first_name: 'Meera',
      last_name: 'Nair',
      phone: '+91 98112 44820',
      profile_picture: '',
      role: 'customer',
      active: true,
      created_at: '2026-01-20T14:15:00Z',
    },
  ];

  const defaultOrders: OrderRecord[] = [
    {
      id: 1,
      user_id: 2,
      order_number: 'ORD100245',
      subtotal: 24990,
      discount: 2499,
      delivery_charge: 0,
      tax: 1125,
      total_amount: 23616,
      coupon_code: 'SAVE10',
      payment_method: 'UPI',
      status: 'Delivered',
      shipping_address: defaultAddresses[0],
      created_at: '2026-03-01T10:20:00Z',
    },
    {
      id: 2,
      user_id: 2,
      order_number: 'ORD100246',
      subtotal: 14489,
      discount: 1449,
      delivery_charge: 0,
      tax: 652,
      total_amount: 13692,
      coupon_code: 'SAVE10',
      payment_method: 'Credit/Debit Card',
      status: 'Out for Delivery',
      shipping_address: defaultAddresses[0],
      created_at: '2026-03-22T15:40:00Z',
    },
    {
      id: 3,
      user_id: 3,
      order_number: 'ORD100247',
      subtotal: 118990,
      discount: 4000,
      delivery_charge: 0,
      tax: 5750,
      total_amount: 120740,
      coupon_code: 'SAVE20',
      payment_method: 'Credit/Debit Card',
      status: 'Shipped',
      shipping_address: {
        id: 3,
        user_id: 3,
        full_name: 'Meera Nair',
        phone: '+91 98112 44820',
        address: '14, Sea Breeze Promenade, Worli Sea Face',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400030',
        country: 'India',
      },
      created_at: '2026-03-25T09:10:00Z',
    },
  ];

  const defaultOrderItems: OrderItemRecord[] = [
    {
      id: 1,
      order_id: 1,
      product_id: 1,
      product_name: 'Aether Studio ANC Over-Ear Headphones',
      product_image: INITIAL_PRODUCTS[0].image,
      brand: 'Sennheiser',
      quantity: 1,
      price: 24990,
    },
    {
      id: 2,
      order_id: 2,
      product_id: 4,
      product_name: 'AeroStride Carbon Plate Running Sneaker',
      product_image: INITIAL_PRODUCTS[3].image,
      brand: 'New Balance',
      quantity: 1,
      price: 13499,
    },
    {
      id: 3,
      order_id: 2,
      product_id: 18,
      product_name: 'Uniqlo U Heavyweight Supima Cotton Crew Neck Tee',
      product_image: INITIAL_PRODUCTS[17].image,
      brand: 'Uniqlo',
      quantity: 1,
      price: 990,
    },
    {
      id: 4,
      order_id: 3,
      product_id: 3,
      product_name: 'Zenith Pro 14 OLED Creator Ultrabook',
      product_image: INITIAL_PRODUCTS[2].image,
      brand: 'ASUS',
      quantity: 1,
      price: 118990,
    },
  ];

  const defaultCarts: CartRecord[] = [
    { id: 1, user_id: 1, created_at: '2026-01-01T09:00:00Z', updated_at: '2026-01-01T09:00:00Z' },
    { id: 2, user_id: 2, created_at: '2026-01-15T11:30:00Z', updated_at: '2026-03-25T11:30:00Z' },
    { id: 3, user_id: 3, created_at: '2026-01-20T14:15:00Z', updated_at: '2026-01-20T14:15:00Z' },
  ];

  const defaultCartItems: CartItemRecord[] = [
    { id: 1, cart_id: 2, product_id: 9, quantity: 1 },
    { id: 2, cart_id: 2, product_id: 20, quantity: 1 },
  ];

  const defaultWishlists: WishlistRecord[] = [
    { id: 1, user_id: 2, product_id: 2, created_at: '2026-03-10T10:00:00Z' },
    { id: 2, user_id: 2, product_id: 3, created_at: '2026-03-12T10:00:00Z' },
    { id: 3, user_id: 2, product_id: 10, created_at: '2026-03-15T10:00:00Z' },
  ];

  return {
    users: defaultUsers,
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
    product_images: INITIAL_PRODUCT_IMAGES,
    carts: defaultCarts,
    cart_items: defaultCartItems,
    wishlists: defaultWishlists,
    addresses: defaultAddresses,
    orders: defaultOrders,
    order_items: defaultOrderItems,
    reviews: INITIAL_REVIEWS,
    coupons: INITIAL_COUPONS,
    sessions: {
      demo_customer_token: 2,
      demo_admin_token: 1,
    },
  };
}

class RelationalStore {
  public state: DatabaseState;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.state = JSON.parse(raw);
      } catch {
        this.state = createInitialDatabase();
        this.save();
      }
    } else {
      this.state = createInitialDatabase();
      this.save();
    }
  }

  public save(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Database write error:', err);
    }
  }

  public resetToSeed(): void {
    this.state = createInitialDatabase();
    this.save();
  }

  public recalculateProductRating(productId: number): void {
    const product = this.state.products.find((p) => p.id === productId);
    if (!product) return;
    const prodReviews = this.state.reviews.filter((r) => r.product_id === productId);
    if (prodReviews.length === 0) return;
    const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    product.rating = Number(avg.toFixed(1));
    product.review_count = prodReviews.length;
    this.save();
  }

  public getOrCreateCart(userId: number): CartRecord {
    let cart = this.state.carts.find((c) => c.user_id === userId);
    if (!cart) {
      const nextId = this.state.carts.reduce((max, c) => Math.max(max, c.id), 0) + 1;
      cart = {
        id: nextId,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.state.carts.push(cart);
      this.save();
    }
    return cart;
  }

  public getEnrichedCart(userId: number) {
    const cart = this.getOrCreateCart(userId);
    const items = this.state.cart_items
      .filter((ci) => ci.cart_id === cart.id)
      .map((ci) => {
        const product = this.state.products.find((p) => p.id === ci.product_id);
        if (!product) return null;
        const unitPrice = product.discount_price || product.price;
        const originalPrice = product.price;
        return {
          id: ci.id,
          cart_id: ci.cart_id,
          product_id: ci.product_id,
          quantity: ci.quantity,
          product,
          unit_price: unitPrice,
          original_price: originalPrice,
          line_total: unitPrice * ci.quantity,
          line_savings: (originalPrice - unitPrice) * ci.quantity,
        };
      })
      .filter(Boolean) as Array<{
      id: number;
      cart_id: number;
      product_id: number;
      quantity: number;
      product: ProductRecord;
      unit_price: number;
      original_price: number;
      line_total: number;
      line_savings: number;
    }>;

    const subtotal = items.reduce((acc, item) => acc + item.line_total, 0);
    const productSavings = items.reduce((acc, item) => acc + item.line_savings, 0);
    const deliveryCharge = subtotal === 0 ? 0 : subtotal >= 1999 ? 0 : 120;
    const tax = Math.round(subtotal * 0.05); // 5% GST estimate

    return {
      cart_id: cart.id,
      items,
      item_count: items.reduce((acc, item) => acc + item.quantity, 0),
      subtotal,
      product_savings: productSavings,
      delivery_charge: deliveryCharge,
      tax,
      total: subtotal + deliveryCharge + tax,
    };
  }
}

export const db = new RelationalStore();
export type { OrderStatus };
