# 🎨 Deploy do Frontend no Render (Static Site)

**Data**: 03/12/2025
**Tipo**: Static Site (GRATUITO)
**Status**: Pronto para deploy

---

## ✅ Configurações Aplicadas

### 1. Next.js Config Atualizado
Arquivo: `apps/web/next.config.js`

```javascript
const nextConfig = {
  output: 'export',           // Gera arquivos estáticos
  images: {
    unoptimized: true,        // Imagens sem otimização (para static)
  },
  trailingSlash: true,        // URLs com /
}
```

### 2. Variável de Ambiente Criada
Arquivo: `apps/web/.env.production`

```
NEXT_PUBLIC_API_URL=https://imobiflow-saas-1.onrender.com
```

### 3. Build Testado Localmente
```bash
npm run build
✓ Build success!
✓ 6 páginas geradas
✓ Pasta /out criada com arquivos estáticos
```

---

## 🚀 Como Fazer Deploy no Render

### Passo 1: Commit e Push

```bash
cd /home/hans/imobiflow

# Adicionar arquivos
git add apps/web/next.config.js
git add apps/web/.env.production
git add apps/web/render.yaml

# Commit
git commit -m "config: prepara frontend para static site no Render

- Configura output export no Next.js
- Adiciona .env.production com URL da API
- Cria render.yaml para static site
- Testa build localmente com sucesso"

# Push
git push origin main
```

### Passo 2: Criar Static Site no Render

1. **Acessar**: https://dashboard.render.com

2. **Clicar em**: "New +" → "Static Site"

3. **Conectar Repositório**:
   - Repositório: `Integrius/imobiflow-saas`
   - Branch: `main`

4. **Configurar**:
   ```
   Name: imobiflow-web
   Branch: main
   Root Directory: apps/web
   Build Command: npm install && npm run build
   Publish Directory: out
   ```

5. **Clicar em**: "Create Static Site"

6. **Aguardar**: 3-5 minutos

---

## 📊 O Que Vai Acontecer

```
1. Render clona o repositório
   └─> Branch: main

2. Entra em apps/web
   └─> Root Directory configurado

3. Executa: npm install
   └─> Instala dependências (React, Next.js, etc)

4. Executa: npm run build
   └─> next build
   └─> Lê .env.production
   └─> NEXT_PUBLIC_API_URL=https://imobiflow-saas-1.onrender.com
   └─> Gera arquivos estáticos em /out

5. Publica pasta /out
   └─> Serve arquivos HTML/CSS/JS via CDN

6. Site fica disponível em:
   └─> https://imobiflow-web.onrender.com
```

---

## 🎯 Como Funciona o Site Deployado

### Quando usuário acessa:

```
1. Browser pede: https://imobiflow-web.onrender.com
   ↓
2. Render CDN retorna: index.html + bundle.js (instantâneo)
   ↓
3. Browser executa React
   ↓
4. React faz: fetch('https://imobiflow-saas-1.onrender.com/api/v1/leads')
   ↓
5. API retorna dados do banco
   ↓
6. React renderiza na tela
```

**Tempo total**: ~500-800ms

---

## 🔧 Configurações do Render

### Build Settings
```
Build Command: npm install && npm run build
Publish Directory: out
Auto-Deploy: Yes
```

### Environment Variables
**Não precisa!**

A variável `NEXT_PUBLIC_API_URL` já está em `.env.production` e é aplicada durante o build.

### Routing
O Render automaticamente redireciona todas as rotas para `index.html` (SPA behavior).

---

## 💰 Custo

**Static Site no Render**: **$0/mês** (GRATUITO)

**Custo Total do Projeto**:
```
API (Web Service):    $7/mês
Database (PostgreSQL): $7/mês
Frontend (Static):     $0/mês
─────────────────────────────
TOTAL:                $14/mês
```

---

## 🌐 URLs Finais

Depois do deploy, você terá:

```
Frontend: https://imobiflow-web.onrender.com
API:      https://imobiflow-saas-1.onrender.com
```

**Arquitetura**:
```
┌──────────────────┐
│  imobiflow-web   │  ← Frontend (Static, Grátis)
│  .onrender.com   │
└────────┬─────────┘
         │ fetch()
         ▼
┌──────────────────┐
│ imobiflow-saas-1 │  ← API ($7/mês)
│  .onrender.com   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   PostgreSQL     │  ← Database ($7/mês)
│   (Render)       │
└──────────────────┘
```

---

