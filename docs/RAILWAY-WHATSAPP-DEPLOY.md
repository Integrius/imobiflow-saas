# 🚂 Deploy Backend WhatsApp no Railway

**Data**: 2025-12-20
**Objetivo**: Rodar backend com WhatsApp no Railway (melhor que Render para Puppeteer)

---

## 🎯 Por Que Railway?

| Aspecto | Railway | Render |
|---------|---------|--------|
| **Puppeteer/Chromium** | ✅ Suportado | ❌ Limitado |
| **Filesystem** | ✅ Persistente | ❌ Efêmero |
| **RAM** | ✅ 8GB (Hobby) | ❌ 512MB (Free) |
| **WhatsApp Session** | ✅ Mantém | ❌ Perde ao redeploy |
| **Custo** | $5/mês crédito grátis | Grátis limitado |

---

## 📋 Passo a Passo

### **1. Criar Conta no Railway**

1. Acesse: https://railway.app/
2. Clique em **"Start a New Project"**
3. Faça login com **GitHub**
4. Autorize Railway a acessar seus repositórios

### **2. Criar Novo Projeto**

1. No Railway Dashboard, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório: `Integrius/imobiflow-saas`
4. Clique em **"Deploy Now"**

### **3. Configurar Variáveis de Ambiente**

No projeto criado, vá em **Variables** e adicione:

#### **Banco de Dados** (Use o mesmo do Render):
```bash
DATABASE_URL=postgresql://imobiflow:TSDnj5HyoG41xF8hQCF56xkGxUSHqj8o@dpg-d4kgd33e5dus73f7b480-a.ohio-postgres.render.com/imobiflow
```

#### **JWT**:
```bash
JWT_SECRET=seu_jwt_secret_aqui
```

#### **Cloudinary**:
```bash
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

#### **IA (Anthropic)**:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

#### **IA (OpenAI)** - Opcional:
```bash
OPENAI_API_KEY=sk-...
```

#### **Configurações de IA**:
```bash
AI_ENABLED=true
AI_AUTO_RESPOND=true
AI_FALLBACK_TO_OPENAI=false
AI_MAX_COST_PER_DAY=10.00
```

#### **WhatsApp**:
```bash
WHATSAPP_SESSION_PATH=/app/whatsapp-session
```

#### **Puppeteer** (Importante!):
```bash
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

#### **Porta**:
```bash
PORT=3333
```

### **4. Configurar Build Settings**

No Railway, vá em **Settings**:

#### **Build Command**:
```bash
cd apps/api && pnpm install && pnpm run build
```

#### **Start Command**:
```bash
cd apps/api && bash railway-start.sh
```

#### **Watch Paths** (opcional):
```
apps/api/**
```

### **5. Adicionar Nixpacks para Chromium**

O Railway já detectará o arquivo `nixpacks.toml` automaticamente e instalará Chromium.

### **6. Deploy**

1. Clique em **"Deploy"**
2. Aguarde o build completar (~3-5 minutos)
3. Railway vai gerar uma URL: `https://imobiflow-production.up.railway.app`

---

## 🧪 Testar Deployment

### **1. Health Check**

```bash
curl https://imobiflow-production.up.railway.app/health
```

**Esperado**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-20T...",
  "service": "ImobiFlow API",
  "version": "1.0.0"
}
```

### **2. Login**

```bash
curl -X POST https://imobiflow-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@imobiflow.com","senha":"Admin@123"}'
```

### **3. Inicializar WhatsApp**

```bash
export TOKEN="seu_token_aqui"

curl -X POST https://imobiflow-production.up.railway.app/api/v1/whatsapp/initialize \
  -H "Authorization: Bearer $TOKEN"
