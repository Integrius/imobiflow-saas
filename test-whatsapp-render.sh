#!/bin/bash

# Script para testar WhatsApp no Render
# Após o deploy completar, execute este script

echo "🧪 Testando WhatsApp no Render..."
echo ""

# 1. Login
echo "1️⃣ Fazendo login..."
RESPONSE=$(curl -s -X POST https://api.integrius.com.br/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@imobiflow.com","senha":"Admin@123"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erro no login!"
  echo "Resposta: $RESPONSE"
  exit 1
fi

echo "✅ Login bem-sucedido!"
echo "Token: ${TOKEN:0:20}..."
echo ""

# 2. Inicializar WhatsApp
echo "2️⃣ Inicializando WhatsApp..."
INIT_RESPONSE=$(curl -s -X POST https://api.integrius.com.br/api/v1/whatsapp/initialize \
  -H "Authorization: Bearer $TOKEN")

echo "Resposta: $INIT_RESPONSE"
echo ""

# 3. Aguardar QR Code gerar
echo "3️⃣ Aguardando QR Code (15 segundos)..."
sleep 15

# 4. Obter QR Code
echo "4️⃣ Obtendo QR Code..."
QR_RESPONSE=$(curl -s https://api.integrius.com.br/api/v1/whatsapp/qr \
  -H "Authorization: Bearer $TOKEN")

if echo "$QR_RESPONSE" | grep -q "data:image"; then
  echo "✅ QR Code gerado com sucesso!"
  echo ""
  echo "📱 PRÓXIMO PASSO:"
  echo "1. Copie o código base64 abaixo"
  echo "2. Acesse: https://codebeautify.org/base64-to-image-converter"
  echo "3. Cole o código"
  echo "4. Escaneie com WhatsApp do celular"
  echo ""
  echo "$QR_RESPONSE"
else
  echo "⚠️  QR Code ainda não disponível"
  echo "Resposta: $QR_RESPONSE"
  echo ""
  echo "Tente novamente em alguns segundos com:"
  echo "curl https://api.integrius.com.br/api/v1/whatsapp/qr -H \"Authorization: Bearer $TOKEN\""
fi

echo ""
echo "5️⃣ Verificando status..."
STATUS_RESPONSE=$(curl -s https://api.integrius.com.br/api/v1/whatsapp/status \
  -H "Authorization: Bearer $TOKEN")

echo "Status: $STATUS_RESPONSE"
