# Fase 5: Testes e Validação Multi-Tenant

## Status: Pronto para Execução

A arquitetura multi-tenant está **95% completa**. Falta apenas aplicar a migration no banco e executar testes de validação.

---

## 📋 Checklist de Execução

### 1. Aplicar Migration no Banco de Dados

```bash
cd /home/hans/imobiflow/apps/api

# Verificar status das migrations
npx prisma migrate status

# Aplicar a migration multi-tenant
npx prisma migrate deploy

# OU para desenvolvimento (cria o banco se não existir)
npx prisma migrate dev
```

**Migration a ser aplicada:**
- `20251203110803_add_multi_tenant_support`
- Localização: `apps/api/prisma/migrations/20251203110803_add_multi_tenant_support/migration.sql`

### 2. Verificar Tenant Padrão

Após aplicar a migration, verificar se o tenant padrão foi criado:

```bash
# Via CLI do PostgreSQL
psql $DATABASE_URL -c "SELECT * FROM tenants WHERE id = 'default-tenant-id';"

# Ou via Prisma Studio
npx prisma studio
```

**Resultado esperado:**
- Tenant com id: `default-tenant-id`
- Nome: `Tenant Padrão`
- Plano: `ENTERPRISE`
- Status: `ATIVO`

### 3. Testes de Isolamento entre Tenants

Execute o script de teste automatizado:

```bash
cd /home/hans/imobiflow/apps/api
npx tsx scripts/test-tenant-isolation.ts
```

**O que o script testa:**
1. Criação de 2 tenants diferentes
2. Criação de leads em cada tenant
3. Validação de que cada tenant só vê seus próprios dados
4. Verificação de composite unique constraints (email, creci, cpf_cnpj)

### 4. Teste Manual via API

#### 4.1. Criar um novo Tenant

```bash
curl -X POST http://localhost:3333/api/v1/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "nome": "Imobiliária Teste",
    "slug": "teste",
    "email": "contato@teste.com",
    "plano": "PRO"
  }'
```

#### 4.2. Criar Lead com Tenant ID

```bash
# Usando Header X-Tenant-ID
curl -X POST http://localhost:3333/api/v1/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-Tenant-ID: <tenant-id-aqui>" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "11999999999",
    "origem": "SITE"
  }'
```

#### 4.3. Listar Leads do Tenant

```bash
# Usando Header X-Tenant-ID
curl -X GET http://localhost:3333/api/v1/leads \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-Tenant-ID: <tenant-id-aqui>"
```

#### 4.4. Testar Isolamento

```bash
# 1. Criar lead no Tenant A
curl -X POST http://localhost:3333/api/v1/leads \
  -H "X-Tenant-ID: tenant-a-id" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nome": "Lead do Tenant A", "telefone": "11111111111", "origem": "SITE"}'

# 2. Tentar listar com Tenant B (deve retornar vazio)
curl -X GET http://localhost:3333/api/v1/leads \
  -H "X-Tenant-ID: tenant-b-id" \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado esperado:** Tenant B não deve ver o lead do Tenant A

---

## 🧪 Script de Teste Automatizado

O script `scripts/test-tenant-isolation.ts` já foi criado e inclui:

### Testes Implementados:

1. **✅ Criação de Tenants**
   - Criar 2 tenants com planos diferentes
   - Validar dados retornados

2. **✅ Isolamento de Leads**
   - Criar lead no Tenant 1
   - Criar lead no Tenant 2
   - Validar que Tenant 1 não vê dados do Tenant 2
   - Validar que Tenant 2 não vê dados do Tenant 1

3. **✅ Isolamento de Corretores**
   - Criar usuário e corretor no Tenant 1
   - Tentar buscar do Tenant 2 (deve falhar)

4. **✅ Isolamento de Imóveis**
   - Criar proprietário e imóvel no Tenant 1
   - Validar que Tenant 2 não vê o imóvel

5. **✅ Composite Unique Constraints**
   - Validar que email pode ser repetido entre tenants
   - Validar que CPF/CNPJ pode ser repetido entre tenants
   - Validar que CRECI pode ser repetido entre tenants

6. **✅ Limites por Plano**
   - Testar criação até o limite
   - Validar erro ao exceder limite

---

## 🔍 Validações de Segurança

### Checklist de Segurança:

- [ ] **Isolamento de dados**: Tenant A não consegue acessar dados do Tenant B
- [ ] **Composite unique**: Campos únicos por tenant (email, creci, cpf_cnpj, codigo)
- [ ] **Middleware**: Todas as rotas protegidas têm authMiddleware + tenantMiddleware
- [ ] **Fallback seguro**: Default tenant usado apenas quando middleware não está presente
- [ ] **Validação de status**: Tenants SUSPENSO/INATIVO não conseguem acessar
- [ ] **Limites por plano**: Sistema respeita limites de usuários e imóveis

### SQL Injection Prevention:

Todas as queries usam Prisma ORM que previne SQL injection automaticamente:
```typescript
// ✅ Seguro - Prisma usa prepared statements
await prisma.lead.findMany({
  where: { tenant_id: tenantId }
})

