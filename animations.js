(() => {
  // ── Scroll Reveal ──────────────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function initReveal() {
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

  // ── Animated Counters ──────────────────────────────────────────
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString('fa-IR') + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('fa-IR') + suffix;
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  function initCounters() {
    document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));
  }

  // ── Typewriter ─────────────────────────────────────────────────
  function typewriter(el, text, speed = 60, delay = 400) {
    el.textContent = '';
    let i = 0;
    setTimeout(() => {
      const interval = setInterval(() => {
        el.textContent += text[i];
        i++;
        if (i >= text.length) clearInterval(interval);
      }, speed);
    }, delay);
  }

  // ── Product Card 3D Tilt ───────────────────────────────────────
  function initCardTilt() {
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = `perspective(800px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ── Staggered list animation ───────────────────────────────────
  function initStagger() {
    document.querySelectorAll('.stagger-children').forEach(parent => {
      Array.from(parent.children).forEach((child, i) => {
        child.style.transitionDelay = `${i * 80}ms`;
        child.classList.add('reveal');
        revealObserver.observe(child);
      });
    });
  }

  // ── Nav scroll shadow ─────────────────────────────────────────
  function initNavScroll() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav-scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // ── Hero parallax (subtle) ────────────────────────────────────
  function initParallax() {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;
    window.addEventListener('scroll', () => {
      const y = window.scrollY * 0.3;
      heroBg.style.transform = `translateY(${y}px)`;
    }, { passive: true });
  }

  // ── Init on DOM ready ─────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initCounters();
    initStagger();
    initNavScroll();
    initParallax();
    // Card tilt init after any dynamic content is rendered
    setTimeout(initCardTilt, 300);
  });

  window.YL = window.YL || {};
  window.YL.typewriter    = typewriter;
  window.YL.initCardTilt  = initCardTilt;
  window.YL.initReveal    = initReveal;
})();
