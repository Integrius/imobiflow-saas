#!/bin/bash

# Script de Teste - Endpoints de IA
# Uso: ./test-ai-endpoints.sh <JWT_TOKEN> <LEAD_ID>

set -e

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuração
API_URL="https://imobiflow-saas-1.onrender.com/api/v1/ai"
TOKEN="${1:-}"
LEAD_ID="${2:-}"

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Erro: Token JWT não fornecido${NC}"
  echo "Uso: $0 <JWT_TOKEN> <LEAD_ID>"
  echo ""
  echo "Para obter um token, faça login:"
  echo "curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/auth/login \\"
  echo "  -H 'Content-Type: application/json' \\"
  echo "  -d '{\"email\":\"seu@email.com\",\"password\":\"sua_senha\"}'"
  exit 1
fi

echo -e "${YELLOW}🧪 Iniciando testes dos endpoints de IA...${NC}\n"

# Teste 1: Stats
echo -e "${YELLOW}📊 Teste 1: GET /stats${NC}"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL/stats" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""

# Se LEAD_ID não foi fornecido, tenta pegar do response de stats
if [ -z "$LEAD_ID" ]; then
  echo -e "${YELLOW}⚠️  LEAD_ID não fornecido. Pulando testes que requerem lead específico.${NC}"
  echo ""
  echo "Para testes completos, execute:"
  echo "$0 $TOKEN <LEAD_ID>"
  exit 0
fi

# Teste 2: Process Message
echo -e "${YELLOW}💬 Teste 2: POST /process-message${NC}"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/process-message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"leadId\": \"$LEAD_ID\",
    \"message\": \"Oi, quero saber mais sobre apartamentos de 2 quartos\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
  echo "$BODY" | jq '.'

  # Extrai a resposta da IA
  AI_RESPONSE=$(echo "$BODY" | jq -r '.data.response // empty')
  if [ -n "$AI_RESPONSE" ]; then
    echo -e "\n${GREEN}🤖 Resposta da Sofia:${NC}"
    echo "\"$AI_RESPONSE\""
  fi
else
  echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""

# Teste 3: Get Messages
echo -e "${YELLOW}📜 Teste 3: GET /lead/:leadId/messages${NC}"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL/lead/$LEAD_ID/messages" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"
  MESSAGE_COUNT=$(echo "$BODY" | jq '.data | length')
  echo "Total de mensagens: $MESSAGE_COUNT"
  echo "$BODY" | jq '.data | .[-3:] // .' # Últimas 3 mensagens
else
  echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""

# Teste 4: Get Conversation
echo -e "${YELLOW}💭 Teste 4: GET /lead/:leadId/conversation${NC}"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL/lead/$LEAD_ID/conversation" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Success (HTTP $HTTP_CODE)${NC}"

  # Extrai informações do lead
  LEAD_NAME=$(echo "$BODY" | jq -r '.data.lead.nome // "N/A"')
  LEAD_SCORE=$(echo "$BODY" | jq -r '.data.lead.score // 0')
  LEAD_TEMP=$(echo "$BODY" | jq -r '.data.lead.temperatura // "N/A"')

  echo -e "\n${GREEN}👤 Lead Info:${NC}"
  echo "  Nome: $LEAD_NAME"
  echo "  Score: $LEAD_SCORE"
  echo "  Temperatura: $LEAD_TEMP"

  # Estatísticas da conversa
  TOTAL_MSGS=$(echo "$BODY" | jq -r '.data.stats.totalMessages // 0')
  AI_RESPONSES=$(echo "$BODY" | jq -r '.data.stats.aiResponses // 0')

  echo -e "\n${GREEN}📊 Conversa Stats:${NC}"
  echo "  Total de mensagens: $TOTAL_MSGS"
  echo "  Respostas da IA: $AI_RESPONSES"
else
  echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""

# Teste 5: Toggle AI (desabilita e reabilita)
echo -e "${YELLOW}🔄 Teste 5: PATCH /lead/:leadId/toggle${NC}"

# Desabilita
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X PATCH "$API_URL/lead/$LEAD_ID/toggle" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"enabled": false}')

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Desabilitado com sucesso (HTTP $HTTP_CODE)${NC}"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}❌ Failed ao desabilitar (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

sleep 1

# Reabilita
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X PATCH "$API_URL/lead/$LEAD_ID/toggle" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"enabled": true}')

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Reabilitado com sucesso (HTTP $HTTP_CODE)${NC}"
  echo "$BODY" | jq '.'
else
  echo -e "${RED}❌ Failed ao reabilitar (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""
echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo ""
echo -e "${YELLOW}⚠️  Nota: O teste de escalação não foi executado para não alterar o estado do lead${NC}"
echo "Para testar escalação manualmente:"
echo "curl -X POST $API_URL/lead/$LEAD_ID/escalate \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer $TOKEN' \\"
echo "  -d '{\"reason\": \"Teste de escalação\"}'"