```

### **4. Obter QR Code**

```bash
curl https://imobiflow-production.up.railway.app/api/v1/whatsapp/qr \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada**:
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KG..."
  }
}
```

### **5. Converter QR Code para Imagem**

1. Copie o código `data:image/png;base64,...`
2. Acesse: https://codebeautify.org/base64-to-image-converter
3. Cole o código
4. Visualize a imagem do QR Code
5. Escaneie com WhatsApp do celular

---

## 📱 Escanear QR Code

1. Abra **WhatsApp** no celular
2. Vá em **Menu** (⋮) → **Aparelhos conectados**
3. Clique em **"Conectar um aparelho"**
4. Aponte a câmera para o QR Code na tela
5. Aguarde conectar (~5-10 segundos)

---

## ✅ Verificar Conexão

```bash
curl https://imobiflow-production.up.railway.app/api/v1/whatsapp/status \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado após conectar**:
```json
{
  "success": true,
  "data": {
    "isReady": true,  ← CONECTADO!
    "queueLength": 0,
    "messagesSentLastHour": 0,
    "maxMessagesPerHour": 50,
    "isWorkingHours": true
  }
}
```

---

## 🔧 Configurar Domínio Customizado (Opcional)

### No Railway:

1. Vá em **Settings** → **Domains**
2. Clique em **"Custom Domain"**
3. Digite: `api-whatsapp.integrius.com.br`
4. Railway vai mostrar o CNAME necessário

### No Cloudflare:

```
Type: CNAME
Name: api-whatsapp
Target: [railway-provided-cname]
Proxy: DNS only (cinza)
```

---

## 📊 Arquitetura Final

```
Frontend (Render)
  ↓
https://integrius.com.br
  ↓
┌─────────────────────────────────┐
│  Cloudflare DNS                 │
├─────────────────────────────────┤
│  api.integrius.com.br           │ → Render (API sem WhatsApp)
│  api-whatsapp.integrius.com.br  │ → Railway (API com WhatsApp)
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│  PostgreSQL (Render)            │
│  Compartilhado por ambos        │
└─────────────────────────────────┘
```

**Ou configuração mais simples**:

```
Frontend (Render) → https://integrius.com.br
Backend + WhatsApp (Railway) → https://api.integrius.com.br
PostgreSQL (Render) → Banco compartilhado
```

---

## 💰 Custos Estimados

### **Railway** (Hobby Plan):
- **Grátis**: $5 crédito/mês
- **Uso estimado**: ~$3-4/mês (backend leve)
- **Sobra**: ~$1-2/mês de crédito

### **Total Mensal**:
- Railway: ~$0 (dentro do crédito)
- Render (PostgreSQL + Frontend): Grátis
- **Total**: $0/mês inicialmente

Quando o crédito acabar (~2º mês):
- Railway Hobby: $5/mês (fixo, sem surpresas)

---

## 🚨 Troubleshooting

### **Erro: Chromium not found**

**Solução**: Verificar se `nixpacks.toml` está no root do projeto e tem:
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "pnpm", "chromium"]
```

### **Erro: WhatsApp não conecta**

**Verificar logs**:
1. Railway Dashboard → Logs
2. Procurar por:
   - "QR Code gerado"
   - "WhatsApp conectado"
   - Erros de Puppeteer

### **Erro: Session perdida após redeploy**

**Solução**: Railway tem volumes persistentes. Configurar:
1. Settings → Volumes
2. Mount path: `/app/whatsapp-session`

---

## 📚 Próximos Passos

Após Railway configurado:

1. ✅ Testar WhatsApp conectado
2. ✅ Enviar mensagem teste
3. ✅ Verificar Sofia respondendo automaticamente
4. ✅ Atualizar frontend para usar nova API URL (se necessário)
5. ✅ Monitorar logs e performance

---

## 🔗 Links Úteis

- **Railway Dashboard**: https://railway.app/dashboard
- **Railway Docs**: https://docs.railway.app/
- **Nixpacks Docs**: https://nixpacks.com/
- **WhatsApp Web.js**: https://wwebjs.dev/

---

**Status**: 📝 Aguardando configuração
**Plataforma**: Railway (Backend + WhatsApp)
**Última Atualização**: 2025-12-20
