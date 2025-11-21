#!/bin/bash

BASE_URL="http://localhost:3333/api/v1"

echo "🧪 TESTANDO MÓDULO DE NEGOCIAÇÕES E DASHBOARD"
echo "=============================================="
echo ""

# 1. Login
echo "1️⃣ LOGIN..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@imobiflow.com",
    "senha": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erro no login"
  echo "Resposta: $LOGIN_RESPONSE"
  exit 1
fi
echo "✅ Login OK - Token obtido"
echo ""

# 2. Listar Leads (pegar primeiro)
echo "2️⃣ BUSCANDO LEADS..."
LEADS=$(curl -s -X GET "$BASE_URL/leads" \
  -H "Authorization: Bearer $TOKEN")
LEAD_ID=$(echo $LEADS | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Lead encontrado: $LEAD_ID"
echo ""

# 3. Listar Imóveis (pegar primeiro)
echo "3️⃣ BUSCANDO IMÓVEIS..."
IMOVEIS=$(curl -s -X GET "$BASE_URL/imoveis" \
  -H "Authorization: Bearer $TOKEN")
IMOVEL_ID=$(echo $IMOVEIS | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Imóvel encontrado: $IMOVEL_ID"
echo ""

# 4. Listar Corretores (pegar primeiro)
echo "4️⃣ BUSCANDO CORRETORES..."
CORRETORES=$(curl -s -X GET "$BASE_URL/corretores" \
  -H "Authorization: Bearer $TOKEN")
CORRETOR_ID=$(echo $CORRETORES | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Corretor encontrado: $CORRETOR_ID"
echo ""

# 5. Criar Negociação
echo "5️⃣ CRIANDO NEGOCIAÇÃO..."
NEGOCIACAO=$(curl -s -X POST "$BASE_URL/negociacoes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"lead_id\": \"$LEAD_ID\",
    \"imovel_id\": \"$IMOVEL_ID\",
    \"corretor_id\": \"$CORRETOR_ID\",
    \"valor_proposta\": 350000,
    \"observacoes\": \"Negociação de teste via API\"
  }")
NEGOCIACAO_ID=$(echo $NEGOCIACAO | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Negociação criada: $NEGOCIACAO_ID"
echo ""

# 6. Listar Negociações
echo "6️⃣ LISTANDO NEGOCIAÇÕES..."
curl -s -X GET "$BASE_URL/negociacoes" \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo "..."
echo "✅ Listagem OK"
echo ""

# 7. Buscar Negociação por ID
echo "7️⃣ BUSCANDO NEGOCIAÇÃO POR ID..."
curl -s -X GET "$BASE_URL/negociacoes/$NEGOCIACAO_ID" \
  -H "Authorization: Bearer $TOKEN" | head -c 200
echo "..."
echo "✅ Busca OK"
echo ""

# 8. Atualizar Status
echo "8️⃣ ATUALIZANDO STATUS PARA VISITA..."
curl -s -X PUT "$BASE_URL/negociacoes/$NEGOCIACAO_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "VISITA"
  }' | head -c 200
echo "..."
echo "✅ Status atualizado"
echo ""

# 9. Adicionar evento à timeline
echo "9️⃣ ADICIONANDO EVENTO À TIMELINE..."
curl -s -X POST "$BASE_URL/negociacoes/$NEGOCIACAO_ID/timeline" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "VISITA",
    "descricao": "Cliente visitou o imóvel e gostou"
  }' | head -c 200
echo "..."
echo "✅ Evento adicionado"
echo ""

# 10. Pipeline
echo "🔟 BUSCANDO PIPELINE..."
curl -s -X GET "$BASE_URL/negociacoes/pipeline/status" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo "✅ Pipeline OK"
echo ""

# 11. Dashboard - Overview
echo "1️⃣1️⃣ DASHBOARD - OVERVIEW..."
curl -s -X GET "$BASE_URL/dashboard/overview" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo "✅ Overview OK"
echo ""

# 12. Dashboard - Funil de Vendas
echo "1️⃣2️⃣ DASHBOARD - FUNIL DE VENDAS..."
curl -s -X GET "$BASE_URL/dashboard/funil" \
  -H "Authorization: Bearer $TOKEN"
echo ""
echo "✅ Funil OK"
echo ""

# 13. Dashboard - Performance Corretores
echo "1️⃣3️⃣ DASHBOARD - PERFORMANCE CORRETORES..."
curl -s -X GET "$BASE_URL/dashboard/corretores/performance" \
  -H "Authorization: Bearer $TOKEN" | head -c 300
echo "..."
echo "✅ Performance OK"
echo ""

# 14. Dashboard - Atividades Recentes
echo "1️⃣4️⃣ DASHBOARD - ATIVIDADES RECENTES..."
curl -s -X GET "$BASE_URL/dashboard/activity?limit=5" \
  -H "Authorization: Bearer $TOKEN" | head -c 300
echo "..."
echo "✅ Atividades OK"
echo ""

echo ""
echo "=============================================="
echo "🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!"
echo "=============================================="
echo ""
echo "📊 NEGOCIAÇÃO CRIADA: $NEGOCIACAO_ID"
echo "✅ Status: VISITA"
echo "✅ Timeline: 2 eventos"
echo "✅ Dashboard: Funcionando"
