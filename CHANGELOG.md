# Changelog - ImobiFlow

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2.0.0] - 2025-12-03

### ✨ Adicionado

#### 🏢 Sistema Multi-Tenant
- **Tabela Tenants**: Nova tabela principal para gerenciamento de clientes
  - Suporte a subdomínios personalizados (`cliente.imobiflow.com`)
  - Sistema de slugs únicos
  - Campos de configuração (logo, cores, configurações customizadas)
  - Controle de limites por plano

#### 📊 Sistema de Planos e Assinaturas
- **4 Planos Disponíveis**:
  - **BASICO**: 3 usuários, 100 imóveis, 1GB storage - R$ 99/mês
  - **PRO**: 10 usuários, 500 imóveis, 5GB storage - R$ 299/mês
  - **ENTERPRISE**: Ilimitado - R$ 799/mês
  - **CUSTOM**: Customizado - Sob consulta

- **Tabela Assinaturas**:
  - Controle de periodicidade (mensal, trimestral, semestral, anual)
  - Status de assinatura (pendente, ativa, cancelada, suspensa, vencida)
  - Integração com gateways de pagamento (preparado)
  - Histórico de mudanças

#### 🔐 Middleware de Isolamento
- **Identificação de Tenant** via:
  1. Header `X-Tenant-ID`
  2. Subdomínio (ex: `cliente.imobiflow.com`)
  3. Query param `?tenant=slug` (para testes)

- **Validações Automáticas**:
  - Verificação de existência do tenant
  - Verificação de status (ativo/inativo)
  - Verificação de limites do plano

#### 🗄️ Schema Database
- Adicionado `tenant_id` em todas as tabelas:
  - `users`
  - `corretores`
  - `leads`
  - `proprietarios`
  - `imoveis`
  - `negociacoes`
  - `integracoes`
  - `automacoes`

- **Índices Compostos** para performance:
  - `(tenant_id, email)` em users
  - `(tenant_id, creci)` em corretores
  - `(tenant_id, cpf_cnpj)` em proprietarios
  - `(tenant_id, codigo)` em imoveis e negociacoes

#### 🎯 API Endpoints - Tenants
```
POST   /api/v1/tenants              - Criar tenant (signup)
GET    /api/v1/tenants/:id          - Buscar por ID
GET    /api/v1/tenants/slug/:slug   - Buscar por slug
PUT    /api/v1/tenants/:id          - Atualizar tenant
GET    /api/v1/tenants              - Listar tenants
GET    /api/v1/tenants/current      - Tenant atual (do request)
```

#### 📝 Documentação
- **MULTI_TENANT_GUIDE.md**: Guia completo de implementação
  - Arquitetura e estratégia
  - Como aplicar migrations
  - Padrões de código
  - Troubleshooting
  - Queries úteis

### 🔄 Modificado

#### Schema Prisma
- `User.email`: De `@unique` para `@@unique([tenant_id, email])`
- `Corretor.creci`: De `@unique` para `@@unique([tenant_id, creci])`
- `Proprietario.cpf_cnpj`: De `@unique` para `@@unique([tenant_id, cpf_cnpj])`
- `Imovel.codigo`: De `@unique` para `@@unique([tenant_id, codigo])`
- `Negociacao.codigo`: De `@unique` para `@@unique([tenant_id, codigo])`
- `Integracao.portal`: De `@unique` para `@@unique([tenant_id, portal])`

#### Middleware
- `authMiddleware`: Mantido para autenticação
- `tenantMiddleware`: Novo middleware para isolamento

### 🗃️ Migration

**Arquivo**: `20251203110803_add_multi_tenant_support/migration.sql`

A migration inclui:
1. Criação da tabela `tenants`
2. Criação da tabela `assinaturas`
3. Adição de `tenant_id` em todas as tabelas
4. Criação de tenant padrão (`default-tenant-id`)
5. Migração de dados existentes para o tenant padrão
6. Criação de índices e constraints
7. Atualização de índices únicos compostos

### 📂 Novos Arquivos

```
apps/api/src/
├── modules/
│   └── tenants/
│       ├── tenant.schema.ts       - Validações Zod
│       ├── tenant.repository.ts   - Acesso ao banco
│       ├── tenant.service.ts      - Lógica de negócio
│       ├── tenant.controller.ts   - Handlers HTTP
│       └── tenant.routes.ts       - Definição de rotas
│
└── shared/
    └── middlewares/
        └── tenant.middleware.ts   - Middleware de isolamento

prisma/
└── migrations/
    └── 20251203110803_add_multi_tenant_support/
        └── migration.sql

MULTI_TENANT_GUIDE.md              - Documentação completa
CHANGELOG.md                       - Este arquivo
```

### ⚠️ Breaking Changes

1. **Todas as queries devem incluir `tenant_id`**
   ```typescript
   // ❌ Antes
   await prisma.lead.findMany()

   // ✅ Agora
   await prisma.lead.findMany({
     where: { tenant_id: tenantId }
   })
   ```

2. **Repositories devem aceitar `tenantId` como parâmetro**
   ```typescript
   // ❌ Antes
   async findAll() { ... }

   // ✅ Agora
   async findAll(tenantId: string) { ... }
   ```

3. **Email não é mais único globalmente**
   - Mesmo email pode existir em múltiplos tenants
   - Unicidade é por `(tenant_id, email)`

### 🚀 Como Atualizar

1. **Backup do banco de dados**
   ```bash
   pg_dump -U postgres imobiflow > backup.sql
   ```

2. **Aplicar migration**
   ```bash
   cd apps/api
   npx prisma generate
   npx prisma migrate deploy
   ```

3. **Atualizar código dos repositories**
   - Adicionar parâmetro `tenantId` nos métodos
   - Adicionar filtro `tenant_id` nas queries

4. **Adicionar middleware nas rotas**
   ```typescript
   server.get('/api/v1/leads', {
     preHandler: [authMiddleware, tenantMiddleware]
   }, handler)
   ```

### 🔍 Verificação

```sql
-- Verificar tenant padrão criado
SELECT * FROM tenants WHERE slug = 'default';

-- Verificar dados migrados
SELECT COUNT(*) FROM users WHERE tenant_id = 'default-tenant-id';
SELECT COUNT(*) FROM leads WHERE tenant_id = 'default-tenant-id';
```

### 📊 Estatísticas

- **Tabelas Modificadas**: 8
- **Novos Índices**: 15
- **Novas Tabelas**: 2 (tenants, assinaturas)
- **Novos Enums**: 4
- **Linhas de Código Adicionadas**: ~1.500

---

## [1.0.0] - 2025-11-19

### ✨ Inicial

#### Autenticação
- Login com email/senha
- Login com Google OAuth
- JWT tokens
- Middleware de autenticação

#### Dashboard
- Dashboard básico com métricas
- Integração com frontend

#### Módulos Base
- Leads
- Corretores
- Proprietários
- Imóveis
- Negociações

### 🗄️ Database Schema
- PostgreSQL 16
- Prisma ORM
- 8 tabelas principais
- Relacionamentos definidos

---

**Formato baseado em [Keep a Changelog](https://keepachangelog.com/)**
