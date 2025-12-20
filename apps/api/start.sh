#!/bin/bash

# Script de inicialização com detecção automática do Chromium

echo "🚀 Iniciando ImobiFlow API..."

# Detectar caminho do Chromium
if [ -z "$PUPPETEER_EXECUTABLE_PATH" ]; then
  echo "🔍 Detectando Chromium..."

  if command -v chromium &> /dev/null; then
    export PUPPETEER_EXECUTABLE_PATH=$(which chromium)
    echo "✅ Chromium encontrado em: $PUPPETEER_EXECUTABLE_PATH"
  elif command -v chromium-browser &> /dev/null; then
    export PUPPETEER_EXECUTABLE_PATH=$(which chromium-browser)
    echo "✅ Chromium encontrado em: $PUPPETEER_EXECUTABLE_PATH"
  elif [ -f /usr/bin/chromium ]; then
    export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
    echo "✅ Chromium encontrado em: $PUPPETEER_EXECUTABLE_PATH"
  elif [ -f /usr/bin/chromium-browser ]; then
    export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
    echo "✅ Chromium encontrado em: $PUPPETEER_EXECUTABLE_PATH"
  else
    echo "⚠️  AVISO: Chromium não encontrado! WhatsApp pode não funcionar."
  fi
fi

# Mostrar versão do Chromium
if [ -n "$PUPPETEER_EXECUTABLE_PATH" ] && [ -f "$PUPPETEER_EXECUTABLE_PATH" ]; then
  $PUPPETEER_EXECUTABLE_PATH --version || echo "Não foi possível obter a versão"
fi

# Garantir que PUPPETEER_SKIP_CHROMIUM_DOWNLOAD está configurado
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Criar diretório de sessão se não existir
mkdir -p /app/whatsapp-session

echo "📋 Variáveis de ambiente Puppeteer:"
echo "  PUPPETEER_EXECUTABLE_PATH: $PUPPETEER_EXECUTABLE_PATH"
echo "  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: $PUPPETEER_SKIP_CHROMIUM_DOWNLOAD"
echo "  WHATSAPP_SESSION_PATH: $WHATSAPP_SESSION_PATH"
echo ""

# Iniciar servidor
echo "🚀 Iniciando servidor Node.js..."
exec pnpm start
