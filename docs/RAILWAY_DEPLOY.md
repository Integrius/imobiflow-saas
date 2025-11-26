# Deploy do Backend na Railway

Guia completo para fazer o deploy do backend (API) do ImobiFlow na Railway.

## Por que Railway?

- ✅ **PostgreSQL incluído** - Banco de dados gerenciado
- ✅ **Deploy automático via GitHub** - Push e deploy
- ✅ **Gratuito para começar** - $5 de crédito grátis mensalmente
- ✅ **Configuração simples** - Poucos cliques
- ✅ **SSL automático** - HTTPS configurado automaticamente

## Passo 1: Criar Conta na Railway

1. Acesse: https://railway.app/
2. Clique em **"Start a New Project"** ou **"Login with GitHub"**
3. Autorize o Railway a acessar seu GitHub
4. Confirme seu email (se necessário)

## Passo 2: Criar Novo Projeto

1. No dashboard da Railway, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório: **`imobiflow`**
4. Railway vai detectar automaticamente o monorepo

## Passo 3: Configurar o Serviço da API

Como é um monorepo, você precisa configurar o caminho correto:

1. Depois que o projeto for criado, clique no serviço
2. Vá em **"Settings"**
3. Configure os seguintes campos:

### Root Directory
```
apps/api
```

### Build Command (opcional)
```
pnpm install && pnpm run build
```

### Start Command
```
pnpm run start
```

## Passo 4: Adicionar PostgreSQL

1. No mesmo projeto, clique em **"New"**
2. Selecione **"Database"**
3. Escolha **"Add PostgreSQL"**
4. Railway vai criar o banco automaticamente

## Passo 5: Configurar Variáveis de Ambiente

1. Clique no serviço da API
2. Vá na aba **"Variables"**
3. Adicione as seguintes variáveis:

### Variáveis Obrigatórias:

```bash
# Conexão com o banco (Railway fornece automaticamente)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT
JWT_SECRET=seu-secret-super-seguro-mude-em-producao-2024-PRODUCTION
JWT_EXPIRES_IN=7d

# Ambiente
NODE_ENV=production
PORT=3333

# Redis (opcional por enquanto)
REDIS_URL=

# Email (configurar depois)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@imobiflow.com
```

**IMPORTANTE:**
- Para `DATABASE_URL`, clique em **"Reference"** e selecione `Postgres.DATABASE_URL`
- Isso vincula automaticamente ao banco PostgreSQL
- Altere o `JWT_SECRET` para um valor seguro em produção

## Passo 6: Executar Migrações do Prisma

Railway não executa migrations automaticamente. Você tem 2 opções:

### Opção A: Via Railway CLI (Recomendado)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Fazer login
railway login

# Vincular ao projeto
railway link

# Executar migrations
railway run npx prisma migrate deploy
```

### Opção B: Adicionar ao Build Command

Edite o **Build Command** para incluir as migrations:

```bash
pnpm install && npx prisma generate && npx prisma migrate deploy && pnpm run build
```

**Atenção:** Esta opção executa migrations em CADA deploy, o que pode causar problemas.

## Passo 7: Deploy!

1. Clique em **"Deploy"** ou faça um push no GitHub
2. Railway vai:
   - Clonar o repositório
   - Instalar dependências
   - Gerar o Prisma Client
   - Executar migrations (se configurado)
   - Fazer o build
   - Iniciar o servidor
3. Aguarde o deploy (2-5 minutos)

## Passo 8: Obter a URL da API

1. Após o deploy, vá em **"Settings"**
2. Clique em **"Generate Domain"**
3. Railway vai gerar uma URL tipo: `https://seu-projeto.up.railway.app`
4. **Copie esta URL** - você vai precisar dela para configurar o frontend

## Passo 9: Testar a API

Teste se a API está funcionando:

```bash
# Teste de health check (se você tiver um endpoint)
curl https://seu-projeto.up.railway.app/health

# Ou teste um endpoint público
curl https://seu-projeto.up.railway.app/
```

## Passo 10: Configurar Frontend na Vercel

Agora você precisa configurar o frontend para usar a API em produção:

1. Acesse: https://vercel.com/
2. Vá no projeto **imobiflow**
3. Clique em **"Settings"** → **"Environment Variables"**
4. Adicione ou edite:
   - **Variable name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://seu-projeto.up.railway.app`
   - **Environments:** Marque **Production**
5. Clique em **"Save"**
6. Faça um **Redeploy** do frontend

## Estrutura Final

```
┌─────────────────────────────────────┐
│   Frontend (Vercel)                 │
│   https://imobiflow.vercel.app      │
└────────────────┬────────────────────┘
                 │ API calls
                 ▼
┌─────────────────────────────────────┐
│   Backend (Railway)                 │
│   https://seu-projeto.railway.app   │
└────────────────┬────────────────────┘
                 │ SQL queries
                 ▼
┌─────────────────────────────────────┐
│   PostgreSQL (Railway)              │
│   Managed Database                  │
└─────────────────────────────────────┘
```

## Deploy Automático

Após a configuração inicial, **cada push no GitHub** vai disparar um deploy automático na Railway! 🚀

## Monitoramento e Logs

### Ver Logs em Tempo Real

1. No dashboard da Railway, clique no serviço
2. Vá na aba **"Logs"**
3. Você verá os logs em tempo real

### Métricas

1. Vá na aba **"Metrics"**
2. Veja CPU, memória, network

## Troubleshooting

### Erro: "Module not found: @prisma/client"

**Solução:** Adicione ao Build Command:
```bash
pnpm install && npx prisma generate && pnpm run build
```

### Erro: "Cannot connect to database"

**Solução:**
1. Verifique se o PostgreSQL está provisionado
2. Confirme que `DATABASE_URL` está como `${{Postgres.DATABASE_URL}}`
3. Reinicie o serviço

### Erro: "Tables don't exist"

**Solução:** Execute as migrations:
```bash
railway run npx prisma migrate deploy
```

### API retorna 502 Bad Gateway

**Solução:**
1. Verifique os logs
2. Confirme que a `PORT` está configurada corretamente
3. Verifique se o servidor está iniciando (procure por "Server running" nos logs)

### Migrations falhando

**Solução:**
1. Verifique se o banco está acessível
2. Confirme que o schema Prisma está correto
3. Tente executar manualmente via Railway CLI

## Custos

Railway oferece:
- **$5 de crédito grátis por mês**
- Depois: ~$5-10/mês dependendo do uso
- PostgreSQL: incluído no custo

## Próximos Passos

1. ✅ Deploy da API
2. ✅ Configurar variável no frontend
3. ⏭️ Testar sistema completo
4. ⏭️ Configurar domínio customizado (opcional)
5. ⏭️ Configurar CI/CD (já configurado com GitHub)
6. ⏭️ Adicionar monitoring (Sentry, etc)

## Links Úteis

- Dashboard Railway: https://railway.app/dashboard
- Documentação: https://docs.railway.app/
- Status: https://railway.app/status
- Suporte: https://help.railway.app/

---

**Pronto!** Seu backend está em produção! 🎉
