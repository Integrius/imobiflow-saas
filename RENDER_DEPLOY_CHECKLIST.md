# ✅ Checklist de Deploy no Render

**Data**: 03/12/2025
**Status**: Configurando Web Service

---

## 📋 Configurações do Web Service

Verifique se todas estas configurações estão corretas **ANTES** de clicar em "Create Web Service":

### 1. Informações Básicas
- [ ] **Name**: `imobiflow-api` (ou qualquer nome que preferir)
- [ ] **Region**: `Ohio (US East)` ✅ **CRÍTICO** - mesma região do banco!
- [ ] **Branch**: `main`
- [ ] **Root Directory**: `apps/api`

### 2. Build & Deploy
- [ ] **Runtime**: `Node`
- [ ] **Build Command**: `pnpm install && pnpm run build`
- [ ] **Start Command**: `pnpm start`

### 3. Instance Type
- [ ] **Instance Type**: `Starter` ($7/mês)
  - 512 MB RAM
  - 0.5 CPU
  - Suficiente para começar

### 4. Environment Variables (6 variáveis)

**⚠️ IMPORTANTE: Adicionar ANTES de criar o serviço!**

Clicar em "Advanced" → "Add Environment Variable" e adicionar:

```bash
# 1. Database URL (INTERNA - mais rápida)
DATABASE_URL=postgresql://imobiflow:TSDnj5HyoG41xF8hQCF56xkGxUSHqj8o@dpg-d4kgd33e5dus73f7b480-a/imobiflow

# 2. JWT Secret
JWT_SECRET=VBLrU5mKcEpHumt4GmbiN5E5AQM9rBcsh43TgA1dBvjz=9XGTOajQQfgrMbBksYs

# 3. JWT Expiration
JWT_EXPIRES_IN=7d

# 4. Node Environment
NODE_ENV=production

# 5. Port
PORT=3333

# 6. SMTP From
SMTP_FROM=noreply@integrius.com.br
```

**Observação**: Note que a DATABASE_URL **não tem** `.ohio-postgres.render.com` - é a URL interna para melhor performance!

---

## 🚀 Passo a Passo Final

### Antes de Criar o Service:

1. **Revisar Build Command**
   - Deve ser exatamente: `pnpm install && pnpm run build`
   - **NÃO** usar `yarn` ou `npm`

2. **Revisar Start Command**
   - Deve ser exatamente: `pnpm start`

3. **Adicionar Variáveis de Ambiente**
   - Scroll até a seção "Environment Variables"
   - Clicar em "Advanced" (se não estiver visível)
   - Clicar em "Add Environment Variable"
   - Adicionar as 6 variáveis acima, uma por vez:
     - Key: DATABASE_URL
     - Value: postgresql://imobiflow:...
     - (Repetir para todas as 6)

4. **Revisar Região**
   - Confirmar que está em `Ohio (US East)`
   - **Isso é crítico** para latência baixa com o banco

5. **Clicar em "Create Web Service"**
   - Somente após confirmar TODAS as configurações acima

---

## ⏱️ O Que Vai Acontecer

Após clicar em "Create Web Service":

1. **Deploy Inicial (5-10 minutos)**
   ```
   ⏳ Render vai:
      → Clonar o repositório
      → Instalar dependências (pnpm install)
      → Compilar TypeScript (pnpm run build)
      → Iniciar servidor (pnpm start)
   ```

2. **Logs em Tempo Real**
   - Você verá os logs de build e deploy
   - Procure por erros em vermelho
   - Sucesso quando ver: "✅ Your service is live"

3. **URL Gerada**
   ```
   https://imobiflow-api.onrender.com
   ou
   https://imobiflow-api-xyz.onrender.com
   ```

---

## ✅ Após Deploy com Sucesso

### Testar a API:

```bash
# 1. Health Check
curl https://SUA-URL.onrender.com/health

# Deve retornar:
# {"status":"ok","timestamp":"...","service":"ImobiFlow API"}

# 2. Criar um Tenant
curl -X POST https://SUA-URL.onrender.com/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Minha Imobiliária",
    "slug": "minha-imobiliaria",
    "email": "contato@minhaimobiliaria.com",
    "plano": "PRO"
  }'
```

---

## 🆘 Se Algo Der Errado

### Erro: Build Failed

**Possíveis causas**:
1. Build command incorreto
2. Dependências faltando
3. Erro no código

**Solução**:
- Ver logs detalhados no dashboard
- Verificar se `apps/api/package.json` tem script `build`
- Verificar se `apps/api/package.json` tem script `start`

### Erro: Can't reach database

**Possíveis causas**:
1. DATABASE_URL incorreta
2. Banco não está na mesma região

**Solução**:
- Verificar URL interna no Environment Variables
- Confirmar região Ohio para ambos (banco e API)

### Erro: Application Failed to Start

**Possíveis causas**:
1. Start command incorreto
2. Porta incorreta
3. Variável de ambiente faltando

**Solução**:
- Start command deve ser `pnpm start`
- PORT deve ser `3333`
- Verificar se todas as 6 variáveis estão configuradas

---

## 📊 Custos

- **Web Service Starter**: $7/mês
- **PostgreSQL** (já existente): $7/mês
- **Total**: $14/mês

---

## 🎯 Próximos Passos (Após Deploy)

1. ✅ Testar API em produção
2. ✅ Configurar domínio customizado (opcional)
3. ✅ Deploy do frontend no Vercel
4. ✅ Configurar monitoramento

---

**⚠️ LEMBRE-SE**: Adicionar as variáveis de ambiente ANTES de criar o serviço! Depois é mais trabalhoso.

**Pronto para clicar em "Create Web Service"?** ✅
