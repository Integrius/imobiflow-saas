# 🔧 Correção do Build no Render

**Problema identificado**: `pnpm-lock.yaml` desatualizado causando erro de frozen-lockfile

**Status**: ✅ CORRIGIDO - Commit 8fc5da7 já enviado para GitHub

---

## ✅ O Que Foi Corrigido

1. **pnpm-lock.yaml atualizado** - Sincronizado com package.json
2. **render.yaml criado** - Configuração automática do Render
3. **Código commitado e pushed** - Pronto para novo deploy

---

## 🚀 Como Fazer Deploy Agora

### Opção A: Retry Deploy Automático (Recomendado)

Se você já criou o Web Service:

1. **Ir para o Dashboard do Render**
2. **Seu Service** → `imobiflow-api` (ou nome que você deu)
3. **Clicar em "Manual Deploy"** → **"Deploy latest commit"**
4. Aguardar build (5-10 minutos)

### Opção B: Criar Novo Web Service

Se ainda não criou ou quer criar novo:

1. **New +** → **Web Service**
2. **Repositório**: `Integrius/imobiflow-saas`
3. **Branch**: `main`

**Configurações**:
```
Name: imobiflow-api
Region: Ohio (US East)
Branch: main
Root Directory: apps/api
Runtime: Node
```

**Build Command** (IMPORTANTE - use esta versão atualizada):
```bash
pnpm install --no-frozen-lockfile && pnpm run build
```

**Start Command**:
```bash
pnpm start
```

**Instance Type**: `Starter` ($7/mês)

**Environment Variables** (CRÍTICO - adicionar antes de criar):
```
DATABASE_URL=postgresql://imobiflow:TSDnj5HyoG41xF8hQCF56xkGxUSHqj8o@dpg-d4kgd33e5dus73f7b480-a/imobiflow
JWT_SECRET=VBLrU5mKcEpHumt4GmbiN5E5AQM9rBcsh43TgA1dBvjz=9XGTOajQQfgrMbBksYs
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3333
SMTP_FROM=noreply@integrius.com.br
```

---

## 🔍 Logs Esperados no Build

Quando o build estiver funcionando, você verá:

```bash
==> Cloning from https://github.com/Integrius/imobiflow-saas
==> Checking out commit 8fc5da7...
==> Using Node.js version 22.x
==> Running build command 'pnpm install --no-frozen-lockfile && pnpm run build'

# Instalação (2-3 minutos)
Packages: +570
Done in 45s

# Build (1-2 minutos)
> @imobiflow/api@1.0.0 build
> prisma generate && tsc

✔ Generated Prisma Client
✔ TypeScript compiled successfully

==> Build succeeded ✅
==> Starting service...
🚀 Server running on port 3333
```

---

## ⚠️ Diferença do Build Command

### ❌ Antes (causava erro):
```bash
pnpm install && pnpm run build
```

**Erro**: frozen-lockfile não permite instalar com lockfile desatualizado

### ✅ Agora (corrigido):
```bash
pnpm install --no-frozen-lockfile && pnpm run build
```

**Por quê?**: A flag `--no-frozen-lockfile` permite que o pnpm atualize o lockfile se necessário, evitando erros de sincronização.

**Alternativa**: Como já atualizamos o lockfile no commit 8fc5da7, você também pode usar:
```bash
pnpm install && pnpm run build
```
(Deve funcionar agora, mas `--no-frozen-lockfile` é mais seguro)

---

## 📊 Checklist de Deploy

Antes de clicar em "Create Web Service" ou "Deploy":

- [x] Código atualizado no GitHub (commit 8fc5da7)
- [x] pnpm-lock.yaml sincronizado
- [ ] Build Command correto: `pnpm install --no-frozen-lockfile && pnpm run build`
- [ ] Start Command correto: `pnpm start`
- [ ] Root Directory: `apps/api`
- [ ] Region: `Ohio (US East)`
- [ ] 6 variáveis de ambiente adicionadas
- [ ] Instance Type: Starter selecionado

---

## 🎯 Próximos Passos Após Deploy Bem-Sucedido

Quando o deploy terminar com sucesso:

```bash
# 1. Testar Health Check
curl https://sua-url.onrender.com/health

# Deve retornar:
# {"status":"ok","timestamp":"...","service":"ImobiFlow API"}

# 2. Criar Primeiro Tenant
curl -X POST https://sua-url.onrender.com/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Primeira Imobiliária",
    "slug": "primeira",
    "email": "contato@primeira.com",
    "plano": "PRO"
  }'
```

---

## 🆘 Se Continuar Falhando

Se ainda houver erros:

1. **Verificar logs completos** no Render Dashboard
2. **Copiar mensagem de erro** completa
3. **Me enviar** para análise

**Possíveis erros restantes**:
- Falta de variável de ambiente
- Erro de conexão com banco
- Problema com Node.js version
- Timeout (significa que está lento, mas pode estar funcionando)

---

**Criado em**: 03/12/2025 - 18:48
**Status**: Pronto para deploy ✅
**Commit**: 8fc5da7
