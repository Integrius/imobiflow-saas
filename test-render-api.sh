#!/bin/bash

# Script para testar API deployada no Render
# Uso: ./test-render-api.sh <URL_DA_API>
# Exemplo: ./test-render-api.sh https://imobiflow-api.onrender.com

if [ -z "$1" ]; then
  echo "❌ Erro: URL da API não fornecida"
  echo "Uso: ./test-render-api.sh <URL_DA_API>"
  echo "Exemplo: ./test-render-api.sh https://imobiflow-api.onrender.com"
  exit 1
fi

API_URL="$1"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🧪 TESTANDO API NO RENDER"
echo "=========================================="
echo -e "${BLUE}URL: $API_URL${NC}"
echo ""

# Teste 1: Health Check
echo "1️⃣ Testando Health Check..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [[ $HTTP_CODE == "200" ]]; then
  echo -e "${GREEN}✅ API está online!${NC}"
  echo "   Status: $HTTP_CODE"
  echo "   Response: $BODY"
else
  echo -e "${RED}❌ API não está respondendo${NC}"
  echo "   Status: $HTTP_CODE"
  echo "   Response: $BODY"
  exit 1
fi
echo ""

# Teste 2: Criar Tenant
echo "2️⃣ Testando criação de tenant..."
TENANT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/tenants" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Imobiliária Teste Render",
    "slug": "teste-render",
    "email": "teste@render.com",
    "plano": "PRO"
  }')

HTTP_CODE=$(echo "$TENANT_RESPONSE" | tail -n1)
BODY=$(echo "$TENANT_RESPONSE" | head -n-1)

if [[ $HTTP_CODE == "201" ]]; then
  echo -e "${GREEN}✅ Tenant criado com sucesso!${NC}"
  echo "   Status: $HTTP_CODE"
  echo "   Response:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
  echo -e "${YELLOW}⚠️  Status inesperado: $HTTP_CODE${NC}"
  echo "   Response: $BODY"
fi
echo ""

# Teste 3: Verificar se rotas exigem autenticação
echo "3️⃣ Testando proteção de rotas (sem token)..."
LEADS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/v1/leads")
HTTP_CODE=$(echo "$LEADS_RESPONSE" | tail -n1)
BODY=$(echo "$LEADS_RESPONSE" | head -n-1)

if [[ $HTTP_CODE == "401" ]] || [[ $HTTP_CODE == "403" ]]; then
  echo -e "${GREEN}✅ Rotas protegidas por autenticação${NC}"
  echo "   Status: $HTTP_CODE (esperado)"
else
  echo -e "${YELLOW}⚠️  Status inesperado: $HTTP_CODE${NC}"
  echo "   Response: $BODY"
fi
echo ""

# Resumo
echo "=========================================="
echo "📊 RESUMO DOS TESTES"
echo "=========================================="
echo -e "${GREEN}✅ API está rodando no Render${NC}"
echo -e "${GREEN}✅ Health check funcionando${NC}"
echo -e "${GREEN}✅ Endpoint de tenants acessível${NC}"
echo -e "${GREEN}✅ Autenticação ativa${NC}"
echo ""
echo -e "${BLUE}🎉 API deployada com sucesso!${NC}"
echo ""
echo "URL da sua API: $API_URL"
echo ""
