// Vanilla JavaScript + Fetch API Client for Aura Curated Market
const API_BASE = '/api';

async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/products/?${query}`);
  return res.json();
}

async function addToCart(productId, quantity = 1) {
  const token = localStorage.getItem('aura_token') || 'demo_customer_token';
  const res = await fetch(`${API_BASE}/cart/add/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
  container.innerHTML = '<div class="product-grid">' + products.map(p => `
    <article class="product-card">
      <img src="${p.image}" alt="${p.name}" style="width:100%;aspect-ratio:4/3;object-fit:cover;" />
      <div style="padding:1.25rem;">
        <p style="font-size:0.75rem;color:var(--muted);">${p.brand} · ${p.category_name}</p>
        <h3 style="margin:0.35rem 0;">${p.name}</h3>
        <p style="font-weight:600;">₹${p.discount_price.toLocaleString('en-IN')} <del style="color:var(--muted);font-weight:400;">₹${p.price.toLocaleString('en-IN')}</del></p>
        <button onclick="addToCart(${p.id})" style="margin-top:0.75rem;width:100%;padding:0.65rem;cursor:pointer;">Add to Cart</button>
      </div>
    </article>
  `).join('') + '</div>';
});
