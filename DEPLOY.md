# Deploy ImobiFlow na Vercel

Este guia explica como fazer o deploy do projeto ImobiFlow na Vercel.

## Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Vercel CLI instalado (opcional, mas recomendado)

## Opção 1: Deploy via Dashboard da Vercel (Recomendado)

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

## Deploy do Backend (API)

O backend (Fastify + Prisma) precisa ser deployado separadamente:

### Opções para Backend:
1. **Railway**: https://railway.app
2. **Render**: https://render.com
3. **Heroku**: https://heroku.com
4. **DigitalOcean App Platform**: https://www.digitalocean.com/products/app-platform

### Depois de fazer deploy do backend:
1. Atualize a variável `NEXT_PUBLIC_API_URL` na Vercel
2. Faça um novo deploy ou aguarde o auto-deploy

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
