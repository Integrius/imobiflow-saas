#!/bin/bash

# Script de verificação pré-deploy
echo "🚀 ImobiFlow - Verificação Pré-Deploy"
echo "======================================"
echo ""

# Verificar se está em um repositório Git
if [ ! -d .git ]; then
  echo "❌ Erro: Este diretório não é um repositório Git"
  echo "   Execute: git init"
  exit 1
fi

echo "✅ Repositório Git detectado"

# Verificar package manager
if [ -f "pnpm-lock.yaml" ]; then
  echo "✅ PNPM detectado"
  PKG_MANAGER="pnpm"
elif [ -f "package-lock.json" ]; then
  echo "✅ NPM detectado"
  PKG_MANAGER="npm"
elif [ -f "yarn.lock" ]; then
  echo "✅ Yarn detectado"
  PKG_MANAGER="yarn"
else
  echo "❌ Nenhum lock file encontrado"
  exit 1
fi

# Verificar se há alterações não commitadas
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  Há alterações não commitadas"
  echo ""
  git status --short
  echo ""
  read -p "Deseja commitar todas as alterações? (s/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Ss]$ ]]; then
    git add .
    read -p "Mensagem do commit: " commit_msg
    git commit -m "$commit_msg"
    echo "✅ Commit criado"
  fi
else
  echo "✅ Não há alterações pendentes"
fi

# Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo "📌 Branch atual: $CURRENT_BRANCH"

# Verificar arquivos necessários
echo ""
echo "Verificando arquivos de configuração..."

if [ -f "vercel.json" ]; then
  echo "✅ vercel.json encontrado"
else
  echo "❌ vercel.json não encontrado"
fi

if [ -f "apps/web/.env.example" ]; then
  echo "✅ .env.example encontrado"
else
  echo "⚠️  .env.example não encontrado"
fi

if [ -f "apps/web/.env.local" ]; then
  echo "✅ .env.local encontrado"
else
  echo "⚠️  .env.local não encontrado"
fi

# Testar build
echo ""
read -p "Deseja testar o build localmente? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo "🔨 Executando build..."
  $PKG_MANAGER run build

  if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
  else
    echo "❌ Build falhou. Corrija os erros antes de fazer deploy."
    exit 1
  fi
fi

echo ""
echo "======================================"
echo "✅ Verificação concluída!"
echo ""
echo "Próximos passos:"
echo "1. Faça push das alterações: git push origin $CURRENT_BRANCH"
echo "2. Acesse https://vercel.com/new"
echo "3. Importe seu repositório"
echo "4. Configure as variáveis de ambiente"
echo "5. Faça o deploy!"
echo ""
echo "Consulte DEPLOY_QUICKSTART.md para mais detalhes."
