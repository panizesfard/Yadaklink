document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  if (page === 'home')    initHome();
  if (page === 'products') initProducts();
  if (page === 'product')  initProduct();
  if (page === 'cart')     initCart();
  if (page === 'blog')     initBlog();

  initMobileMenu();
  initSearchSuggest();
});

// ── Helpers ────────────────────────────────────────────────────────────────
function formatPrice(n) {
  return n.toLocaleString('fa-IR') + ' تومان';
}

function badge(text) {
  if (!text) return '';
  const cls = text === 'ناموجود' ? 'badge-out' : text === 'تخفیف' ? 'badge-sale' : 'badge-new';
  return `<span class="product-badge ${cls}">${text}</span>`;
}

function stars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function renderProductCard(p) {
  return `
  <div class="product-card reveal" data-id="${p.id}">
    ${badge(p.badge)}
    <a href="product.html?id=${p.id}" class="product-img-wrap">
      <img src="${p.image}" alt="${p.name}" loading="lazy">
    </a>
    <div class="product-info">
      <span class="product-cat">${p.categoryName}</span>
      <a href="product.html?id=${p.id}" class="product-name">${p.name}</a>
      <div class="product-code">کد: ${p.code}</div>
      <div class="product-rating">
        <span class="stars">${stars(p.rating)}</span>
        <span class="review-count">(${p.reviews})</span>
      </div>
      <div class="product-price-row">
        <div>
          ${p.originalPrice > p.price ? `<del class="original-price">${formatPrice(p.originalPrice)}</del>` : ''}
          <span class="price">${formatPrice(p.price)}</span>
        </div>
        ${p.stock
          ? `<button class="btn btn-cart" data-add-cart="${p.id}" aria-label="افزودن به سبد">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
             </button>`
          : `<span class="out-of-stock">ناموجود</span>`
        }
      </div>
    </div>
  </div>`;
}

// ── Home page ──────────────────────────────────────────────────────────────
function initHome() {
  // Typewriter on hero
  const tw = document.getElementById('hero-typewriter');
  if (tw && window.YL?.typewriter) {
    window.YL.typewriter(tw, 'یدک لینک', 80, 600);
  }

  // Render featured products (first 8)
  const grid = document.getElementById('featured-grid');
  if (grid && window.PRODUCTS) {
    const featured = window.PRODUCTS.filter(p => p.badge && p.badge !== 'ناموجود').slice(0, 8);
    grid.innerHTML = featured.map(renderProductCard).join('');
    window.YL?.initCardTilt?.();
    window.YL?.initReveal?.();
  }

  // Category filter tabs on homepage
  initCategoryTabs('featured-tabs', 'featured-grid', false);

  // Hero search
  const heroForm = document.getElementById('hero-search-form');
  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q    = heroForm.querySelector('[name="q"]')?.value?.trim() || '';
      const cat  = heroForm.querySelector('[name="cat"]')?.value || '';
      const car  = heroForm.querySelector('[name="car"]')?.value?.trim() || '';
      window.location.href = `products.html?q=${encodeURIComponent(q)}&cat=${cat}&car=${encodeURIComponent(car)}`;
    });
  }

  // Render categories section
  const catGrid = document.getElementById('categories-grid');
  if (catGrid && window.CATEGORIES) {
    catGrid.innerHTML = window.CATEGORIES.map(c => `
      <a href="products.html?cat=${c.id}" class="cat-card reveal">
        <div class="cat-icon">${getCatSVG(c.icon)}</div>
        <div class="cat-name">${c.name}</div>
        <div class="cat-count">${c.count} قطعه</div>
      </a>
    `).join('');
    window.YL?.initReveal?.();
  }
}

