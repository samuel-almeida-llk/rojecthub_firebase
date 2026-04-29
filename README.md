# 🚀 ProjectHub — Gestão de Projetos

Sistema SaaS de gestão de projetos com Kanban, integração Firebase e deploy no GitHub Pages.

## 📁 Estrutura do Projeto

```
projecthub_firebase/
├── index.html                  # HTML semântico + imports
├── css/
│   ├── variables.css           # Custom properties (temas dark/light)
│   ├── base.css                # Reset, tipografia, animações
│   ├── components.css          # Botões, modais, toasts, forms
│   ├── layout.css              # Sidebar, topbar, grids
│   ├── auth.css                # Tela de login/registro
│   ├── kanban.css              # Board + drag & drop
│   ├── profile.css             # Avatar, perfil
│   └── responsive.css          # Media queries
├── js/
│   ├── app.js                  # Entry point (ES Module)
│   ├── config/
│   │   └── firebase.js         # Firebase config + init
│   ├── modules/
│   │   ├── auth.js             # Login, registro, Google OAuth
│   │   ├── theme.js            # Tema claro/escuro
│   │   ├── router.js           # Navegação entre páginas
│   │   ├── store.js            # Estado global + Firestore
│   │   ├── modal.js            # Controle de modais
│   │   └── profile.js          # Avatar, nome
│   ├── utils/
│   │   ├── helpers.js          # uid, formatDate, timeAgo...
│   │   ├── toast.js            # Notificações
│   │   └── sanitize.js         # Prevenção XSS
│   └── constants/
│       └── status.js           # Labels de status/prioridade
└── README.md
```

## ⚡ Stack

- **Frontend**: HTML5 + CSS3 + Vanilla JS (ES Modules)
- **Backend**: Firebase Auth + Firestore
- **Deploy**: GitHub Pages (zero build tools)

## 🔧 Como rodar localmente

1. Clone o repositório
2. Abra com **Live Server** no VS Code (ES Modules exigem servidor HTTP)
3. Ou publique no GitHub Pages

## ✨ Funcionalidades

- ✅ Autenticação (Email/Senha + Google OAuth)
- ✅ CRUD de Clientes e Projetos
- ✅ Kanban com Drag & Drop
- ✅ Subtarefas com progresso
- ✅ Calendário de entregas
- ✅ Busca global
- ✅ Tema claro/escuro
- ✅ Perfil com avatar
- ✅ Sync real-time + offline
- ✅ Sanitização XSS

## 👤 Autor

**Samuel Lucas de Almeida** — [@samuel-almeida-llk](https://github.com/samuel-almeida-llk)
