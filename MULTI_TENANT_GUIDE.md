# Guia de Migração Multi-Tenant - ImobiFlow

## 📋 Visão Geral

Este documento descreve a implementação do sistema multi-tenant no ImobiFlow, permitindo que múltiplos clientes compartilhem a mesma infraestrutura enquanto mantêm seus dados isolados.

## 🏗️ Arquitetura Multi-Tenant

### Estratégia de Isolamento

Utilizamos **Row-Level Isolation** com `tenant_id`:
- Cada registro nas tabelas possui um `tenant_id`
- Isolamento no nível da aplicação (via middleware)
- Banco de dados compartilhado
- Vantagens: Custo reduzido, fácil manutenção, escalabilidade

### Estrutura do Schema

#### Tabela Principal: `tenants`

```prisma
model Tenant {
  id                  String        @id @default(uuid())
  nome                String
  slug                String        @unique
  subdominio          String?       @unique
  email               String
  plano               PlanoTenant   @default(BASICO)
  status              StatusTenant  @default(TRIAL)

  // Limites por plano
  limite_usuarios     Int           @default(3)
  limite_imoveis      Int           @default(100)
  total_usuarios      Int           @default(0)
  total_imoveis       Int           @default(0)
}
```

#### Planos Disponíveis

| Plano | Usuários | Imóveis | Storage | Preço/mês |
|-------|----------|---------|---------|-----------|
| BASICO | 3 | 100 | 1GB | R$ 99 |
| PRO | 10 | 500 | 5GB | R$ 299 |
| ENTERPRISE | Ilimitado | Ilimitado | 50GB | R$ 799 |
| CUSTOM | Customizado | Customizado | Customizado | Sob consulta |

## 🔄 Mudanças no Schema

### Tabelas Modificadas

Todas as tabelas principais agora possuem `tenant_id`:

```prisma
model User {
  tenant_id     String
  tenant        Tenant    @relation(...)
  // ... outros campos

  @@unique([tenant_id, email])
  @@index([tenant_id])
}

model Lead {
  tenant_id     String
  tenant        Tenant    @relation(...)
  // ... outros campos

  @@index([tenant_id])
}

// E assim por diante para:
// - Corretor
// - Proprietario
// - Imovel
// - Negociacao
// - Integracao
// - Automacao
```

### Nova Tabela: `assinaturas`

```prisma
model Assinatura {
  id                  String            @id
  tenant_id           String
  plano               PlanoTenant
  valor_mensal        Decimal
  status              StatusAssinatura
  inicio              DateTime
  proxima_cobranca    DateTime?
}
```

## 🚀 Aplicando a Migration

### 1. Backup do Banco de Dados

```bash
# PostgreSQL
pg_dump -U postgres imobiflow > backup_antes_multi_tenant.sql
```

### 2. Executar a Migration

```bash
cd apps/api

# Gerar Prisma Client
npx prisma generate

# Aplicar migration
npx prisma migrate deploy
```

### 3. Verificar a Migration

```bash
# Verificar que o tenant default foi criado
psql -U postgres -d imobiflow -c "SELECT * FROM tenants WHERE slug = 'default';"

# Verificar que os dados existentes foram migrados
psql -U postgres -d imobiflow -c "SELECT COUNT(*) FROM users WHERE tenant_id = 'default-tenant-id';"
```

## 🔐 Middleware de Isolamento

### Como Funciona

O middleware `tenantMiddleware` identifica o tenant de 3 formas:

1. **Header HTTP** (prioridade 1)
```typescript
X-Tenant-ID: tenant-uuid-here
```

2. **Subdomínio** (prioridade 2)
```
cliente.imobiflow.com → tenant com subdominio='cliente'
```

3. **Query Parameter** (prioridade 3, apenas para testes)
```
?tenant=cliente-slug
```

### Uso no Código

```typescript
// Aplicar em rotas específicas
server.get('/api/v1/leads', {
  preHandler: [authMiddleware, tenantMiddleware]
}, handler)

// Acessar tenant no handler
async function handler(request: FastifyRequest, reply: FastifyReply) {
  const tenantId = request.tenantId
  // Usar tenantId nas queries...
}
```

## 📝 Atualizando Repositories

### Antes (Single-Tenant)

```typescript
async findAll() {
  return this.prisma.lead.findMany()
}
```

### Depois (Multi-Tenant)

```typescript
async findAll(tenantId: string) {
  return this.prisma.lead.findMany({
    where: { tenant_id: tenantId }
  })
}
```

### Pattern para Queries

```typescript
// ✅ CORRETO - Sempre filtrar por tenant_id
await prisma.lead.findMany({
  where: {
    tenant_id: tenantId,
    status: 'ATIVO'
  }
})

// ❌ ERRADO - Sem filtro de tenant
await prisma.lead.findMany({
  where: { status: 'ATIVO' }
})
```

