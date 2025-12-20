# 🌐 Configurar Domínio Customizado no Render

**Domínio**: `integrius.com.br`
**Plataforma**: Render
**Serviços**: Frontend (Web) + Backend (API)

---

## 📋 ARQUITETURA ATUAL

### Backend (API):
- **URL Atual**: `https://imobiflow-saas-1.onrender.com`
- **Tipo**: Web Service (Fastify)
- **Porta**: 3333

### Frontend (Web):
- **URL Atual**: `https://imobiflow-web.onrender.com` (ou similar)
- **Tipo**: Static Site (Next.js)
- **Framework**: Next.js 16

---

## 🎯 OBJETIVO

Configurar:
- **Frontend**: `https://integrius.com.br` (landing page + dashboard)
- **Backend**: `https://api.integrius.com.br` (endpoints REST)

Ou alternativamente:
- **Frontend**: `https://integrius.com.br`
- **Backend**: `https://integrius.com.br/api/*` (proxy)

---

## 🚀 OPÇÃO 1: DOMÍNIOS SEPARADOS (RECOMENDADO)

### Vantagens:
- ✅ Separação clara frontend/backend
- ✅ Escalabilidade
- ✅ Melhor organização

### Configuração:

#### Frontend: `integrius.com.br`
#### Backend: `api.integrius.com.br`

---

## 📝 PASSO A PASSO - RENDER

### 1. Acessar Render Dashboard

1. Acesse: https://dashboard.render.com/
2. Faça login
3. Você verá seus serviços:
   - `imobiflow-saas-1` (Backend API)
   - `imobiflow-web` ou similar (Frontend)

---

### 2. Configurar Domínio no Frontend

#### 2.1 Abrir Serviço Frontend

1. Click no serviço do **Frontend** (Next.js)
2. Vá em **Settings**
3. Role até **Custom Domains**

#### 2.2 Adicionar Domínio Principal

1. Click em **Add Custom Domain**
2. Digite: `integrius.com.br`
3. Click **Save**

**O Render vai mostrar os registros DNS necessários:**

```
Type: CNAME
Name: integrius.com.br
Value: [seu-servico].onrender.com
```

OU (se for domínio apex):

```
Type: A
Name: @
Value: [IP do Render]
```

**E também para WWW:**

```
Type: CNAME
Name: www
Value: [seu-servico].onrender.com
```

---

### 3. Configurar Domínio no Backend (API)

#### 3.1 Abrir Serviço Backend

1. Click no serviço `imobiflow-saas-1` (Backend)
2. Vá em **Settings**
3. Role até **Custom Domains**

#### 3.2 Adicionar Subdomínio API

1. Click em **Add Custom Domain**
2. Digite: `api.integrius.com.br`
3. Click **Save**

**Registro DNS necessário:**

```
Type: CNAME
Name: api
Value: imobiflow-saas-1.onrender.com
```

---

### 4. Configurar DNS no Registro.br

#### 4.1 Acessar Registro.br

1. Acesse: https://registro.br/
2. Login > **Meus Domínios**
3. Selecione `integrius.com.br`
4. Click **Editar Zona DNS**

#### 4.2 Adicionar Registros

**Para o Frontend (apex + www):**

```
Tipo: CNAME
Host: @
Dados: [seu-servico-frontend].onrender.com
TTL: 3600
```

```
Tipo: CNAME
Host: www
Dados: [seu-servico-frontend].onrender.com
TTL: 3600
```

**Para o Backend (API):**

```
Tipo: CNAME
Host: api
Dados: imobiflow-saas-1.onrender.com
TTL: 3600
```

**NOTA**: Registro.br pode não aceitar CNAME no apex (`@`). Nesse caso:

**Use registro A** (o Render fornece o IP):
```
Tipo: A
Host: @
Dados: [IP fornecido pelo Render]
TTL: 3600
```

---

### 5. Verificar no Render Dashboard

Após adicionar os registros DNS:

1. Volte ao Render Dashboard
2. Em cada serviço, vá em **Settings** > **Custom Domains**
3. Aguarde o status mudar para:
   - ✅ **Verified** (verde)

**Tempo de verificação**: 5-30 minutos

---

## 🔒 SSL AUTOMÁTICO

O Render configura SSL automaticamente via Let's Encrypt:

1. Após domínio verificado, aguarde ~5 minutos
2. Render gera certificado SSL automaticamente
3. Status: ✅ **SSL Certificate Issued**

**Teste**:
```bash
curl -I https://integrius.com.br
curl -I https://api.integrius.com.br
```

---

## 🔧 ATUALIZAR CONFIGURAÇÃO DO FRONTEND

Após configurar os domínios, atualize as variáveis de ambiente:

### No serviço Frontend (Render):

1. Settings > Environment
2. Adicione/atualize:

```bash
NEXT_PUBLIC_API_URL=https://api.integrius.com.br
```

3. **Trigger Manual Deploy** para aplicar mudanças

---

## 🎯 RESULTADO FINAL

Após configuração completa:

### URLs Funcionais:

**Frontend**:
- ✅ `https://integrius.com.br` (landing page)
- ✅ `https://www.integrius.com.br` (mesmo que acima)
- ✅ `https://integrius.com.br/dashboard`
- ✅ `https://integrius.com.br/login`