// ── Products page ──────────────────────────────────────────────────────────
function initProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid || !window.PRODUCTS) return;

  const params = new URLSearchParams(window.location.search);
  let q   = params.get('q')   || '';
  let cat = params.get('cat') || 'all';
  let car = params.get('car') || '';

  // Set search inputs
  const searchInput = document.getElementById('search-input');
  const catSelect   = document.getElementById('cat-select');
  const carInput    = document.getElementById('car-input');
  if (searchInput) searchInput.value = q;
  if (catSelect)   catSelect.value   = cat;
  if (carInput)    carInput.value    = car;

  // Populate category select
  if (catSelect && window.CATEGORIES) {
    const opts = window.CATEGORIES.map(c =>
      `<option value="${c.id}" ${cat === c.id ? 'selected' : ''}>${c.name}</option>`
    ).join('');
    catSelect.innerHTML = `<option value="all">همه دسته‌ها</option>${opts}`;
    catSelect.value = cat;
  }

  function filterAndRender() {
    let results = window.PRODUCTS;
    if (cat !== 'all') results = results.filter(p => p.category === cat);
    if (q)   results = results.filter(p =>
      p.name.includes(q) || p.code.toLowerCase().includes(q.toLowerCase()) || p.nameEn?.toLowerCase().includes(q.toLowerCase())
    );
    if (car) results = results.filter(p =>
      p.compatible.some(c => c.includes(car))
    );

    document.getElementById('results-count').textContent = results.length;

    if (results.length === 0) {
      grid.innerHTML = `<div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <p>محصولی یافت نشد</p>
        <button class="btn btn-outline" onclick="clearFilters()">پاک کردن فیلترها</button>
      </div>`;
      return;
    }
    grid.innerHTML = results.map(renderProductCard).join('');
    window.YL?.initCardTilt?.();
    window.YL?.initReveal?.();
  }

  window.clearFilters = function() {
    q = ''; cat = 'all'; car = '';
    if (searchInput) searchInput.value = '';
    if (catSelect)   catSelect.value   = 'all';
    if (carInput)    carInput.value    = '';
    filterAndRender();
  };

  // Filter form
  const filterForm = document.getElementById('filter-form');
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      q   = searchInput?.value?.trim() || '';
      cat = catSelect?.value || 'all';
      car = carInput?.value?.trim() || '';
      filterAndRender();
      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('q', q);
      url.searchParams.set('cat', cat);
      url.searchParams.set('car', car);
      history.replaceState({}, '', url);
    });
  }

  // Sort
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const val = sortSelect.value;
      const items = window.PRODUCTS.filter(p => {
        let pass = true;
        if (cat !== 'all') pass = pass && p.category === cat;
        if (q) pass = pass && (p.name.includes(q) || p.code.includes(q));
        if (car) pass = pass && p.compatible.some(c => c.includes(car));
        return pass;
      });
      if (val === 'price-asc')  items.sort((a,b) => a.price - b.price);
      if (val === 'price-desc') items.sort((a,b) => b.price - a.price);
      if (val === 'rating')     items.sort((a,b) => b.rating - a.rating);
      grid.innerHTML = items.map(renderProductCard).join('');
      window.YL?.initCardTilt?.();
      window.YL?.initReveal?.();
    });
  }

  // Category tabs (sidebar)
  document.querySelectorAll('[data-cat-filter]').forEach(btn => {
    if (btn.dataset.catFilter === cat) btn.classList.add('active');
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-cat-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cat = btn.dataset.catFilter;
      filterAndRender();
    });
  });

  filterAndRender();
}

