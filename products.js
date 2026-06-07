/* =========================================
   BT — products.js
   ========================================= */

const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let currentCat = 'Todos';
let currentSearch = '';
let currentSort = 'relevancia';
let showFavoritesOnly = false;

function getProducts() {
  return BT.get('produtos', []);
}

function getFavorites() {
  return BT.get('favoritos', []);
}

function toggleFavorite(idx) {
  const favs = getFavorites();
  const pos = favs.indexOf(idx);
  if (pos === -1) favs.push(idx);
  else favs.splice(pos, 1);
  BT.set('favoritos', favs);
}

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function openModal(produto) {
  const overlay = document.getElementById('modal-overlay');
  const gallery = document.getElementById('modal-gallery');
  const title = document.getElementById('modal-title');
  const desc = document.getElementById('modal-desc');
  const price = document.getElementById('modal-price');
  const cat = document.getElementById('modal-category');
  const cta = document.getElementById('modal-cta');
  const videoWrap = document.getElementById('modal-video-wrap');

  // Imagens
  const imgs = Array.isArray(produto.imagens) && produto.imagens.length > 0
    ? produto.imagens
    : (produto.imagem ? [produto.imagem] : []);
  gallery.innerHTML = imgs.length > 0
    ? imgs.map(src => `<img src="${src}" alt="${produto.nome}" loading="lazy" />`).join('')
    : `<div style="width:100%;height:200px;background:var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text3)">Sem imagem</div>`;

  title.textContent = produto.nome || '';
  desc.textContent = produto.descricao || '';
  price.textContent = produto.preco || '';
  cat.textContent = produto.categoria || '';
  cta.href = produto.link || '#';

  // Vídeo
  const embedUrl = getYoutubeEmbedUrl(produto.video);
  if (embedUrl) {
    videoWrap.innerHTML = `<iframe src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    videoWrap.classList.remove('hidden');
  } else {
    videoWrap.innerHTML = '';
    videoWrap.classList.add('hidden');
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function renderProducts() {
  const container = document.getElementById('products-grid');
  const emptyState = document.getElementById('empty-state');
  const countEl = document.getElementById('product-count');
  if (!container) return;

  let produtos = getProducts();
  const favs = getFavorites();

  // Filtros
  if (showFavoritesOnly) {
    produtos = produtos.filter((_, i) => favs.includes(i));
  }
  if (currentCat !== 'Todos') {
    produtos = produtos.filter(p => p.categoria === currentCat);
  }
  if (currentSearch.trim()) {
    const q = currentSearch.trim().toLowerCase();
    produtos = produtos.filter(p =>
      p.nome?.toLowerCase().includes(q) ||
      p.categoria?.toLowerCase().includes(q) ||
      p.descricao?.toLowerCase().includes(q)
    );
  }

  // Ordenação
  if (currentSort === 'preco-asc') {
    produtos.sort((a, b) => parseFloat((a.preco||'0').replace(/\D/g,'')) - parseFloat((b.preco||'0').replace(/\D/g,'')));
  } else if (currentSort === 'preco-desc') {
    produtos.sort((a, b) => parseFloat((b.preco||'0').replace(/\D/g,'')) - parseFloat((a.preco||'0').replace(/\D/g,'')));
  } else if (currentSort === 'novo') {
    produtos.reverse();
  }

  // Paginação
  const total = produtos.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  if (currentPage > totalPages) currentPage = 1;
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = produtos.slice(start, start + ITEMS_PER_PAGE);

  if (countEl) countEl.textContent = `${total} produto${total !== 1 ? 's' : ''}`;

  if (total === 0) {
    container.innerHTML = '';
    emptyState?.classList.remove('hidden');
  } else {
    emptyState?.classList.add('hidden');

    // Obtemos os índices globais pra favoritos
    const allProducts = getProducts();

    container.innerHTML = paginated.map(p => {
      const globalIdx = allProducts.indexOf(p);
      const isFav = favs.includes(globalIdx);
      const thumb = (Array.isArray(p.imagens) && p.imagens[0]) || p.imagem || '';
      return `
        <article class="product-card" data-idx="${globalIdx}">
          <img class="product-thumb" src="${thumb || 'https://via.placeholder.com/400x300?text=Sem+Imagem'}"
               alt="${p.nome}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=Erro'" />
          <div class="product-body">
            <div class="product-tag">${p.categoria || ''}</div>
            <h3 class="product-name">${p.nome}</h3>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span class="product-price">${p.preco || ''}</span>
              <button class="product-fav ${isFav ? 'active' : ''}" data-idx="${globalIdx}" title="Favoritar" onclick="event.stopPropagation()">
                ${isFav ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Clique no card → abre modal
    container.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.idx);
        const all = getProducts();
        if (all[idx]) openModal(all[idx]);
      });
    });

    // Clique no favorito
    container.querySelectorAll('.product-fav').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        toggleFavorite(idx);
        renderProducts();
      });
    });
  }

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const pag = document.getElementById('pagination');
  if (!pag) return;
  if (totalPages <= 1) { pag.innerHTML = ''; return; }

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  pag.innerHTML = html;
  pag.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      renderProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}
