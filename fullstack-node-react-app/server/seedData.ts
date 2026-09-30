export interface UserRecord {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile_picture: string;
  role: 'customer' | 'admin';
  active: boolean;
  created_at: string;
}

export interface CategoryRecord {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  created_at: string;
}

export interface ProductRecord {
  id: number;
  name: string;
  description: string;
  category_id: number;
  category_name: string;
  brand: string;
  price: number;
  discount_price: number;
  stock: number;
  image: string;
  rating: number;
  review_count: number;
  tag?: string; // Max 1 subtle text tag per card rule
  features: string[];
  specifications: Record<string, string>;
  warranty: string;
  return_policy: string;
  delivery_info: string;
  is_featured?: boolean;
  is_new?: boolean;
  is_bestseller?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImageRecord {
  id: number;
  product_id: number;
  image: string;
  caption: string;
}

export interface CartRecord {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemRecord {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
}

export interface WishlistRecord {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string;
}

export interface AddressRecord {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default?: boolean;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderRecord {
  id: number;
  user_id: number;
  order_number: string;
  subtotal: number;
  discount: number;
  delivery_charge: number;
  tax: number;
  total_amount: number;
  coupon_code?: string;
  payment_method: 'Cash on Delivery' | 'UPI' | 'Credit/Debit Card';
  status: OrderStatus;
  shipping_address: AddressRecord;
  created_at: string;
}

export interface OrderItemRecord {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  brand: string;
  quantity: number;
  price: number;
}

export interface ReviewRecord {
  id: number;
  user_id: number;
  user_name: string;
  product_id: number;
  rating: number;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponRecord {
  id: number;
  code: string;
  description: string;
  discount_percentage: number;
  minimum_order: number;
  maximum_discount: number;
  expiry_date: string;
  active: boolean;
}

// Studio-grade SVG Data URI generator for product & angle variations so zero images ever fail
function createStudioProductSvg(
  title: string,
  subtitle: string,
  bgHex: string,
  accentHex: string,
  shapeType: 'audio' | 'watch' | 'laptop' | 'shoe' | 'mobile' | 'fashion' | 'home' | 'beauty' | 'sports' | 'accessory',
  angleLabel = 'Studio Front'
): string {
  let illustration = '';
  switch (shapeType) {
    case 'audio':
      illustration = `
        <path d="M220 260 C220 150 380 150 380 260" fill="none" stroke="${accentHex}" stroke-width="22" stroke-linecap="round"/>
        <rect x="195" y="245" width="46" height="95" rx="23" fill="${accentHex}"/>
        <rect x="359" y="245" width="46" height="95" rx="23" fill="${accentHex}"/>
        <circle cx="218" cy="292" r="10" fill="#E5E0D8" opacity="0.5"/>
        <circle cx="382" cy="292" r="10" fill="#E5E0D8" opacity="0.5"/>
      `;
      break;
    case 'watch':
      illustration = `
        <rect x="272" y="135" width="56" height="230" rx="10" fill="${accentHex}" opacity="0.85"/>
        <circle cx="300" cy="250" r="68" fill="#1C1B1A" stroke="#D4AF37" stroke-width="6"/>
        <circle cx="300" cy="250" r="56" fill="none" stroke="#EAE6DF" stroke-width="1" stroke-dasharray="4 6"/>
        <line x1="300" y1="250" x2="300" y2="208" stroke="#FBFBF9" stroke-width="4" stroke-linecap="round"/>
        <line x1="300" y1="250" x2="335" y2="250" stroke="#D4AF37" stroke-width="3" stroke-linecap="round"/>
        <circle cx="300" cy="250" r="5" fill="#D4AF37"/>
      `;
      break;
    case 'laptop':
      illustration = `
        <rect x="175" y="165" width="250" height="155" rx="10" fill="#1F2022" stroke="${accentHex}" stroke-width="5"/>
        <rect x="187" y="177" width="226" height="131" rx="4" fill="#2D3036"/>
        <path d="M140 320 L460 320 L440 338 L160 338 Z" fill="${accentHex}"/>
        <rect x="275" y="320" width="50" height="5" rx="2" fill="#1F2022" opacity="0.4"/>
      `;
      break;
    case 'shoe':
      illustration = `
        <path d="M165 295 Q180 220 245 215 L315 255 Q375 265 425 275 Q445 285 440 315 L160 315 Z" fill="${accentHex}"/>
        <rect x="155" y="308" width="290" height="24" rx="12" fill="#FFFFFF"/>
        <line x1="255" y1="230" x2="295" y2="250" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
      `;
      break;
    case 'mobile':
      illustration = `
        <rect x="235" y="130" width="130" height="245" rx="22" fill="${accentHex}" stroke="#2A2A28" stroke-width="4"/>
        <rect x="245" y="142" width="110" height="221" rx="16" fill="#18181A"/>
        <circle cx="272" cy="172" r="14" fill="#2C2C30" stroke="#52525B" stroke-width="2"/>
        <circle cx="272" cy="206" r="14" fill="#2C2C30" stroke="#52525B" stroke-width="2"/>
      `;
      break;
    case 'fashion':
      illustration = `
        <path d="M235 155 L270 145 L300 170 L330 145 L365 155 L410 215 L375 240 L355 205 L355 345 L245 345 L245 205 L225 240 L190 215 Z" fill="${accentHex}"/>
        <line x1="300" y1="170" x2="300" y2="345" stroke="#FBFBF9" stroke-width="2" opacity="0.35"/>
      `;
      break;
    case 'home':
      illustration = `
        <path d="M235 235 Q300 140 365 235 Z" fill="${accentHex}"/>
        <rect x="293" y="235" width="14" height="95" fill="#3F3E3C"/>
        <rect x="250" y="325" width="100" height="16" rx="8" fill="${accentHex}"/>
      `;
      break;
    case 'beauty':
      illustration = `
        <rect x="275" y="150" width="50" height="26" rx="4" fill="#1C1B1A"/>
        <rect x="288" y="128" width="24" height="24" rx="4" fill="#C5A059"/>
        <rect x="252" y="182" width="96" height="158" rx="18" fill="${accentHex}"/>
        <rect x="266" y="218" width="68" height="86" rx="4" fill="#FBFBF9" opacity="0.9"/>
      `;
      break;
    case 'sports':
      illustration = `
        <circle cx="300" cy="245" r="78" fill="${accentHex}"/>
        <path d="M235 205 Q300 245 235 285" fill="none" stroke="#FBFBF9" stroke-width="4" opacity="0.6"/>
        <path d="M365 205 Q300 245 365 285" fill="none" stroke="#FBFBF9" stroke-width="4" opacity="0.6"/>
        <line x1="222" y1="245" x2="378" y2="245" stroke="#FBFBF9" stroke-width="3" opacity="0.5"/>
      `;
      break;
    case 'accessory':
    default:
      illustration = `
        <rect x="215" y="180" width="170" height="155" rx="22" fill="${accentHex}"/>
        <path d="M260 180 V155 C260 135 340 135 340 155 V180" fill="none" stroke="${accentHex}" stroke-width="12"/>
        <rect x="245" y="235" width="110" height="65" rx="10" fill="#FBFBF9" opacity="0.22"/>
      `;
      break;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
    <defs>
      <radialGradient id="glow" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.75"/>
        <stop offset="100%" stop-color="${bgHex}" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <rect width="600" height="450" fill="url(#glow)"/>
    <ellipse cx="300" cy="352" rx="135" ry="18" fill="#000000" opacity="0.08"/>
    ${illustration}
    <text x="300" y="395" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-weight="600" fill="#1C1B18" letter-spacing="0.5">${title.replace(/&/g, '&amp;')}</text>
    <text x="300" y="418" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#6E6D68" letter-spacing="1.5">${subtitle.toUpperCase().replace(/&/g, '&amp;')} · ${angleLabel.toUpperCase()}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const GENERATED_ASSETS = {
  heroStorefront: '/src/assets/images/hero_flagship_storefront_1790774703951.jpg',
  audioHeadphones: '/src/assets/images/product_audio_headphones_1790774721014.jpg',
  chronographWatch: '/src/assets/images/product_chronograph_watch_1790774735944.jpg',
  ultrabookLaptop: '/src/assets/images/product_ultrabook_laptop_1790774751108.jpg',
  runningSneakers: '/src/assets/images/product_running_sneakers_1790774766813.jpg',
};

export const INITIAL_CATEGORIES: CategoryRecord[] = [
  {
    id: 1,
    name: 'Electronics',
    slug: 'electronics',
    description: 'Reference-grade wireless headphones, studio monitors, and acoustic instruments.',
    image: GENERATED_ASSETS.audioHeadphones,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 2,
    name: 'Watches',
    slug: 'watches',
    description: 'Mechanical chronographs, titanium field watches, and sapphire crystal timepieces.',
    image: GENERATED_ASSETS.chronographWatch,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 3,
    name: 'Laptops',
    slug: 'laptops',
    description: 'Precision CNC-machined ultrabooks, creator workstations, and high-DPI displays.',
    image: GENERATED_ASSETS.ultrabookLaptop,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 4,
    name: 'Shoes',
    slug: 'shoes',
    description: 'Sculptural running silhouettes, Italian leather sneakers, and trail footwear.',
    image: GENERATED_ASSETS.runningSneakers,
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 5,
    name: 'Mobiles',
    slug: 'mobiles',
    description: 'Flagship 5G smartphones with ProRAW optics, LTPO OLED panels, and titanium frames.',
    image: createStudioProductSvg('Flagship 5G Series', 'Mobiles', '#F3F1EC', '#27272A', 'mobile', 'Collection'),
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 6,
    name: 'Fashion',
    slug: 'fashion',
    description: 'Heavyweight organic cotton outerwear, Japanese selvedge denim, and tailored staples.',
    image: createStudioProductSvg('Minimalist Apparel', 'Fashion', '#F4F1EA', '#3F3A34', 'fashion', 'Collection'),
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 7,
    name: 'Accessories',
    slug: 'accessories',
    description: 'Full-grain leather folios, polycarbonate travel luggage, and everyday carry essentials.',
    image: createStudioProductSvg('Everyday Carry', 'Accessories', '#F2EFE9', '#52473B', 'accessory', 'Collection'),
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 8,
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Architectural table lamps, pour-over coffee instruments, and air purification systems.',
    image: createStudioProductSvg('Architectural Living', 'Home & Kitchen', '#F5F2EB', '#7C5836', 'home', 'Collection'),
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 9,
    name: 'Beauty',
    slug: 'beauty',
    description: 'Botanical skin formulations, amber glass serums, and artisanal eau de parfum.',
    image: createStudioProductSvg('Botanical Formulations', 'Beauty', '#F6F3EC', '#854D27', 'beauty', 'Collection'),
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 10,
    name: 'Sports',
    slug: 'sports',
    description: 'Carbon-composite racquets, precision recovery devices, and endurance training gear.',
    image: createStudioProductSvg('Athletic Performance', 'Sports', '#EFECE6', '#1E3A5F', 'sports', 'Collection'),
    created_at: '2026-01-10T10:00:00Z',
  },
];

export const INITIAL_PRODUCTS: ProductRecord[] = [
  // 1. Electronics (Audio)
  {
    id: 1,
    name: 'Aether Studio ANC Over-Ear Headphones',
    description: 'Reference-grade wireless active noise-cancelling headphones engineered with 45mm beryllium-coated drivers, lambskin memory foam ear cushions, and 48-hour battery life with lossless USB-C DAC playback.',
    category_id: 1,
    category_name: 'Electronics',
    brand: 'Sennheiser',
    price: 29990,
    discount_price: 24990,
    stock: 18,
    image: GENERATED_ASSETS.audioHeadphones,
    rating: 4.9,
    review_count: 142,
    tag: 'Best Seller',
    features: [
      'Hybrid Adaptive Active Noise Cancellation with 6 studio microphones',
      '45mm custom transducer for flat, uncolored audiophile frequency response',
      'Up to 48 hours of continuous playback; 10-minute fast charge yields 6 hours',
      'Multipoint Bluetooth 5.4 with aptX Lossless and USB-C DAC mode',
    ],
    specifications: {
      'Driver Unit': '45mm Dynamic Beryllium-Coated',
      'Frequency Response': '6 Hz – 42,000 Hz',
      'Battery Life': '48 Hours (ANC On)',
      'Weight': '292g',
      'Connectivity': 'Bluetooth 5.4, 3.5mm TRS, USB-C Audio',
    },
    warranty: '2 Years Official Manufacturer Warranty across India',
    return_policy: '14-day hassle-free replacement and return guarantee',
    delivery_info: 'Complimentary insured express delivery in 2–3 business days',
    is_featured: true,
    is_bestseller: true,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Chronos Titanium Automatic Field Watch',
    description: 'Grade-5 brushed titanium case housing a 28,800 vph Swiss automatic movement, domed anti-reflective sapphire crystal, and vegetable-tanned Italian calfskin strap.',
    category_id: 2,
    category_name: 'Watches',
    brand: 'Tissot',
    price: 54000,
    discount_price: 45900,
    stock: 9,
    image: GENERATED_ASSETS.chronographWatch,
    rating: 4.8,
    review_count: 89,
    tag: 'Limited Run',
    features: [
      'Grade-5 Micro-Blasted Titanium 40mm Case (ultra-light 64g weight)',
      '80-Hour Power Reserve Mechanical Automatic Calibre',
      'Scratch-resistant Box Sapphire Crystal with exhibition caseback',
      '10 ATM (100m) Water Resistance with screw-down crown',
    ],
    specifications: {
      'Case Diameter': '40 mm',
      'Case Material': 'Grade-5 Titanium',
      'Movement': 'Automatic Mechanical (28,800 vph)',
      'Crystal': 'Domed Sapphire with AR Coating',
      'Water Resistance': '100 Meters (10 ATM)',
    },
    warranty: '5 Years International Horological Warranty',
    return_policy: '14-day return in unworn condition with original box & certificate',
    delivery_info: 'Insured white-glove courier delivery within 2 business days',
    is_featured: true,
    is_bestseller: true,
    created_at: '2026-02-04T10:00:00Z',
    updated_at: '2026-03-12T10:00:00Z',
  },
  {
    id: 3,
    name: 'Zenith Pro 14 OLED Creator Ultrabook',
    description: 'Precision-milled from a single block of recycled anodized aluminum. Features a 14.2-inch 3.2K 120Hz Tandem OLED display, 24GB unified high-bandwidth memory, and 1TB NVMe PCIe 4.0 SSD.',
    category_id: 3,
    category_name: 'Laptops',
    brand: 'ASUS',
    price: 134990,
    discount_price: 118990,
    stock: 12,
    image: GENERATED_ASSETS.ultrabookLaptop,
    rating: 4.9,
    review_count: 116,
    tag: 'New Release',
    features: [
      '14.2-inch 3.2K (3200 × 2000) 120Hz OLED Display with 100% DCI-P3',
      '16-Core Neural & Graphics Architecture with 24GB LPDDR5X RAM',
      '1TB PCIe 4.0 Performance SSD & Dual Thunderbolt 4 ports',
      '21-hour all-day battery life in an ultra-thin 1.28 kg chassis',
    ],
    specifications: {
      'Display': '14.2" 3.2K 120Hz HDR OLED',
      'Memory': '24GB LPDDR5X 7500MHz',
      'Storage': '1TB NVMe M.2 SSD',
      'Weight': '1.28 kg',
      'Battery': '76Wh Li-Polymer (21 hrs)',
    },
    warranty: '1 Year Onsite Premium Care + Accidental Damage Protection',
    return_policy: '10-day replacement guarantee for hardware defects',
    delivery_info: 'Free priority air shipping in 1–2 business days',
    is_featured: true,
    is_new: true,
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-03-18T10:00:00Z',
  },
  {
    id: 4,
    name: 'AeroStride Carbon Plate Running Sneaker',
    description: 'Sculptural marathon road-running shoe combining dual-density nitrogen-infused supercritical foam with a full-length carbon fiber propulsion plate and breathable engineered mesh upper.',
    category_id: 4,
    category_name: 'Shoes',
    brand: 'New Balance',
    price: 16999,
    discount_price: 13499,
    stock: 25,
    image: GENERATED_ASSETS.runningSneakers,
    rating: 4.7,
    review_count: 204,
    tag: 'Best Seller',
    features: [
      'Nitrogen-infused PEBA supercritical midsole foam for 87% energy return',
      'Full-length articulated carbon-fiber propulsion plate',
      'Engineered monofilament jacquard mesh upper in chalk & terracotta',
      'High-abrasion continental rubber outsole pods for wet/dry traction',
    ],
    specifications: {
      'Weight': '198g (UK 8)',
      'Heel-to-Toe Drop': '8 mm (39.5mm / 31.5mm)',
      'Upper Material': 'Engineered Jacquard Mesh',
      'Midsole': 'Dual-Density PEBA + Carbon Plate',
      'Terrain': 'Road & Track Racing',
    },
    warranty: '6 Months Manufacturing & Sole Delamination Warranty',
    return_policy: '14-day size exchange or full refund',
    delivery_info: 'Free standard delivery in 2–4 business days',
    is_featured: true,
    is_bestseller: true,
    created_at: '2026-02-12T10:00:00Z',
    updated_at: '2026-03-19T10:00:00Z',
  },
  {
    id: 5,
    name: 'Nothing Phone (3) Pro 5G — 256GB Obsidian',
    description: 'Iconic transparent industrial design with customizable Glyph Matrix interface, periscope 50MP triple camera system co-engineered for true-to-life natural shadow rendering, and 120Hz LTPO AMOLED screen.',
    category_id: 5,
    category_name: 'Mobiles',
    brand: 'Nothing',
    price: 49999,
    discount_price: 42999,
    stock: 32,
    image: createStudioProductSvg('Phone (3) Pro 5G', 'Nothing · 256GB', '#F4F3EF', '#1F2024', 'mobile'),
    rating: 4.6,
    review_count: 178,
    tag: 'Featured',
    features: [
      '6.7-inch 120Hz LTPO Flexible AMOLED with symmetrical 1.15mm bezels',
      'Triple 50MP Camera Array with 3x Optical Periscope Zoom & OIS',
      '12GB LPDDR5X RAM + 256GB UFS 4.0 Storage',
      '5000mAh Silicon-Carbon Battery with 65W Fast Charge & 15W Qi2 Wireless',
    ],
    specifications: {
      'Display': '6.7" 120Hz LTPO OLED (1600 nits)',
      'Processor': 'Snapdragon 8s Gen 3 Octa-Core',
      'Camera': '50MP Main + 50MP Periscope + 50MP Ultra-Wide',
      'RAM / Storage': '12GB / 256GB',
      'Battery': '5000 mAh',
    },
    warranty: '1 Year Official Brand Warranty on Handset',
    return_policy: '7-day replacement policy',
    delivery_info: 'Free next-day delivery in metro cities',
    is_featured: true,
    is_new: true,
    created_at: '2026-02-14T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 6,
    name: 'Atelier Heavyweight Merino Wool Overshirt',
    description: 'Tailored in fine 420gsm mulesing-free Australian merino wool with horn buttons, concealed chest pockets, and a relaxed architectural drape suitable as a structured shirt or light jacket.',
    category_id: 6,
    category_name: 'Fashion',
    brand: 'COS',
    price: 9499,
    discount_price: 7499,
    stock: 20,
    image: createStudioProductSvg('Merino Wool Overshirt', 'COS · 420gsm', '#F6F4EE', '#433D36', 'fashion'),
    rating: 4.8,
    review_count: 64,
    tag: 'New Release',
    features: [
      '100% RWS-Certified 420gsm Interlock Merino Wool',
      'Natural temperature regulation and crease-resistant structure',
      'Genuine corozo nut buttons and clean French-seamed interior',
      'Relaxed boxy fit engineered for layering over tees or knitwear',
    ],
    specifications: {
      'Fabric': '100% Australian Merino Wool (420 GSM)',
      'Fit': 'Relaxed Architectural Fit',
      'Care': 'Dry Clean or Cold Wool Handwash',
      'Origin': 'Woven in Biella, Italy',
    },
    warranty: 'Quality assurance guarantee',
    return_policy: '14-day easy size exchange and return',
    delivery_info: 'Ships in plastic-free archival garment packaging in 3 days',
    is_featured: true,
    is_new: true,
    created_at: '2026-02-16T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 7,
    name: 'Keychron Q1 Max Wireless Custom Mechanical Keyboard',
    description: 'Full CNC-machined 6063 aluminum body with double-gasket mount structure, hot-swappable Gateron Jupiter tactile switches, QMK/VIA open-source keymap support, and 2.4GHz 1000Hz polling.',
    category_id: 1,
    category_name: 'Electronics',
    brand: 'Keychron',
    price: 19999,
    discount_price: 17499,
    stock: 15,
    image: createStudioProductSvg('Keychron Q1 Max', 'CNC Aluminum 75%', '#F2F0EA', '#2E3238', 'laptop'),
    rating: 4.9,
    review_count: 95,
    features: [
      'Full CNC-Machined 6063 Anodized Aluminum Chassis (1.7 kg)',
      'Double-Gasket Mount with IXPE, PET, and EPDM acoustic foams',
      'Tri-Mode Connectivity: 2.4GHz (1000Hz), Bluetooth 5.1, Wired USB-C',
      'Double-shot PBT OSA profile keycaps & programmable rotary encoder knob',
    ],
    specifications: {
      'Layout': '75% Compact (81 Keys + Knob)',
      'Body Material': 'CNC Machined Aluminum',
      'Switches': 'Hot-Swappable Gateron Tactile',
      'Battery': '4000 mAh Li-Polymer',
    },
    warranty: '1 Year Domestic Warranty',
    return_policy: '10-day return policy',
    delivery_info: 'Express delivery within 2–4 business days',
    is_bestseller: true,
    created_at: '2026-02-18T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 8,
    name: 'Seiko Presage Cocktail Time Automatic SRPB43',
    description: 'Inspired by Tokyo cocktail lounges, featuring an ice-blue sunray textured dial, box-shaped Hardlex crystal, blued steel dauphine hands, and in-house 4R35 mechanical calibre.',
    category_id: 2,
    category_name: 'Watches',
    brand: 'Seiko',
    price: 38500,
    discount_price: 33200,
    stock: 11,
    image: createStudioProductSvg('Presage Automatic', 'Seiko · Calibre 4R35', '#F4F2EC', '#25364A', 'watch'),
    rating: 4.8,
    review_count: 112,
    features: [
      'In-house Seiko 4R35 Automatic Movement with manual winding',
      'Intricate sunray guilloché dial with hand-applied indices',
      'Exhibition see-through caseback with gold-tone rotor',
      'Deployant clasp with push-button release on calfskin strap',
    ],
    specifications: {
      'Calibre': 'Seiko 4R35 (23 Jewels)',
      'Power Reserve': '41 Hours',
      'Case Size': '40.5 mm × 11.8 mm',
      'Water Resistance': '5 Bar (50m)',
    },
    warranty: '2 Years Seiko India Official Warranty',
    return_policy: '14-day return policy',
    delivery_info: 'Complimentary insured shipping',
    created_at: '2026-02-19T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 9,
    name: 'Aesop Reverence Aromatique Hand & Body Duo',
    description: 'Vetiver root, petitgrain, and bergamot rind botanical formulations housed in UV-protective amber apothecary bottles. Gently exfoliates with finely milled pumice and deeply hydrates.',
    category_id: 9,
    category_name: 'Beauty',
    brand: 'Aesop',
    price: 8900,
    discount_price: 7650,
    stock: 28,
    image: createStudioProductSvg('Reverence Aromatique', 'Aesop · 500ml Duo', '#F6F3EC', '#6B3E26', 'beauty'),
    rating: 4.9,
    review_count: 74,
    tag: 'Best Seller',
    features: [
      'Woody, earthy, smoky aroma profile from Vetiver Root & Bergamot',
      'Finely milled pumice suspended in botanical gel cleanser',
      'Potassium lactate-enriched emollient balm for 24-hour skin suppleness',
      '100% Vegan and cruelty-free formulation in 97% recycled bottles',
    ],
    specifications: {
      'Volume': '2 × 500 mL (16.9 fl oz)',
      'Key Ingredients': 'Vetiver Root, Petitgrain, Bergamot Rind',
      'Skin Feel': 'Thoroughly cleansed, polished, supple',
      'Origin': 'Melbourne, Australia',
    },
    warranty: 'Authenticity guaranteed by authorized distributor',
    return_policy: '7-day return on unopened sealed sets',
    delivery_info: 'Includes complimentary cotton drawstring pouch & samples',
    is_bestseller: true,
    created_at: '2026-02-20T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 10,
    name: 'Fellow Stagg EKG Pro Studio Pour-Over Kettle',
    description: 'Countertop precision gooseneck electric kettle with full-color OLED screen, brew guide temperature control to the exact degree, altitude calibration, and solid walnut handle.',
    category_id: 8,
    category_name: 'Home & Kitchen',
    brand: 'Fellow',
    price: 18500,
    discount_price: 15990,
    stock: 14,
    image: createStudioProductSvg('Stagg EKG Pro Kettle', 'Fellow · Matte Black', '#F4F1EA', '#232322', 'home'),
    rating: 4.8,
    review_count: 83,
    features: [
      'Precision gooseneck spout engineered for laminar pour-over flow rate',
      '1200W quick-heating element with PID temperature controller (40°C–100°C)',
      '60-minute Hold Mode and programmable morning schedule',
      '304 18/8 food-grade stainless steel body with FSC walnut accents',
    ],
    specifications: {
      'Capacity': '0.9 Liters',
      'Power': '1200W, 220V–240V India Plug',
      'Material': '304 Stainless Steel + Solid Walnut',
      'Temperature Range': '40°C to 100°C',
    },
    warranty: '2 Years Replacement Warranty',
    return_policy: '14-day return policy',
    delivery_info: 'Ships within 24 hours via BlueDart Air',
    is_new: true,
    created_at: '2026-02-21T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 11,
    name: 'Bellroy Transit Workpack Pro 22L',
    description: 'Weather-resistant recycled Dura-Nylon backpack with separate 16-inch suspended laptop vault, clamshell luggage opening, hidden AirTag pocket, and contoured breathable back panel.',
    category_id: 7,
    category_name: 'Accessories',
    brand: 'Bellroy',
    price: 17990,
    discount_price: 14990,
    stock: 22,
    image: createStudioProductSvg('Transit Workpack 22L', 'Bellroy · Slate Olive', '#F2EFE9', '#4A5240', 'accessory'),
    rating: 4.7,
    review_count: 91,
    features: [
      'Full clamshell zip opening for effortless packing and commuting',
      'Dedicated padded 16" laptop compartment with waterproof YKK AquaGuard zip',
      'Quick-access top sunglasses pouch with soft microfiber lining',
      'Luggage pass-through strap for seamless airport rolling',
    ],
    specifications: {
      'Capacity': '22 Liters',
      'Dimensions': '500 × 330 × 180 mm',
      'Weight': '1.1 kg',
      'Material': '100% Recycled Baida Ripstop Nylon & LWG Leather',
    },
    warranty: '6 Years Bellroy Global Warranty',
    return_policy: '30-day trial and return guarantee',
    delivery_info: 'Free delivery in 2–3 business days',
    is_bestseller: true,
    created_at: '2026-02-22T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 12,
    name: 'Wilson Blade 98 (16x19) V9 Carbon Tennis Racquet',
    description: 'Tour-level precision tennis racquet featuring StableFeel braided graphite + basalt layup, DirectConnect carbon fiber handle for enhanced torsional stability, and emerald matte finish.',
    category_id: 10,
    category_name: 'Sports',
    brand: 'Wilson',
    price: 24999,
    discount_price: 19999,
    stock: 10,
    image: createStudioProductSvg('Blade 98 V9 Tour', 'Wilson · Carbon 305g', '#EFECE6', '#1B4D3E', 'sports'),
    rating: 4.9,
    review_count: 58,
    tag: 'Pro Spec',
    features: [
      'FortyFive° carbon layup increases both flexibility and stability on modern vertical swings',
      'DirectConnect carbon fiber handle fused directly to the end cap',
      '16×19 open string pattern for explosive spin and pocketing feel',
      'Top Grip Taper provides better feel for two-handed backhand placement',
    ],
    specifications: {
      'Head Size': '98 sq in (632 sq cm)',
      'Unstrung Weight': '305 g (10.8 oz)',
      'String Pattern': '16 × 19',
      'Balance': '32.0 cm / 7 pts HL',
    },
    warranty: '1 Year Structural Frame Warranty',
    return_policy: '10-day return on unstrung frames',
    delivery_info: 'Includes protective thermal sleeve; ships in 2 days',
    created_at: '2026-02-23T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 13,
    name: 'Sony WF-1000XM5 Reference True Wireless Earbuds',
    description: 'Dual proprietary processors and Dynamic Driver X deliver industry-leading noise cancellation and 24-bit LDAC Hi-Res Audio Wireless in a sculpted, ergonomic acoustic chamber.',
    category_id: 1,
    category_name: 'Electronics',
    brand: 'Sony',
    price: 24990,
    discount_price: 19990,
    stock: 27,
    image: createStudioProductSvg('WF-1000XM5 Hi-Res', 'Sony · Platinum Silver', '#F3F1EC', '#52504C', 'audio'),
    rating: 4.7,
    review_count: 310,
    features: [
      'Integrated Processor V2 + HD Noise Cancelling Processor QN2e',
      '8.4mm Dynamic Driver X for deep bass and crystal-clear vocals',
      'Bone conduction sensors and AI beamforming for wind-free calls',
      '24-hour total battery life with Qi wireless charging case',
    ],
    specifications: {
      'Driver': '8.4 mm Dynamic Driver X',
      'Codecs': 'LDAC, AAC, SBC, LC3',
      'Water Resistance': 'IPX4 Splash Proof',
      'Weight': '5.9g per earbud',
    },
    warranty: '1 Year Sony India Official Warranty',
    return_policy: '10-day replacement guarantee',
    delivery_info: 'Free 2-day express delivery',
    is_bestseller: true,
    created_at: '2026-02-24T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 14,
    name: 'Apple MacBook Air 15-inch (M3, 16GB, 512GB) — Starlight',
    description: 'Impossibly thin 11.5mm fanless enclosure powered by the M3 architecture with hardware-accelerated ray tracing, Liquid Retina 500-nit display, and 6-speaker Spatial Audio system.',
    category_id: 3,
    category_name: 'Laptops',
    brand: 'Apple',
    price: 154900,
    discount_price: 139900,
    stock: 8,
    image: createStudioProductSvg('MacBook Air 15 M3', 'Apple · 16GB / 512GB', '#F5F2EB', '#A39B8B', 'laptop'),
    rating: 4.9,
    review_count: 245,
    tag: 'Best Seller',
    features: [
      'Apple M3 chip with 8-core CPU, 10-core GPU, and 16-core Neural Engine',
      '15.3-inch Liquid Retina Display with True Tone and P3 Wide Color',
      '1080p FaceTime HD camera and three-mic array with directional beamforming',
      'MagSafe 3 charging port and two Thunderbolt / USB 4 ports',
    ],
    specifications: {
      'Chip': 'Apple M3 (3nm Architecture)',
      'Unified Memory': '16 GB',
      'SSD Storage': '512 GB',
      'Battery Life': 'Up to 18 Hours',
    },
    warranty: '1 Year Apple Limited Warranty',
    return_policy: '7-day DOA replacement guarantee',
    delivery_info: 'Insured priority courier with OTP handoff',
    is_bestseller: true,
    created_at: '2026-02-25T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 15,
    name: 'Casio G-Shock CasiOak Full Metal GM-B2100D',
    description: 'Octagonal stainless-steel bezel and band with screw-back case construction, Tough Solar charging, and Bluetooth smartphone link time calibration.',
    category_id: 2,
    category_name: 'Watches',
    brand: 'Casio',
    price: 42995,
    discount_price: 36495,
    stock: 16,
    image: createStudioProductSvg('G-Shock Full Metal', 'Casio · GM-B2100D', '#F1EFEA', '#3D434D', 'watch'),
    rating: 4.8,
    review_count: 134,
    features: [
      'Solid forged stainless steel bezel with hairline and mirror finishing',
      'Tough Solar power system converts faint ambient light into energy',
      'Bluetooth Mobile Link for automatic atomic time synchronization',
      '200-meter water resistance and Double LED Super Illuminator',
    ],
    specifications: {
      'Case Size': '49.8 × 44.4 × 12.8 mm',
      'Weight': '165 g',
      'Power Supply': 'Tough Solar',
      'Water Resistance': '20 Bar (200m)',
    },
    warranty: '2 Years Casio India Warranty',
    return_policy: '14-day return policy',
    delivery_info: 'Free express shipping in collector tin',
    created_at: '2026-02-26T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 16,
    name: 'Nike ZoomX Vaporfly Next% 3 Ekiden Edition',
    description: 'Built for chasers, racers, and pacers. Redesigned Flyplate geometry and full-length ZoomX foam make this the lightest, most energy-efficient Vaporfly ever produced.',
    category_id: 4,
    category_name: 'Shoes',
    brand: 'Nike',
    price: 20695,
    discount_price: 17995,
    stock: 14,
    image: createStudioProductSvg('ZoomX Vaporfly 3', 'Nike · Ekiden Pack', '#F5F2EB', '#B91C1C', 'shoe'),
    rating: 4.9,
    review_count: 168,
    features: [
      'Full-length carbon fiber Flyplate provides propulsive stiff lever sensation',
      'Convex midsole geometry around the forefoot for smoother transition',
      'Flyknit yarns selected for zonal breathability and midfoot containment',
      'Thin waffle outsole rubber reduces weight while increasing ZoomX stack thickness',
    ],
    specifications: {
      'Weight': '184g (Men UK 8)',
      'Offset': '8 mm',
      'Midsole': 'Nike ZoomX Foam',
      'Plate': 'Full-Length Carbon Fiber',
    },
    warranty: '6 Months Nike India Manufacturing Warranty',
    return_policy: '14-day return or exchange',
    delivery_info: 'Free express shipping',
    created_at: '2026-02-27T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 17,
    name: 'Samsung Galaxy S25 Ultra 5G — Titanium Gray (512GB)',
    description: 'Grade-5 Titanium armor frame with Corning Gorilla Armor anti-reflective glass, integrated S-Pen, 200MP quad-telephoto ProVisual camera engine, and Snapdragon 8 Elite processor.',
    category_id: 5,
    category_name: 'Mobiles',
    brand: 'Samsung',
    price: 139999,
    discount_price: 124999,
    stock: 19,
    image: createStudioProductSvg('Galaxy S25 Ultra', 'Samsung · 512GB Titanium', '#F2F0EB', '#4B4E54', 'mobile'),
    rating: 4.9,
    review_count: 289,
    tag: 'Best Seller',
    features: [
      '6.9-inch Dynamic AMOLED 2X QHD+ (1–120Hz) with 2600 nits peak brightness',
      '200MP Wide + 50MP 5x Periscope + 50MP Ultra-Wide + 10MP 3x Optical Telephoto',
      'Built-in S-Pen with 2.8ms ultra-low latency for sketching and notes',
      '7 Years of OS and Security Updates guaranteed',
    ],
    specifications: {
      'Display': '6.9" QHD+ Dynamic AMOLED 2X',
      'Storage / RAM': '512GB UFS 4.0 / 12GB RAM',
      'Battery': '5000 mAh (45W Wired / 15W Wireless)',
      'Protection': 'IP68 + Titanium Frame',
    },
    warranty: '1 Year Samsung India Official Warranty',
    return_policy: '7-day service center replacement',
    delivery_info: 'Free insured next-day delivery',
    is_bestseller: true,
    created_at: '2026-02-28T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 18,
    name: 'Uniqlo U Heavyweight Supima Cotton Crew Neck Tee',
    description: 'Designed in the Paris Atelier under artistic direction by Christophe Lemaire. Knit from 100% long-staple Supima cotton in a compact dry jersey with a bound ribbed collar.',
    category_id: 6,
    category_name: 'Fashion',
    brand: 'Uniqlo',
    price: 1490,
    discount_price: 990,
    stock: 85,
    image: createStudioProductSvg('Supima Crew Neck Tee', 'Uniqlo U · Paris Atelier', '#F5F3EE', '#6E5A4F', 'fashion'),
    rating: 4.7,
    review_count: 412,
    tag: 'Essential',
    features: [
      '100% heavy-gauge compact cotton jersey that holds its boxy silhouette',
      'Durable high-set ribbed crew collar that resists stretching wash after wash',
      'Garment-washed for a vintage matte finish and soft hand-feel',
      'Unisex relaxed fit suitable for standalone wear or layering',
    ],
    specifications: {
      'Material': '100% Compact Cotton (280 GSM)',
      'Fit': 'Relaxed Boxy Fit',
      'Collar': '2.2cm Ribbed Crew Neck',
      'Care': 'Machine Wash Cold',
    },
    warranty: 'Standard Apparel Quality Guarantee',
    return_policy: '30-day easy return or exchange',
    delivery_info: 'Free shipping on orders over ₹999',
    is_bestseller: true,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 19,
    name: 'Japanese Selvedge Raw Indigo Denim Jeans (14oz)',
    description: 'Woven on vintage shuttle looms in Okayama, Japan. 14oz rope-dyed indigo selvedge denim with copper rivets, hidden coin pocket selvedge ID, and straight-tapered leg.',
    category_id: 6,
    category_name: 'Fashion',
    brand: 'Naked & Famous',
    price: 14500,
    discount_price: 11900,
    stock: 15,
    image: createStudioProductSvg('14oz Selvedge Denim', 'Okayama Shuttle Loom', '#F1EFEA', '#1E293B', 'fashion'),
    rating: 4.8,
    review_count: 53,
    features: [
      '14oz 100% Rope-Dyed Japanese Red-Line Selvedge Denim',
      'Develops personalized high-contrast whiskers and fades over time',
      'Full-grain buffalo leather patch and custom engraved Donut buttons',
      'Chain-stitched hem sewn on a vintage Union Special 43200G machine',
    ],
    specifications: {
      'Weight': '14 oz / sq yd',
      'Mill': 'Kurabo Mills, Okayama, Japan',
      'Cut': 'Weird Guy (Standard Tapered)',
      'Composition': '100% Ring-Spun Cotton',
    },
    warranty: 'Lifetime rivet & button repair guarantee',
    return_policy: '14-day return (unwashed & unhemmed)',
    delivery_info: 'Ships in 2–3 business days',
    created_at: '2026-03-02T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 20,
    name: 'Logitech MX Master 3S Wireless Productivity Mouse',
    description: 'Iconic ergonomic silhouette remastered with Quiet Click tactile switches (90% less noise), 8000 DPI Darkfield optical sensor that tracks on glass, and MagSpeed electromagnetic scroll wheel.',
    category_id: 7,
    category_name: 'Accessories',
    brand: 'Logitech',
    price: 10995,
    discount_price: 8495,
    stock: 44,
    image: createStudioProductSvg('MX Master 3S Wireless', 'Logitech · Pale Grey', '#F3F1EC', '#3F3F46', 'accessory'),
    rating: 4.9,
    review_count: 520,
    tag: 'Best Seller',
    features: [
      'MagSpeed Electromagnetic scrolling silently ratchets 1,000 lines per second',
      '8,000 DPI Darkfield optical sensor tracks flawlessly on 4mm clear glass',
      'Quiet Click switches deliver satisfying tactile feedback with 90% less noise',
      'Pair with up to 3 macOS/Windows/Linux workstations via Bluetooth or Logi Bolt',
    ],
    specifications: {
      'Sensor': 'Darkfield High Precision (200–8000 DPI)',
      'Buttons': '7 Programmable Buttons + Thumb Wheel',
      'Battery': '70 Days on Full Charge (USB-C)',
      'Weight': '141 g',
    },
    warranty: '1 Year Logitech Hardware Warranty',
    return_policy: '10-day replacement guarantee',
    delivery_info: 'Next-day dispatch across India',
    is_bestseller: true,
    created_at: '2026-03-03T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 21,
    name: 'Anker Prime 20,000mAh 200W GaN Power Bank',
    description: 'Airline-approved high-output portable power station with smart digital telemetry display showing real-time wattage input/output, dual 100W USB-C PD 3.0 ports, and ActiveShield 2.0.',
    category_id: 7,
    category_name: 'Accessories',
    brand: 'Anker',
    price: 12999,
    discount_price: 9999,
    stock: 30,
    image: createStudioProductSvg('Prime 200W Power Bank', 'Anker · 20,000mAh GaN', '#F2F0EB', '#27272A', 'accessory'),
    rating: 4.8,
    review_count: 147,
    features: [
      '200W Total Multi-Device Output charges two MacBook Pros simultaneously',
      '100W Rapid Recharge via USB-C reaches 100% in just 75 minutes',
      'Smart TFT Color Display shows remaining runtime, battery health, and port wattage',
      'Flight-safe 72Wh capacity compliant with DGCA and TSA cabin regulations',
    ],
    specifications: {
      'Capacity': '20,000 mAh (72 Wh)',
      'Ports': '2 × USB-C (100W Max each) + 1 × USB-A (65W)',
      'Dimensions': '127 × 54 × 49 mm',
      'Weight': '544 g',
    },
    warranty: '18 Months Anker India Warranty',
    return_policy: '10-day replacement policy',
    delivery_info: 'Surface/Air DG-certified shipping in 3 days',
    created_at: '2026-03-04T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 22,
    name: 'Dyson Purifier Cool Formaldehyde TP09 — Nickel/Gold',
    description: 'Solid-state formaldehyde sensor and catalytic filter continuously destroy formaldehyde, while HEPA H13 sealed filtration captures 99.95% of ultrafine PM0.1 pollutants.',
    category_id: 8,
    category_name: 'Home & Kitchen',
    brand: 'Dyson',
    price: 59900,
    discount_price: 49900,
    stock: 7,
    image: createStudioProductSvg('Purifier Cool TP09', 'Dyson · HEPA H13 + Gold', '#F5F2EB', '#9A7B4F', 'home'),
    rating: 4.8,
    review_count: 92,
    features: [
      'Selective Catalytic Oxidization (SCO) filter destroys formaldehyde at molecular level',
      'Fully sealed to HEPA H13 standard—what goes inside stays inside',
      'Air Multiplier technology projects 290 liters of purified air per second',
      '350° smooth oscillation with MyDyson app air quality graphs and voice control',
    ],
    specifications: {
      'Filtration': '360° Glass HEPA H13 + Activated Carbon + Catalytic',
      'Airflow Max': '290 L/s',
      'Sound Level': '61.5 dBA (Max) / 42 dBA (Night Mode)',
      'Height': '1050 mm',
    },
    warranty: '2 Years Dyson Official Parts & Labor Warranty',
    return_policy: '10-day replacement guarantee',
    delivery_info: 'Free white-glove home installation & demo',
    created_at: '2026-03-05T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 23,
    name: 'Louis Poulsen Panthella 160 Portable Table Lamp',
    description: 'Verner Panton’s 1971 Danish architectural lighting icon scaled into a cordless, weather-resistant portable lamp casting glare-free, downward-reflected warm ambient light.',
    category_id: 8,
    category_name: 'Home & Kitchen',
    brand: 'Louis Poulsen',
    price: 26500,
    discount_price: 22500,
    stock: 13,
    image: createStudioProductSvg('Panthella 160 Portable', 'Verner Panton · Opal', '#F6F3EC', '#D97706', 'home'),
    rating: 4.9,
    review_count: 41,
    tag: 'Design Icon',
    features: [
      'Hemispherical opal acrylic shade diffuses soft 2700K warm illumination',
      'Trumpet-shaped base acts as a secondary reflector for upward glow',
      'Step-dimmer touch control on top finial (10%, 33%, 100% brightness)',
      'Qi wireless charging compatible + USB-C rechargeable battery (45 hrs at 10%)',
    ],
    specifications: {
      'Designer': 'Verner Panton',
      'Dimensions': 'Ø 160 mm × H 232 mm',
      'Light Source': '2.5W Integrated Warm LED (2700K)',
      'Ingress Protection': 'IP44 (Indoor & Outdoor Terrace)',
    },
    warranty: '2 Years Architectural Lighting Warranty',
    return_policy: '14-day return in original protective crate',
    delivery_info: 'Fragile-insured shipping in 3 business days',
    is_new: true,
    created_at: '2026-03-06T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 24,
    name: 'Le Labo Santal 33 Eau de Parfum (100ml)',
    description: 'Hand-blended unisex olfactory signature combining Australian sandalwood, papyrus, cedarwood, cardamom, iris, and violet with smoky leather accord.',
    category_id: 9,
    category_name: 'Beauty',
    brand: 'Le Labo',
    price: 26900,
    discount_price: 23900,
    stock: 9,
    image: createStudioProductSvg('Santal 33 EDP 100ml', 'Le Labo · Hand Compounded', '#F6F3EC', '#785A46', 'beauty'),
    rating: 4.9,
    review_count: 128,
    features: [
      'High-concentration Eau de Parfum (22% aromatic oil concentration)',
      'Notes of Cardamom, Iris, Violet, Ambrox, Australian Sandalwood, and Cedarwood',
      'Cruelty-free, paraben-free, and preservative-free vegan formulation',
      'Presented in signature apothecary glass flacon with custom batch label',
    ],
    specifications: {
      'Volume': '100 mL / 3.4 fl. oz.',
      'Concentration': 'Eau de Parfum',
      'Scent Family': 'Woody Aromatic Leather',
      'Origin': 'Grasse / New York',
    },
    warranty: '100% Batch-Verified Authenticity',
    return_policy: 'Returnable within 7 days if outer kraft box is unsealed',
    delivery_info: 'Temperature-controlled express air shipping',
    created_at: '2026-03-07T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 25,
    name: 'The Ordinary Niacinamide 10% + Hyaluronic 2% Daily Set',
    description: 'Clinical dermatologist-grade daily regimen pairing high-strength vitamin B3 blemish-control serum with multi-molecular hyaluronic acid + pro-vitamin B5 hydration support.',
    category_id: 9,
    category_name: 'Beauty',
    brand: 'The Ordinary',
    price: 1350,
    discount_price: 950,
    stock: 65,
    image: createStudioProductSvg('Niacinamide + HA Regimen', 'The Ordinary · Clinical Duo', '#F5F3EE', '#475569', 'beauty'),
    rating: 4.6,
    review_count: 380,
    tag: 'Under ₹1,000',
    features: [
      '10% Niacinamide + 1% Zinc PCA visibly refines pore appearance and skin texture',
      '2% Multi-Molecular Hyaluronic Acid + Ceramides deliver plumper hydration',
      'Alcohol-free, silicone-free, fragrance-free, and non-comedogenic',
      'Suitable for morning and evening layering across all skin types',
    ],
    specifications: {
      'Contents': '2 × 30 mL UV Dropper Bottles',
      'pH Range': '5.50 – 6.50',
      'Key Actives': 'Niacinamide, Zinc PCA, Sodium Hyaluronate, Panthenol',
      'Origin': 'Toronto, Canada',
    },
    warranty: 'Authorized Retailer Batch Guarantee',
    return_policy: '7-day replacement for transit damage',
    delivery_info: 'Ships in 1–2 business days',
    is_bestseller: true,
    created_at: '2026-03-08T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 26,
    name: 'Theragun Relief Handheld Percussive Therapy Massager',
    description: 'FDA-registered scientific percussive massage device with 16mm amplitude, whisper-quiet brushless motor, ergonomic triangle grip, and 3 biometric foam attachments.',
    category_id: 10,
    category_name: 'Sports',
    brand: 'Therabody',
    price: 14999,
    discount_price: 12499,
    stock: 18,
    image: createStudioProductSvg('Theragun Percussive Pro', 'Therabody · Sand Beige', '#F2EFE9', '#334155', 'sports'),
    rating: 4.8,
    review_count: 76,
    features: [
      'Scientifically calibrated percussive therapy reaches 60% deeper into muscle tissue',
      'Patented ergonomic triangle handle eliminates wrist strain during back recovery',
      '3 speeds (1750, 2100, 2400 PPM) with LED pressure indicator',
      'Includes Dampener, Standard Ball, and Thumb closed-cell foam attachments',
    ],
    specifications: {
      'Stroke Amplitude': '10 mm – 16 mm',
      'Speeds': '1750 / 2100 / 2400 Percussions Per Minute',
      'Battery Life': '120 Minutes Continuous',
      'Weight': '620 g',
    },
    warranty: '1 Year Therabody India Replacement Warranty',
    return_policy: '10-day return policy',
    delivery_info: 'Free priority shipping in 2 days',
    created_at: '2026-03-09T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 27,
    name: 'Manduka PROlite 4.7mm High-Density Studio Yoga Mat',
    description: 'Closed-cell German PVC studio mat engineered to last a lifetime. Hygienic moisture-barrier surface with proprietary dot-pattern bottom that prevents sliding on hardwood or stone.',
    category_id: 10,
    category_name: 'Sports',
    brand: 'Manduka',
    price: 9500,
    discount_price: 7800,
    stock: 24,
    image: createStudioProductSvg('PROlite 4.7mm Yoga Mat', 'Manduka · Midnight Slate', '#EFECE6', '#312E81', 'sports'),
    rating: 4.9,
    review_count: 88,
    features: [
      'High-density 4.7mm cushion protects joints on hard concrete or wood floors',
      'Hygienic closed-cell surface blocks sweat and bacteria absorption',
      'OEKO-TEX Standard 100 certified emissions-free manufacturing in Germany',
      '100% latex-free construction',
    ],
    specifications: {
      'Dimensions': '180 cm × 61 cm',
      'Thickness': '4.7 mm',
      'Weight': '1.8 kg',
      'Origin': 'Made in Germany',
    },
    warranty: 'Manduka Lifetime Guarantee',
    return_policy: '14-day return policy (unopened roll)',
    delivery_info: 'Ships rolled in recyclable box within 2 days',
    created_at: '2026-03-10T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 28,
    name: 'On Cloudmonster 2 Max-Cushion Road Running Shoes',
    description: 'Monster CloudTec pods paired with dual-density Helion superfoam and a nylon-blend Speedboard for maximum impact absorption and energetic forward roll on long road miles.',
    category_id: 4,
    category_name: 'Shoes',
    brand: 'On Running',
    price: 17999,
    discount_price: 15499,
    stock: 19,
    image: createStudioProductSvg('Cloudmonster 2 Helion', 'On Running · Swiss Engineered', '#F4F2EC', '#374151', 'shoe'),
    rating: 4.8,
    review_count: 131,
    tag: 'New Release',
    features: [
      'Oversized CloudTec phase elements compress horizontally and vertically',
      'Dual-density Helion superfoam midsole adds bounce and longevity',
      'Nylon-blend Speedboard fixed between midsole layers for snappy toe-off',
      'Recycled polyester engineered mesh upper with plush heel collar',
    ],
    specifications: {
      'Weight': '295 g',
      'Heel-to-Toe Drop': '6 mm',
      'Cushioning': 'Max Cushion / Road',
      'Recycled Content': '92% Recycled Polyester Upper',
    },
    warranty: '6 Months Swiss Engineering Warranty',
    return_policy: '14-day size exchange or return',
    delivery_info: 'Free 2-day courier delivery',
    is_new: true,
    created_at: '2026-03-11T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 29,
    name: 'Google Pixel 9 Pro XL 5G — Hazel (256GB)',
    description: 'Silky matte glass back with polished aluminum visor, Super Actua 6.8-inch display, Tensor G4 processor, and triple rear pro camera system with 42MP wide-angle selfie optics.',
    category_id: 5,
    category_name: 'Mobiles',
    brand: 'Google',
    price: 124999,
    discount_price: 109999,
    stock: 11,
    image: createStudioProductSvg('Pixel 9 Pro XL 5G', 'Google · 256GB Hazel', '#F3F1EC', '#4E5953', 'mobile'),
    rating: 4.8,
    review_count: 156,
    features: [
      '6.8-inch Super Actua LTPO OLED (1–120Hz) with up to 3000 nits peak brightness',
      '50MP Octa PD Wide + 48MP Quad PD Ultra-Wide + 48MP 5x Telephoto (30x Super Res)',
      '16GB RAM + 256GB Storage with 7 years of Pixel Feature Drops',
      'Vapor chamber thermal cooling for sustained 4K 60fps Video Boost capture',
    ],
    specifications: {
      'Display': '6.8" LTPO OLED (1344 × 2992)',
      'Processor': 'Google Tensor G4 + Titan M2 Security',
      'Memory': '16GB RAM / 256GB ROM',
      'Battery': '5060 mAh',
    },
    warranty: '1 Year Google Authorized Service Warranty in India',
    return_policy: '7-day replacement policy',
    delivery_info: 'Free insured air delivery',
    created_at: '2026-03-12T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 30,
    name: 'Aura Archival Braided USB-C 240W Cable & Organizer Kit',
    description: 'Aramid-fiber braided 2-meter USB4 / PD 3.1 cable supporting 240W power delivery and 40Gbps data transfer, paired with a vegetable-tanned magnetic leather desk cord keeper.',
    category_id: 7,
    category_name: 'Accessories',
    brand: 'Aura Studio',
    price: 799,
    discount_price: 449,
    stock: 120,
    image: createStudioProductSvg('240W Braided USB-C Kit', 'Aura Studio · Aramid Weave', '#F5F2EB', '#7C2D12', 'accessory'),
    rating: 4.8,
    review_count: 265,
    tag: 'Under ₹500',
    features: [
      'USB-IF Certified E-Marker chip regulates up to 240W (48V/5A) Extended Power Range',
      'Tested to withstand 30,000+ 90-degree bend cycles without fraying',
      'CNC anodized aluminum connector housings fit all protective phone and laptop cases',
      'Includes magnetic leather cable clip for clean desk routing',
    ],
    specifications: {
      'Length': '2.0 Meters (6.6 ft)',
      'Max Power': '240W PD 3.1 Extended Power Range',
      'Jacket': 'Double-Braided Ballistic Nylon + Aramid Core',
      'Compatibility': 'MacBook Pro, iPad Pro, iPhone 16/17, Android, Monitors',
    },
    warranty: '2 Years Instant Replacement Warranty',
    return_policy: '14-day return policy',
    delivery_info: 'Ships same day',
    is_bestseller: true,
    created_at: '2026-03-13T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
];

// Generate 3 additional gallery angles for every product
export const INITIAL_PRODUCT_IMAGES: ProductImageRecord[] = INITIAL_PRODUCTS.flatMap((prod) => {
  const shapeMap: Record<number, 'audio' | 'watch' | 'laptop' | 'shoe' | 'mobile' | 'fashion' | 'accessory' | 'home' | 'beauty' | 'sports'> = {
    1: 'audio',
    2: 'watch',
    3: 'laptop',
    4: 'shoe',
    5: 'mobile',
    6: 'fashion',
    7: 'accessory',
    8: 'home',
    9: 'beauty',
    10: 'sports',
  };
  const shape = shapeMap[prod.category_id] || 'accessory';
  return [
    {
      id: prod.id * 10 + 1,
      product_id: prod.id,
      image: prod.image,
      caption: 'Primary Studio Perspective',
    },
    {
      id: prod.id * 10 + 2,
      product_id: prod.id,
      image: createStudioProductSvg(prod.name.slice(0, 26), prod.brand, '#EFECE6', '#27272A', shape, '45° Profile View'),
      caption: '45° Architectural Profile',
    },
    {
      id: prod.id * 10 + 3,
      product_id: prod.id,
      image: createStudioProductSvg(prod.name.slice(0, 26), prod.brand, '#E7E3DA', '#7C2D12', shape, 'Macro Detail'),
      caption: 'Material & Finish Macro',
    },
  ];
});

export const INITIAL_COUPONS: CouponRecord[] = [
  {
    id: 1,
    code: 'SAVE10',
    description: '10% instant discount on orders above ₹1,000 (up to ₹1,500 off)',
    discount_percentage: 10,
    minimum_order: 1000,
    maximum_discount: 1500,
    expiry_date: '2027-12-31T23:59:59Z',
    active: true,
  },
  {
    id: 2,
    code: 'SAVE20',
    description: '20% instant discount on orders above ₹3,500 (up to ₹4,000 off)',
    discount_percentage: 20,
    minimum_order: 3500,
    maximum_discount: 4000,
    expiry_date: '2027-12-31T23:59:59Z',
    active: true,
  },
  {
    id: 3,
    code: 'WELCOME',
    description: '15% welcome privilege on your first order above ₹500 (up to ₹1,200 off)',
    discount_percentage: 15,
    minimum_order: 500,
    maximum_discount: 1200,
    expiry_date: '2027-12-31T23:59:59Z',
    active: true,
  },
  {
    id: 4,
    code: 'CAMPUS25',
    description: '25% academic mini-project demo discount on orders above ₹5,000 (up to ₹5,000 off)',
    discount_percentage: 25,
    minimum_order: 5000,
    maximum_discount: 5000,
    expiry_date: '2027-12-31T23:59:59Z',
    active: true,
  },
];

export const INITIAL_REVIEWS: ReviewRecord[] = [
  {
    id: 1,
    user_id: 2,
    user_name: 'Aarav Sharma',
    product_id: 1,
    rating: 5,
    comment: 'The acoustic separation and sub-bass control on these Sennheiser studio cans are phenomenal. Wearing them for 6-hour coding sessions without any clamping fatigue.',
    verified_purchase: true,
    created_at: '2026-03-02T14:20:00Z',
    updated_at: '2026-03-02T14:20:00Z',
  },
  {
    id: 2,
    user_id: 3,
    user_name: 'Meera Nair',
    product_id: 1,
    rating: 5,
    comment: 'USB-C lossless DAC mode makes a night-and-day difference with high-res FLAC tracks. Build quality feels far superior to plastic competitors.',
    verified_purchase: true,
    created_at: '2026-03-10T09:15:00Z',
    updated_at: '2026-03-10T09:15:00Z',
  },
  {
    id: 3,
    user_id: 2,
    user_name: 'Aarav Sharma',
    product_id: 2,
    rating: 5,
    comment: 'Grade-5 titanium disappears on the wrist. The 80-hour power reserve easily lasts over the weekend and the sapphire crystal has zero glare.',
    verified_purchase: true,
    created_at: '2026-03-05T18:40:00Z',
    updated_at: '2026-03-05T18:40:00Z',
  },
  {
    id: 4,
    user_id: 3,
    user_name: 'Meera Nair',
    product_id: 3,
    rating: 5,
    comment: 'The 3.2K 120Hz OLED screen is breathtaking for Figma and photo grading. Compiles our entire full-stack project in seconds while staying cool.',
    verified_purchase: true,
    created_at: '2026-03-12T11:30:00Z',
    updated_at: '2026-03-12T11:30:00Z',
  },
  {
    id: 5,
    user_id: 2,
    user_name: 'Aarav Sharma',
    product_id: 4,
    rating: 5,
    comment: 'Shaved 4 minutes off my half-marathon PB in Bengaluru. The carbon plate roll-through feels effortless at tempo pace.',
    verified_purchase: true,
    created_at: '2026-03-14T07:50:00Z',
    updated_at: '2026-03-14T07:50:00Z',
  },
];
