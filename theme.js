(() => {
  const STORAGE_KEY = 'yadaklink-theme';
  const root = document.documentElement;

  function getStored() {
    return localStorage.getItem(STORAGE_KEY) || 'dark';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggleIcons(theme);
  }

  function updateToggleIcons(theme) {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const icon = btn.querySelector('.theme-icon');
      if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'حالت روشن' : 'حالت تاریک');
    });
  }

  function toggle() {
    const current = root.getAttribute('data-theme') || 'dark';
    apply(current === 'dark' ? 'light' : 'dark');
  }

  // Apply saved theme immediately (before DOM interactive to avoid flash)
  apply(getStored());

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggle);
    });
    updateToggleIcons(getStored());
  });

  window.YL = window.YL || {};
  window.YL.toggleTheme = toggle;
})();
