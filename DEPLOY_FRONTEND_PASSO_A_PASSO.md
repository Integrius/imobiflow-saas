# 🚀 Deploy Frontend - Passo a Passo Rápido

**⏱️ Tempo estimado**: 5 minutos

---

## ✅ Preparação (CONCLUÍDA)

- [x] Next.js configurado para static export
- [x] Variável de ambiente criada (.env.production)
- [x] Build testado localmente (sucesso!)
- [x] Código commitado e pushed para GitHub
- [x] CORS configurado na API

---

## 🎯 Agora: Criar Static Site no Render

### 1. Acessar Render Dashboard
```
https://dashboard.render.com
```

### 2. Criar Novo Static Site
- Clicar em: **"New +"**
- Selecionar: **"Static Site"**

### 3. Conectar Repositório
- **Repository**: `Integrius/imobiflow-saas`
- **Branch**: `main`

### 4. Configurações

Preencher exatamente assim:

```
Name: imobiflow-web

Branch: main

Root Directory: apps/web

Build Command: npm install && npm run build

Publish Directory: out
```

### 5. Criar
- Clicar em: **"Create Static Site"**
- Aguardar: 3-5 minutos

---

## ✅ Resultado Esperado

Quando terminar, você verá:

```
✅ Build succeeded
✅ Site is live at: https://imobiflow-web.onrender.com
```

---

## 🧪 Testar

Abrir no navegador:
```
https://imobiflow-web.onrender.com
```

Deve mostrar sua aplicação!

---

## 💰 Custo

**Static Site**: $0/mês (GRATUITO!)

**Custo Total**:
- API: $7/mês
- Database: $7/mês
- Frontend: **$0/mês**
- **Total: $14/mês**

---

## 🎉 Pronto!

Quando o deploy terminar, você terá:

✅ Frontend no ar (gratuito)
✅ API no ar ($7/mês)
✅ Database conectado ($7/mês)
✅ Tudo funcionando!

**Arquitetura Final**:
```
Frontend (gratuito) → API ($7) → Database ($7)
```

---

**Documentação completa**: [DEPLOY_FRONTEND_RENDER.md](DEPLOY_FRONTEND_RENDER.md)