## ✅ Checklist de Deploy

Antes de criar o Static Site:

- [x] next.config.js configurado com output: 'export'
- [x] .env.production criado com NEXT_PUBLIC_API_URL
- [x] Build testado localmente (npm run build)
- [x] Pasta /out gerada com sucesso
- [x] render.yaml criado
- [ ] Código commitado e pushed para GitHub
- [ ] Static Site criado no Render Dashboard
- [ ] Deploy concluído com sucesso
- [ ] Site acessível na URL gerada

---

## 🧪 Testes Após Deploy

Quando o deploy terminar:

### 1. Acessar URL
```
https://imobiflow-web.onrender.com
```

Deve mostrar a página inicial.

### 2. Testar Login
```
https://imobiflow-web.onrender.com/login
```

Tentar fazer login (se tiver usuário cadastrado).

### 3. Verificar Chamadas API
Abrir DevTools (F12) → Network → Ver chamadas para:
```
https://imobiflow-saas-1.onrender.com/api/v1/...
```

### 4. Testar Dashboard
```
https://imobiflow-web.onrender.com/dashboard
```

Verificar se carrega dados da API.

---

## 🆘 Troubleshooting

### Erro: Build Failed

**Causa**: Dependências ou erros de TypeScript

**Solução**:
```bash
# Testar build localmente
cd apps/web
npm run build

# Ver erros
# Corrigir
# Commit e push novamente
```

### Erro: Página em branco

**Causa**: JavaScript não carregou ou erro no bundle

**Solução**:
- Abrir DevTools → Console
- Ver erros
- Verificar se arquivos .js estão sendo servidos

### Erro: API não responde

**Causa**: CORS ou URL incorreta

**Solução**:
```bash
# Verificar se API permite origin do frontend
# No backend (apps/api), verificar CORS:

fastify.register(cors, {
  origin: [
    'https://imobiflow-web.onrender.com',
    'http://localhost:3000'
  ]
})
```

### Site carrega mas não mostra dados

**Causa**: Variável de ambiente incorreta

**Solução**:
```bash
# Verificar se .env.production tem URL correta
NEXT_PUBLIC_API_URL=https://imobiflow-saas-1.onrender.com

# Rebuild
npm run build
git add .
git commit -m "fix: corrige URL da API"
git push
```

---

## 🎯 Próximos Passos Após Deploy

### 1. Configurar Domínio Customizado (Opcional)

**No Render**:
- Dashboard → Static Site → Settings → Custom Domain
- Adicionar: `app.seudominio.com.br` ou `seudominio.com.br`

**No DNS**:
```
CNAME: app → imobiflow-web.onrender.com
ou
A: @ → [IP do Render]
```

### 2. Testar Fluxo Completo
- Criar conta (se tiver endpoint)
- Login
- Navegar pelo dashboard
- Criar leads, imóveis, etc
- Verificar isolamento multi-tenant

### 3. Otimizações
- Comprimir imagens
- Lazy loading de componentes
- Code splitting
- Cache de API calls

### 4. Monitoramento
- Google Analytics
- Sentry (error tracking)
- Render Analytics

---

## 📈 Performance Esperada

### Métricas (após deploy):

**Lighthouse Score** (estimado):
```
Performance:  90-95  ⚡ (static é rápido)
Accessibility: 85-90  ✅
Best Practices: 90-95 ✅
SEO: 60-70  ⚠️ (SPA tem SEO limitado)
```

**Load Times**:
```
First Contentful Paint: 0.5-1s
Time to Interactive: 1-2s
Total Load: 1.5-3s
```

**Bandwidth**:
```
HTML: ~5 KB
CSS: ~50 KB
JS: ~110 KB (First Load)
Imagens: Variável

Total (primeira visita): ~165 KB
Total (visitas seguintes): ~5 KB (cache)
```

---

## 🎊 Conclusão

Seu frontend está pronto para deploy como **Static Site gratuito no Render**!

**Vantagens conquistadas**:
✅ Custo zero ($0/mês)
✅ Performance excelente
✅ Deploy automático via Git
✅ CDN incluso
✅ SSL/HTTPS gratuito
✅ Mesma plataforma da API

**Próximo comando**:
```bash
git add . && git commit -m "config: frontend para static site" && git push
```

Depois, criar Static Site no Render Dashboard! 🚀

---

**Criado em**: 03/12/2025
**Status**: Pronto para deploy ✅
**Tipo**: Static Site (gratuito)
