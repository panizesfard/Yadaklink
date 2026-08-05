(() => {
  const STORAGE_KEY = 'yadaklink-cart';

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function getItems() { return load(); }

  function getTotalCount() {
    return load().reduce((sum, item) => sum + item.qty, 0);
  }

  function addItem(product) {
    const items = load();
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({
        id:    product.id,
        name:  product.name,
        price: product.price,
        image: product.image,
        code:  product.code,
        qty:   1,
      });
    }
    save(items);
    updateBadges();
    showToast(`«${product.name}» به سبد خرید اضافه شد`);
  }

  function removeItem(id) {
    save(load().filter(i => i.id !== id));
    updateBadges();
  }

  function updateQty(id, qty) {
    const items = load();
    const item = items.find(i => i.id === id);
    if (item) {
      item.qty = Math.max(1, qty);
      save(items);
    }
    updateBadges();
  }

  function clearCart() {
    save([]);
    updateBadges();
  }

  function getTotal() {
    return load().reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function updateBadges() {
    const count = getTotalCount();
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // ── Toast notification ─────────────────────────────────────────
  function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">✓</span> ${message}`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast-show'));
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateBadges();

    // Delegate click on all add-to-cart buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add-cart]');
      if (!btn) return;
      const id = parseInt(btn.dataset.addCart, 10);
      const product = window.PRODUCTS?.find(p => p.id === id);
      if (product) {
        if (!product.stock) {
          showToast('این محصول موجود نیست');
          return;
        }
        addItem(product);
        btn.classList.add('btn-bounce');
        setTimeout(() => btn.classList.remove('btn-bounce'), 600);
      }
    });
  });

  window.YL = window.YL || {};
  window.YL.cart = { getItems, addItem, removeItem, updateQty, clearCart, getTotal, getTotalCount, updateBadges, showToast };
})();
