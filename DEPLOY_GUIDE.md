# 🚀 Guia de Deploy - ImobiFlow Multi-Tenant

**Data**: 03/12/2025
**Status**: Pronto para Deploy

---

## 📋 Pré-requisitos

✅ Código multi-tenant completo
✅ Migration aplicada no banco do Render
✅ Testes passando (16/16 - 100%)
✅ Repositório GitHub: https://github.com/Integrius/imobiflow-saas.git

---

## 🎯 Opção 1: Deploy no Render (Recomendado)

Você já tem o banco PostgreSQL no Render, então é a opção mais fácil!

### Passo 1: Commit e Push do Código

```bash
cd /home/hans/imobiflow

# Adicionar todos os arquivos da migração
git add .

# Criar commit
git commit -m "feat: implementa arquitetura multi-tenant completa

- Adiciona suporte multi-tenant em todos os módulos
- Migration aplicada e testada
- 16/16 testes passando
- Sistema de planos (BASICO, PRO, ENTERPRISE, CUSTOM)
- Isolamento completo de dados entre tenants
- Composite unique constraints
- Middleware de validação automática"

# Push para o GitHub
git push origin main
```

### Passo 2: Criar Web Service no Render

1. **Acessar Render Dashboard**
   - Ir para https://dashboard.render.com
   - Login com suas credenciais

2. **Criar Novo Web Service**
   - Clicar em **"New +"** → **"Web Service"**
   - Conectar ao repositório: `Integrius/imobiflow-saas`
   - Branch: `main`

3. **Configurar o Service**
   ```
   Name: imobiflow-api
   Region: Ohio (US East) - mesma região do banco
   Branch: main
   Root Directory: apps/api
   Runtime: Node
   Build Command: pnpm install && pnpm run build
   Start Command: pnpm start
   ```

4. **Adicionar Variáveis de Ambiente**

   No Render Dashboard → Environment:

   ```bash
   DATABASE_URL=postgresql://imobiflow:TSDnj5HyoG41xF8hQCF56xkGxUSHqj8o@dpg-d4kgd33e5dus73f7b480-a/imobiflow

   JWT_SECRET=VBLrU5mKcEpHumt4GmbiN5E5AQM9rBcsh43TgA1dBvjz=9XGTOajQQfgrMbBksYs

   JWT_EXPIRES_IN=7d

   NODE_ENV=production

   PORT=3333

   SMTP_FROM=noreply@integrius.com.br
   ```

   **⚠️ IMPORTANTE**: Use a URL **interna** do banco para melhor performance:
   ```
   DATABASE_URL=postgresql://imobiflow:TSDnj5HyoG41xF8hQCF56xkGxUSHqj8o@dpg-d4kgd33e5dus73f7b480-a/imobiflow
   ```

5. **Deploy**
   - Clicar em **"Create Web Service"**
   - Aguardar o deploy (5-10 minutos)

6. **URL Gerada**
   ```
   https://imobiflow-api.onrender.com
   ou
   https://imobiflow-api-xyz.onrender.com
   ```

### Passo 3: Testar o Deploy

```bash
# Health check
curl https://sua-url.onrender.com/health

# Criar um tenant
curl -X POST https://sua-url.onrender.com/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Minha Imobiliária",
    "slug": "minha-imobiliaria",
    "email": "contato@minhaimobiliaria.com",
    "plano": "PRO"
  }'
```

---

## 🎯 Opção 2: Deploy no Vercel (Frontend + API)

### Para a API

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd /home/hans/imobiflow/apps/api
   vercel --prod
   ```

3. **Configurar Variáveis de Ambiente**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add NODE_ENV
   ```

### Para o Frontend (Next.js)

```bash
cd /home/hans/imobiflow/apps/web
vercel --prod
```

**Configurar variáveis**:
```
NEXT_PUBLIC_API_URL=https://sua-api.vercel.app
```

---

## 🎯 Opção 3: Deploy com Docker (VPS/Cloud)

### Criar Dockerfile para API

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar package files
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código
COPY apps/api ./apps/api

# Build
WORKDIR /app/apps/api
RUN pnpm run build

# Expor porta
EXPOSE 3333

# Start
CMD ["pnpm", "start"]
```

### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "3333:3333"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    restart: unless-stopped
```

### Deploy em VPS

```bash
# No servidor (DigitalOcean, AWS, etc)
git clone https://github.com/Integrius/imobiflow-saas.git
cd imobiflow-saas

# Criar .env
cat > .env << EOF
DATABASE_URL=postgresql://imobiflow:senha@dpg-xxx.ohio-postgres.render.com/imobiflow
JWT_SECRET=seu-jwt-secret
NODE_ENV=production
EOF

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🎯 Opção 4: Ngrok (Teste Rápido - Temporário)

Para testar rapidamente sem deploy:

```bash
# Instalar ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Autenticar (pegar token em https://dashboard.ngrok.com)
ngrok config add-authtoken SEU_TOKEN

# Iniciar servidor local
cd /home/hans/imobiflow/apps/api
pnpm run dev

