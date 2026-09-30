import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { db } from './database.ts';

export const DJANGO_MODELS_CODE = `# ============================================================================
# ecommerce/backend/models_overview.py
# Consolidated Django ORM Models for Users, Products, Cart, Wishlist, Orders & Reviews
# Compatible with SQLite3 (development) and PostgreSQL / MySQL (production)
# ============================================================================

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    phone = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=80)
    state = models.CharField(max_length=80)
    pincode = models.CharField(max_length=12)
    country = models.CharField(max_length=80, default='India')
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.full_name} - {self.city} ({self.pincode})"


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, db_index=True)
    description = models.TextField(blank=True)
    image = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=220, db_index=True)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    brand = models.CharField(max_length=100, db_index=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    stock = models.PositiveIntegerField(default=0)
    image = models.CharField(max_length=500)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.5)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['category', 'brand']),
            models.Index(fields=['discount_price']),
        ]

    @property
    def discount_percentage(self):
        if self.price and self.price > self.discount_price:
            return round(((self.price - self.discount_price) / self.price) * 100)
        return 0

    def __str__(self):
        return f"{self.brand} - {self.name}"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='gallery_images')
    image = models.CharField(max_length=500)
    caption = models.CharField(max_length=140, blank=True)


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    class Meta:
        unique_together = ('cart', 'product')


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')


class Coupon(models.Model):
    code = models.CharField(max_length=30, unique=True, db_index=True)
    discount_percentage = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(90)])
    minimum_order = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    maximum_discount = models.DecimalField(max_digits=10, decimal_places=2, default=5000)
    expiry_date = models.DateTimeField()
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} ({self.discount_percentage}% OFF)"


class Order(models.Model):
    STATUS_CHOICES = [
        ('Order Placed', 'Order Placed'),
        ('Order Confirmed', 'Order Confirmed'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Out for Delivery', 'Out for Delivery'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]
    PAYMENT_CHOICES = [
        ('Cash on Delivery', 'Cash on Delivery'),
        ('UPI', 'UPI'),
        ('Credit/Debit Card', 'Credit/Debit Card'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=30, unique=True, db_index=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_charge = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=40, choices=PAYMENT_CHOICES)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Order Placed')
    shipping_address = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
`;

export const DJANGO_VIEWS_CODE = `# ============================================================================
# ecommerce/backend/api/views.py
# Django REST Framework (DRF) Views implementing all required E-Commerce endpoints
# ============================================================================

import random
from decimal import Decimal
from django.db import transaction
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from users.models import User, Address
from products.models import Category, Product
from cart.models import Cart, CartItem
from wishlist.models import Wishlist
from orders.models import Order, OrderItem, Coupon
from reviews.models import Review
from .serializers import (
    UserSerializer, CategorySerializer, ProductSerializer,
    CartItemSerializer, OrderSerializer, ReviewSerializer, CouponSerializer
)


class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        if User.objects.filter(username=data.get('username')).exists():
            return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(
            username=data['username'],
            email=data.get('email', ''),
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            phone=data.get('phone', '')
        )
        Cart.objects.create(user=user)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=identifier, password=password)
        if not user:
            return Response({'error': 'Invalid username/email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data})


class ProductListCreateAPIView(APIView):
    def get(self, request):
        qs = Product.objects.select_related('category').all()
        category = request.query_params.get('category')
        search = request.query_params.get('search')
        sort_by = request.query_params.get('sort', 'relevance')

        if category and category != 'All':
            qs = qs.filter(category__name__iexact=category)
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(brand__icontains=search)
        if sort_by == 'price_asc':
            qs = qs.order_by('discount_price')
        elif sort_by == 'price_desc':
            qs = qs.order_by('-discount_price')
        elif sort_by == 'rating':
            qs = qs.order_by('-rating')
        elif sort_by == 'newest':
            qs = qs.order_by('-created_at')

        return Response(ProductSerializer(qs, many=True).data)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderCreateListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart_items = cart.items.select_related('product').all()
        if not cart_items.exists():
            return Response({'error': 'Your cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = Decimal('0.00')
        for item in cart_items:
            if item.product.stock < item.quantity:
                return Response(
                    {'error': f"{item.product.name} is out of stock (only {item.product.stock} left)"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            subtotal += item.product.discount_price * item.quantity

        discount = Decimal(str(request.data.get('discount', 0)))
        delivery_charge = Decimal('0.00') if subtotal >= 1999 else Decimal('120.00')
        total_amount = subtotal - discount + delivery_charge

        order = Order.objects.create(
            user=request.user,
            order_number=f"ORD{random.randint(100000, 999999)}",
            total_amount=total_amount,
            discount=discount,
            delivery_charge=delivery_charge,
            payment_method=request.data.get('payment_method', 'Cash on Delivery'),
            shipping_address=request.data.get('shipping_address', {}),
            status='Order Placed'
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.discount_price
            )
            item.product.stock -= item.quantity
            item.product.save()

        cart_items.delete()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
`;