**Backend API**:
- ✅ `https://api.integrius.com.br/health`
- ✅ `https://api.integrius.com.br/api/v1/auth/login`
- ✅ `https://api.integrius.com.br/api/v1/ai/stats`
- ✅ `https://api.integrius.com.br/api/v1/whatsapp/status`

---

## 🧪 TESTAR CONFIGURAÇÃO

### 1. DNS Propagado?

```bash
# Verificar frontend
dig integrius.com.br

# Verificar backend
dig api.integrius.com.br

# Ou use online:
https://dnschecker.org/
```

### 2. Frontend Acessível?

```bash
curl -I https://integrius.com.br
```

**Esperado**:
```
HTTP/2 200
server: Render
```

### 3. Backend API Acessível?

```bash
curl https://api.integrius.com.br/health
```

**Esperado**:
```json
{
  "status": "ok",
  "service": "ImobiFlow API"
}
```

### 4. SSL Funcionando?

Abra no navegador:
- `https://integrius.com.br` → ✅ Cadeado verde
- `https://api.integrius.com.br/health` → ✅ Cadeado verde

---

## 🔄 OPÇÃO 2: TUDO NO MESMO DOMÍNIO

Se preferir ter tudo em `integrius.com.br`:

### Frontend: `integrius.com.br`
### Backend: `integrius.com.br/api/*` (via proxy)

**Neste caso:**

1. Configure apenas o frontend no Render
2. Use proxy reverso no Next.js (já configurado via `vercel.json`)
3. Atualize `next.config.js` para fazer rewrites:

```javascript
// apps/web/next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://imobiflow-saas-1.onrender.com/api/:path*'
      }
    ]
  }
}
```

**URLs finais**:
- Frontend: `https://integrius.com.br`
- API: `https://integrius.com.br/api/v1/*` (proxy para Render)

---

## ⚠️ TROUBLESHOOTING

### Erro: "Domain verification failed"

**Causa**: Registros DNS não propagaram

**Solução**:
1. Verifique registros no Registro.br
2. Aguarde 30 minutos
3. Click em **Verify** novamente no Render

---

### Erro: "CNAME not allowed on apex domain"

**Causa**: Registro.br não aceita CNAME em `@`

**Solução**:
1. Use registro **A** em vez de CNAME
2. O Render fornece o IP ao adicionar domínio
3. Exemplo: `A @ 216.24.57.1`

---

### SSL não funciona

**Causa**: Certificado ainda não foi gerado

**Solução**:
1. Aguarde 10 minutos após domínio verificado
2. Settings > Custom Domains > Renew Certificate
3. Limpe cache do navegador

---

### API não responde em `api.integrius.com.br`

**Causa**: DNS não propagou ou CNAME incorreto

**Solução**:
```bash
dig api.integrius.com.br

# Deve retornar: imobiflow-saas-1.onrender.com
```

Se não retornar, verifique registro CNAME no Registro.br

---

## 📊 CHECKLIST COMPLETO

### Render Dashboard:
- [ ] Serviço Frontend identificado
- [ ] Domínio adicionado: `integrius.com.br`
- [ ] Domínio adicionado: `www.integrius.com.br`
- [ ] Domínio adicionado no Backend: `api.integrius.com.br`
- [ ] Status: Verified ✅

### DNS (Registro.br):
- [ ] CNAME/A para `@` ou `integrius.com.br`
- [ ] CNAME para `www`
- [ ] CNAME para `api`
- [ ] DNS propagado (verificado com `dig`)

### SSL:
- [ ] Certificado SSL emitido (Frontend)
- [ ] Certificado SSL emitido (Backend)
- [ ] HTTPS funciona sem erros
- [ ] Cadeado verde no navegador

### Variáveis de Ambiente:
- [ ] `NEXT_PUBLIC_API_URL` atualizado no Frontend
- [ ] Deploy triggered após mudança

### Testes:
- [ ] `https://integrius.com.br` carrega
- [ ] `https://www.integrius.com.br` funciona
- [ ] `https://api.integrius.com.br/health` responde
- [ ] Login funciona
- [ ] Dashboard acessível

---

## 🎯 RESUMO RÁPIDO

### No Render:
1. Frontend → Add Domain → `integrius.com.br`
2. Backend → Add Domain → `api.integrius.com.br`

### No Registro.br:
```
CNAME www        [frontend].onrender.com
CNAME api        imobiflow-saas-1.onrender.com
A     @          [IP do Render]
```

### Aguardar:
- DNS: ~30 minutos
- SSL: ~5 minutos após DNS

### Testar:
```bash
curl https://integrius.com.br
curl https://api.integrius.com.br/health
```

---

## 🔗 LINKS ÚTEIS

- **Render Dashboard**: https://dashboard.render.com/
- **Registro.br**: https://registro.br/
- **DNS Checker**: https://dnschecker.org/
- **Render Docs (Custom Domains)**: https://render.com/docs/custom-domains

---

**Status**: ⏳ Aguardando configuração
**Última Atualização**: 2025-12-20
**Plataforma**: RENDER (não Vercel!)