// ── Product detail page ────────────────────────────────────────────────────
function initProduct() {
  const id = parseInt(new URLSearchParams(window.location.search).get('id'), 10);
  const product = window.PRODUCTS?.find(p => p.id === id);
  if (!product) {
    document.getElementById('product-detail').innerHTML = `
      <div class="empty-state" style="padding:4rem 0">
        <p>محصول یافت نشد</p>
        <a href="products.html" class="btn btn-primary">بازگشت به محصولات</a>
      </div>`;
    return;
  }

  document.title = `${product.name} | یدک لینک`;

  const el = document.getElementById('product-detail');
  if (!el) return;

  el.innerHTML = `
    <div class="pd-breadcrumb reveal">
      <a href="index.html">خانه</a>
      <span>/</span>
      <a href="products.html">محصولات</a>
      <span>/</span>
      <a href="products.html?cat=${product.category}">${product.categoryName}</a>
      <span>/</span>
      <span>${product.name}</span>
    </div>

    <div class="pd-layout">
      <div class="pd-gallery reveal">
        <div class="pd-main-img">
          <img src="${product.image}" alt="${product.name}" id="pd-img-main">
        </div>
        ${!product.stock ? '<div class="pd-unavailable-overlay">ناموجود</div>' : ''}
      </div>

      <div class="pd-info reveal">
        <div class="pd-cat-tag">${product.categoryName}</div>
        <h1 class="pd-title">${product.name}</h1>
        <div class="pd-code">کد فنی: <strong>${product.code}</strong></div>

        <div class="pd-meta-row">
          <div class="pd-meta-item">
            <span class="pd-meta-label">برند</span>
            <span class="pd-meta-val">${product.brand}</span>
          </div>
          <div class="pd-meta-item">
            <span class="pd-meta-label">گارانتی</span>
            <span class="pd-meta-val">${product.warranty}</span>
          </div>
          <div class="pd-meta-item">
            <span class="pd-meta-label">ارسال</span>
            <span class="pd-meta-val">${product.delivery}</span>
          </div>
          <div class="pd-meta-item">
            <span class="pd-meta-label">موجودی</span>
            <span class="pd-meta-val ${product.stock ? 'in-stock' : 'no-stock'}">${product.stock ? 'موجود ✓' : 'ناموجود'}</span>
          </div>
        </div>

        <div class="pd-compatible">
          <div class="pd-section-label">سازگار با خودروها:</div>
          <div class="pd-compat-list">
            ${product.compatible.map(c => `<span class="compat-tag">${c}</span>`).join('')}
          </div>
        </div>

        <div class="pd-price-section">
          ${product.originalPrice > product.price
            ? `<del class="pd-original">${formatPrice(product.originalPrice)}</del>
               <span class="pd-discount">${Math.round((1 - product.price/product.originalPrice)*100)}٪ تخفیف</span>`
            : ''}
          <div class="pd-price">${formatPrice(product.price)}</div>
        </div>

        ${product.stock
          ? `<div class="pd-qty-row">
               <label>تعداد:</label>
               <div class="qty-control">
                 <button class="qty-btn" id="qty-minus">−</button>
                 <input type="number" id="qty-input" value="1" min="1" max="10" class="qty-input">
                 <button class="qty-btn" id="qty-plus">+</button>
               </div>
             </div>
             <button class="btn btn-primary btn-lg" data-add-cart="${product.id}">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
               افزودن به سبد خرید
             </button>`
          : `<button class="btn btn-outline btn-lg" disabled>این محصول موجود نیست</button>`
        }
      </div>
    </div>

    <div class="pd-tabs reveal">
      <div class="pd-tab-nav">
        <button class="pd-tab-btn active" data-tab="desc">توضیحات</button>
        <button class="pd-tab-btn" data-tab="specs">مشخصات فنی</button>
      </div>
      <div class="pd-tab-content" id="tab-desc">
        <p class="pd-desc-text">${product.description}</p>
      </div>
      <div class="pd-tab-content hidden" id="tab-specs">
        <table class="specs-table">
          ${product.specs.map(s => `<tr><td class="spec-label">${s.label}</td><td class="spec-val">${s.value}</td></tr>`).join('')}
        </table>
      </div>
    </div>

    <div class="pd-related reveal">
      <h3 class="section-title">محصولات مرتبط</h3>
      <div class="products-grid stagger-children">
        ${window.PRODUCTS
          .filter(p => p.category === product.category && p.id !== product.id)
          .slice(0, 4)
          .map(renderProductCard).join('')}
      </div>
    </div>
  `;

  // Tab switching
  el.querySelectorAll('.pd-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.pd-tab-btn').forEach(b => b.classList.remove('active'));
      el.querySelectorAll('.pd-tab-content').forEach(c => c.classList.add('hidden'));
      btn.classList.add('active');
      el.querySelector(`#tab-${btn.dataset.tab}`)?.classList.remove('hidden');
    });
  });

  // Qty controls
  const qtyInput = el.querySelector('#qty-input');
  el.querySelector('#qty-minus')?.addEventListener('click', () => {
    if (qtyInput) qtyInput.value = Math.max(1, parseInt(qtyInput.value) - 1);
  });
  el.querySelector('#qty-plus')?.addEventListener('click', () => {
    if (qtyInput) qtyInput.value = Math.min(10, parseInt(qtyInput.value) + 1);
  });

  window.YL?.initReveal?.();
  window.YL?.initCardTilt?.();
}