## 🎯 API Endpoints - Tenants

### Criar Tenant (Signup)

```http
POST /api/v1/tenants
Content-Type: application/json

{
  "nome": "Imobiliária ABC",
  "slug": "imobiliaria-abc",
  "email": "contato@abc.com",
  "telefone": "(11) 99999-9999",
  "plano": "BASICO"
}
```

### Buscar Tenant Atual

```http
GET /api/v1/tenants/current
Authorization: Bearer {token}
X-Tenant-ID: {tenant-id}
```

### Atualizar Tenant

```http
PUT /api/v1/tenants/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "plano": "PRO",
  "logo_url": "https://...",
  "cores_tema": {
    "primary": "#007bff",
    "secondary": "#6c757d"
  }
}
```

## 🔍 Verificando Limites

### No Service

```typescript
import { TenantService } from './modules/tenants/tenant.service'

// Antes de criar um novo usuário
await tenantService.checkLimits(tenantId, 'usuarios')

// Antes de criar um novo imóvel
await tenantService.checkLimits(tenantId, 'imoveis')
```

### Incrementar Contadores

```typescript
// Ao criar usuário
await tenantRepository.incrementUsuarios(tenantId)

// Ao deletar usuário
await tenantRepository.decrementUsuarios(tenantId)

// Ao criar imóvel
await tenantRepository.incrementImoveis(tenantId)

// Ao deletar imóvel
await tenantRepository.decrementImoveis(tenantId)
```

## 🧪 Testando Multi-Tenancy

### 1. Criar Tenant de Teste

```bash
curl -X POST http://localhost:3333/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste Tenant",
    "slug": "teste",
    "email": "teste@teste.com",
    "plano": "BASICO"
  }'
```

### 2. Criar Usuário no Tenant

```typescript
// No AuthService, modificar o register para aceitar tenant_id
await prisma.user.create({
  data: {
    tenant_id: tenantId,
    nome: "Usuario Teste",
    email: "usuario@teste.com",
    // ...
  }
})
```

### 3. Testar Isolamento

```bash
# Criar lead no Tenant A
curl -X POST http://localhost:3333/api/v1/leads \
  -H "Authorization: Bearer {token-tenant-a}" \
  -H "X-Tenant-ID: {tenant-a-id}" \
  -d '{"nome": "Lead do Tenant A"}'

# Tentar buscar no Tenant B (deve retornar vazio)
curl http://localhost:3333/api/v1/leads \
  -H "Authorization: Bearer {token-tenant-b}" \
  -H "X-Tenant-ID: {tenant-b-id}"
```

## 📊 Monitoramento

### Queries Úteis

```sql
-- Ver todos os tenants
SELECT id, nome, slug, plano, status, total_usuarios, total_imoveis
FROM tenants
ORDER BY created_at DESC;

-- Ver uso por tenant
SELECT
  t.nome,
  t.plano,
  t.total_usuarios,
  t.limite_usuarios,
  t.total_imoveis,
  t.limite_imoveis
FROM tenants t
WHERE t.status = 'ATIVO';

-- Ver tenants próximos do limite
SELECT
  nome,
  plano,
  total_usuarios,
  limite_usuarios,
  ROUND((total_usuarios::decimal / limite_usuarios) * 100, 2) as uso_usuarios_pct
FROM tenants
WHERE total_usuarios >= (limite_usuarios * 0.8)
  AND status = 'ATIVO';
```

## 🚨 Problemas Comuns

### Erro: "Tenant não encontrado"

**Causa:** Middleware não está sendo aplicado ou tenant_id não está sendo passado

**Solução:**
```typescript
// Verificar se o middleware está registrado
server.get('/api/v1/leads', {
  preHandler: [authMiddleware, tenantMiddleware]
}, handler)
```

### Erro: "Limite atingido"

**Causa:** Tenant atingiu o limite do plano

**Solução:**
```typescript
// Fazer upgrade do plano
await tenantService.update(tenantId, {
  plano: 'PRO'
})
```

### Dados Vazando Entre Tenants

**Causa:** Query sem filtro de tenant_id

**Solução:**
```typescript
// ✅ Sempre incluir tenant_id
await prisma.lead.findMany({
  where: {
    tenant_id: tenantId
  }
})
```

## 📚 Próximos Passos

- [ ] Implementar página de cadastro (signup)
- [ ] Implementar sistema de pagamentos
- [ ] Criar dashboard administrativo
- [ ] Implementar webhooks de pagamento
- [ ] Adicionar telemetria e analytics
- [ ] Criar testes automatizados de isolamento
- [ ] Documentar API com Swagger/OpenAPI

## 📞 Suporte

Para dúvidas ou problemas:
- GitHub Issues: https://github.com/Integrius/imobiflow-saas/issues
- Email: suporte@imobiflow.com

---

Última atualização: 03/12/2025
Versão: 2.0.0-multi-tenant
