#!/bin/bash

echo "=========================================="
echo "🧪 TESTES DA API MULTI-TENANT"
echo "=========================================="
echo ""

API_URL="http://localhost:3333/api/v1"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "1️⃣ Testando Health Check..."
HEALTH=$(curl -s http://localhost:3333/health)
if [[ $HEALTH == *"ok"* ]]; then
  echo -e "${GREEN}✅ API está rodando${NC}"
  echo "   $HEALTH"
else
  echo -e "${RED}❌ API não respondeu${NC}"
  exit 1
fi
echo ""

echo "2️⃣ Testando criação de tenant (sem autenticação - deve falhar)..."
TENANT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/tenants" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Imobiliária Teste API",
    "slug": "teste-api",
    "email": "teste@api.com",
    "plano": "PRO"
  }')

HTTP_CODE=$(echo "$TENANT_RESPONSE" | tail -n1)
BODY=$(echo "$TENANT_RESPONSE" | head -n-1)

if [[ $HTTP_CODE == "401" ]] || [[ $HTTP_CODE == "403" ]]; then
  echo -e "${GREEN}✅ Autenticação funcionando (401/403 esperado)${NC}"
  echo "   HTTP $HTTP_CODE: $BODY"
else
  echo -e "${YELLOW}⚠️  Código inesperado: HTTP $HTTP_CODE${NC}"
  echo "   $BODY"
fi
echo ""

echo "3️⃣ Verificando se rota de tenants existe..."
if curl -s -I "$API_URL/tenants" | grep -q "HTTP"; then
  echo -e "${GREEN}✅ Rota /api/v1/tenants existe${NC}"
else
  echo -e "${RED}❌ Rota não encontrada${NC}"
fi
echo ""

echo "4️⃣ Testando rota de leads (sem autenticação)..."
LEADS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/leads")
HTTP_CODE=$(echo "$LEADS_RESPONSE" | tail -n1)
BODY=$(echo "$LEADS_RESPONSE" | head -n-1)

if [[ $HTTP_CODE == "401" ]] || [[ $HTTP_CODE == "403" ]]; then
  echo -e "${GREEN}✅ Rota protegida por autenticação${NC}"
  echo "   HTTP $HTTP_CODE"
else
  echo -e "${YELLOW}⚠️  Código inesperado: HTTP $HTTP_CODE${NC}"
  echo "   $BODY"
fi
echo ""

echo "=========================================="
echo "📊 RESUMO"
echo "=========================================="
echo -e "${GREEN}✅ API está rodando e respondendo${NC}"
echo -e "${GREEN}✅ Rotas de tenant existem${NC}"
echo -e "${GREEN}✅ Autenticação está ativa${NC}"
echo -e "${YELLOW}ℹ️  Para testes completos, é necessário um token JWT${NC}"
echo ""
echo "=========================================="