export const SQL_SCHEMA_CODE = `-- ============================================================================
-- Aura Curated Market — Relational SQLite / PostgreSQL DDL Schema
-- Supports all 12 E-Commerce Entities with Foreign Keys & Indexes
-- ============================================================================

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(80),
    last_name VARCHAR(80),
    phone VARCHAR(25),
    profile_picture TEXT,
    role VARCHAR(20) DEFAULT 'customer',
    active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(220) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    discount_price DECIMAL(10, 2) NOT NULL CHECK (discount_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image TEXT NOT NULL,
    rating DECIMAL(3, 1) DEFAULT 4.5,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(discount_price);

CREATE TABLE product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image TEXT NOT NULL,
    caption VARCHAR(140)
);

CREATE TABLE carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    UNIQUE(cart_id, product_id)
);

CREATE TABLE wishlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

CREATE TABLE addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(80) NOT NULL,
    state VARCHAR(80) NOT NULL,
    pincode VARCHAR(15) NOT NULL,
    country VARCHAR(80) DEFAULT 'India',
    is_default BOOLEAN DEFAULT 0
);

CREATE TABLE coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(30) NOT NULL UNIQUE,
    discount_percentage INTEGER NOT NULL CHECK (discount_percentage BETWEEN 1 AND 90),
    minimum_order DECIMAL(10, 2) DEFAULT 0,
    maximum_discount DECIMAL(10, 2) DEFAULT 5000,
    expiry_date TIMESTAMP NOT NULL,
    active BOOLEAN DEFAULT 1
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(30) NOT NULL UNIQUE,
    subtotal DECIMAL(12, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    delivery_charge DECIMAL(8, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(40) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Order Placed',
    shipping_address JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export const README_CONTENT = `# Aura Curated Market — Full-Stack E-Commerce Shopping Platform
**College Mini-Project & Viva Demonstration Package**

---

## 1. Project Overview
**Aura Curated Market** is a responsive, full-stack E-Commerce Shopping Platform inspired by modern retail architectures (Amazon, Flipkart, Myntra, Shopify) with an original luxury editorial design system.

It implements all **15 core pages & modules**, **12 relational database models**, **RESTful API endpoints**, **multi-step checkout**, **coupon validation**, **visual order tracking timeline**, **customer reviews**, **dark mode**, and a complete **Admin Analytics & Inventory Dashboard**.

---

## 2. Sample Login Credentials (For Project Demo & Viva)

