# 🎯 Estratégia de Deploy - Render + Vercel

**Recomendação**: API no Render + Frontend no Vercel
**Seu domínio**: Configurável em ambos

---

## 📊 Arquitetura Recomendada

```
┌─────────────────────────────────────────────────────┐
│                  SEU DOMÍNIO                         │
│            imobiflow.com.br (exemplo)                │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────┐              ┌────────────────┐
│   FRONTEND    │              │      API       │
│   (Vercel)    │──────────────▶│   (Render)    │
│               │   API Calls   │               │
│ imobiflow.com │              │api.imobiflow  │
│      ou       │              │    .com       │
│app.imobiflow  │              │               │
└───────────────┘              └────────────────┘
                                        │
                                        ▼
                               ┌────────────────┐
                               │  PostgreSQL    │
                               │   (Render)     │
                               │                │
                               │ ✅ JÁ EXISTE  │
                               └────────────────┘
```

---

## 🎯 Passo a Passo Completo

### PARTE 1: Deploy da API no Render (10 minutos)

#### 1.1 - Commit e Push do Código

```bash
cd /home/hans/imobiflow

# Ver status
git status

# Adicionar tudo
git add .

# Commit
git commit -m "feat: sistema multi-tenant completo

- Arquitetura SaaS multi-tenant implementada
- 16/16 testes passando
- Migration aplicada no banco
- Pronto para produção"

# Push
git push origin main
```

#### 1.2 - Criar Web Service no Render

1. **Acessar**: https://dashboard.render.com
2. **Clicar**: "New +" → "Web Service"
3. **Conectar repositório**:
   - Selecionar: `Integrius/imobiflow-saas`
   - Branch: `main`

4. **Configurar**:
   ```
   Name: imobiflow-api
   Region: Ohio (US East) ← mesma do seu banco!
   Branch: main
   Root Directory: apps/api
   Runtime: Node
   Build Command: pnpm install && pnpm run build
   Start Command: pnpm start
   ```

5. **Variáveis de Ambiente**:

   Clicar em "Advanced" → "Add Environment Variable":

   ```bash
   # URL INTERNA do banco (mais rápida - sem .ohio-postgres.render.com)
   DATABASE_URL=postgresql://imobiflow:TSDnj5HyoG41xF8hQCF56xkGxUSHqj8o@dpg-d4kgd33e5dus73f7b480-a/imobiflow

   JWT_SECRET=VBLrU5mKcEpHumt4GmbiN5E5AQM9rBcsh43TgA1dBvjz=9XGTOajQQfgrMbBksYs

   JWT_EXPIRES_IN=7d

   NODE_ENV=production

   PORT=3333

   SMTP_FROM=noreply@integrius.com.br
   ```

6. **Criar Service**: Clicar em "Create Web Service"

#### 1.3 - Aguardar Deploy (5-10 min)

Você verá os logs em tempo real. Quando terminar:
```
✅ Your service is live at https://imobiflow-api.onrender.com
```

#### 1.4 - Testar API

```bash
# Health check
curl https://imobiflow-api.onrender.com/health

# Deve retornar:
# {"status":"ok","timestamp":"...","service":"ImobiFlow API"}
```

---

### PARTE 2: Configurar Domínio para API (5 minutos)

#### 2.1 - Adicionar Domínio Customizado no Render

1. **No Render Dashboard** → Seu Service → Settings
2. **Custom Domain** → "Add Custom Domain"
3. **Digitar**: `api.seudominio.com.br`
4. **Salvar**

#### 2.2 - Configurar DNS no seu Provedor

No painel do seu domínio (Registro.br, Hostgator, etc):

```
Tipo: CNAME
Nome: api
Valor: imobiflow-api.onrender.com
TTL: 3600
```

**Aguardar**: 5-30 minutos para propagar

**Testar**:
```bash
curl https://api.seudominio.com.br/health
```

---

### PARTE 3: Deploy do Frontend no Vercel (5 minutos)

#### 3.1 - Configurar Variável de Ambiente

Criar arquivo `.env.production` no frontend:

```bash
cd /home/hans/imobiflow/apps/web

cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://api.seudominio.com.br
EOF

# Commit
git add .env.production
git commit -m "config: adiciona URL da API de produção"
git push
```

