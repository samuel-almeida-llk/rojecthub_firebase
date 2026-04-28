<div align="center">

# 🚀 ProjectHub

### Sistema Completo de Gestão de Projetos

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-6c5ce7?style=for-the-badge)](LICENSE)

<br>

<img src="https://img.shields.io/badge/Status-Online-00b894?style=flat-square" alt="Status">
<img src="https://img.shields.io/badge/Versão-1.0.0-6c5ce7?style=flat-square" alt="Versão">
<img src="https://img.shields.io/badge/Custo-Gratuito-00b894?style=flat-square" alt="Custo">

<br><br>

> Sistema web de gestão de projetos com carteira de clientes, quadro Kanban, checklist de tarefas e calendário de entregas — tudo com autenticação segura e banco de dados em tempo real via Firebase.

<br>

</div>

---

## 📑 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Como Usar](#-como-usar)
- [Configuração do Firebase](#-configuração-do-firebase)
- [Deploy no GitHub Pages](#-deploy-no-github-pages)
- [Estrutura de Dados](#-estrutura-de-dados)
- [Autor](#-autor)

---

## 💡 Sobre o Projeto

O **ProjectHub** é um sistema de gestão de projetos leve, moderno e 100% gratuito, projetado para profissionais que precisam organizar sua **carteira de clientes** e **projetos** de forma visual e eficiente.

Desenvolvido como uma **Single Page Application (SPA)** em HTML puro com integração Firebase, o sistema roda diretamente no navegador sem necessidade de backend próprio, frameworks ou dependências complexas.

### Por que o ProjectHub?

| Problema | Solução |
|---|---|
| Ferramentas complexas demais | Interface limpa e intuitiva |
| Custos com servidores | 100% gratuito (Firebase Spark) |
| Dados perdidos entre dispositivos | Sincronização em tempo real na nuvem |
| Sem controle visual dos projetos | Quadro Kanban integrado |
| Falta de visão de prazos | Calendário de entregas |

---

## ✨ Funcionalidades

### 🔐 Autenticação
- Login com **e-mail e senha**
- Login com **Google** (um clique)
- **Cadastro** de novos usuários
- **Recuperação de senha** por e-mail
- Dados **isolados por usuário** (cada conta vê apenas seus dados)

### 📊 Dashboard
- Cards com **estatísticas em tempo real** (clientes, projetos, andamento, concluídos)
- Lista de **projetos recentes** com acesso rápido
- Feed de **atividade recente** (log automático de ações)

### 🏢 Carteira de Clientes
- Criação, edição e exclusão de clientes
- Campos: nome, segmento, contato, e-mail, observações
- **8 cores personalizáveis** para identificação visual
- **Barra de progresso** por cliente (% de projetos concluídos)
- Busca global por nome, segmento ou projeto

### 📁 Quadro Kanban
- **4 colunas**: Backlog → Em Andamento → Em Revisão → Concluído
- Alteração de status com **um clique**
- Cards com **prioridade** (alta/média/baixa), datas e progresso
- Botão de adição rápida por coluna

### ✅ Gestão de Tarefas
- **Checklist** dentro de cada projeto
- Barra de progresso automática
- Marcar como concluída / excluir tarefa

### 📅 Calendário
- Visão **mensal** com deadlines dos projetos
- Navegação entre meses
- Indicação visual do dia atual

### 🔄 Sincronização
- **Tempo real** via Firestore (alterações refletem instantaneamente)
- **Modo offline** com cache local como fallback
- Indicador visual de status de sincronização

---

## 🛠 Tecnologias

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura da aplicação |
| **CSS3** | Design responsivo, tema escuro, animações |
| **JavaScript (ES6+)** | Lógica da aplicação, SPA routing |
| **Firebase Auth** | Autenticação (e-mail/senha + Google) |
| **Cloud Firestore** | Banco de dados NoSQL em tempo real |
| **GitHub Pages** | Hospedagem gratuita |
| **Google Fonts (Inter)** | Tipografia moderna |

---

## 🏗 Arquitetura

```
ProjectHub (Single HTML File)
│
├── 🔐 Firebase Authentication
│   ├── E-mail / Senha
│   ├── Google OAuth
│   └── Recuperação de senha
│
├── 🗄️ Cloud Firestore
│   ├── /users/{uid}          → Perfil do usuário
│   └── /userData/{uid}       → Clientes, projetos, tarefas, atividades
│
├── 🎨 Frontend (HTML + CSS + JS)
│   ├── Tela de Login / Registro
│   ├── Dashboard
│   ├── Carteira de Clientes
│   ├── Quadro Kanban (por cliente)
│   ├── Visão de Todos os Projetos
│   └── Calendário de Entregas
│
└── 📴 Fallback Offline
    └── LocalStorage (cache)
```

### Modelo de Dados

```
Usuário (uid)
  └── clientes[]
       ├── id, nome, segmento, contato, email, cor, notas
       └── projetos[]
            ├── id, nome, descrição, status, prioridade
            ├── dataInício, dataEntrega, responsável
            └── tarefas[]
                 ├── texto
                 └── concluída (boolean)
```

---

## 🚀 Como Usar

### Pré-requisitos

- Navegador moderno (Chrome, Edge, Firefox)
- Conta no [Firebase](https://console.firebase.google.com/) (gratuita)

### Acesso Online

```
https://samuel-almeida-llk.github.io/projecthub/
```

### Acesso Local

1. Clone o repositório:
```bash
git clone https://github.com/samuel-almeida-llk/projecthub.git
cd projecthub
```

2. Abra com um servidor local (Live Server, http-server, etc.):
```bash
# Opção 1: VS Code + Live Server
# Botão direito no index.html → "Open with Live Server"

# Opção 2: Node.js
npx http-server -p 8080

# Opção 3: Python
python -m http.server 8080
```

> ⚠️ **Importante**: O Firebase não funciona com o protocolo `file://`. Sempre use `http://` ou `https://`.

---

## 🔥 Configuração do Firebase

### 1. Criar Projeto

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Registre um app Web e copie o `firebaseConfig`

### 2. Ativar Autenticação

1. Firebase Console → **Authentication** → **Sign-in method**
2. Ative **E-mail/senha** e **Google**

### 3. Criar Firestore

1. Firebase Console → **Firestore Database** → **Criar banco de dados**
2. Inicie em **modo de teste**
3. Região recomendada: `southamerica-east1`

### 4. Regras de Segurança

Substitua as regras do Firestore por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /userData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Autorizar Domínios

Em **Authentication → Settings → Domínios autorizados**, adicione:
- `localhost`
- `127.0.0.1`
- `seu-usuario.github.io`

---

## 📦 Deploy no GitHub Pages

1. Crie um repositório no GitHub
2. Suba o código:
```bash
git init
git add .
git commit -m "ProjectHub v1.0"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/projecthub.git
git push -u origin main
```
3. Em **Settings → Pages**, selecione branch `main` e pasta `/ (root)`
4. Aguarde o deploy e acesse `https://SEU_USUARIO.github.io/projecthub/`

---

## 📊 Limites do Plano Gratuito (Firebase Spark)

| Recurso | Limite |
|---|---|
| Autenticação | Ilimitada |
| Leituras Firestore | ~50.000/dia |
| Gravações Firestore | ~20.000/dia |
| Armazenamento | 1 GB |
| **Custo** | **R$ 0** |

> Mais do que suficiente para uso pessoal e pequenas equipes.

---

## 👤 Autor

<div align="center">

**Samuel Lucas de Almeida**

Especialista de Sucesso do Cliente | Lanlink Soluções

[![GitHub](https://img.shields.io/badge/GitHub-samuel--almeida--llk-181717?style=for-the-badge&logo=github)](https://github.com/samuel-almeida-llk)

</div>

---

<div align="center">

Feito com 💜 e ☕ em Fortaleza, CE

</div>