# Em outro terminal, expor na internet
ngrok http 3333
```

**URL gerada**:
```
https://abc123.ngrok.io → http://localhost:3333
```

⚠️ **Limitações**:
- URL muda a cada reinício (gratuito)
- Temporário (fecha quando você fecha o terminal)
- Apenas para testes

---

## 📊 Comparação de Opções

| Opção | Custo | Facilidade | Performance | Recomendado Para |
|-------|-------|------------|-------------|------------------|
| **Render** | $7-25/mês | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Produção (você já tem DB lá) |
| **Vercel** | $20/mês | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Frontend + API serverless |
| **Docker/VPS** | $5-50/mês | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Controle total |
| **Ngrok** | Grátis | ⭐⭐⭐⭐⭐ | ⭐⭐ | Testes rápidos |

---

## 🔧 Configurações Adicionais

### 1. Configurar Domínio Customizado

**No Render**:
1. Dashboard → Seu Service → Settings
2. Custom Domain → Add Custom Domain
3. Adicionar: `api.seudominio.com`
4. Configurar DNS (CNAME):
   ```
   CNAME: api → imobiflow-api.onrender.com
   ```

**No Vercel**:
```bash
vercel domains add api.seudominio.com
```

### 2. SSL/HTTPS

- ✅ **Render**: SSL automático gratuito
- ✅ **Vercel**: SSL automático gratuito
- ⚠️ **VPS**: Configurar Let's Encrypt manualmente

### 3. Monitoramento

**Health Check**:
```bash
# Adicionar em crontab
*/5 * * * * curl -f https://sua-api.com/health || echo "API DOWN"
```

**Serviços de Monitoramento**:
- UptimeRobot (gratuito)
- Pingdom
- Better Uptime

---

## 🚀 Scripts de Deploy Rápido

### Script 1: Deploy no Render via Git

```bash
#!/bin/bash
# deploy-render.sh

echo "🚀 Iniciando deploy no Render..."

# Commit e push
git add .
git commit -m "deploy: atualização $(date +'%Y-%m-%d %H:%M')"
git push origin main

echo "✅ Código enviado para GitHub"
echo "⏳ Render vai detectar e fazer deploy automaticamente"
echo "🔗 Acesse https://dashboard.render.com para acompanhar"
```

### Script 2: Deploy Vercel

```bash
#!/bin/bash
# deploy-vercel.sh

echo "🚀 Deploy Vercel API..."
cd apps/api
vercel --prod --yes

echo "🚀 Deploy Vercel Web..."
cd ../web
vercel --prod --yes

echo "✅ Deploy concluído!"
```

---

## ✅ Checklist de Deploy

Antes de fazer deploy em produção:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] DATABASE_URL usando URL **interna** no Render
- [ ] JWT_SECRET forte e único
- [ ] NODE_ENV=production
- [ ] Migration aplicada no banco
- [ ] Testes passando (16/16)
- [ ] Git commit e push realizados
- [ ] SSL configurado
- [ ] Domínio customizado (opcional)
- [ ] Monitoramento configurado
- [ ] Backup do banco configurado

---

## 🆘 Troubleshooting

### Erro: Cannot reach database

**Causa**: DATABASE_URL incorreta
**Solução**:
```bash
# Usar URL interna no Render (mais rápida)
DATABASE_URL=postgresql://user:pass@dpg-xxx/db

# Usar URL externa fora do Render
DATABASE_URL=postgresql://user:pass@dpg-xxx.ohio-postgres.render.com/db
```

### Erro: Build failed

**Causa**: Dependências faltando
**Solução**:
```bash
# Garantir que package.json está correto
cd apps/api
pnpm install
pnpm run build
```

### Erro: Migration not applied

**Solução**:
```bash
# Aplicar migration manualmente
DATABASE_URL="sua-url" npx prisma migrate deploy
```

---

## 📝 Próximos Passos Após Deploy

1. **Testar API em produção**
   ```bash
   curl https://sua-api.com/health
   curl https://sua-api.com/api/v1/tenants
   ```

2. **Criar primeiro tenant via API**
   ```bash
   curl -X POST https://sua-api.com/api/v1/tenants \
     -H "Content-Type: application/json" \
     -d '{"nome": "Primeira Imobiliária", "slug": "primeira", "plano": "PRO"}'
   ```

3. **Configurar frontend** para apontar para a API
   ```javascript
   // .env.production
   NEXT_PUBLIC_API_URL=https://sua-api.com
   ```

4. **Deploy do frontend**
   ```bash
   cd apps/web
   vercel --prod
   ```

---

## 🎉 Recomendação Final

**Para você, recomendo o Render** porque:
1. ✅ Você já tem o banco PostgreSQL lá
2. ✅ URL interna = performance máxima
3. ✅ Deploy automático via Git
4. ✅ SSL gratuito
5. ✅ Fácil de configurar
6. ✅ $7/mês para começar

**Comandos para deploy imediato**:
```bash
cd /home/hans/imobiflow
git add .
git commit -m "feat: sistema multi-tenant completo"
git push origin main

# Depois criar Web Service no Render Dashboard
```

---

**Criado em**: 03/12/2025
**Versão**: 1.0
**Status**: Pronto para Deploy 🚀
