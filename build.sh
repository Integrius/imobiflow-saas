#!/bin/bash
# Script de build para CI/CD - Permite atualização de lockfile

echo "🔧 Instalando dependências (permitindo atualização de lockfile)..."
pnpm install --no-frozen-lockfile

echo "🏗️  Executando build..."
pnpm run build --no-frozen-lockfile

echo "✅ Build concluído!"
