/* =========================================
   BT — admin.js
   Painel administrativo completo
   ========================================= */

// ─── AUTH ───────────────────────────────────────────────────────────────────

function getAdmins() {
  return BT.get('admins_db', {
    // Admin master padrão — TROQUE a senha após o primeiro acesso!
    'admin@bt.com': { senha: 'admin123', master: true }
  });
}

function saveAdmins(db) {
  BT.set('admins_db', db);
}

function getCurrentUser() {
  return BT.get('current_admin', null);
}

function isMaster() {
  const user = getCurrentUser();
  if (!user) return false;
  const db = getAdmins();
  return db[user]?.master === true;
}

function login() {
  const email = document.getElementById('login-email')?.value.trim().toLowerCase();
  const senha = document.getElementById('login-password')?.value;
  const errEl = document.getElementById('login-error');

  if (!email || !senha) {
    errEl?.classList.remove('hidden');
    errEl.textContent = 'Preencha email e senha.';
    return;
  }

  const db = getAdmins();
  if (db[email] && db[email].senha === senha) {
    BT.set('current_admin', email);
    document.getElementById('login-screen')?.classList.add('hidden');
    document.getElementById('admin-panel')?.classList.remove('hidden');
    loadPanel();
    errEl?.classList.add('hidden');
  } else {
    errEl?.classList.remove('hidden');
    errEl.textContent = 'Email ou senha incorretos.';
    setTimeout(() => errEl?.classList.add('hidden'), 3000);
  }
}

function logout() {
  BT.remove('current_admin');
  document.getElementById('admin-panel')?.classList.add('hidden');
  document.getElementById('login-screen')?.classList.remove('hidden');
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
}

// ─── INIT ────────────────────────────────────────────────────────────────────

function loadPanel() {
  loadProdutos();
  loadPromos();
  loadAdmins();
}

window.addEventListener('DOMContentLoaded', () => {
  // Verifica se já está logado
  const user = getCurrentUser();
  if (user) {
    const db = getAdmins();
    if (db[user]) {
      document.getElementById('login-screen')?.classList.add('hidden');
      document.getElementById('admin-panel')?.classList.remove('hidden');
      loadPanel();
    }
  }

  // LOGIN
  document.getElementById('btn-login')?.addEventListener('click', login);
  document.getElementById('login-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') login();
  });

  // LOGOUT
  document.getElementById('btn-logout')?.addEventListener('click', logout);

  // TABS
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-tab').forEach(s => s.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab)?.classList.add('active');
    });
  });

  // IMAGENS — adicionar campo
  document.getElementById('add-image-btn')?.addEventListener('click', addImageField);

  // FORM PRODUTO
  document.getElementById('produto-form')?.addEventListener('submit', e => {
    e.preventDefault();
    salvarProduto();
  });

  // FORM PROMOÇÃO
  document.getElementById('promocao-form')?.addEventListener('submit', e => {
    e.preventDefault();
    adicionarPromocao();
  });
  document.getElementById('limpar-promo')?.addEventListener('click', () => {
    document.getElementById('promo-titulo').value = '';
    document.getElementById('promo-imagem').value = '';
    document.getElementById('promo-link').value = '';
  });

  // FORM ADMINS
  document.getElementById('admin-form')?.addEventListener('submit', e => {
    e.preventDefault();
    criarAdmin();
  });

  // FORM MUDAR SENHA
  document.getElementById('change-password-form')?.addEventListener('submit', e => {
    e.preventDefault();
    mudarSenha();
  });
});

// ─── IMAGENS ────────────────────────────────────────────────────────────────

