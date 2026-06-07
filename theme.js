/* =========================================
   BT — theme.js
   Gerencia modo claro/escuro
   ========================================= */

(function () {
  const saved = BT.get('theme', 'light');
  document.documentElement.setAttribute('data-theme', saved);
  document.body.setAttribute('data-theme', saved);

  window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('toggle-theme');
    if (!btn) return;

    const apply = (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      BT.set('theme', theme);
    };

    apply(saved);

    btn.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme') || 'light';
      apply(current === 'dark' ? 'light' : 'dark');
    });
  });
})();
