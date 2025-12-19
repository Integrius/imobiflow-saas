# 🚀 Deploy ImobiFlow - Guia Completo

**Última atualização**: 2025-12-19

## 📦 Arquitetura de Deploy (Atual)

### ✅ Backend (API) - Render
- **URL Produção**: https://imobiflow-saas-1.onrender.com
- **Plataforma**: Render
- **Auto-deploy**: ✅ Ativo (push para `main`)
- **Configuração**: `render.yaml`

### ✅ Frontend (Web) - Cloudflare Pages
- **URL Produção**: https://vivoly.integrius.com.br
- **Plataforma**: Cloudflare Pages
- **Auto-deploy**: ✅ Ativo (push para `main`)
- **CDN Global**: 275+ cidades (14 no Brasil)

### ❌ NÃO usar Frontend no Render
O Render está configurado APENAS para rodar a API. Todo o frontend roda exclusivamente no Cloudflare Pages.

---

## Pré-requisitos

1. Conta no Cloudflare (https://cloudflare.com)
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Conta no Render (https://render.com)

## Deploy do Frontend (Cloudflare Pages)

### Passo 1: Preparar o Repositório

1. Certifique-se de que todas as alterações estão commitadas:
   ```bash
   git add .
   git commit -m "feat: preparar projeto para deploy na Vercel"
   git push origin main
   ```

### Passo 2: Importar Projeto na Vercel

1. Acesse https://vercel.com/dashboard
2. Clique em "Add New..." → "Project"
3. Importe seu repositório Git
4. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: deixe vazio (raiz do projeto)
   - **Build Command**: `cd apps/web && npm run build`
   - **Output Directory**: `apps/web/.next`
   - **Install Command**: `npm install`

### Passo 3: Configurar Variáveis de Ambiente

Na página de configuração do projeto, adicione as seguintes variáveis:

```
NEXT_PUBLIC_API_URL=https://sua-api-url.com
```

**Importante**: Se você ainda não tem o backend em produção, você pode:
- Usar a URL do backend local para testes: `http://localhost:3333`
- Ou criar uma API mock/staging primeiro

### Passo 4: Deploy

1. Clique em "Deploy"
2. Aguarde a build completar
3. Acesse a URL gerada (ex: `imobiflow.vercel.app`)

## Opção 2: Deploy via Vercel CLI

### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Passo 2: Login na Vercel

```bash
vercel login
```

### Passo 3: Deploy

```bash
# Na raiz do projeto
vercel

# Para deploy em produção
vercel --prod
```

## Configuração do Monorepo

O projeto usa Turborepo e PNPM. A configuração em `vercel.json` já está otimizada para:
- Build apenas do app web (`apps/web`)
- Usar npm como package manager (compatível com Vercel)
- Region: São Paulo (gru1) para melhor latência no Brasil

## Variáveis de Ambiente na Vercel

Configure estas variáveis no painel da Vercel:

### Produção
- `NEXT_PUBLIC_API_URL`: URL da API em produção

### Development/Preview
- `NEXT_PUBLIC_API_URL`: URL da API de staging/desenvolvimento

## Troubleshooting

### Erro: "Package manager not found"
- Certifique-se de que `package.json` existe na raiz
- Verifique se `packageManager` está definido no `package.json` raiz

### Erro: "Build failed"
- Verifique os logs de build na Vercel
- Teste o build localmente: `npm run build`
- Verifique se todas as dependências estão instaladas

### Erro: "API requests failing"
- Verifique se `NEXT_PUBLIC_API_URL` está configurado corretamente
- Certifique-se de que a API está acessível publicamente
- Verifique CORS na API

## 🔄 Workflow de Deploy

### Desenvolvimento Local
```bash
# Terminal 1 - Backend
cd apps/api
pnpm dev

# Terminal 2 - Frontend
cd apps/web
pnpm dev
```

### Deploy Automático (Recomendado)
```bash
git add .
git commit -m "feat: sua alteração"
git push origin main
```

**Resultado:**
- ✅ Render faz rebuild da API automaticamente
- ✅ Cloudflare Pages faz rebuild do Frontend automaticamente

### Deploy Manual Frontend (se necessário)
- Acesse https://dash.cloudflare.com
- Vá em "Workers & Pages"
- Selecione seu projeto
- Click "Create deployment" → "Deploy latest commit"

### Deploy Manual Backend (se necessário)
- Acesse https://dashboard.render.com
- Selecione `imobiflow-saas-1`
- Click "Manual Deploy" → "Deploy latest commit"

## 🔐 Variáveis de Ambiente

### Backend (Render Dashboard)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
ANTHROPIC_API_KEY=sk-ant-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend (Cloudflare Pages Dashboard)
```env
NEXT_PUBLIC_API_URL=https://imobiflow-saas-1.onrender.com
```

**Como configurar:**
1. Acesse https://dash.cloudflare.com
2. Workers & Pages → Seu projeto → Settings → Environment variables
3. Adicione a variável para Production e Preview

## Domínio Customizado

Para adicionar um domínio próprio:
1. Vá em Settings → Domains no projeto na Vercel
2. Adicione seu domínio
3. Configure os DNS records conforme instruído

## Auto Deploy

A Vercel faz auto-deploy quando você:
- Faz push para a branch principal (main/master)
- Cria um Pull Request (Preview Deploy)

## Monitoramento

- Acesse Analytics na Vercel para ver métricas
- Configure Web Vitals monitoring
- Use Vercel Logs para debugging

## Próximos Passos

1. [ ] Fazer deploy do backend em um serviço de hospedagem
2. [ ] Configurar banco de dados PostgreSQL em produção
3. [ ] Atualizar `NEXT_PUBLIC_API_URL` com URL da API em produção
4. [ ] Configurar domínio customizado (opcional)
5. [ ] Configurar CI/CD para testes automatizados
6. [ ] Implementar autenticação JWT em produção

## Suporte

- Documentação Vercel: https://vercel.com/docs
- Documentação Next.js: https://nextjs.org/docs
- Documentação Turborepo: https://turbo.build/repo/docs
