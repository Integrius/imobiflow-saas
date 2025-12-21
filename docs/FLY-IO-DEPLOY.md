# 🚀 Deploy Backend WhatsApp no Fly.io

**Data**: 2025-12-21
**Objetivo**: Deploy do backend com WhatsApp no Fly.io com Chromium funcionando

---

## 🎯 Por Que Fly.io?

| Aspecto | Fly.io | Render |
|---------|--------|--------|
| **Chromium/Puppeteer** | ✅ Suporte completo | ❌ Limitado no plano grátis |
| **Dockerfile** | ✅ Docker completo | ❌ Limitações no Starter |
| **RAM** | 512MB (grátis) | 512MB (grátis) |
| **Volumes Persistentes** | ✅ 3GB grátis | ❌ Efêmero |
| **WhatsApp Session** | ✅ Mantém sempre | ❌ Perde ao redeploy |
| **Região Brasil** | ✅ São Paulo (GRU) | ✅ Ohio |

---

## 📋 Passo a Passo

### **1. Instalar Fly CLI**

```bash
# Linux/WSL
curl -L https://fly.io/install.sh | sh

# Adicionar ao PATH (adicione ao ~/.bashrc também)
export FLYCTL_INSTALL="/home/hans/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

# Verificar instalação
flyctl version
```

### **2. Criar Conta no Fly.io**

```bash
# Login (vai abrir navegador)
flyctl auth login
```

**No navegador**:
1. Clique em **"Sign up with GitHub"**
2. Autorize Fly.io
3. **Não precisa adicionar cartão de crédito para começar!**

### **3. Criar Aplicação**

```bash
cd /home/hans/imobiflow

# Criar app (NÃO precisa rodar launch, já temos fly.toml!)
flyctl apps create imobiflow-api --org personal
```

### **4. Criar Volume Persistente para WhatsApp**

```bash
# Criar volume de 1GB para sessão do WhatsApp
flyctl volumes create whatsapp_data --region gru --size 1
```

**Resposta esperada**:
```
        ID: vol_xxxxx
      Name: whatsapp_data
       App: imobiflow-api
    Region: gru
      Zone: xxx
   Size GB: 1
 Encrypted: true
Created at: 2025-12-21...
```

### **5. Configurar Secrets (Variáveis Sensíveis)**

```bash
# DATABASE_URL
flyctl secrets set DATABASE_URL="postgresql://imobiflow:TSDnj5HyoG41xF8hQCF56xkGxUSHqj8o@dpg-d4kgd33e5dus73f7b480-a.ohio-postgres.render.com/imobiflow"

# JWT_SECRET
flyctl secrets set JWT_SECRET="seu_jwt_secret_aqui"

# Cloudinary
flyctl secrets set CLOUDINARY_CLOUD_NAME="seu_cloud_name"
flyctl secrets set CLOUDINARY_API_KEY="sua_api_key"
flyctl secrets set CLOUDINARY_API_SECRET="seu_api_secret"

# Anthropic API
flyctl secrets set ANTHROPIC_API_KEY="sk-ant-api03-..."

# OpenAI API (opcional)
flyctl secrets set OPENAI_API_KEY="sk-..."
```

**Para ver secrets configurados**:
```bash
flyctl secrets list
```

### **6. Deploy!**

```bash
# Deploy inicial
flyctl deploy

# Acompanhar logs em tempo real
flyctl logs
```

**O deploy vai**:
1. ✅ Build da imagem Docker com Chromium
2. ✅ Upload para Fly.io
3. ✅ Criar máquina virtual
4. ✅ Montar volume persistente
5. ✅ Iniciar aplicação
6. ✅ Health check em `/health`

**Tempo estimado**: 5-7 minutos

### **7. Configurar Domínio Customizado**

```bash
# Adicionar domínio
flyctl certs create api.integrius.com.br

# Fly.io vai mostrar os registros DNS necessários
```

**No Cloudflare DNS**:
```
Type: CNAME
Name: api
Target: imobiflow-api.fly.dev
Proxy: DNS only (cinza)
```

---

## 🧪 Testar WhatsApp

### **1. Verificar se app está rodando**

```bash
# Ver status
flyctl status

# Ver URL da aplicação
flyctl info
```

URL será: `https://imobiflow-api.fly.dev`

### **2. Health Check**

```bash
curl https://imobiflow-api.fly.dev/health
```