#### 3.2 - Deploy no Vercel

```bash
# Se não tiver Vercel CLI, instalar
npm install -g vercel

# Fazer login
vercel login

# Deploy do frontend
cd /home/hans/imobiflow/apps/web
vercel --prod
```

Siga as perguntas:
```
? Set up and deploy "~/imobiflow/apps/web"? Y
? Which scope? [Sua conta]
? Link to existing project? N
? What's your project's name? imobiflow-web
? In which directory is your code located? ./
? Want to override the settings? N
```

**URL gerada**:
```
https://imobiflow-web.vercel.app
ou
https://imobiflow-web-xyz.vercel.app
```

#### 3.3 - Configurar Domínio para Frontend

1. **No Vercel Dashboard**: https://vercel.com/dashboard
2. **Seu projeto** → Settings → Domains
3. **Add Domain**: `seudominio.com.br` ou `app.seudominio.com.br`
4. **Seguir instruções do Vercel** para configurar DNS

**Exemplo de DNS**:
```
Tipo: CNAME
Nome: app (ou @)
Valor: cname.vercel-dns.com
```

---

## 🌐 Resultado Final

Quando tudo estiver configurado, você terá:

```
Frontend (Usuários acessam):
https://app.seudominio.com.br
  │
  └──> Vercel (Global, rápido)
       │
       └──> Chama API: https://api.seudominio.com.br
            │
            └──> Render (Ohio, mesma região do banco)
                 │
                 └──> PostgreSQL (Render, conexão interna)
```

---

## 💰 Custos Estimados

| Serviço | Plano | Custo/mês | Já tem? |
|---------|-------|-----------|---------|
| **Render - PostgreSQL** | Starter | $7 | ✅ Sim |
| **Render - Web Service** | Starter | $7 | Novo |
| **Vercel - Frontend** | Hobby | $0 | Novo |
| **Domínio** | Registro.br | ~R$40/ano | Você tem? |
| **TOTAL** | | **~$14/mês** | |

**Observação**: Vercel Hobby é gratuito e suficiente para começar!

---

## 🔄 Fluxo de Deploy Futuro

Depois de configurado, para atualizar:

```bash
# Fazer mudanças no código
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Deploy automático:
# - Render detecta push e faz deploy da API automaticamente
# - Vercel detecta push e faz deploy do frontend automaticamente
```

**Não precisa fazer nada manualmente!** 🎉

---

## 🆘 Alternativa: Tudo no Render

Se preferir simplicidade (tudo no mesmo lugar):

**Render pode hospedar API + Frontend também!**

```
Frontend (Static Site): $0/mês
API (Web Service): $7/mês
Database: $7/mês
TOTAL: $14/mês
```

**Vantagens**:
- Tudo no mesmo dashboard
- Mais simples de gerenciar
- Mesma rede (latência zero)

**Desvantagens**:
- Frontend mais lento (sem edge network do Vercel)
- Menos features que Vercel (ISR, etc)

---

## 🎯 Minha Recomendação Final para Você

**Use Render + Vercel** porque:

1. ✅ Você já tem banco no Render (não precisa migrar nada)
2. ✅ Você já conhece Vercel e gostou
3. ✅ API no Render = mesma rede do banco = super rápido
4. ✅ Frontend no Vercel = edge global = usuários felizes
5. ✅ Pode começar com Vercel gratuito
6. ✅ Deploy automático nos dois
7. ✅ Domínio customizado fácil nos dois

**Custo inicial**: $7/mês (só adicionar Web Service no Render)

---

## 📋 Checklist Rápido

Para deploy hoje:

- [ ] Fazer commit e push do código
- [ ] Criar Web Service no Render (10 min)
- [ ] Configurar variáveis de ambiente no Render
- [ ] Testar API: `curl https://imobiflow-api.onrender.com/health`
- [ ] Deploy frontend no Vercel: `vercel --prod` (5 min)
- [ ] Testar frontend acessando a URL do Vercel
- [ ] (Opcional) Configurar domínios customizados

**Quer que eu te guie no primeiro passo agora? (commit e push)**

---

**Criado em**: 03/12/2025
**Status**: Estratégia Definida ✅
