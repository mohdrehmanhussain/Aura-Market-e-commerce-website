import React, { useState } from 'react';
import { Package } from 'lucide-react';

export type PageRoute =
  | 'home'
  | 'products'
  | 'product-details'
  | 'categories'
  | 'search'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'orders'
  | 'wishlist'
  | 'profile'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'admin'
  | 'project-zip';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile_picture: string;
  role: 'customer' | 'admin';
  active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  product_count?: number;
  created_at: string;
}

export interface ProductImageItem {
  id: number;
  product_id: number;
  image: string;
  caption: string;
}

export interface Product {
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
  tag?: string;
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
  gallery?: ProductImageItem[];
  reviews?: Review[];
  related_products?: Product[];
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  product: Product;
  unit_price: number;
  original_price: number;
  line_total: number;
  line_savings: number;
}

export interface CartSummary {
  cart_id: number;
  items: CartItem[];
  item_count: number;
  subtotal: number;
  product_savings: number;
  delivery_charge: number;
  tax: number;
  total: number;
}

export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string;
  product: Product;
}

export interface Address {
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

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  brand: string;
  quantity: number;
  price: number;
}

export interface Order {
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
  shipping_address: Address;
  created_at: string;
  items: OrderItem[];
  customer?: User;
}

export interface Review {
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

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_percentage: number;
  minimum_order: number;
  maximum_discount: number;
  expiry_date: string;
  active: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  type: 'success' | 'error' | 'info';
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function getDiscountPercent(price: number, discountPrice: number): number {
  if (!price || price <= discountPrice) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

// Zero-Broken-Image Policy Resilient Image Component
export const StudioImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}> = ({ src, alt, className = '', fallbackLabel }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return React.createElement(
      'div',
      {
        className: `flex flex-col items-center justify-center bg-[#F4F3EF] dark:bg-[#1E1E22] text-[#575653] dark:text-[#A6A6A2] p-6 text-center select-none ${className}`,
      },
      React.createElement(Package, { className: 'w-8 h-8 mb-2 opacity-50 stroke-[1.5]' }),
      React.createElement(
        'span',
        {
          className:
            'font-display text-sm font-semibold text-[#141413] dark:text-[#F5F5F3] line-clamp-1',
        },
        fallbackLabel || alt
      ),
      React.createElement(
        'span',
        { className: 'text-[11px] text-[#85847F] mt-0.5' },
        'Aura Studio Archive'
      )
    );
  }

  return React.createElement('img', {
    src,
    alt,
    referrerPolicy: 'no-referrer',
    onError: () => setHasError(true),
    className,
  });
};

export async function downloadFullProjectZip(
  onNotify?: (msg: string, type?: 'success' | 'error' | 'info') => void
): Promise<void> {
  try {
    if (onNotify) {
      onNotify('Packaging 43 project files into ZIP archive...', 'info');
    }
    const JSZipModule = await import('jszip');
    const JSZip = JSZipModule.default || JSZipModule;
    const zip = new JSZip();

    const res = await fetch('/api/project-files/');
    if (!res.ok) {
      throw new Error('Failed to fetch project file bundle');
    }
    const data = await res.json();
    const allFiles: Record<string, string> = data.all_files || {};

    let fileCount = 0;
    for (const [filePath, content] of Object.entries(allFiles)) {
      if (content && content.length > 0) {
        zip.file(filePath, content);
        fileCount++;
      }
    }

    // Ensure main documentation files are always present
    if (data.readme) zip.file('ecommerce/README.md', data.readme);
    if (data.django_models) zip.file('ecommerce/backend/users/models.py', data.django_models);
    if (data.django_views) zip.file('ecommerce/backend/api/views.py', data.django_views);
    if (data.sql_schema) zip.file('ecommerce/schema.sql', data.sql_schema);

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const sizeKB = Math.max(1, Math.round(blob.size / 1024));
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aura-ecommerce-college-project.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    if (onNotify) {
      onNotify(
        `Downloaded aura-ecommerce-college-project.zip (${fileCount} files · ${sizeKB} KB)`,
        'success'
      );
    }
  } catch (err) {
    console.error('ZIP generation error:', err);
    if (onNotify) {
      onNotify('Error generating ZIP archive. Please try again.', 'error');
    }
  }
}
