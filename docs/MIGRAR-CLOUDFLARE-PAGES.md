# 🚀 Migração Frontend para Cloudflare Pages - Guia Completo

**Objetivo**: Migrar frontend do Render para Cloudflare Pages
**Tempo estimado**: 20 minutos
**Economia**: $7/mês (~R$42/mês)

---

## 📋 Pré-requisitos

- [ ] Conta no Cloudflare (https://cloudflare.com)
- [ ] Acesso ao repositório GitHub
- [ ] Acesso ao dashboard do Render (para suspender serviço depois)

---

## 🎯 Passo 1: Criar Projeto no Cloudflare Pages (10 minutos)

### 1.1 Acesse Cloudflare Dashboard

1. Acesse: https://dash.cloudflare.com
2. Faça login
3. No menu lateral, click em **"Workers & Pages"**
4. Click em **"Create application"**
5. Selecione a aba **"Pages"**
6. Click em **"Connect to Git"**

### 1.2 Conectar Repositório GitHub

1. Click em **"Connect GitHub"** (ou GitLab/etc)
2. Autorize Cloudflare a acessar sua conta GitHub
3. Selecione o repositório: **`Integrius/imobiflow-saas`** (ou o nome correto)
4. Click em **"Begin setup"**

### 1.3 Configurar Build

Preencha os campos:

**Project name**: `imobiflow-frontend` (ou nome que preferir)

**Production branch**: `main`

**Build command**:
```bash
cd apps/web && npm install && npm run build
```

**Build output directory**:
```
apps/web/.next
```

**Root directory**: deixe vazio (ou `/`)

**Framework preset**: Selecione **"Next.js"**

### 1.4 Configurar Variáveis de Ambiente

Ainda na mesma página, role para baixo até **"Environment variables"**

Click em **"Add variable"**:

| Variable name | Value |
|---------------|-------|
| `NEXT_PUBLIC_API_URL` | `https://imobiflow-saas-1.onrender.com` |
| `NODE_VERSION` | `18` |

**Importante**: Marque como **"Production"** e **"Preview"**

### 1.5 Finalizar Criação

1. Click em **"Save and Deploy"**
2. Aguarde o build (3-5 minutos)
3. Você verá logs em tempo real

---

## 🎯 Passo 2: Configurar Domínio Customizado (5 minutos)

### 2.1 Aguardar Deploy Inicial

1. Aguarde até ver: **"Success! Your site is live!"**
2. Cloudflare vai gerar uma URL temporária como:
   - `imobiflow-frontend.pages.dev`
3. **TESTE ESSA URL PRIMEIRO** antes de configurar domínio

### 2.2 Adicionar Domínio Customizado

1. Na página do projeto, click em **"Custom domains"**
2. Click em **"Set up a custom domain"**
3. Digite: `vivoly.integrius.com.br`
4. Click em **"Continue"**

### 2.3 Configurar DNS

**Opção A: Se o domínio JÁ está no Cloudflare (Recomendado)**

1. Cloudflare detectará automaticamente
2. Perguntará: "Activate domain?"
3. Click em **"Activate domain"**
4. Cloudflare configurará automaticamente
5. Aguarde 1-2 minutos para propagação

**Opção B: Se o domínio NÃO está no Cloudflare**

1. Cloudflare mostrará um CNAME record
2. Copie o valor (algo como `imobiflow-frontend.pages.dev`)
3. Vá no seu provedor de DNS atual
4. Adicione um CNAME:
   - Name: `vivoly` (ou `@` para raiz)
   - Value: `imobiflow-frontend.pages.dev`
   - TTL: 3600
5. Aguarde propagação (pode levar até 24h, mas geralmente 5-10 min)

---

## 🎯 Passo 3: Configurar Google OAuth (5 minutos)

### 3.1 Adicionar URLs no Google Cloud Console

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Localize: `101518980847-9n7uovmjc8g561vmqormir1931og01ue.apps.googleusercontent.com`
3. Click para editar

### 3.2 Adicionar Origins

Em **"Authorized JavaScript origins"**, adicione:
```
https://vivoly.integrius.com.br
https://imobiflow-frontend.pages.dev
```

### 3.3 Adicionar Redirect URIs

Em **"Authorized redirect URIs"**, adicione:
```
https://vivoly.integrius.com.br/login
https://imobiflow-frontend.pages.dev/login
```

### 3.4 Salvar

1. Click em **"SAVE"**
2. Aguarde 1 minuto para propagação

---

## 🎯 Passo 4: Testar (5 minutos)

### 4.1 Testar URL Temporária

1. Acesse: `https://imobiflow-frontend.pages.dev/login`
2. Tente login com:
   - Email: `admin@imobiflow.com`
   - Senha: `Admin@123`
3. **Deve funcionar!**

### 4.2 Testar Domínio Customizado

1. Acesse: `https://vivoly.integrius.com.br/login`
2. Tente login novamente
3. **Deve funcionar!**

### 4.3 Testar Google OAuth

1. Click em "Continuar com Google"
2. **Não deve** dar erro 400
3. Deve abrir popup do Google
4. Deve fazer login

---

## 🎯 Passo 5: Suspender Frontend no Render (2 minutos)

**APENAS DEPOIS** de confirmar que Cloudflare Pages está funcionando:

1. Acesse: https://dashboard.render.com
2. Localize serviço **frontend** (não a API!)
3. Settings → Suspend Service
4. Confirme

**Economia**: $7/mês

---

## 🎯 Passo 6: Atualizar Documentação (Opcional)

Já está feito! Os arquivos foram atualizados para refletir Cloudflare Pages.

---

## 📊 Arquitetura Final

```
┌─────────────────────────────────────┐
│  Cloudflare Pages (Frontend)        │
│  vivoly.integrius.com.br            │
│  Custo: $0/mês                      │
└──────────────┬──────────────────────┘
               │
               │ HTTPS
               ▼
┌─────────────────────────────────────┐
│  Render (Backend API)               │
│  imobiflow-saas-1.onrender.com      │
│  Custo: $7/mês                      │
└──────────────┬──────────────────────┘
               │
               │ Private Network
               ▼
┌─────────────────────────────────────┐
│  Render PostgreSQL (Database)       │
│  Custo: $7/mês                      │
└─────────────────────────────────────┘

CUSTO TOTAL: $14/mês (era $21/mês)
ECONOMIA: $7/mês = $84/ano
```

---

## 🔧 Troubleshooting

### Build Falha no Cloudflare

**Erro**: `Command not found: pnpm`

**Solução**: Use npm em vez de pnpm no build command:
```bash
cd apps/web && npm install && npm run build
```

### Build Falha: "Module not found"

**Solução**: Adicione variável de ambiente:
- `NPM_FLAGS` = `--legacy-peer-deps`

### Site mostra "404 Not Found"

**Solução**: Verifique o "Build output directory":
- Deve ser: `apps/web/.next` ou `.next` (dependendo do root)

### Google OAuth continua dando erro 400

**Solução**:
1. Confirme que adicionou URLs corretas
2. Aguarde 2-3 minutos (cache do Google)
3. Limpe cache do navegador
4. Teste em modo anônimo

### DNS não propaga

**Solução**:
```bash
# Teste DNS
nslookup vivoly.integrius.com.br

# Deve mostrar IPs do Cloudflare:
# 104.21.x.x ou 172.67.x.x
```

Se não mostrar, aguarde mais 5-10 minutos.

---

## 📞 Suporte

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages
- **Cloudflare Status**: https://www.cloudflarestatus.com
- **Next.js + Cloudflare**: https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site

---

## ✅ Checklist Final

- [ ] Projeto criado no Cloudflare Pages
- [ ] Build passou com sucesso
- [ ] URL temporária (.pages.dev) funciona
- [ ] Domínio customizado configurado
- [ ] DNS propagou
- [ ] vivoly.integrius.com.br funciona
- [ ] Login com senha funciona
- [ ] Google OAuth funciona
- [ ] Frontend do Render foi suspenso
- [ ] Economia de $7/mês confirmada

---

**Última atualização**: 2025-12-19

**Próximos passos após migração**:
1. ✅ Implementar Dashboard de BI
2. ✅ Configurar CI/CD avançado
3. ✅ Implementar análise de IA
