# BT — Garimpos do Gu

Mini loja de catálogo de produtos com painel administrativo seguro.

---

## 📁 Estrutura de Pastas

```
BT/
├── index.html          ← Página principal da loja (pública)
├── pages/
│   └── admin.html      ← Painel administrativo (protegido)
├── css/
│   ├── style.css       ← Estilos da loja principal
│   └── admin.css       ← Estilos do painel admin
├── js/
│   ├── storage.js      ← Utilitários de localStorage (carregue PRIMEIRO)
│   ├── theme.js        ← Modo claro/escuro
│   ├── carousel.js     ← Carrossel de promoções
│   ├── products.js     ← Lógica dos produtos (grid, modal, favoritos)
│   ├── main.js         ← Inicialização da página principal
│   └── admin.js        ← Lógica completa do painel admin
└── README.md
```

---

## 🚀 Como usar

1. Abra `index.html` no navegador para ver a loja.
2. Acesse `pages/admin.html` para o painel administrativo.

### Login padrão do admin:
- **Email:** `admin@bt.com`
- **Senha:** `admin123`

⚠️ **IMPORTANTE:** Troque a senha assim que fizer o primeiro login!

---

## ✅ Funcionalidades

### Loja (público)
- Catálogo de produtos sem necessidade de login
- Busca em tempo real
- Filtro por categorias
- Ordenação por preço / relevância / mais novos
- Favoritos (salvo no navegador)
- Modal com múltiplas imagens e vídeo do YouTube
- Modo claro/escuro corrigido (funciona corretamente em ambos)
- Carrossel de promoções

### Painel Admin (protegido)
- Login por email + senha (apenas emails autorizados entram)
- Admin master pode criar e remover outros admins
- Cadastrar produtos com até 5 imagens + vídeo do YouTube
- Gerenciar promoções do carrossel
- Alterar própria senha

---

## 🔥 Próximo passo — Firebase

Para mais segurança e dados na nuvem, o próximo passo é integrar Firebase:
1. Criar projeto em https://console.firebase.google.com
2. Ativar Authentication (Email/Password)
3. Ativar Firestore Database
4. Substituir o `storage.js` por chamadas ao Firestore

---

## 🛠️ Hospedar no Netlify

1. Arraste a pasta `BT/` para https://app.netlify.com/drop
2. Seu site estará no ar em segundos!