// ── Cart page ──────────────────────────────────────────────────────────────
function initCart() {
  function renderCart() {
    const container = document.getElementById('cart-items');
    const summary   = document.getElementById('cart-summary');
    if (!container || !window.YL?.cart) return;

    const items = window.YL.cart.getItems();

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <p>سبد خرید شما خالی است</p>
          <a href="products.html" class="btn btn-primary">مشاهده محصولات</a>
        </div>`;
      if (summary) summary.innerHTML = '';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <a href="product.html?id=${item.id}" class="cart-item-name">${item.name}</a>
          <div class="cart-item-code">کد: ${item.code}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
        </div>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button class="qty-btn" data-change="-1" data-id="${item.id}">−</button>
            <span class="qty-display">${item.qty}</span>
            <button class="qty-btn" data-change="1" data-id="${item.id}">+</button>
          </div>
          <div class="cart-item-subtotal">${formatPrice(item.price * item.qty)}</div>
          <button class="cart-remove" data-remove="${item.id}" aria-label="حذف">✕</button>
        </div>
      </div>
    `).join('');

    const total = window.YL.cart.getTotal();
    if (summary) {
      summary.innerHTML = `
        <div class="cart-summary-row"><span>جمع کالاها (${items.length})</span><span>${formatPrice(total)}</span></div>
        <div class="cart-summary-row"><span>هزینه ارسال</span><span class="free-shipping">رایگان</span></div>
        <div class="cart-summary-total"><span>مبلغ قابل پرداخت</span><span>${formatPrice(total)}</span></div>
        <button class="btn btn-primary btn-full" id="checkout-btn">ادامه و پرداخت</button>
        <a href="products.html" class="btn btn-outline btn-full">ادامه خرید</a>
      `;
      document.getElementById('checkout-btn')?.addEventListener('click', () => {
        window.YL.cart.showToast('این یک نمایش UI است. درگاه پرداخت در نسخه واقعی فعال می‌شود');
      });
    }

    // Qty change buttons
    container.querySelectorAll('[data-change]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = parseInt(btn.dataset.id, 10);
        const chg = parseInt(btn.dataset.change, 10);
        const cur = items.find(i => i.id === id)?.qty || 1;
        window.YL.cart.updateQty(id, cur + chg);
        renderCart();
      });
    });

    // Remove buttons
    container.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.YL.cart.removeItem(parseInt(btn.dataset.remove, 10));
        renderCart();
      });
    });
  }

  renderCart();

  document.getElementById('clear-cart')?.addEventListener('click', () => {
    window.YL.cart.clearCart();
    renderCart();
  });
}

// ── Blog page ──────────────────────────────────────────────────────────────
function initBlog() {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  const posts = [
    { title: 'چطور بفهمیم لنت ترمز خودرو باید عوض شود؟', date: '۱۴۰۳/۰۴/۱۰', cat: 'نگهداری', img: 'pics/لنت ترمز جلو پراید.jpg', excerpt: 'لنت ترمز یکی از اجزای حیاتی ایمنی خودرو است. در این مقاله نشانه‌های فرسودگی لنت را بررسی می‌کنیم.' },
    { title: 'راهنمای تعویض واترپمپ در خانه', date: '۱۴۰۳/۰۳/۲۵', cat: 'آموزش', img: 'pics/واترپمپ سمند EF7.jpg', excerpt: 'با چند ابزار ساده می‌توانید واترپمپ خودرو را در خانه تعویض کنید. مراحل را به ترتیب دنبال کنید.' },
    { title: 'تفاوت کلاچ اصل و غیراصل را بشناسید', date: '۱۴۰۳/۰۳/۱۵', cat: 'راهنمای خرید', img: 'pics/دیسک و صفحه کلاچ پژو ۲۰۶.jpg', excerpt: 'خرید کلاچ غیراصل می‌تواند هزینه‌های بیشتری به شما تحمیل کند. این مقاله به شما کمک می‌کند.' },
    { title: 'چرا رادیاتور خودرو بالا می‌آورد؟', date: '۱۴۰۳/۰۲/۳۰', cat: 'عیب‌یابی', img: 'pics/رادیاتور آب تیبا.jpg', excerpt: 'گرمای بیش از حد موتور دلایل مختلفی دارد. از رادیاتور گرفته تا ترموستات را بررسی می‌کنیم.' },
    { title: 'علائم خرابی کمک‌فنر چیست؟', date: '۱۴۰۳/۰۲/۱۵', cat: 'نگهداری', img: 'pics/کمک‌فنر جلو پژو پارس.jpg', excerpt: 'کمک‌فنر فرسوده نه تنها راحتی رانندگی را کم می‌کند، بلکه ایمنی خودرو را هم به خطر می‌اندازد.' },
    { title: 'هر چند کیلومتر باید روغن موتور عوض کنیم؟', date: '۱۴۰۳/۰۱/۲۰', cat: 'آموزش', img: 'pics/فیلتر روغن (تمام مدل).jpg', excerpt: 'فاصله تعویض روغن به نوع روغن، خودرو و شرایط رانندگی بستگی دارد. همه چیز را اینجا بخوانید.' },
  ];

  grid.innerHTML = posts.map(p => `
    <article class="blog-card reveal">
      <div class="blog-card-img">
        <img src="${p.img}" alt="${p.title}" loading="lazy">
        <span class="blog-cat">${p.cat}</span>
      </div>
      <div class="blog-card-body">
        <div class="blog-date">${p.date}</div>
        <h3 class="blog-title">${p.title}</h3>
        <p class="blog-excerpt">${p.excerpt}</p>
        <a href="#" class="btn btn-ghost">ادامه مطلب ←</a>
      </div>
    </article>
  `).join('');

  window.YL?.initReveal?.();
}

