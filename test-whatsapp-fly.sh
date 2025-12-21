#!/bin/bash

echo "🧪 Testando WhatsApp no Fly.io..."
echo ""

# 1. Login
echo "1️⃣ Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST https://imobiflow-api.fly.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@imobiflow.com","senha":"Admin@123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erro no login!"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login bem-sucedido!"
echo "Token: ${TOKEN:0:20}..."
echo ""

# 2. Inicializar WhatsApp
echo "2️⃣ Inicializando WhatsApp..."
INIT_RESPONSE=$(curl -s -X POST https://imobiflow-api.fly.dev/api/v1/whatsapp/initialize \
  -H "Authorization: Bearer $TOKEN")

echo "Resposta: $INIT_RESPONSE"
echo ""

# 3. Aguardar QR Code (60 segundos - Puppeteer pode demorar)
echo "3️⃣ Aguardando QR Code gerar (60 segundos)..."
sleep 60

# 4. Obter QR Code
echo "4️⃣ Obtendo QR Code..."
QR_RESPONSE=$(curl -s https://imobiflow-api.fly.dev/api/v1/whatsapp/qr \
  -H "Authorization: Bearer $TOKEN")

echo "$QR_RESPONSE" | jq . > /tmp/qr_response.json 2>/dev/null

if echo "$QR_RESPONSE" | grep -q '"qrCode"'; then
  echo "✅ QR Code gerado com sucesso!"
  echo ""
  QR_CODE=$(echo "$QR_RESPONSE" | jq -r '.data.qrCode')
  echo "QR Code (primeiros 100 caracteres):"
  echo "${QR_CODE:0:100}..."
  echo ""
  echo "📝 QR Code completo salvo em: /tmp/fly_whatsapp_qr.txt"
  echo "$QR_CODE" > /tmp/fly_whatsapp_qr.txt
  echo ""
  echo "🔗 Para escanear:"
  echo "1. Copie o conteúdo do arquivo /tmp/fly_whatsapp_qr.txt"
  echo "2. Acesse: https://codebeautify.org/base64-to-image-converter"
  echo "3. Cole o código e visualize o QR Code"
  echo "4. Escaneie com o WhatsApp do celular"
else
  echo "⚠️  QR Code ainda não disponível"
  echo "Resposta: $QR_RESPONSE"
fi

echo ""

# 5. Verificar status
echo "5️⃣ Verificando status..."
STATUS=$(curl -s https://imobiflow-api.fly.dev/api/v1/whatsapp/status \
  -H "Authorization: Bearer $TOKEN")

echo "Status: $STATUS"