function addImageField() {
  const container = document.getElementById('image-inputs');
  const inputs = container.querySelectorAll('.produto-imagem');
  if (inputs.length >= 5) { alert('Máximo de 5 imagens.'); return; }

  const row = document.createElement('div');
  row.className = 'image-input-row';
  row.innerHTML = `
    <input type="url" class="produto-imagem" placeholder="URL da imagem ${inputs.length + 1}" />
    <button type="button" class="btn-remove-img" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(row);
}

function getImagens() {
  return Array.from(document.querySelectorAll('.produto-imagem'))
    .map(el => el.value.trim())
    .filter(Boolean);
}

// ─── PRODUTOS ───────────────────────────────────────────────────────────────

function salvarProduto() {
  const editIdx = document.getElementById('produto-edit-index')?.value;
  const produto = {
    nome: document.getElementById('produto-nome').value.trim(),
    preco: document.getElementById('produto-preco').value.trim(),
    link: document.getElementById('produto-link').value.trim(),
    categoria: document.getElementById('produto-categoria').value,
    descricao: document.getElementById('produto-desc').value.trim(),
    imagens: getImagens(),
    video: document.getElementById('produto-video').value.trim(),
    destaque: document.getElementById('produto-destaque').checked,
    createdAt: Date.now()
  };

  if (!produto.nome || !produto.link || !produto.categoria) {
    alert('Preencha nome, link e categoria.');
    return;
  }

  const produtos = BT.get('produtos', []);

  if (editIdx !== '') {
    produtos[parseInt(editIdx)] = { ...produtos[parseInt(editIdx)], ...produto };
  } else {
    produtos.push(produto);
  }

  BT.set('produtos', produtos);
  limparFormProduto();
  loadProdutos();
}

function limparFormProduto() {
  document.getElementById('produto-edit-index').value = '';
  document.getElementById('produto-nome').value = '';
  document.getElementById('produto-preco').value = '';
  document.getElementById('produto-link').value = '';
  document.getElementById('produto-categoria').value = '';
  document.getElementById('produto-desc').value = '';
  document.getElementById('produto-video').value = '';
  document.getElementById('produto-destaque').checked = false;

  const imgContainer = document.getElementById('image-inputs');
  imgContainer.innerHTML = `
    <div class="image-input-row">
      <input type="url" class="produto-imagem" placeholder="URL da imagem 1 (principal)" />
      <button type="button" class="btn-add-img" id="add-image-btn">+ Adicionar imagem</button>
    </div>
  `;
  document.getElementById('add-image-btn')?.addEventListener('click', addImageField);

  document.getElementById('btn-save-produto').textContent = 'Salvar Produto';
}

function editarProduto(idx) {
  const produtos = BT.get('produtos', []);
  const p = produtos[idx];
  if (!p) return;

  document.getElementById('produto-edit-index').value = idx;
  document.getElementById('produto-nome').value = p.nome || '';
  document.getElementById('produto-preco').value = p.preco || '';
  document.getElementById('produto-link').value = p.link || '';
  document.getElementById('produto-categoria').value = p.categoria || '';
  document.getElementById('produto-desc').value = p.descricao || '';
  document.getElementById('produto-video').value = p.video || '';
  document.getElementById('produto-destaque').checked = p.destaque || false;

  const imgContainer = document.getElementById('image-inputs');
  const imgs = p.imagens || (p.imagem ? [p.imagem] : []);
  imgContainer.innerHTML = '';
  imgs.forEach((url, i) => {
    const row = document.createElement('div');
    row.className = 'image-input-row';
    row.innerHTML = i === 0
      ? `<input type="url" class="produto-imagem" placeholder="URL da imagem 1 (principal)" value="${url}" />
         <button type="button" class="btn-add-img" id="add-image-btn">+ Adicionar imagem</button>`
      : `<input type="url" class="produto-imagem" placeholder="URL da imagem ${i+1}" value="${url}" />
         <button type="button" class="btn-remove-img" onclick="this.parentElement.remove()">✕</button>`;
    imgContainer.appendChild(row);
  });
  if (imgs.length === 0) {
    imgContainer.innerHTML = `<div class="image-input-row">
      <input type="url" class="produto-imagem" placeholder="URL da imagem 1 (principal)" />
      <button type="button" class="btn-add-img" id="add-image-btn">+ Adicionar imagem</button>
    </div>`;
  }
  document.getElementById('add-image-btn')?.addEventListener('click', addImageField);

  document.getElementById('btn-save-produto').textContent = 'Atualizar Produto';

  // Ir para o topo do form
  document.getElementById('tab-produtos').scrollIntoView({ behavior: 'smooth' });
}

function excluirProduto(idx) {
  if (!confirm('Excluir este produto?')) return;
  const produtos = BT.get('produtos', []);
  produtos.splice(idx, 1);
  BT.set('produtos', produtos);
  loadProdutos();
}

function loadProdutos() {
  const produtos = BT.get('produtos', []);
  const list = document.getElementById('admin-product-list');
  const count = document.getElementById('produtos-count');
  if (!list) return;

  if (count) count.textContent = produtos.length;

  if (produtos.length === 0) {
    list.innerHTML = '<p style="color:#555;padding:16px 0">Nenhum produto cadastrado ainda.</p>';
    return;
  }

  list.innerHTML = produtos.map((p, i) => {
    const thumb = (Array.isArray(p.imagens) && p.imagens[0]) || p.imagem || '';
    return `
      <div class="admin-product-item">
        <img class="admin-product-thumb" src="${thumb || 'https://via.placeholder.com/56?text=?'}"
             alt="${p.nome}" onerror="this.src='https://via.placeholder.com/56?text=?'" />
        <div class="admin-product-info">
          <div class="admin-product-name">${p.nome}</div>
          <div class="admin-product-meta">${p.categoria} · ${p.preco || 'sem preço'}</div>
        </div>
        <div class="admin-product-actions">
          <button class="btn-edit" onclick="editarProduto(${i})">Editar</button>
          <button class="btn-delete" onclick="excluirProduto(${i})">Excluir</button>
        </div>
      </div>
    `;
  }).join('');
}

// ─── PROMOÇÕES ───────────────────────────────────────────────────────────────

function adicionarPromocao() {
  const titulo = document.getElementById('promo-titulo').value.trim();
  const imagem = document.getElementById('promo-imagem').value.trim();
  const link = document.getElementById('promo-link').value.trim();
  if (!titulo || !imagem) { alert('Preencha título e imagem.'); return; }

  const promos = BT.get('promocoes', []);
  promos.push({ titulo, imagem, link });
  BT.set('promocoes', promos);
  loadPromos();
  document.getElementById('promo-titulo').value = '';
  document.getElementById('promo-imagem').value = '';
  document.getElementById('promo-link').value = '';
}

function removerPromocao(idx) {
  if (!confirm('Remover promoção?')) return;
  const promos = BT.get('promocoes', []);
  promos.splice(idx, 1);
  BT.set('promocoes', promos);
  loadPromos();
}

function loadPromos() {
  const lista = document.getElementById('lista-promocoes');
  if (!lista) return;
  const promos = BT.get('promocoes', []);
  if (promos.length === 0) {
    lista.innerHTML = '<li style="justify-content:center;color:#555">Nenhuma promoção cadastrada.</li>';
    return;
  }
  lista.innerHTML = promos.map((p, i) => `
    <li>
      <div>
        <strong>${p.titulo}</strong>
        <br/><small style="color:#555">${p.link || 'sem link'}</small>
      </div>
      <div class="list-actions">
        <button class="btn-delete" onclick="removerPromocao(${i})">Remover</button>
      </div>
    </li>
  `).join('');
}

// ─── ADMINS ──────────────────────────────────────────────────────────────────

function criarAdmin() {
  if (!isMaster()) { alert('Apenas o admin master pode criar admins.'); return; }

  const email = document.getElementById('adm-email').value.trim().toLowerCase();
  const senha = document.getElementById('adm-senha').value;

  if (!email || !senha) { alert('Preencha email e senha.'); return; }
  if (senha.length < 6) { alert('Senha muito curta (mínimo 6 caracteres).'); return; }
  if (!/\S+@\S+\.\S+/.test(email)) { alert('Email inválido.'); return; }

  const db = getAdmins();
  if (db[email]) { alert('Esse email já é admin.'); return; }

  db[email] = { senha, master: false };
  saveAdmins(db);
  loadAdmins();

  document.getElementById('adm-email').value = '';
  document.getElementById('adm-senha').value = '';
}

function removerAdmin(email) {
  if (!isMaster()) { alert('Apenas o admin master pode remover admins.'); return; }
  const current = getCurrentUser();
  if (email === current) { alert('Você não pode remover a si mesmo.'); return; }
  if (!confirm(`Remover admin ${email}?`)) return;

  const db = getAdmins();
  delete db[email];
  saveAdmins(db);
  loadAdmins();
}

function loadAdmins() {
  const lista = document.getElementById('lista-admins');
  if (!lista) return;

  const db = getAdmins();
  const current = getCurrentUser();
  const entries = Object.entries(db);

  if (entries.length === 0) {
    lista.innerHTML = '<li style="justify-content:center;color:#555">Nenhum admin cadastrado.</li>';
    return;
  }

  lista.innerHTML = entries.map(([email, data]) => `
    <li>
      <span>${email} ${data.master ? '<span style="color:#f5c518;font-size:0.78rem">(master)</span>' : ''} ${email === current ? '<span style="color:#6effc0;font-size:0.78rem">(você)</span>' : ''}</span>
      ${isMaster() && !data.master ? `<div class="list-actions"><button class="btn-delete" onclick="removerAdmin('${email}')">Remover</button></div>` : ''}
    </li>
  `).join('');
}

function mudarSenha() {
  const nova = document.getElementById('nova-senha').value;
  const confirmar = document.getElementById('confirmar-senha').value;
  const msg = document.getElementById('senha-msg');

  if (nova.length < 6) { alert('Senha muito curta.'); return; }
  if (nova !== confirmar) { alert('As senhas não coincidem.'); return; }

  const current = getCurrentUser();
  const db = getAdmins();
  if (!db[current]) return;

  db[current].senha = nova;
  saveAdmins(db);

  msg?.classList.remove('hidden');
  msg.textContent = 'Senha alterada com sucesso!';
  setTimeout(() => msg?.classList.add('hidden'), 3000);

  document.getElementById('nova-senha').value = '';
  document.getElementById('confirmar-senha').value = '';
}
