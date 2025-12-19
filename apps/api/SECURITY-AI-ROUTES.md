# 🔒 Segurança Multi-Tenant - Rotas de IA

## ⚠️ CRÍTICO: Proteção contra vazamento de dados entre tenants

Este documento descreve as medidas de segurança implementadas nas rotas de IA para **garantir isolamento total entre tenants**.

## 🛡️ Camadas de Segurança Implementadas

### 1. Middlewares Obrigatórios

**Todas** as rotas de IA em `/api/v1/ai/*` passam por:

```typescript
server.addHook('onRequest', authMiddleware);
server.addHook('onRequest', tenantMiddleware);
```

#### `authMiddleware`
- Valida token JWT no header `Authorization: Bearer <token>`
- Verifica se usuário existe e está ativo
- Adiciona `request.user` com informações do usuário autenticado
- **Rejeita** requests sem token ou com token inválido (401)

#### `tenantMiddleware`
- Extrai `tenantId` de 3 fontes (em ordem de prioridade):
  1. Header `X-Tenant-ID`
  2. Subdomínio (ex: `cliente.imobiflow.com`)
  3. Query param `?tenant=slug` (apenas para testes)
- Valida se tenant existe no banco de dados
- Verifica status do tenant (ATIVO ou TRIAL)
- Adiciona `request.tenantId` (extraído de forma segura)
- **Rejeita** requests de tenants inativos ou inexistentes (403/404)

### 2. Validação em Nível de Rota

**TODAS** as rotas validam que os recursos pertencem ao tenant autenticado:

#### ✅ Exemplo Correto - `/process-message`
```typescript
const tenantId = request.tenantId; // ✅ Vem do middleware
const lead = await prisma.lead.findUnique({ where: { id: leadId } });

if (!lead || lead.tenant_id !== tenantId) {
  throw new Error('Lead não pertence ao tenant');
}
```

#### ❌ NUNCA fazer isso:
```typescript
const { tenantId } = request.body; // ❌ INSEGURO! Cliente pode mentir
const { tenantId } = request.query; // ❌ INSEGURO! Cliente pode mentir
```

### 3. Queries com Filtro de Tenant

**TODAS** as queries ao banco incluem filtro por `tenant_id`:

```typescript
// ✅ CORRETO
const messages = await prisma.message.findMany({
  where: {
    lead_id: leadId,
    tenant_id: tenantId  // SEMPRE inclui
  }
});

// ✅ CORRETO
const stats = await prisma.lead.count({
  where: {
    tenant_id: tenantId,  // SEMPRE inclui
    ai_enabled: true
  }
});
```

## 📋 Checklist de Segurança por Endpoint

### POST `/api/v1/ai/process-message`
- ✅ Middleware: `authMiddleware` + `tenantMiddleware`
- ✅ TenantId: Extraído de `request.tenantId`
- ✅ Validação: Verifica `lead.tenant_id !== tenantId`
- ✅ Query: Salva messages com `tenant_id`

### GET `/api/v1/ai/lead/:leadId/messages`
- ✅ Middleware: `authMiddleware` + `tenantMiddleware`
- ✅ TenantId: Extraído de `request.tenantId`
- ✅ Query: Filtra por `tenant_id` e `lead_id`

### GET `/api/v1/ai/lead/:leadId/conversation`
- ✅ Middleware: `authMiddleware` + `tenantMiddleware`
- ✅ TenantId: Extraído de `request.tenantId`
- ✅ Validação: Verifica `lead.tenant_id !== tenantId`
- ✅ Query: Includes validam tenant

### GET `/api/v1/ai/stats`
- ✅ Middleware: `authMiddleware` + `tenantMiddleware`
- ✅ TenantId: Extraído de `request.tenantId`
- ✅ Query: TODAS as aggregates filtram por `tenant_id`

### PATCH `/api/v1/ai/lead/:leadId/toggle`
- ✅ Middleware: `authMiddleware` + `tenantMiddleware`
- ✅ TenantId: Extraído de `request.tenantId`
- ✅ Validação: `findFirst` com `tenant_id` antes do update
- ✅ Proteção: Rejeita se lead não pertence ao tenant

### POST `/api/v1/ai/lead/:leadId/escalate`
- ✅ Middleware: `authMiddleware` + `tenantMiddleware`
- ✅ TenantId: Extraído de `request.tenantId`
- ✅ Validação: `findFirst` com `tenant_id` antes do update
- ✅ Proteção: Rejeita se lead não pertence ao tenant

## 🎯 Princípios de Segurança

### 1. Zero Trust
- Nunca confiar em dados do cliente (body, query, params)
- Sempre validar tenant_id de recursos antes de operações

### 2. Fail Secure
- Em caso de dúvida, **rejeitar** o request
- Retornar 404 "não encontrado" em vez de 403 "sem permissão" (evita information disclosure)

### 3. Defense in Depth
- Múltiplas camadas: Middleware → Validação → Query Filter
- Mesmo se uma camada falhar, outras protegem

### 4. Least Privilege
- Usuários só acessam dados do seu próprio tenant
- Sem exceções, sem "super admin" que pula validação

## ⚠️ Avisos Importantes

### Para Desenvolvedores

**NUNCA**:
- ❌ Aceitar `tenantId` de body/query/params
- ❌ Fazer queries sem filtro de `tenant_id`
- ❌ Comentar ou remover middlewares "para testar"
- ❌ Usar `findUnique` sem validar `tenant_id` depois

**SEMPRE**:
- ✅ Usar `request.tenantId` (do middleware)
- ✅ Incluir `tenant_id` em WHERE de todas as queries
- ✅ Validar ownership antes de update/delete
- ✅ Testar com múltiplos tenants

### Para Code Review

Rejeitar PR se:
- Rota não tem `authMiddleware` + `tenantMiddleware`
- Query não filtra por `tenant_id`
- `tenantId` vem de body/query em vez de `request.tenantId`
- Update/Delete não valida ownership primeiro

## 🧪 Como Testar Segurança

```bash
# 1. Criar 2 tenants diferentes
# 2. Criar leads em cada tenant
# 3. Tentar acessar lead do Tenant A com token do Tenant B

# Deve retornar 404 ou erro "não encontrado"
curl -X GET \
  http://localhost:3333/api/v1/ai/lead/{leadId-do-tenant-A}/conversation \
  -H "Authorization: Bearer {token-do-tenant-B}" \
  -H "X-Tenant-ID: {tenant-B}"

# Resultado esperado: 404 Lead não encontrado
```

## 📚 Referências

- Middlewares: `/shared/middlewares/auth.middleware.ts`
- Middlewares: `/shared/middlewares/tenant.middleware.ts`
- Rotas: `/modules/ai/ai.routes.ts`
- Service: `/ai/services/message-processor-v2.service.ts`

## 🔄 Histórico de Segurança

### 2024-12-19 - CRÍTICO: Correção de Vazamento de Dados
- **Problema**: Rotas aceitavam `tenantId` do body/query
- **Impacto**: Cliente malicioso poderia acessar dados de outros tenants
- **Solução**:
  - Adicionado `authMiddleware` + `tenantMiddleware` em TODAS as rotas
  - Mudado de `request.body.tenantId` → `request.tenantId`
  - Adicionado validação de ownership antes de updates
  - Adicionado filtro `tenant_id` em TODAS as queries
- **Status**: ✅ CORRIGIDO

---

**Última atualização**: 2024-12-19
**Responsável**: Claude Code
**Criticidade**: 🔴 MÁXIMA
