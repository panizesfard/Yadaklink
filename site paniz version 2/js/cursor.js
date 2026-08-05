(() => {
  // Skip on touch devices
  if ('ontouchstart' in window) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.id  = 'cursor-dot';
  ring.id = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let tx = -100, ty = -100; // target (mouse)
  let cx = -100, cy = -100; // current ring (lerp)
  let visible = false;

  document.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!visible) {
      cx = tx; cy = ty;
      visible = true;
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    }
    dot.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  // Hover state on interactive elements
  const HOVER_SEL = 'a, button, [role="button"], input, select, textarea, label, .product-card, .cat-card, .nav-link';

  function onHoverIn()  { ring.classList.add('cursor-hover'); }
  function onHoverOut() { ring.classList.remove('cursor-hover'); }

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(HOVER_SEL)) onHoverIn();
    else onHoverOut();
  });

  // Click ripple
  document.addEventListener('mousedown', () => ring.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => ring.classList.remove('cursor-click'));

  // Lerp animation loop
  function loop() {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    ring.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();
})();
