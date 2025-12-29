# 🚀 Deployment Steps - Sistema de Propostas

## ✅ O que já foi feito

1. **Schema do Banco de Dados**
   - ✅ Modelo `Proposta` adicionado ao Prisma Schema
   - ✅ Relacionamentos configurados (Tenant, Lead, Imovel, Corretor)
   - ✅ Enums e constraints definidos

2. **Backend API**
   - ✅ Service completo (`propostas.service.ts`)
   - ✅ Routes/Controller completo (`propostas.routes.ts`)
   - ✅ Endpoints registrados no servidor (`server.ts`)

3. **Frontend**
   - ✅ Modal de negociações atualizado
   - ✅ Exibe "Melhor Oferta" (read-only)
   - ✅ Exibe "Sua Oferta" (editável)
   - ✅ Auto-carregamento de ofertas
   - ✅ Salvamento automático de propostas

4. **Commit**
   - ✅ Código commitado no Git
   - ✅ Pronto para push

---

## 📋 Próximos Passos (Executar no Render.com)

### 1. Push do Código

```bash
git push origin main
```

Isso vai disparar o deploy automático no Render.com.

### 2. Aplicar Migration do Banco de Dados

**IMPORTANTE:** A tabela `propostas` ainda não existe no banco de dados de produção!

#### Opção A: Via Render Shell (Recomendado)

1. Acesse o Render Dashboard: https://dashboard.render.com
2. Entre no serviço `imobiflow-saas-1` (API Backend)
3. Clique em **Shell** no menu lateral
4. Execute:

```bash
cd apps/api
npx prisma db push
npx prisma generate
```

#### Opção B: Localmente (se tiver acesso ao DATABASE_URL)

```bash
cd apps/api
DATABASE_URL="postgresql://user:pass@host:5432/db" npx prisma db push
DATABASE_URL="postgresql://user:pass@host:5432/db" npx prisma generate
```

**⚠️ ATENÇÃO:** A aplicação vai dar erro 500 nas rotas de propostas até que a migration seja aplicada!

### 3. Reiniciar o Serviço

Após aplicar a migration, reinicie o serviço no Render:

1. Vá em **Manual Deploy** → **Clear build cache & deploy**
2. Ou simplesmente aguarde o auto-deploy do push do Git

### 4. Testar o Sistema

1. Acesse: https://vivoly.integrius.com.br/login
2. Faça login como um lead/corretor
3. Vá em **Negociações**
4. Selecione um **Lead** e um **Imóvel**
5. Observe:
   - 🏆 **Melhor Oferta** deve aparecer (se houver outras propostas)
   - 💰 **Sua Oferta** deve estar editável
6. Digite um valor e salve
7. Reabra o modal → valor deve persistir

---

## 🔍 Verificação Pós-Deploy

### Verificar se a tabela foi criada

No Render Shell ou psql:

```sql
SELECT COUNT(*) FROM propostas;
-- Deve retornar 0 (tabela vazia mas criada)

\d propostas
-- Deve mostrar a estrutura da tabela
```

### Verificar endpoints da API

```bash
# Health check
curl https://imobiflow-saas-1.onrender.com/health

# Criar proposta (requer autenticação)
curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/propostas \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "uuid-do-lead",
    "imovel_id": "uuid-do-imovel",
    "valor": 500000,
    "observacoes": "Teste de proposta"
  }'
```

---

## 🐛 Troubleshooting

### Erro: "Table propostas does not exist"

**Causa:** Migration não foi aplicada.

**Solução:** Execute `npx prisma db push` no Render Shell.

### Erro: "Cannot find module @prisma/client"

**Causa:** Prisma Client não foi gerado.

**Solução:** Execute `npx prisma generate` e reinicie o serviço.

### Melhor Oferta não aparece

**Causas possíveis:**
1. Ainda não há propostas para o imóvel
2. Endpoint `/propostas/imovel/:id/best-offer` retornando 404
3. API está offline ou com erro

**Debug:**
- Verifique console do navegador (F12)
- Verifique logs do Render
- Teste endpoint diretamente com curl

### Valor formatado errado

**Causa:** Função `formatCurrencyForEdit` vs `formatCurrencyInput`.

**Verificação:**
- `formatCurrencyForEdit`: Preserva valor original (usar para edição)
- `formatCurrencyInput`: Divide por 100 (usar para digitação)

---

## 📊 Schema da Tabela Propostas

```sql
CREATE TABLE "propostas" (
  "id" TEXT PRIMARY KEY,
  "tenant_id" TEXT NOT NULL,
  "lead_id" TEXT NOT NULL,
  "imovel_id" TEXT NOT NULL,
  "corretor_id" TEXT,
  "valor" DECIMAL(10,2) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDENTE',
  "observacoes" TEXT,
  "resposta" TEXT,
  "data_resposta" TIMESTAMP,
  "respondido_por_id" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL,

  CONSTRAINT "propostas_tenant_id_lead_id_imovel_id_key"
    UNIQUE ("tenant_id", "lead_id", "imovel_id"),

  CONSTRAINT "propostas_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,

  CONSTRAINT "propostas_lead_id_fkey"
    FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE,

  CONSTRAINT "propostas_imovel_id_fkey"
    FOREIGN KEY ("imovel_id") REFERENCES "imoveis"("id") ON DELETE RESTRICT,

  CONSTRAINT "propostas_corretor_id_fkey"
    FOREIGN KEY ("corretor_id") REFERENCES "corretores"("id") ON DELETE SET NULL
);

CREATE INDEX "propostas_tenant_id_idx" ON "propostas"("tenant_id");
CREATE INDEX "propostas_lead_id_idx" ON "propostas"("lead_id");
CREATE INDEX "propostas_imovel_id_idx" ON "propostas"("imovel_id");
CREATE INDEX "propostas_status_idx" ON "propostas"("status");
```

---

## ✅ Checklist Final

- [x] Push do código para `main`
- [x] Aguardar deploy automático no Render
- [x] Aplicar migration (`npx prisma db push`) - ✅ CONCLUÍDO em 29/12/2025
- [x] Gerar Prisma Client (`npx prisma generate`) - ✅ CONCLUÍDO em 29/12/2025
- [ ] Reiniciar serviço no Render (ou aguardar próximo deploy)
- [ ] Testar criação de proposta via frontend
- [ ] Verificar exibição de "Melhor Oferta"
- [ ] Verificar edição de "Sua Oferta"
- [ ] Verificar que valor persiste após salvar

---

**Data de Criação:** 29/12/2025
**Autor:** Claude Code Assistant
**Sistema:** ImobiFlow - Propostas/Lances para Imóveis