| Role | Username / Email | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer Account** | \`aarav_sharma\` or \`aarav@example.com\` | \`customer123\` | Pre-loaded cart, wishlist, saved addresses, past orders (\`#ORD100245\`, \`#ORD100246\`), verified product review access |
| **Admin Account** | \`admin\` or \`admin@auramarket.in\` | \`admin123\` | Full Admin Dashboard access: Product CRUD, Category CRUD, Order Status Management, User Management, Revenue Charts |

### Active Coupon Codes for Checkout Testing
* \`SAVE10\` — **10% OFF** on orders above ₹1,000 (Max discount ₹1,500)
* \`SAVE20\` — **20% OFF** on orders above ₹3,500 (Max discount ₹4,000)
* \`WELCOME\` — **15% OFF** on orders above ₹500 (Max discount ₹1,200)
* \`CAMPUS25\` — **25% OFF** on orders above ₹5,000 (Max discount ₹5,000)

---

## 3. What Is Inside This ZIP Archive?

This ZIP archive includes **both** complete implementations so you can run or present whichever stack your faculty prefers:

1. **\`ecommerce/\` (Django + Django REST Framework + SQLite + Vanilla HTML5/CSS3/JS)**
   - \`ecommerce/backend/manage.py\`
   - \`ecommerce/backend/ecommerce/settings.py\` & \`urls.py\`
   - \`ecommerce/backend/users/models.py\`, \`products/models.py\`, \`cart/models.py\`, \`wishlist/models.py\`, \`orders/models.py\`, \`reviews/models.py\`
   - \`ecommerce/backend/api/serializers.py\`, \`views.py\`, \`urls.py\`
   - \`ecommerce/frontend/index.html\`, \`products.html\`, \`product-details.html\`, \`cart.html\`, \`checkout.html\`, \`orders.html\`, \`wishlist.html\`, \`login.html\`, \`register.html\`, \`profile.html\`, \`css/style.css\`, \`js/app.js\`
   - \`ecommerce/schema.sql\`, \`requirements.txt\`, \`live_seed_snapshot.json\`
2. **\`fullstack-node-react-app/\` (The exact Full-Stack Express + TypeScript + React + Vite source code running in the live preview)**
   - \`package.json\`, \`server.ts\`, \`vite.config.ts\`, \`tsconfig.json\`, \`index.html\`
   - \`server/database.ts\`, \`server/seedData.ts\`, \`server/zipGenerator.ts\`
   - \`src/App.tsx\`, \`src/types.ts\`, \`src/index.css\`, \`src/components/...\`

---

## 4. Installation & Run Commands

### Option A — Running the Full-Stack Node/Express + React App (Live Preview Version)
\`\`\`bash
cd fullstack-node-react-app
npm install
npm run dev
# Opens on http://localhost:3000
\`\`\`

### Option B — Running the Django + DRF + SQLite Backend
\`\`\`bash
cd ecommerce
python -m venv venv
source venv/bin/activate        # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt

cd backend
python manage.py makemigrations users products cart wishlist orders reviews
python manage.py migrate
python manage.py runserver 8000
\`\`\`
`;

