/* =========================================
   BT — main.js
   Inicialização e eventos da página principal
   ========================================= */

window.addEventListener('DOMContentLoaded', () => {
  renderProducts();

  // BUSCA
  const searchInput = document.getElementById('search');
  let searchTimer;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentSearch = searchInput.value;
      currentPage = 1;
      renderProducts();
    }, 300);
  });

  // CATEGORIAS
  document.getElementById('category-list')?.addEventListener('click', e => {
    const item = e.target.closest('.cat-item');
    if (!item) return;
    document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');
    currentCat = item.dataset.cat;
    currentPage = 1;
    document.getElementById('section-title').textContent =
      currentCat === 'Todos' ? 'Todos os Produtos' : currentCat;
    renderProducts();
  });

  // ORDENAÇÃO
  document.getElementById('sort')?.addEventListener('change', e => {
    currentSort = e.target.value;
    renderProducts();
  });

  // FAVORITOS
  document.getElementById('favorites-filter')?.addEventListener('click', function () {
    showFavoritesOnly = !showFavoritesOnly;
    this.classList.toggle('active', showFavoritesOnly);
    currentPage = 1;
    renderProducts();
  });

  // MODAL — fechar
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});