// ── Mobile menu ────────────────────────────────────────────────────────────
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.classList.toggle('active');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('open');
      toggle.classList.remove('active');
    }
  });
}

// ── Search suggestions ─────────────────────────────────────────────────────
function initSearchSuggest() {
  const input = document.getElementById('nav-search');
  const drop  = document.getElementById('search-dropdown');
  if (!input || !drop || !window.PRODUCTS) return;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (q.length < 2) { drop.classList.remove('open'); return; }
    const matches = window.PRODUCTS.filter(p =>
      p.name.includes(q) || p.code.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 5);
    if (!matches.length) { drop.classList.remove('open'); return; }
    drop.innerHTML = matches.map(p => `
      <a href="product.html?id=${p.id}" class="search-suggest-item">
        <img src="${p.image}" alt="${p.name}">
        <div>
          <div class="suggest-name">${p.name}</div>
          <div class="suggest-price">${formatPrice(p.price)}</div>
        </div>
      </a>
    `).join('');
    drop.classList.add('open');
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !drop.contains(e.target)) {
      drop.classList.remove('open');
    }
  });
}

// ── Category filter tabs (reusable) ───────────────────────────────────────
function initCategoryTabs(tabsId, gridId, allProducts = true) {
  const tabs = document.getElementById(tabsId);
  const grid = document.getElementById(gridId);
  if (!tabs || !grid || !window.PRODUCTS) return;

  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab-cat]');
    if (!btn) return;
    tabs.querySelectorAll('[data-tab-cat]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.tabCat;
    let results = allProducts ? window.PRODUCTS : window.PRODUCTS.filter(p => p.badge && p.badge !== 'ناموجود');
    if (cat !== 'all') results = results.filter(p => p.category === cat);
    grid.innerHTML = results.slice(0, 8).map(renderProductCard).join('');
    window.YL?.initCardTilt?.();
    window.YL?.initReveal?.();
  });
}

// ── Category SVG icons ─────────────────────────────────────────────────────
function getCatSVG(icon) {
  const icons = {
    brake:    `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="26"/><circle cx="32" cy="32" r="12"/><line x1="32" y1="6" x2="32" y2="20"/><line x1="32" y1="44" x2="32" y2="58"/><line x1="6" y1="32" x2="20" y2="32"/><line x1="44" y1="32" x2="58" y2="32"/></svg>`,
    susp:     `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="32" y1="4" x2="32" y2="20"/><rect x="24" y="20" width="16" height="8" rx="2"/><path d="M32 28 Q24 36 32 44 Q40 36 32 28"/><rect x="24" y="44" width="16" height="8" rx="2"/><line x1="32" y1="52" x2="32" y2="60"/><circle cx="32" cy="60" r="4"/></svg>`,
    engine:   `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="20" width="40" height="28" rx="4"/><rect x="20" y="12" width="8" height="8" rx="1"/><rect x="36" y="12" width="8" height="8" rx="1"/><line x1="4" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="60" y2="32"/><circle cx="24" cy="34" r="5"/><circle cx="40" cy="34" r="5"/></svg>`,
    cooling:  `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="8" y="12" width="48" height="40" rx="4"/><line x1="20" y1="12" x2="20" y2="52"/><line x1="32" y1="12" x2="32" y2="52"/><line x1="44" y1="12" x2="44" y2="52"/><line x1="8" y1="24" x2="56" y2="24"/><line x1="8" y1="40" x2="56" y2="40"/></svg>`,
    electric: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="20" width="48" height="28" rx="4"/><rect x="20" y="12" width="8" height="8" rx="1"/><rect x="36" y="12" width="8" height="8" rx="1"/><path d="M28 30 l-4 8 h8 l-4 8" stroke-width="2.5"/></svg>`,
    filter:   `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 16 h48 l-18 20 v16 l-12-6 V36 Z"/></svg>`,
    trans:    `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="20" cy="20" r="10"/><circle cx="44" cy="44" r="10"/><path d="M28 22 Q44 22 44 34"/><circle cx="20" cy="20" r="4" fill="currentColor" stroke="none"/><circle cx="44" cy="44" r="4" fill="currentColor" stroke="none"/></svg>`,
    body:     `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 40 Q4 28 20 24 L30 14 h16 l10 10 h4 v16 H4 Z"/><circle cx="16" cy="46" r="6"/><circle cx="48" cy="46" r="6"/></svg>`,
  };
  return icons[icon] || icons.engine;
}