**Esperado**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-21T...",
  "service": "ImobiFlow API",
  "version": "1.0.0"
}
```

### **3. Diagnóstico Chromium**

```bash
# Login
TOKEN=$(curl -s -X POST https://imobiflow-api.fly.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@imobiflow.com","senha":"Admin@123"}' | jq -r '.token')

# Diagnóstico
curl -s "https://imobiflow-api.fly.dev/api/v1/whatsapp/diagnostics" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Esperado**:
```json
{
  "success": true,
  "data": {
    "environment": {
      "PUPPETEER_EXECUTABLE_PATH": "/usr/bin/chromium",
      "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD": "true"
    },
    "chromium": {
      "exists": true,  ← ✅ DEVE SER TRUE!
      "path": "/usr/bin/chromium",
      "version": "Chromium 120.0.6099.109"
    },
    "sessionPath": {
      "exists": true,
      "writable": true
    }
  }
}
```

### **4. Inicializar WhatsApp**

```bash
curl -X POST https://imobiflow-api.fly.dev/api/v1/whatsapp/initialize \
  -H "Authorization: Bearer $TOKEN"
```

### **5. Obter QR Code**

```bash
# Aguardar 15 segundos para QR gerar
sleep 15

# Obter QR Code
curl -s "https://imobiflow-api.fly.dev/api/v1/whatsapp/qr" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data.qrCode' > /tmp/qr.txt

# Ver QR Code base64
cat /tmp/qr.txt
```

### **6. Converter QR Code para Imagem**

1. Copie todo o conteúdo do arquivo `/tmp/qr.txt` (começa com `data:image/png;base64,`)
2. Acesse: https://codebeautify.org/base64-to-image-converter
3. Cole o código
4. Visualize o QR Code
5. Escaneie com WhatsApp do celular

### **7. Verificar Conexão**

```bash
curl -s "https://imobiflow-api.fly.dev/api/v1/whatsapp/status" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Esperado após conectar**:
```json
{
  "success": true,
  "data": {
    "isReady": true,  ← ✅ CONECTADO!
    "queueLength": 0,
    "messagesSentLastHour": 0
  }
}
```

---

## 📊 Comandos Úteis Fly.io

```bash
# Ver logs em tempo real
flyctl logs

# SSH na máquina
flyctl ssh console

# Ver status
flyctl status

# Ver métricas
flyctl metrics

# Escalar (se precisar mais RAM)
flyctl scale memory 1024

# Listar apps
flyctl apps list

# Ver volumes
flyctl volumes list

# Redeploy
flyctl deploy

# Destruir app (cuidado!)
flyctl apps destroy imobiflow-api
```

---

## 🔧 Troubleshooting

### **Erro: Chromium not found**

**SSH na máquina e verificar**:
```bash
flyctl ssh console

# Dentro da máquina
which chromium
chromium --version
```

### **Erro: Volume not mounted**

**Verificar volumes**:
```bash
flyctl volumes list
```

**Recriar volume**:
```bash
flyctl volumes destroy whatsapp_data
flyctl volumes create whatsapp_data --region gru --size 1
flyctl deploy
```

### **WhatsApp desconecta ao redeploy**

**Normal!** O volume persistente mantém a sessão, mas precisa reconectar:
1. Inicializar novamente: `POST /api/v1/whatsapp/initialize`
2. Se sessão válida, conecta automaticamente
3. Se inválida, gera novo QR Code

---

## 💰 Custos

### **Plano Grátis (Hobby)**:
- ✅ 3 máquinas compartilhadas (256MB cada)
- ✅ 3GB de volumes persistentes
- ✅ 160GB de tráfego/mês
- ✅ SSL automático
- ✅ **Chromium incluído!**

### **Nosso uso estimado**:
- 1 máquina de 512MB = **$0/mês** (dentro do grátis)
- 1GB volume = **$0/mês** (dentro do grátis)
- **Total: GRÁTIS** 🎉

---

## 📚 Links Úteis

- **Fly.io Dashboard**: https://fly.io/dashboard
- **Fly.io Docs**: https://fly.io/docs/
- **Fly.io Status**: https://status.fly.io/
- **Preços**: https://fly.io/docs/about/pricing/

---

## 🎯 Próximos Passos

Após Fly.io configurado:

1. ✅ Verificar Chromium instalado (diagnostics)
2. ✅ Inicializar WhatsApp
3. ✅ Escanear QR Code
4. ✅ Verificar Sofia respondendo automaticamente
5. ✅ Configurar domínio `api.integrius.com.br`
6. ✅ Atualizar frontend para usar nova URL (se necessário)

---

**Status**: 📝 Pronto para deploy
**Plataforma**: Fly.io
**Região**: São Paulo (GRU)
**Última Atualização**: 2025-12-21
