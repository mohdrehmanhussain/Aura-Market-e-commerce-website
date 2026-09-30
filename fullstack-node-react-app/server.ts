import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, generateToken, hashPassword, OrderStatus } from './server/database.ts';
import {
  DJANGO_MODELS_CODE,
  DJANGO_VIEWS_CODE,
  README_CONTENT,
  SQL_SCHEMA_CODE,
  buildCollegeProjectZip,
  getProjectTextFilesMap,
} from './server/zipGenerator.ts';

const PORT = 3000;

function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  const userId = db.state.sessions[token];
  if (!userId) return null;
  const user = db.state.users.find((u) => u.id === userId && u.active);
  return user || null;
}

function sanitizeUser(user: (typeof db.state.users)[0]) {
  const { password_hash, ...safe } = user;
  return safe;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // ==========================================================================
  // 1. AUTHENTICATION & USER PROFILE API
  // ==========================================================================
  app.post('/api/register/', (req: Request, res: Response) => {
    const { username, email, password, first_name, last_name, phone } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }
    const existing = db.state.users.find(
      (u) =>
        u.username.toLowerCase() === String(username).toLowerCase() ||
        u.email.toLowerCase() === String(email).toLowerCase()
    );
    if (existing) {
      return res.status(400).json({ error: 'Username or email is already registered.' });
    }

    const nextId = db.state.users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
    const newUser = {
      id: nextId,
      username: String(username).trim(),
      email: String(email).trim(),
      password_hash: hashPassword(String(password)),
      first_name: String(first_name || username).trim(),
      last_name: String(last_name || '').trim(),
      phone: String(phone || '+91 98000 00000').trim(),
      profile_picture: '',
      role: 'customer' as const,
      active: true,
      created_at: new Date().toISOString(),
    };

    db.state.users.push(newUser);
    db.getOrCreateCart(newUser.id);
    const token = generateToken();
    db.state.sessions[token] = newUser.id;
    db.save();

    return res.status(201).json({
      token,
      user: sanitizeUser(newUser),
    });
  });

  app.post('/api/login/', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Please enter both username/email and password.' });
    }
    const identifier = String(username).trim().toLowerCase();
    const user = db.state.users.find(
      (u) => u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier
    );
    if (!user || user.password_hash !== hashPassword(String(password))) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }
    if (!user.active) {
      return res.status(403).json({ error: 'This account has been disabled by an administrator.' });
    }

    const token = generateToken();
    db.state.sessions[token] = user.id;
    db.save();

    return res.json({
      token,
      user: sanitizeUser(user),
    });
  });

  app.post('/api/logout/', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (token !== 'demo_customer_token' && token !== 'demo_admin_token') {
        delete db.state.sessions[token];
        db.save();
      }
    }
    return res.json({ message: 'Logged out successfully.' });
  });

  app.post('/api/forgot-password/', (req: Request, res: Response) => {
    const { email, new_password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please provide your registered email or username.' });
    }
    const identifier = String(email).trim().toLowerCase();
    const user = db.state.users.find(
      (u) => u.email.toLowerCase() === identifier || u.username.toLowerCase() === identifier
    );
    if (!user) {
      return res.status(404).json({ error: 'No account found matching that email or username.' });
    }
    if (new_password && String(new_password).length >= 6) {
      user.password_hash = hashPassword(String(new_password));
      db.save();
      return res.json({ message: 'Password updated successfully. You may now sign in.' });
    }
    return res.json({
      message: `Password reset verified for ${user.email}. Enter a new password to complete reset.`,
      verified: true,
    });
  });

  app.get('/api/me/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const addresses = db.state.addresses.filter((a) => a.user_id === user.id);
    return res.json({
      user: sanitizeUser(user),
      addresses,
    });
  });

  app.put('/api/profile/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const { first_name, last_name, email, phone, profile_picture } = req.body;
    if (first_name !== undefined) user.first_name = String(first_name).trim();
    if (last_name !== undefined) user.last_name = String(last_name).trim();
    if (email !== undefined) user.email = String(email).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (profile_picture !== undefined) user.profile_picture = String(profile_picture).trim();
    db.save();

    return res.json({ user: sanitizeUser(user) });
  });

  app.put('/api/profile/password/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const { current_password, new_password } = req.body;
    if (!new_password || String(new_password).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    if (current_password && user.password_hash !== hashPassword(String(current_password))) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }
    user.password_hash = hashPassword(String(new_password));
    db.save();
    return res.json({ message: 'Password changed successfully.' });
  });

  // ==========================================================================
  // 2. SAVED ADDRESSES API
  // ==========================================================================
  app.get('/api/addresses/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    return res.json(db.state.addresses.filter((a) => a.user_id === user.id));
  });

  app.post('/api/addresses/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const { full_name, phone, address, city, state, pincode, country, is_default } = req.body;
    if (!full_name || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({ error: 'All shipping address fields are required.' });
    }

    const nextId = db.state.addresses.reduce((max, a) => Math.max(max, a.id), 0) + 1;
    if (is_default) {
      db.state.addresses.forEach((a) => {
        if (a.user_id === user.id) a.is_default = false;
      });
    }
    const newAddr = {
      id: nextId,
      user_id: user.id,
      full_name: String(full_name).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      city: String(city).trim(),
      state: String(state).trim(),
      pincode: String(pincode).trim(),
      country: String(country || 'India').trim(),
      is_default: Boolean(is_default),
    };
    db.state.addresses.push(newAddr);
    db.save();
    return res.status(201).json(newAddr);
  });

  app.delete('/api/addresses/:id/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    const id = Number(req.params.id);
    db.state.addresses = db.state.addresses.filter((a) => !(a.id === id && a.user_id === user.id));
    db.save();
    return res.json({ deleted: id });
  });

  // ==========================================================================
  // 3. CATEGORIES API
  // ==========================================================================
  app.get('/api/categories/', (_req: Request, res: Response) => {
    const enriched = db.state.categories.map((cat) => ({
      ...cat,
      product_count: db.state.products.filter((p) => p.category_id === cat.id).length,
    }));
    return res.json(enriched);
  });

  app.post('/api/categories/', (req: Request, res: Response) => {
    const { name, description, image } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const nextId = db.state.categories.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const slug = String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const newCat = {
      id: nextId,
      name: String(name).trim(),
      slug,
      description: String(description || 'Curated collection').trim(),
      image: image || db.state.categories[0]?.image || '',
      created_at: new Date().toISOString(),
    };
    db.state.categories.push(newCat);
    db.save();
    return res.status(201).json(newCat);
  });

  app.put('/api/categories/:id/', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const cat = db.state.categories.find((c) => c.id === id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    const { name, description, image } = req.body;
    if (name !== undefined) {
      cat.name = String(name).trim();
      db.state.products.forEach((p) => {
        if (p.category_id === cat.id) p.category_name = cat.name;
      });
    }
    if (description !== undefined) cat.description = String(description).trim();
    if (image !== undefined) cat.image = String(image).trim();
    db.save();
    return res.json(cat);
  });

  app.delete('/api/categories/:id/', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    db.state.categories = db.state.categories.filter((c) => c.id !== id);
    db.save();
    return res.json({ deleted: id });
  });

  // ==========================================================================
  // 4. PRODUCTS & REVIEWS API
  // ==========================================================================
  app.get('/api/products/', (req: Request, res: Response) => {
    let list = [...db.state.products];

    const { category, search, price_range, min_rating, brand, availability, sort } = req.query;

    if (category && category !== 'All') {
      const catStr = String(category).toLowerCase();
      list = list.filter(
        (p) => p.category_name.toLowerCase() === catStr || String(p.category_id) === catStr
      );
    }

    if (search && String(search).trim() !== '') {
      const q = String(search).trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category_name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (price_range && price_range !== 'all') {
      const range = String(price_range);
      if (range === 'under_500') list = list.filter((p) => p.discount_price < 500);
      else if (range === '500_1000')
        list = list.filter((p) => p.discount_price >= 500 && p.discount_price <= 1000);
      else if (range === '1000_5000')
        list = list.filter((p) => p.discount_price > 1000 && p.discount_price <= 5000);
      else if (range === 'above_5000') list = list.filter((p) => p.discount_price > 5000);
    }

    if (min_rating && Number(min_rating) > 0) {
      const minR = Number(min_rating);
      list = list.filter((p) => p.rating >= minR);
    }

    if (brand && brand !== 'All') {
      const brandStr = String(brand).toLowerCase();
      list = list.filter((p) => p.brand.toLowerCase() === brandStr);
    }

    if (availability === 'in_stock') {
      list = list.filter((p) => p.stock > 0);
    } else if (availability === 'out_of_stock') {
      list = list.filter((p) => p.stock === 0);
    }

    if (sort) {
      const sortKey = String(sort);
      if (sortKey === 'price_asc') list.sort((a, b) => a.discount_price - b.discount_price);
      else if (sortKey === 'price_desc') list.sort((a, b) => b.discount_price - a.discount_price);
      else if (sortKey === 'newest')
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      else if (sortKey === 'rating') list.sort((a, b) => b.rating - a.rating);
      else if (sortKey === 'popular') list.sort((a, b) => b.review_count - a.review_count);
      else if (sortKey === 'discount') {
        const getDisc = (p: (typeof list)[0]) => ((p.price - p.discount_price) / p.price) * 100;
        list.sort((a, b) => getDisc(b) - getDisc(a));
      }
    }

    return res.json(list);
  });

  app.get('/api/products/:id/', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const product = db.state.products.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const gallery = db.state.product_images.filter((img) => img.product_id === id);
    const reviews = db.state.reviews
      .filter((r) => r.product_id === id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const related = db.state.products
      .filter(
        (p) =>
          p.id !== id && (p.category_id === product.category_id || p.brand === product.brand)
      )
      .slice(0, 4);

    return res.json({
      ...product,
      gallery: gallery.length > 0 ? gallery : [{ id: 1, product_id: id, image: product.image, caption: 'Studio View' }],
      reviews,
      related_products: related,
    });
  });

  app.post('/api/products/', (req: Request, res: Response) => {
    const {
      name,
      description,
      category_id,
      brand,
      price,
      discount_price,
      stock,
      image,
      tag,
    } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Product name and price are required.' });
    }
    const cat =
      db.state.categories.find((c) => c.id === Number(category_id)) || db.state.categories[0];
    const nextId = db.state.products.reduce((max, p) => Math.max(max, p.id), 0) + 1;

    const newProduct = {
      id: nextId,
      name: String(name).trim(),
      description: String(description || 'Precision engineered studio product.').trim(),
      category_id: cat.id,
      category_name: cat.name,
      brand: String(brand || 'Aura Studio').trim(),
      price: Number(price),
      discount_price: Number(discount_price || price),
      stock: Number(stock ?? 15),
      image: image || cat.image,
      rating: 4.8,
      review_count: 1,
      tag: tag ? String(tag).trim() : undefined,
      features: [
        'Archival studio-grade build and finish',
        'Verified domestic warranty & quality inspection',
        'Ships in protective recyclable packaging',
      ],
      specifications: {
        Brand: String(brand || 'Aura Studio'),
        Category: cat.name,
        Warranty: '1 Year Official Warranty',
      },
      warranty: '1 Year Official Manufacturer Warranty',
      return_policy: '14-day hassle-free return and replacement',
      delivery_info: 'Complimentary insured express delivery in 2–3 business days',
      is_new: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.state.products.unshift(newProduct);
    db.save();
    return res.status(201).json(newProduct);
  });

  app.put('/api/products/:id/', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const product = db.state.products.find((p) => p.id === id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const { name, description, category_id, brand, price, discount_price, stock, image, tag } =
      req.body;
    if (name !== undefined) product.name = String(name).trim();
    if (description !== undefined) product.description = String(description).trim();
    if (category_id !== undefined) {
      const cat = db.state.categories.find((c) => c.id === Number(category_id));
      if (cat) {
        product.category_id = cat.id;
        product.category_name = cat.name;
      }
    }
    if (brand !== undefined) product.brand = String(brand).trim();
    if (price !== undefined) product.price = Number(price);
    if (discount_price !== undefined) product.discount_price = Number(discount_price);
    if (stock !== undefined) product.stock = Math.max(0, Number(stock));
    if (image !== undefined && String(image).trim()) product.image = String(image).trim();
    if (tag !== undefined) product.tag = tag ? String(tag).trim() : undefined;
    product.updated_at = new Date().toISOString();

    db.save();
    return res.json(product);
  });

  app.delete('/api/products/:id/', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    db.state.products = db.state.products.filter((p) => p.id !== id);
    db.state.cart_items = db.state.cart_items.filter((ci) => ci.product_id !== id);
    db.state.wishlists = db.state.wishlists.filter((w) => w.product_id !== id);
    db.save();
    return res.json({ deleted: id });
  });

  // Reviews
  app.get('/api/products/:id/reviews/', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const reviews = db.state.reviews
      .filter((r) => r.product_id === id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return res.json(reviews);
  });

  app.post('/api/products/:id/reviews/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Please sign in to submit a review.' });

    const productId = Number(req.params.id);
    const { rating, comment } = req.body;
    if (!rating || !comment || String(comment).trim().length < 3) {
      return res.status(400).json({ error: 'Please provide a star rating and review comment.' });
    }

    const nextId = db.state.reviews.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const newReview = {
      id: nextId,
      user_id: user.id,
      user_name: `${user.first_name} ${user.last_name}`.trim() || user.username,
      product_id: productId,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: String(comment).trim(),
      verified_purchase: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.state.reviews.unshift(newReview);
    db.recalculateProductRating(productId);
    return res.status(201).json(newReview);
  });

  app.put('/api/reviews/:id/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    const id = Number(req.params.id);
    const review = db.state.reviews.find((r) => r.id === id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.user_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this review' });
    }
    if (req.body.rating !== undefined) review.rating = Number(req.body.rating);
    if (req.body.comment !== undefined) review.comment = String(req.body.comment).trim();
    review.updated_at = new Date().toISOString();
    db.recalculateProductRating(review.product_id);
    return res.json(review);
  });

  app.delete('/api/reviews/:id/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    const id = Number(req.params.id);
    const review = db.state.reviews.find((r) => r.id === id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.user_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }
    const productId = review.product_id;
    db.state.reviews = db.state.reviews.filter((r) => r.id !== id);
    db.recalculateProductRating(productId);
    return res.json({ deleted: id });
  });

  // ==========================================================================
  // 5. SHOPPING CART API
  // ==========================================================================
  app.get('/api/cart/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    const userId = user ? user.id : 2; // Fallback to demo customer session for seamless guest browsing
    return res.json(db.getEnrichedCart(userId));
  });

  app.post('/api/cart/add/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    const userId = user ? user.id : 2;
    const { product_id, quantity = 1 } = req.body;

    const product = db.state.products.find((p) => p.id === Number(product_id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock <= 0) {
      return res.status(400).json({ error: `${product.name} is currently out of stock.` });
    }

    const cart = db.getOrCreateCart(userId);
    const existingItem = db.state.cart_items.find(
      (ci) => ci.cart_id === cart.id && ci.product_id === product.id
    );

    const requestedQty = Number(quantity) || 1;
    if (existingItem) {
      const nextQty = existingItem.quantity + requestedQty;
      if (nextQty > product.stock) {
        return res
          .status(400)
          .json({ error: `Only ${product.stock} units of ${product.name} available in stock.` });
      }
      existingItem.quantity = nextQty;
    } else {
      if (requestedQty > product.stock) {
        return res
          .status(400)
          .json({ error: `Only ${product.stock} units of ${product.name} available in stock.` });
      }
      const nextId = db.state.cart_items.reduce((max, ci) => Math.max(max, ci.id), 0) + 1;
      db.state.cart_items.push({
        id: nextId,
        cart_id: cart.id,
        product_id: product.id,
        quantity: requestedQty,
      });
    }

    cart.updated_at = new Date().toISOString();
    db.save();
    return res.json(db.getEnrichedCart(userId));
  });

  app.put('/api/cart/update/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    const userId = user ? user.id : 2;
    const { product_id, quantity } = req.body;
    const cart = db.getOrCreateCart(userId);
    const product = db.state.products.find((p) => p.id === Number(product_id));
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const newQty = Number(quantity);
    if (newQty <= 0) {
      db.state.cart_items = db.state.cart_items.filter(
        (ci) => !(ci.cart_id === cart.id && ci.product_id === product.id)
      );
    } else {
      if (newQty > product.stock) {
        return res
          .status(400)
          .json({ error: `Only ${product.stock} units available in stock.` });
      }
      const item = db.state.cart_items.find(
        (ci) => ci.cart_id === cart.id && ci.product_id === product.id
      );
      if (item) item.quantity = newQty;
    }

    cart.updated_at = new Date().toISOString();
    db.save();
    return res.json(db.getEnrichedCart(userId));
  });

  app.delete('/api/cart/remove/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    const userId = user ? user.id : 2;
    const productId = Number(req.body.product_id || req.query.product_id);
    const cart = db.getOrCreateCart(userId);

    db.state.cart_items = db.state.cart_items.filter(
      (ci) => !(ci.cart_id === cart.id && ci.product_id === productId)
    );
    db.save();
    return res.json(db.getEnrichedCart(userId));
  });

  app.delete('/api/cart/clear/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    const userId = user ? user.id : 2;
    const cart = db.getOrCreateCart(userId);
    db.state.cart_items = db.state.cart_items.filter((ci) => ci.cart_id !== cart.id);
    db.save();
    return res.json(db.getEnrichedCart(userId));
  });

  // ==========================================================================
  // 6. WISHLIST API
  // ==========================================================================
  app.get('/api/wishlist/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    const userId = user ? user.id : 2;
    const items = db.state.wishlists
      .filter((w) => w.user_id === userId)
      .map((w) => {
        const product = db.state.products.find((p) => p.id === w.product_id);
        return product ? { ...w, product } : null;
      })
      .filter(Boolean);
    return res.json(items);
  });

  app.post('/api/wishlist/add/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    const userId = user ? user.id : 2;
    const productId = Number(req.body.product_id);
    const exists = db.state.wishlists.find(
      (w) => w.user_id === userId && w.product_id === productId
    );
    if (!exists) {
      const nextId = db.state.wishlists.reduce((max, w) => Math.max(max, w.id), 0) + 1;
      db.state.wishlists.push({
        id: nextId,
        user_id: userId,
        product_id: productId,
        created_at: new Date().toISOString(),
      });
      db.save();
    }
    const items = db.state.wishlists
      .filter((w) => w.user_id === userId)
      .map((w) => ({
        ...w,
        product: db.state.products.find((p) => p.id === w.product_id),
      }))
      .filter((w) => w.product);
    return res.json(items);
  });

  app.delete('/api/wishlist/remove/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    const userId = user ? user.id : 2;
    const productId = Number(req.body.product_id || req.query.product_id);
    db.state.wishlists = db.state.wishlists.filter(
      (w) => !(w.user_id === userId && w.product_id === productId)
    );
    db.save();
    const items = db.state.wishlists
      .filter((w) => w.user_id === userId)
      .map((w) => ({
        ...w,
        product: db.state.products.find((p) => p.id === w.product_id),
      }))
      .filter((w) => w.product);
    return res.json(items);
  });

  // ==========================================================================
  // 7. COUPONS & ORDERS API
  // ==========================================================================
  app.get('/api/coupons/', (_req: Request, res: Response) => {
    return res.json(db.state.coupons.filter((c) => c.active));
  });

  app.post('/api/coupons/validate/', (req: Request, res: Response) => {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Please enter a coupon code.' });

    const coupon = db.state.coupons.find(
      (c) => c.code.toUpperCase() === String(code).trim().toUpperCase()
    );
    if (!coupon || !coupon.active) {
      return res.status(404).json({ error: 'Invalid or inactive coupon code.' });
    }
    if (new Date(coupon.expiry_date).getTime() < Date.now()) {
      return res.status(400).json({ error: 'This coupon has expired.' });
    }
    const orderSubtotal = Number(subtotal || 0);
    if (orderSubtotal < coupon.minimum_order) {
      return res.status(400).json({
        error: `Minimum order value of ₹${coupon.minimum_order.toLocaleString('en-IN')} is required for ${coupon.code}.`,
      });
    }

    const rawDiscount = Math.round((orderSubtotal * coupon.discount_percentage) / 100);
    const discountAmount = Math.min(rawDiscount, coupon.maximum_discount);

    return res.json({
      coupon,
      discount_amount: discountAmount,
      message: `Coupon ${coupon.code} applied! You saved ₹${discountAmount.toLocaleString('en-IN')}.`,
    });
  });

  app.post('/api/orders/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Please sign in to place your order.' });
    }

    const enrichedCart = db.getEnrichedCart(user.id);
    if (enrichedCart.items.length === 0) {
      return res.status(400).json({ error: 'Your shopping cart is empty.' });
    }

    // Validate stock for all items
    for (const item of enrichedCart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          error: `${item.product.name} has only ${item.product.stock} units remaining in stock.`,
        });
      }
    }

    const { shipping_address, payment_method, coupon_code } = req.body;
    if (!shipping_address || !shipping_address.full_name || !shipping_address.address) {
      return res.status(400).json({ error: 'Valid delivery address is required.' });
    }

    let couponDiscount = 0;
    if (coupon_code) {
      const coupon = db.state.coupons.find(
        (c) => c.code.toUpperCase() === String(coupon_code).trim().toUpperCase() && c.active
      );
      if (coupon && enrichedCart.subtotal >= coupon.minimum_order) {
        couponDiscount = Math.min(
          Math.round((enrichedCart.subtotal * coupon.discount_percentage) / 100),
          coupon.maximum_discount
        );
      }
    }

    const nextOrderId = db.state.orders.reduce((max, o) => Math.max(max, o.id), 0) + 1;
    const orderNumber = `ORD${100244 + nextOrderId}`;
    const totalAmount = Math.max(
      0,
      enrichedCart.subtotal - couponDiscount + enrichedCart.delivery_charge + enrichedCart.tax
    );

    const newOrder = {
      id: nextOrderId,
      user_id: user.id,
      order_number: orderNumber,
      subtotal: enrichedCart.subtotal,
      discount: couponDiscount,
      delivery_charge: enrichedCart.delivery_charge,
      tax: enrichedCart.tax,
      total_amount: totalAmount,
      coupon_code: coupon_code || undefined,
      payment_method: payment_method || 'Cash on Delivery',
      status: 'Order Placed' as OrderStatus,
      shipping_address,
      created_at: new Date().toISOString(),
    };

    db.state.orders.unshift(newOrder);

    // Create order items and deduct product stock
    let nextItemId = db.state.order_items.reduce((max, oi) => Math.max(max, oi.id), 0) + 1;
    const createdItems = [];
    for (const item of enrichedCart.items) {
      const orderItem = {
        id: nextItemId++,
        order_id: newOrder.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.image,
        brand: item.product.brand,
        quantity: item.quantity,
        price: item.unit_price,
      };
      db.state.order_items.push(orderItem);
      createdItems.push(orderItem);

      item.product.stock = Math.max(0, item.product.stock - item.quantity);
    }

    // Clear user's cart
    const userCart = db.getOrCreateCart(user.id);
    db.state.cart_items = db.state.cart_items.filter((ci) => ci.cart_id !== userCart.id);
    db.save();

    return res.status(201).json({
      ...newOrder,
      items: createdItems,
    });
  });

  app.get('/api/orders/', (req: Request, res: Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const allOrders =
      user.role === 'admin' && req.query.all === 'true'
        ? db.state.orders
        : db.state.orders.filter((o) => o.user_id === user.id);

    const enriched = allOrders.map((order) => ({
      ...order,
      items: db.state.order_items.filter((oi) => oi.order_id === order.id),
      customer: db.state.users.find((u) => u.id === order.user_id)
        ? sanitizeUser(db.state.users.find((u) => u.id === order.user_id)!)
        : undefined,
    }));

    return res.json(enriched);
  });

  app.get('/api/orders/:id/', (req: Request, res: Response) => {
    const idOrNum = req.params.id;
    const order = db.state.orders.find(
      (o) => o.id === Number(idOrNum) || o.order_number.toLowerCase() === idOrNum.toLowerCase()
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = db.state.order_items.filter((oi) => oi.order_id === order.id);
    return res.json({ ...order, items });
  });

  app.put('/api/orders/:id/cancel/', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const order = db.state.orders.find((o) => o.id === id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status === 'Delivered') {
      return res.status(400).json({ error: 'Delivered orders cannot be cancelled.' });
    }
    if (order.status !== 'Cancelled') {
      order.status = 'Cancelled';
      // Restore stock
      const items = db.state.order_items.filter((oi) => oi.order_id === order.id);
      for (const item of items) {
        const prod = db.state.products.find((p) => p.id === item.product_id);
        if (prod) prod.stock += item.quantity;
      }
      db.save();
    }
    return res.json({
      ...order,
      items: db.state.order_items.filter((oi) => oi.order_id === order.id),
    });
  });

  app.put('/api/orders/:id/status/', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const order = db.state.orders.find((o) => o.id === id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const { status } = req.body;
    if (status) {
      order.status = status as OrderStatus;
      db.save();
    }
    return res.json({
      ...order,
      items: db.state.order_items.filter((oi) => oi.order_id === order.id),
    });
  });

  // ==========================================================================
  // 8. ADMIN DASHBOARD ANALYTICS & USER MANAGEMENT API
  // ==========================================================================
  app.get('/api/admin/analytics/', (_req: Request, res: Response) => {
    const validOrders = db.state.orders.filter((o) => o.status !== 'Cancelled');
    const totalSales = validOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalOrders = db.state.orders.length;
    const totalUsers = db.state.users.length;
    const totalProducts = db.state.products.length;
    const pendingOrders = db.state.orders.filter(
      (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
    ).length;
    const deliveredOrders = db.state.orders.filter((o) => o.status === 'Delivered').length;

    const categoryBreakdown = db.state.categories.map((cat) => {
      const catProducts = db.state.products.filter((p) => p.category_id === cat.id);
      const stockCount = catProducts.reduce((s, p) => s + p.stock, 0);
      return {
        category: cat.name,
        products: catProducts.length,
        stock: stockCount,
      };
    });

    const popularProducts = [...db.state.products]
      .sort((a, b) => b.review_count - a.review_count)
      .slice(0, 6);

    return res.json({
      total_sales: totalSales,
      total_orders: totalOrders,
      total_users: totalUsers,
      total_products: totalProducts,
      pending_orders: pendingOrders,
      delivered_orders: deliveredOrders,
      category_breakdown: categoryBreakdown,
      popular_products: popularProducts,
      recent_orders: db.state.orders.slice(0, 8).map((o) => ({
        ...o,
        items: db.state.order_items.filter((oi) => oi.order_id === o.id),
      })),
    });
  });

  app.get('/api/admin/users/', (_req: Request, res: Response) => {
    return res.json(db.state.users.map(sanitizeUser));
  });

  app.put('/api/admin/users/:id/', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = db.state.users.find((u) => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (req.body.active !== undefined) user.active = Boolean(req.body.active);
    if (req.body.role !== undefined) user.role = req.body.role;
    db.save();
    return res.json(sanitizeUser(user));
  });

  // ==========================================================================
  // 9. COLLEGE PROJECT DELIVERABLES & ZIP ARCHIVE GENERATOR
  // ==========================================================================
  app.get('/api/project-files/', (_req: Request, res: Response) => {
    const allFiles = getProjectTextFilesMap();
    return res.json({
      django_models: DJANGO_MODELS_CODE,
      django_views: DJANGO_VIEWS_CODE,
      sql_schema: SQL_SCHEMA_CODE,
      readme: README_CONTENT,
      all_files: allFiles,
    });
  });

  app.get('/api/project-zip/', async (_req: Request, res: Response) => {
    try {
      const buffer = await buildCollegeProjectZip();
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="aura-ecommerce-college-project.zip"'
      );
      res.setHeader('Content-Length', String(buffer.length));
      return res.end(buffer);
    } catch (err) {
      console.error('Failed to generate project zip:', err);
      return res.status(500).json({ error: 'Failed to generate ZIP archive' });
    }
  });

  // ==========================================================================
  // 10. VITE MIDDLEWARE / STATIC ASSETS
  // ==========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aura Curated Market server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