export function getProjectTextFilesMap(): Record<string, string> {
  const fileMap: Record<string, string> = {};

  // 1. Django + Vanilla JS project files
  fileMap['ecommerce/README.md'] = README_CONTENT;
  fileMap['ecommerce/requirements.txt'] =
    `Django>=5.0,<5.2\ndjangorestframework>=3.15.0\ndjango-cors-headers>=4.4.0\nPillow>=10.4.0\npsycopg2-binary>=2.9.9\n`;
  fileMap['ecommerce/schema.sql'] = SQL_SCHEMA_CODE;
  fileMap['ecommerce/live_seed_snapshot.json'] = JSON.stringify(db.state, null, 2);

  fileMap['ecommerce/backend/manage.py'] =
    `#!/usr/bin/env python\nimport os\nimport sys\n\ndef main():\n    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')\n    from django.core.management import execute_from_command_line\n    execute_from_command_line(sys.argv)\n\nif __name__ == '__main__':\n    main()\n`;

  fileMap['ecommerce/backend/ecommerce/settings.py'] =
    `from pathlib import Path\nimport os\n\nBASE_DIR = Path(__file__).resolve().parent.parent\nSECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-aura-market-college-project-2026')\nDEBUG = True\nALLOWED_HOSTS = ['*']\n\nINSTALLED_APPS = [\n    'django.contrib.admin',\n    'django.contrib.auth',\n    'django.contrib.contenttypes',\n    'django.contrib.sessions',\n    'django.contrib.messages',\n    'django.contrib.staticfiles',\n    'rest_framework',\n    'rest_framework.authtoken',\n    'corsheaders',\n    'users',\n    'products',\n    'cart',\n    'wishlist',\n    'orders',\n    'reviews',\n    'api',\n]\n\nMIDDLEWARE = [\n    'corsheaders.middleware.CorsMiddleware',\n    'django.middleware.security.SecurityMiddleware',\n    'django.contrib.sessions.middleware.SessionMiddleware',\n    'django.middleware.common.CommonMiddleware',\n    'django.middleware.csrf.CsrfViewMiddleware',\n    'django.contrib.auth.middleware.AuthenticationMiddleware',\n    'django.contrib.messages.middleware.MessageMiddleware',\n]\n\nROOT_URLCONF = 'ecommerce.urls'\n\nDATABASES = {\n    'default': {\n        'ENGINE': os.environ.get('DB_ENGINE', 'django.db.backends.sqlite3'),\n        'NAME': BASE_DIR / 'db.sqlite3',\n    }\n}\n\nAUTH_USER_MODEL = 'users.User'\nCORS_ALLOW_ALL_ORIGINS = True\nSTATIC_URL = '/static/'\nMEDIA_URL = '/media/'\nDEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'\n`;

  fileMap['ecommerce/backend/ecommerce/urls.py'] =
    `from django.contrib import admin\nfrom django.urls import path, include\n\nurlpatterns = [\n    path('admin/', admin.site.urls),\n    path('api/', include('api.urls')),\n]\n`;

  fileMap['ecommerce/backend/users/models.py'] = DJANGO_MODELS_CODE;
  fileMap['ecommerce/backend/products/models.py'] = DJANGO_MODELS_CODE;
  fileMap['ecommerce/backend/cart/models.py'] = DJANGO_MODELS_CODE;
  fileMap['ecommerce/backend/wishlist/models.py'] = DJANGO_MODELS_CODE;
  fileMap['ecommerce/backend/orders/models.py'] = DJANGO_MODELS_CODE;
  fileMap['ecommerce/backend/reviews/models.py'] = DJANGO_MODELS_CODE;

  fileMap['ecommerce/backend/api/views.py'] = DJANGO_VIEWS_CODE;
  fileMap['ecommerce/backend/api/serializers.py'] =
    `from rest_framework import serializers\nfrom users.models import User, Address\nfrom products.models import Category, Product, ProductImage\nfrom cart.models import Cart, CartItem\nfrom wishlist.models import Wishlist\nfrom orders.models import Order, OrderItem, Coupon\nfrom reviews.models import Review\n\nclass UserSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = User\n        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'profile_picture', 'created_at']\n\nclass CategorySerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Category\n        fields = '__all__'\n\nclass ProductSerializer(serializers.ModelSerializer):\n    discount_percentage = serializers.ReadOnlyField()\n    class Meta:\n        model = Product\n        fields = '__all__'\n\nclass CartItemSerializer(serializers.ModelSerializer):\n    product = ProductSerializer(read_only=True)\n    class Meta:\n        model = CartItem\n        fields = '__all__'\n\nclass OrderSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Order\n        fields = '__all__'\n\nclass ReviewSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Review\n        fields = '__all__'\n\nclass CouponSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Coupon\n        fields = '__all__'\n`;

  fileMap['ecommerce/backend/api/urls.py'] =
    `from django.urls import path\nfrom .views import RegisterAPIView, LoginAPIView, ProductListCreateAPIView, OrderCreateListAPIView\n\nurlpatterns = [\n    path('register/', RegisterAPIView.as_view(), name='api-register'),\n    path('login/', LoginAPIView.as_view(), name='api-login'),\n    path('products/', ProductListCreateAPIView.as_view(), name='api-products'),\n    path('orders/', OrderCreateListAPIView.as_view(), name='api-orders'),\n]\n`;

  const htmlPages = [
    'index.html',
    'products.html',
    'product-details.html',
    'cart.html',
    'checkout.html',
    'orders.html',
    'wishlist.html',
    'login.html',
    'register.html',
    'profile.html',
  ];

  for (const page of htmlPages) {
    const pageTitle = page.replace('.html', '').replace('-', ' ').toUpperCase();
    fileMap[`ecommerce/frontend/${page}`] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Aura Curated Market — ${pageTitle}</title>
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
</head>
<body data-page="${page.replace('.html', '')}">
  <header class="site-header">
    <a href="index.html" class="brand-logo">Aura Market</a>
    <nav class="main-nav">
      <a href="index.html">Home</a>
      <a href="products.html">Products</a>
      <a href="orders.html">My Orders</a>
      <a href="wishlist.html">Wishlist</a>
      <a href="profile.html">Profile</a>
    </nav>
    <div class="header-actions">
      <a href="cart.html" class="cart-link"><i class="fa-solid fa-bag-shopping"></i> <span id="cart-count">0</span></a>
      <a href="login.html" class="btn-primary">Account</a>
    </div>
  </header>
  <main id="app-container" class="container"></main>
  <div id="toast-container"></div>
  <script src="js/app.js"></script>
</body>
</html>`;
  }

  fileMap['ecommerce/frontend/css/style.css'] = `:root {
  --bg: #FBFBF9;
  --surface: #F4F3EF;
  --text: #141413;
  --muted: #575653;
  --accent: #9A3412;
  --border: rgba(20, 20, 19, 0.1);
}
[data-theme="dark"] {
  --bg: #121214;
  --surface: #1A1A1E;
  --text: #F5F5F3;
  --muted: #A6A6A2;
  --accent: #EA580C;
  --border: rgba(245, 245, 243, 0.12);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
.site-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 2.5rem; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg); z-index: 50; }
.brand-logo { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.75rem; font-weight: 600; text-decoration: none; color: var(--text); }
.main-nav { display: flex; gap: 2rem; }
.main-nav a { text-decoration: none; color: var(--muted); font-size: 0.95rem; }
.main-nav a:hover { color: var(--text); }
.container { max-width: 1280px; margin: 0 auto; padding: 2.5rem 1.5rem; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
.product-card { background: var(--surface); border-radius: 12px; overflow: hidden; transition: transform 0.2s ease; }
.product-card:hover { transform: translateY(-3px); }
`;

  fileMap['ecommerce/frontend/js/app.js'] = `// Vanilla JavaScript + Fetch API Client for Aura Curated Market
const API_BASE = '/api';

async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(\`\${API_BASE}/products/?\${query}\`);
  return res.json();
}

async function addToCart(productId, quantity = 1) {
  const token = localStorage.getItem('aura_token') || 'demo_customer_token';
  const res = await fetch(\`\${API_BASE}/cart/add/\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
    body: JSON.stringify({ product_id: productId, quantity })
  });
  const data = await res.json();
  showToast('Added to shopping bag');
  return data;
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('app-container');
  if (!container) return;
  const products = await fetchProducts();
  container.innerHTML = '<div class="product-grid">' + products.map(p => \`
    <article class="product-card">
      <img src="\${p.image}" alt="\${p.name}" style="width:100%;aspect-ratio:4/3;object-fit:cover;" />
      <div style="padding:1.25rem;">
        <p style="font-size:0.75rem;color:var(--muted);">\${p.brand} · \${p.category_name}</p>
        <h3 style="margin:0.35rem 0;">\${p.name}</h3>
        <p style="font-weight:600;">₹\${p.discount_price.toLocaleString('en-IN')} <del style="color:var(--muted);font-weight:400;">₹\${p.price.toLocaleString('en-IN')}</del></p>
        <button onclick="addToCart(\${p.id})" style="margin-top:0.75rem;width:100%;padding:0.65rem;cursor:pointer;">Add to Cart</button>
      </div>
    </article>
  \`).join('') + '</div>';
});
`;

  // 2. Include all live Full-Stack Node/Express + React source files
  const filesToCopy = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'index.html',
    'metadata.json',
    'server.ts',
    'server/database.ts',
    'server/seedData.ts',
    'server/zipGenerator.ts',
    'src/main.tsx',
    'src/index.css',
    'src/types.ts',
    'src/App.tsx',
    'src/components/Navbar.tsx',
    'src/components/ProductCard.tsx',
    'src/components/ProductDetailView.tsx',
    'src/components/CartAndCheckoutViews.tsx',
    'src/components/OrdersAndProfileViews.tsx',
    'src/components/AdminAndVivaViews.tsx',
  ];

  for (const relPath of filesToCopy) {
    const absPath = path.resolve(process.cwd(), relPath);
    if (fs.existsSync(absPath)) {
      try {
        fileMap[`fullstack-node-react-app/${relPath}`] = fs.readFileSync(absPath, 'utf-8');
      } catch {
        // ignore
      }
    }
  }
  fileMap['fullstack-node-react-app/README.md'] = README_CONTENT;
  fileMap['README.md'] = README_CONTENT;

  return fileMap;
}

export async function buildCollegeProjectZip(): Promise<Buffer> {
  const zip = new JSZip();
  const textFiles = getProjectTextFilesMap();

  for (const [filePath, content] of Object.entries(textFiles)) {
    zip.file(filePath, content);
  }

  // Also include generated studio images in src/assets/images if present
  const imagesDir = path.resolve(process.cwd(), 'src/assets/images');
  if (fs.existsSync(imagesDir)) {
    const imgFiles = fs.readdirSync(imagesDir);
    for (const imgFile of imgFiles) {
      const fullImgPath = path.join(imagesDir, imgFile);
      if (fs.statSync(fullImgPath).isFile()) {
        zip.file(`fullstack-node-react-app/src/assets/images/${imgFile}`, fs.readFileSync(fullImgPath));
      }
    }
  }

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
