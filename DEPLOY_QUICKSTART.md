# Quick Start: Deploy na Vercel

## Passo a Passo Rápido

### 1. Commit e Push das Alterações

```bash
# Na raiz do projeto
git add .
git commit -m "feat: adiciona configuração para deploy na Vercel"
git push origin main
```

### 2. Criar Projeto na Vercel

1. Acesse: https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione seu repositório `imobiflow`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: (deixe vazio)
   - **Build and Output Settings**: Override
     - Build Command: `pnpm run build --filter=web`
     - Output Directory: `apps/web/.next`
     - Install Command: `pnpm install`

### 3. Adicionar Variável de Ambiente

Na seção "Environment Variables":
- Name: `NEXT_PUBLIC_API_URL`
- Value: `https://sua-api-url.com` (ou `http://localhost:3333` para testes)

### 4. Deploy

Clique em **"Deploy"** e aguarde!

## Resultado

Após alguns minutos, você terá:
- ✅ URL de produção: `https://imobiflow.vercel.app`
- ✅ Auto-deploy configurado
- ✅ Preview deploys para cada PR

## Próximos Passos

1. **Deploy do Backend (API)**
   - Recomendado: Railway.app, Render.com ou Heroku
   - Configure PostgreSQL
   - Atualize `NEXT_PUBLIC_API_URL` na Vercel

2. **Domínio Customizado** (opcional)
   - Settings → Domains na Vercel
   - Adicione seu domínio

## Precisa de Ajuda?

Consulte o arquivo `DEPLOY.md` para guia completo.

## Verificar Deploy Local

Antes de fazer deploy, teste localmente:

```bash
# Build de produção
pnpm run build

# Rodar versão de produção
cd apps/web && pnpm start
```

Acesse: http://localhost:3000