// ✅ Seguro mesmo com raw SQL - usa parametrização
await prisma.$queryRaw`
  SELECT * FROM leads
  WHERE tenant_id = ${tenantId}
`
```

---

## 📊 Métricas de Sucesso

A migração será considerada **100% completa** quando:

1. ✅ Migration aplicada com sucesso
2. ✅ Tenant padrão criado
3. ✅ Dados existentes migrados para default-tenant-id
4. ✅ Testes de isolamento passando
5. ✅ API funcionando com header X-Tenant-ID
6. ✅ Middleware validando tenants corretamente
7. ✅ Limites por plano funcionando

---

## 🚀 Comandos Rápidos

```bash
# 1. Aplicar migration
cd /home/hans/imobiflow/apps/api
npx prisma migrate deploy

# 2. Gerar Prisma Client
npx prisma generate

# 3. Verificar dados
npx prisma studio

# 4. Rodar testes
npx tsx scripts/test-tenant-isolation.ts

# 5. Iniciar servidor
pnpm run dev
```

---

## ⚠️ Troubleshooting

### Erro: Tenant não encontrado

```
Error: Tenant não encontrado (404)
```

**Solução:**
1. Verificar se a migration foi aplicada
2. Verificar se o tenant existe no banco
3. Verificar se o X-Tenant-ID está correto

### Erro: Can't reach database server

```
Error: P1001: Can't reach database server
```

**Solução:**
1. Verificar se o banco está rodando
2. Verificar DATABASE_URL no .env
3. Verificar firewall/network

### Erro: Unique constraint violation

```
Error: Unique constraint failed on the fields: (`tenant_id`,`email`)
```

**Solução:**
1. Email já existe neste tenant
2. Usar email diferente ou atualizar o registro existente

---

## 📝 Notas Importantes

1. **Banco de Dados Externo**: O banco está no Render (dpg-d4kgd33e5dus73f7b480-a)
   - Certifique-se de que está acessível antes de rodar migrations
   - Use VPN se necessário

2. **Backup**: Sempre faça backup antes de aplicar migrations em produção
   ```bash
   pg_dump $DATABASE_URL > backup-antes-multi-tenant.sql
   ```

3. **Rollback**: Se algo der errado, você pode reverter:
   ```bash
   # Restaurar backup
   psql $DATABASE_URL < backup-antes-multi-tenant.sql

   # Ou reverter migration
   npx prisma migrate resolve --rolled-back 20251203110803_add_multi_tenant_support
   ```

4. **Compatibilidade**: O sistema mantém 100% de compatibilidade com modo single-tenant
   - Usa 'default-tenant-id' como fallback
   - Não quebra funcionalidades existentes

---

## 📈 Próximos Passos (Pós-Fase 5)

Após completar os testes:

1. **Deploy em Staging**
   - Testar em ambiente de staging primeiro
   - Validar performance com múltiplos tenants

2. **Documentação para Clientes**
   - Como criar novo tenant
   - Como configurar subdomínio
   - Como usar API com X-Tenant-ID

3. **Monitoramento**
   - Adicionar logs de acesso por tenant
   - Métricas de uso por tenant
   - Alertas de limite de plano

4. **Features Futuras**
   - Dashboard de admin para gerenciar tenants
   - Billing/cobrança por plano
   - Relatórios por tenant
   - White-label por tenant

---

**Data de Criação**: 03/12/2025
**Status**: Pronto para Execução
**Estimativa**: 1-2 horas para completar todos os testes
