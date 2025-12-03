# ImobiFlow Single-Tenant - Documentação de Referência

> **Versão:** v1.0.0-single-tenant
> **Branch:** `single-tenant-stable`
> **Data:** 03/12/2025
> **Status:** ✅ Funcional (Google OAuth implementado)

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
4. [Backend (API)](#backend-api)
5. [Frontend (Web)](#frontend-web)
6. [Autenticação](#autenticação)
7. [Deploy](#deploy)
8. [Como Usar Esta Versão](#como-usar-esta-versão)
9. [Próximas Implementações Necessárias](#próximas-implementações-necessárias)

---

## 🎯 Visão Geral

A versão **Single-Tenant** do ImobiFlow é uma aplicação completa de gestão imobiliária projetada para ser implantada como **uma instância dedicada por cliente**.

### Características Principais:
- ✅ Autenticação com email/senha
- ✅ Login com Google OAuth
- ✅ Dashboard básico com métricas
- ✅ Estrutura completa de dados (leads, corretores, imóveis, negociações)
- ⚠️ Funcionalidades CRUD ainda não testadas
- ⚠️ Interface de usuário básica

### Tecnologias:
- **Backend:** Node.js + Fastify + TypeScript
- **Frontend:** Next.js 14 (App Router) + React + TypeScript
- **Database:** PostgreSQL 16
- **ORM:** Prisma
- **Auth:** JWT + bcrypt + Google OAuth
- **Monorepo:** pnpm workspaces

---

## 🏗️ Arquitetura

```
imobiflow/
├── apps/
│   ├── api/          # Backend Fastify
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── leads/
│   │   │   │   ├── corretores/
│   │   │   │   ├── proprietarios/
│   │   │   │   ├── imoveis/
│   │   │   │   ├── negociacoes/
│   │   │   │   └── dashboard/
│   │   │   ├── shared/
│   │   │   │   ├── middlewares/
│   │   │   │   └── errors/
│   │   │   └── server.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── package.json
│   │
│   └── web/          # Frontend Next.js
│       ├── app/
│       │   ├── login/
│       │   ├── dashboard/
│       │   └── layout.tsx
│       ├── lib/
│       │   ├── api.ts
│       │   └── auth.ts
│       └── package.json
│
├── package.json       # Root workspace
├── pnpm-workspace.yaml
├── ARCHITECTURE.md
└── SINGLE_TENANT_REFERENCE.md (este arquivo)
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais:

#### 1. **users**
```sql
- id: UUID (PK)
- nome: String
- email: String (UNIQUE)
- senha_hash: String? (opcional para OAuth)
- google_id: String? (UNIQUE)
- tipo: UserType (ADMIN | GESTOR | CORRETOR)
- ativo: Boolean
- created_at, updated_at, ultimo_login
```

#### 2. **corretores**
```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- creci: String (UNIQUE)
- telefone: String
- foto_url: String?
- especializacoes: String[]
- meta_mensal, meta_anual: Decimal?
- comissao_padrao: Decimal
- performance_score: Int
- disponibilidade: Json?
```

#### 3. **leads**
```sql
- id: UUID (PK)
- nome: String
- email: String?
- telefone: String
- cpf: String?
- origem: OrigemLead (SITE|PORTAL|WHATSAPP|...)
- temperatura: Temperatura (QUENTE|MORNO|FRIO)
- score: Int
- interesse: Json
- observacoes: Text?
- timeline: Json[]
- corretor_id: UUID? (FK -> corretores)
```

#### 4. **proprietarios**
```sql
- id: UUID (PK)
- nome: String
- cpf_cnpj: String (UNIQUE)
- tipo_pessoa: TipoPessoa (FISICA|JURIDICA)
- email, telefone, telefone_secundario
- contato: Json?
- forma_pagamento: String
- percentual_comissao: Decimal
- banco: Json?
```

#### 5. **imoveis**
```sql
- id: UUID (PK)
- codigo: String (UNIQUE)
- tipo: TipoImovel (APARTAMENTO|CASA|TERRENO|...)
- categoria: CategoriaImovel (VENDA|LOCACAO|TEMPORADA)
- status: StatusImovel (DISPONIVEL|RESERVADO|VENDIDO|...)
- endereco: Json
- caracteristicas: Json
- titulo, descricao: String
- diferenciais: String[]
- fotos: String[]
- video_url, tour_360_url: String?
- documentos: String[]
- preco, condominio, iptu: Decimal
- ultima_validacao: DateTime?
- validado_por: String?
- proprietario_id: UUID (FK -> proprietarios)
```

#### 6. **negociacoes**
```sql
- id: UUID (PK)
- codigo: String (UNIQUE)
- lead_id: UUID (FK -> leads)
- imovel_id: UUID (FK -> imoveis)
- corretor_id: UUID (FK -> corretores)
- status: StatusNegociacao (CONTATO|VISITA_AGENDADA|...)
- valor_proposta, valor_aprovado: Decimal?
- condicoes: Json?
- comissoes: Json[]
- valor_comissao: Decimal?
- documentos: String[]
- contrato_url: String?
- timeline: Json[]
- data_proposta, data_contrato, data_fechamento: DateTime?
- motivo_perda: Text?
```

#### 7. **integracoes**
```sql
- id: UUID (PK)
- portal: PortalIntegracao (ZAP_IMOVEIS|VIVA_REAL|OLX|...)
- status: StatusIntegracao (ATIVO|INATIVO|ERRO|...)
- configuracao: Json
- ultima_sync, proxima_sync: DateTime?
- intervalo_sync: Int
- logs: Json[]
- total_sucesso, total_erro: Int
```

#### 8. **automacoes**
```sql
- id: UUID (PK)
- nome: String
- descricao: Text?
- trigger: String
- condicoes: Json[]
- acoes: Json[]
- ativo: Boolean
- execucoes: Json[]
- total_execucoes: Int
- ultima_execucao: DateTime?
```

### Relacionamentos:
```
User 1:1 Corretor
Corretor 1:N Leads
Corretor 1:N Negociacoes
Proprietario 1:N Imoveis
Lead 1:N Negociacoes
Imovel 1:N Negociacoes
```

---

## 🔧 Backend (API)

### Estrutura de Módulos:

Cada módulo segue o padrão:
```
modules/[nome]/
├── [nome].controller.ts   # Recebe requisições HTTP
├── [nome].service.ts      # Lógica de negócio
├── [nome].repository.ts   # Acesso ao banco
├── [nome].routes.ts       # Definição de rotas
└── [nome].schema.ts       # Validação Zod
```

### Módulos Implementados:

#### ✅ auth
- **Rotas:**
  - `POST /api/v1/auth/register` - Cadastro de usuário
  - `POST /api/v1/auth/login` - Login com email/senha
  - `POST /api/v1/auth/google` - Login com Google OAuth
  - `GET /api/v1/auth/me` - Dados do usuário autenticado (protegida)

- **Arquivos:**
  - `auth.controller.ts` - Controllers de autenticação
  - `auth.service.ts` - Lógica (bcrypt, JWT, Google token validation)
  - `auth.repository.ts` - Queries de usuários
  - `auth.routes.ts` - Registro de rotas
  - `auth.schema.ts` - Validações Zod

#### ⚠️ leads (Backend implementado, frontend não testado)
- **Rotas:**
  - `GET /api/v1/leads` - Listar leads
  - `POST /api/v1/leads` - Criar lead
  - `GET /api/v1/leads/:id` - Buscar lead
  - `PUT /api/v1/leads/:id` - Atualizar lead
  - `DELETE /api/v1/leads/:id` - Deletar lead

#### ⚠️ corretores (Backend implementado, frontend não testado)
- Mesma estrutura CRUD

#### ⚠️ proprietarios (Backend implementado, frontend não testado)
- Mesma estrutura CRUD

#### ⚠️ imoveis (Backend implementado, frontend não testado)
- Mesma estrutura CRUD

#### ⚠️ negociacoes (Backend implementado, frontend não testado)
- Mesma estrutura CRUD

#### ✅ dashboard
- **Rotas:**
  - `GET /api/v1/dashboard/overview` - Métricas gerais (leads, imóveis, negociações)

### Middleware:

#### authMiddleware
**Arquivo:** `src/shared/middlewares/auth.middleware.ts`

Valida JWT token e injeta `user` na request:
```typescript
interface TokenPayload {
  userId: string
}

// Extrai token do header Authorization
// Verifica com JWT_SECRET
// Busca usuário no banco
// Injeta request.user = { id, email, tipo }
```

### Variáveis de Ambiente:

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3333
NODE_ENV=production
```

---

## 🎨 Frontend (Web)

### Páginas Implementadas:

#### ✅ Login (`/login`)
**Arquivo:** `app/login/page.tsx`

- Formulário de login com email/senha
- Botão de login com Google OAuth
- Validação de erros
- Redirecionamento para `/dashboard` após login
- Salva token e user no `localStorage`

#### ✅ Dashboard (`/dashboard`)
**Arquivo:** `app/dashboard/page.tsx`

- Exibe nome do usuário logado
- Cards com métricas:
  - Total de leads (+ leads quentes)
  - Total de imóveis (+ disponíveis)
  - Total de negociações (+ fechadas + taxa de conversão)
- Botão de logout
- Protegido (redireciona para `/login` se não autenticado)

### Bibliotecas de Cliente:

#### api.ts
**Arquivo:** `lib/api.ts`

Cliente Axios configurado:
```typescript
- baseURL: process.env.NEXT_PUBLIC_API_URL
- Interceptor que injeta token JWT automaticamente
- Tratamento de erro 401 (redirect para login)
```

#### auth.ts
**Arquivo:** `lib/auth.ts`

Funções de autenticação:
```typescript
- login(data) - Login com email/senha
- logout() - Remove token e redireciona
- getToken() - Retorna token do localStorage
- getMe() - Busca dados do usuário (não usado atualmente)
```

### Google OAuth:

**Configuração:**
- **Provider:** `@react-oauth/google`
- **Client ID:** `101518980847-9n7uovmjc8g561vmqormir1931og01ue.apps.googleusercontent.com`
- **Wrapper:** `GoogleOAuthProvider` em `app/layout.tsx`
- **Componente:** `<GoogleLogin>` na página de login
- **Locale:** pt-BR
- **One-Tap:** Habilitado

**Fluxo:**
1. Usuário clica no botão do Google
2. Google retorna `credential` (ID token)
3. Frontend envia para `POST /api/v1/auth/google`
4. Backend valida token com Google API
5. Backend cria/vincula usuário e retorna JWT
6. Frontend salva no localStorage e redireciona

---

## 🔐 Autenticação

### Fluxo de Login (Email/Senha):

```
1. User submete email + senha
2. Frontend: POST /auth/login
3. Backend: Busca user por email
4. Backend: Valida senha com bcrypt.compare()
5. Backend: Gera JWT token
6. Backend: Retorna { user, token }
7. Frontend: Salva no localStorage
8. Frontend: Redireciona para /dashboard
```

### Fluxo de Login (Google):

```
1. User clica no botão Google
2. Google OAuth modal
3. Google retorna credential (ID token)
4. Frontend: POST /auth/google { credential }
5. Backend: Valida token com Google API
6. Backend: Extrai { sub, email, name }
7. Backend: Busca user por google_id
8. Backend: Se não existe, busca por email
9. Backend: Se ainda não existe, cria novo user
10. Backend: Gera JWT token
11. Backend: Retorna { user, token }
12. Frontend: Salva no localStorage
13. Frontend: Redireciona para /dashboard
```

### Proteção de Rotas:

**Backend:**
- Middleware `authMiddleware` protege rotas
- Extrai e valida JWT do header `Authorization: Bearer <token>`
- Injeta `request.user` para uso nos controllers

**Frontend:**
- `useEffect` no dashboard verifica `getToken()`
- Se não tem token, redireciona para `/login`
- Token enviado automaticamente via interceptor Axios

---

## 🚀 Deploy

### Arquitetura Atual:

```
Frontend (Vercel):
  - URL: https://imobiflow-frontend-e70z5j0iz-hans-dohmanns-projects.vercel.app
  - Auto-deploy do branch main (quando webhooks funcionam)
  - Deploy manual: cd apps/web && vercel --prod --yes

Backend (Render):
  - URL: https://imobiflow-saas.onrender.com
  - Auto-deploy desabilitado (webhooks não funcionam)
  - Deploy manual via dashboard do Render

Database (Render PostgreSQL):
  - Host: dpg-d4kgd33e5dus73f7b480-a.ohio-postgres.render.com
  - Database: imobiflow
  - User: imobiflow
  - Connection String: postgresql://imobiflow:TSDnj5HyoG41xF8hQCF56xkGxUSHqj8o@...
```

### Como Fazer Deploy:

#### Frontend (Vercel):
```bash
cd apps/web
vercel --prod --yes
```

#### Backend (Render):
1. Acesse https://dashboard.render.com/
2. Selecione o serviço "imobiflow-saas"
3. Clique em "Manual Deploy"
4. Selecione "Deploy latest commit"
5. Aguarde build completar (~3-5 minutos)

#### Database Migrations:
```bash
cd apps/api
DATABASE_URL="<connection-string>" npx prisma migrate deploy
```

### Variáveis de Ambiente:

#### Render (Backend):
```
DATABASE_URL=postgresql://imobiflow:...
JWT_SECRET=imobiflow-secret-key
JWT_EXPIRES_IN=7d
PORT=3333
```

#### Vercel (Frontend):
```
NEXT_PUBLIC_API_URL=https://imobiflow-saas.onrender.com/api/v1
```

---

## 📦 Como Usar Esta Versão

### Para Implantar para um Novo Cliente:

#### 1. Clone o código:
```bash
git clone https://github.com/Integrius/imobiflow-saas.git cliente-nome
cd cliente-nome
git checkout single-tenant-stable
```

#### 2. Configure o banco de dados:
```bash
# Crie um PostgreSQL dedicado
# Atualize .env com a connection string

cd apps/api
DATABASE_URL="<client-connection-string>" npx prisma migrate deploy
DATABASE_URL="<client-connection-string>" npx prisma generate
```

#### 3. Deploy Backend:
```bash
# Crie novo serviço no Render
# Configure variáveis de ambiente
# Deploy
cd apps/api
npm run build
npm start
```

#### 4. Deploy Frontend:
```bash
# Crie novo projeto no Vercel
# Configure NEXT_PUBLIC_API_URL
cd apps/web
vercel --prod
```

#### 5. Configure Google OAuth:
- Crie novo OAuth Client no Google Cloud Console
- Adicione domínio do cliente nas origens autorizadas
- Atualize `GOOGLE_CLIENT_ID` no frontend

---

## ⚠️ Próximas Implementações Necessárias

### Funcionalidades CRUD Não Testadas:

1. **Leads:**
   - Criar interface de cadastro
   - Testar listagem
   - Testar edição
   - Testar exclusão
   - Testar atribuição a corretor

2. **Corretores:**
   - Interface de cadastro
   - Upload de foto
   - Gestão de metas
   - Relatórios de performance

3. **Proprietários:**
   - Cadastro completo
   - Gestão de documentos
   - Histórico de transações

4. **Imóveis:**
   - **CRÍTICO:** Upload de fotos
   - Upload de documentos
   - Tour virtual 360
   - Validação de dados
   - Publicação em portais

5. **Negociações:**
   - Fluxo completo de venda
   - Gestão de documentos
   - Cálculo de comissões
   - Timeline de atividades

### Melhorias de UI/UX:

1. Navegação lateral/menu
2. Breadcrumbs
3. Filtros e buscas
4. Paginação
5. Loading states
6. Toast notifications
7. Confirmações de ações
8. Responsividade mobile
9. Dark mode
10. Accessibility (a11y)

### Segurança:

1. Rate limiting
2. CSRF protection
3. Input sanitization
4. SQL injection prevention (já tem via Prisma)
5. XSS protection
6. Logs de auditoria

### Performance:

1. Caching (Redis)
2. CDN para imagens
3. Lazy loading
4. Code splitting
5. Database indexes
6. Query optimization

---

## 📞 Suporte e Documentação

### Para Dúvidas:

1. Consulte este documento primeiro
2. Verifique o código no branch `single-tenant-stable`
3. Consulte ARCHITECTURE.md para decisões estratégicas

### Logs Importantes:

- **Build logs:** Render dashboard
- **Runtime logs:** Render dashboard → Logs tab
- **Database logs:** Render PostgreSQL dashboard
- **Frontend logs:** Vercel dashboard

---

## 📝 Changelog

### v1.0.0-single-tenant (03/12/2025)
- ✅ Implementado login com email/senha
- ✅ Implementado login com Google OAuth
- ✅ Dashboard básico com métricas
- ✅ Estrutura completa de dados
- ✅ Backend CRUD completo (não testado)
- ⚠️ Frontend CRUD não implementado

---

**Última atualização:** 03/12/2025
**Mantido por:** Hans Dohmann
**Versão do Documento:** 1.0
