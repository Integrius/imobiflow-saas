# 🛠️ Comandos Úteis - ImobiFlow

Referência rápida de comandos para desenvolvimento e deploy.

## 📦 Gerenciamento de Pacotes

```bash
# Instalar todas as dependências
pnpm install

# Adicionar dependência no frontend
pnpm --filter=web add <pacote>

# Adicionar dependência no backend
pnpm --filter=api add <pacote>

# Adicionar dependência de desenvolvimento
pnpm --filter=web add -D <pacote>

# Remover dependência
pnpm --filter=web remove <pacote>

# Atualizar dependências
pnpm update
```

## 🔨 Build e Desenvolvimento

```bash
# Desenvolvimento (todos os apps)
pnpm dev

# Desenvolvimento (apenas frontend)
pnpm dev --filter=web

# Desenvolvimento (apenas backend)
pnpm dev --filter=api

# Build (todos os apps)
pnpm build

# Build (apenas frontend)
pnpm build --filter=web

# Build (apenas backend)
pnpm build --filter=api

# Build de produção e iniciar
pnpm build && cd apps/web && pnpm start
```

## 🧪 Testes e Qualidade

```bash
# Lint (todos os apps)
pnpm lint

# Lint (apenas frontend)
pnpm lint --filter=web

# Fix lint automaticamente
pnpm lint --filter=web --fix

# Formatar código
pnpm format

# Type check
cd apps/web && pnpm tsc --noEmit
```

## 🗄️ Banco de Dados (Prisma)

```bash
# Entrar no diretório da API
cd apps/api

# Gerar Prisma Client
pnpm prisma generate

# Criar migration
pnpm prisma migrate dev --name <nome-da-migration>

# Aplicar migrations
pnpm prisma migrate deploy

# Reset database (CUIDADO!)
pnpm prisma migrate reset

# Abrir Prisma Studio
pnpm prisma studio

# Seed database
pnpm prisma db seed

# Push schema (sem criar migration)
pnpm prisma db push
```

## 🚀 Deploy

```bash
# Verificar status antes do deploy
./scripts/deploy-check.sh

# Build de produção local
pnpm build

# Testar build de produção
cd apps/web && pnpm start

# Commitar alterações
git add .
git commit -m "feat: descrição da alteração"
git push origin main

# Deploy via Vercel CLI (opcional)
vercel
vercel --prod
```

## 🔍 Debug e Logs

```bash
# Ver logs do Vercel (requer Vercel CLI)
vercel logs <deployment-url>

# Logs do Next.js em desenvolvimento
# Os logs aparecem automaticamente no terminal

# Limpar cache do Next.js
rm -rf apps/web/.next

# Limpar cache do Turbo
rm -rf .turbo

# Limpar todos os node_modules
rm -rf node_modules apps/*/node_modules packages/*/node_modules

# Reinstalar tudo do zero
rm -rf node_modules apps/*/node_modules packages/*/node_modules pnpm-lock.yaml
pnpm install
```

## 📊 Análise

```bash
# Analisar bundle size do Next.js
cd apps/web
ANALYZE=true pnpm build

# Ver dependências desatualizadas
pnpm outdated

# Ver árvore de dependências
pnpm list --depth=0
```

## 🔧 Git

```bash
# Ver status
git status

# Ver alterações
git diff

# Commitar com convenção
git commit -m "feat: nova funcionalidade"
git commit -m "fix: correção de bug"
git commit -m "docs: atualização de documentação"
git commit -m "chore: tarefas de manutenção"

# Criar nova branch
git checkout -b feature/nome-da-feature

# Voltar para main
git checkout main

# Atualizar branch
git pull origin main

# Ver histórico
git log --oneline -10
```

## 🌐 Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy em produção
vercel --prod

# Ver logs
vercel logs

# Ver deployments
vercel ls

# Ver variáveis de ambiente
vercel env ls

# Adicionar variável de ambiente
vercel env add NEXT_PUBLIC_API_URL

# Remover deployment
vercel remove <deployment-id>
```

## 🔐 Ambiente

```bash
# Copiar .env de exemplo
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Ver variáveis de ambiente (Linux/Mac)
cat apps/web/.env.local

# Editar variáveis de ambiente
nano apps/web/.env.local
# ou
code apps/web/.env.local
```

## 🧹 Limpeza

```bash
# Limpar tudo e reinstalar
pnpm clean && pnpm install

# Limpar apenas builds
rm -rf apps/web/.next apps/api/dist

# Limpar cache do Turbo
rm -rf .turbo

# Limpar node_modules completamente
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
pnpm install
```

## 📱 Mobile/Responsivo

```bash
# Testar em diferentes viewports (com navegador)
# 1. Abra http://localhost:3000
# 2. Pressione F12
# 3. Clique no ícone de mobile/tablet
# 4. Selecione diferentes dispositivos

# Ou use ferramentas online:
# - https://responsively.app/
# - https://www.browserstack.com/
```

## 🎯 Performance

```bash
# Lighthouse CI (requer instalação)
npm install -g @lhci/cli
lhci autorun --url=http://localhost:3000

# Next.js Bundle Analyzer
cd apps/web
npm install @next/bundle-analyzer
# Adicionar ao next.config.js e rodar build
```

## 💡 Dicas Rápidas

```bash
# Abrir projeto no VS Code
code .

# Ver todos os scripts disponíveis
pnpm run

# Limpar terminal
clear

# Ver versão do Node
node -v

# Ver versão do PNPM
pnpm -v

# Ajuda do Turbo
pnpm turbo --help
```

## 🆘 Solução de Problemas

```bash
# Build falha? Tente:
rm -rf node_modules .turbo apps/*/.next pnpm-lock.yaml
pnpm install
pnpm build

# Erro de TypeScript? Verifique:
cd apps/web && pnpm tsc --noEmit

# Porta 3000 ocupada?
lsof -ti:3000 | xargs kill -9
# ou
killall node

# PNPM travou?
pnpm store prune
rm -rf node_modules
pnpm install
```

---

**💡 Dica:** Adicione um alias no seu `.bashrc` ou `.zshrc`:

```bash
alias dev="pnpm dev"
alias build="pnpm build"
alias deploy="./scripts/deploy-check.sh"
```

Depois rode: `source ~/.bashrc` ou `source ~/.zshrc`
