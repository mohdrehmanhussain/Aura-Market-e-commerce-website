# Aura Curated Market — Full-Stack E-Commerce Shopping Platform
**College Mini-Project & Viva Demonstration Package**

---

## 1. Project Overview
**Aura Curated Market** is a responsive, full-stack E-Commerce Shopping Platform inspired by modern retail architectures (Amazon, Flipkart, Myntra, Shopify) with an original luxury editorial design system.

It implements all **15 core pages & modules**, **12 relational database models**, **RESTful API endpoints**, **multi-step checkout**, **coupon validation**, **visual order tracking timeline**, **customer reviews**, **dark mode**, and a complete **Admin Analytics & Inventory Dashboard**.

---

## 2. Sample Login Credentials (For Project Demo & Viva)

| Role | Username / Email | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer Account** | `aarav_sharma` or `aarav@example.com` | `customer123` | Pre-loaded cart, wishlist, saved addresses, past orders (`#ORD100245`, `#ORD100246`), verified product review access |
| **Admin Account** | `admin` or `admin@auramarket.in` | `admin123` | Full Admin Dashboard access: Product CRUD, Category CRUD, Order Status Management, User Management, Revenue Charts |

### Active Coupon Codes for Checkout Testing
* `SAVE10` — **10% OFF** on orders above ₹1,000 (Max discount ₹1,500)
* `SAVE20` — **20% OFF** on orders above ₹3,500 (Max discount ₹4,000)
* `WELCOME` — **15% OFF** on orders above ₹500 (Max discount ₹1,200)
* `CAMPUS25` — **25% OFF** on orders above ₹5,000 (Max discount ₹5,000)

---

## 3. What Is Inside This ZIP Archive?

This ZIP archive includes **both** complete implementations so you can run or present whichever stack your faculty prefers:

1. **`ecommerce/` (Django + Django REST Framework + SQLite + Vanilla HTML5/CSS3/JS)**
   - `ecommerce/backend/manage.py`
   - `ecommerce/backend/ecommerce/settings.py` & `urls.py`
   - `ecommerce/backend/users/models.py`, `products/models.py`, `cart/models.py`, `wishlist/models.py`, `orders/models.py`, `reviews/models.py`
   - `ecommerce/backend/api/serializers.py`, `views.py`, `urls.py`
   - `ecommerce/frontend/index.html`, `products.html`, `product-details.html`, `cart.html`, `checkout.html`, `orders.html`, `wishlist.html`, `login.html`, `register.html`, `profile.html`, `css/style.css`, `js/app.js`
   - `ecommerce/schema.sql`, `requirements.txt`, `live_seed_snapshot.json`
2. **`fullstack-node-react-app/` (The exact Full-Stack Express + TypeScript + React + Vite source code running in the live preview)**
   - `package.json`, `server.ts`, `vite.config.ts`, `tsconfig.json`, `index.html`
   - `server/database.ts`, `server/seedData.ts`, `server/zipGenerator.ts`
   - `src/App.tsx`, `src/types.ts`, `src/index.css`, `src/components/...`

---

## 4. Installation & Run Commands

### Option A — Running the Full-Stack Node/Express + React App (Live Preview Version)
```bash
cd fullstack-node-react-app
npm install
npm run dev
# Opens on http://localhost:3000
```

### Option B — Running the Django + DRF + SQLite Backend
```bash
cd ecommerce
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt

cd backend
python manage.py makemigrations users products cart wishlist orders reviews
python manage.py migrate
python manage.py runserver 8000
```
