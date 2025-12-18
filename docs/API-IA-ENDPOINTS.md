# 🤖 API de IA - Documentação dos Endpoints

## Base URL
```
http://localhost:3333/api/ai
```

---

## 📨 Processar Mensagem

Processa uma mensagem recebida de um lead e retorna a resposta gerada pela IA.

**Endpoint:** `POST /api/ai/process-message`

**Request Body:**
```json
{
  "tenantId": "uuid-do-tenant",
  "leadId": "uuid-do-lead",
  "message": "Olá, procuro apartamento de 3 quartos"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "messageId": "uuid-da-mensagem",
    "response": "Olá! Entendi que você procura um apartamento de 3 quartos...",
    "analysis": {
      "urgency": "média",
      "intent": "informacao",
      "sentiment": "positivo",
      "scoreImpact": 5
    },
    "newScore": 55,
    "shouldNotifyBroker": false
  }
}
```

**Erros:**
- `400` - Campos obrigatórios faltando
- `500` - Erro ao processar mensagem

---

## 💬 Buscar Mensagens do Lead

Retorna o histórico completo de mensagens de um lead.

**Endpoint:** `GET /api/ai/lead/:leadId/messages?tenantId=xxx`

**Query Parameters:**
- `tenantId` (obrigatório) - UUID do tenant

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Olá, procuro apartamento",
      "isFromLead": true,
      "platform": "WHATSAPP",
      "status": "DELIVERED",
      "aiAnalysis": { ... },
      "scoreImpact": 5,
      "createdAt": "2025-12-18T19:30:00Z"
    },
    {
      "id": "uuid",
      "content": "Olá! Temos ótimas opções...",
      "isFromLead": false,
      "platform": "WHATSAPP",
      "status": "SENT",
      "scoreImpact": null,
      "createdAt": "2025-12-18T19:30:05Z"
    }
  ]
}
```

---

## 📋 Buscar Conversa Completa

Retorna o lead com todo histórico de conversa e estatísticas.

**Endpoint:** `GET /api/ai/lead/:leadId/conversation?tenantId=xxx`

**Query Parameters:**
- `tenantId` (obrigatório) - UUID do tenant

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "lead": {
      "id": "uuid",
      "nome": "João Silva",
      "telefone": "+5511999999999",
      "email": "joao@example.com",
      "score": 58,
      "temperatura": "MORNO",
      "urgency": "ALTA",
      "sentiment": "POSITIVO",
      "intent": "AGENDAMENTO",
      "propertyType": "apartamento",
      "location": "Vila Mariana",
      "bedrooms": 3,
      "budget": 800000,
      "aiEnabled": true,
      "escalatedToBroker": false
    },
    "messages": [ ... ],
    "stats": {
      "totalMessages": 6,
      "leadMessages": 3,
      "aiResponses": 3
    }
  }
}
```

**Erros:**
- `400` - tenantId faltando
- `404` - Lead não encontrado
- `500` - Erro ao buscar conversa

---

## 📊 Estatísticas Gerais

Retorna estatísticas do sistema de IA para o tenant.

**Endpoint:** `GET /api/ai/stats?tenantId=xxx`

**Query Parameters:**
- `tenantId` (obrigatório) - UUID do tenant

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "leadsWithAI": 42,
    "totalMessages": 256,
    "highUrgencyLeads": 8,
    "escalatedLeads": 3,
    "averageScore": 62,
    "aiEnabled": true
  }
}
```

---

## 🔄 Habilitar/Desabilitar IA

Habilita ou desabilita a IA para um lead específico.

**Endpoint:** `PATCH /api/ai/lead/:leadId/toggle`

**Request Body:**
```json
{
  "tenantId": "uuid-do-tenant",
  "enabled": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "leadId": "uuid",
    "aiEnabled": false
  }
}
```

---

## ⬆️ Escalar para Corretor

Escala um lead para atendimento humano e desabilita a IA.

**Endpoint:** `POST /api/ai/lead/:leadId/escalate`

**Request Body:**
```json
{
  "tenantId": "uuid-do-tenant",
  "reason": "Lead solicitou falar com corretor"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "leadId": "uuid",
    "escalated": true,
    "aiEnabled": false
  }
}
```

---

## 🔑 Autenticação

**Todos os endpoints requerem autenticação JWT.**

Adicione o header:
```
Authorization: Bearer seu-token-jwt
```

*(Implementação pendente)*

---

## 📝 Exemplos de Uso

### cURL

```bash
# Processar mensagem
curl -X POST http://localhost:3333/api/ai/process-message \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "default-tenant-id",
    "leadId": "lead-uuid",
    "message": "Quero agendar uma visita"
  }'

# Buscar conversa
curl http://localhost:3333/api/ai/lead/lead-uuid/conversation?tenantId=default-tenant-id

# Estatísticas
curl http://localhost:3333/api/ai/stats?tenantId=default-tenant-id
```

### JavaScript/TypeScript

```typescript
// Processar mensagem
const response = await fetch('http://localhost:3333/api/ai/process-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tenantId: 'default-tenant-id',
    leadId: 'lead-uuid',
    message: 'Olá, procuro apartamento'
  })
});

const data = await response.json();
console.log(data.data.response); // Resposta da IA
```

---

## ⚡ Rate Limiting

- **Limite:** 100 requests/minuto por tenant
- **Resposta ao exceder:** `429 Too Many Requests`

*(Implementação pendente)*

---

## 🐛 Tratamento de Erros

Todos os endpoints retornam erros no formato:

```json
{
  "error": "Descrição do erro",
  "message": "Detalhes técnicos"
}
```

**Códigos HTTP:**
- `200` - Sucesso
- `400` - Requisição inválida
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Recurso não encontrado
- `429` - Rate limit excedido
- `500` - Erro interno do servidor

---

## 📈 Monitoramento

Todos os endpoints logam:
- Tempo de resposta
- Tenant ID
- Lead ID
- Status da operação
- Erros (se houver)

---

## 🔜 Próximas Funcionalidades

- [ ] Webhook para notificações em tempo real
- [ ] Endpoint para enviar mensagem proativa
- [ ] Endpoint para análise em batch
- [ ] Suporte a anexos (imagens, PDFs)
- [ ] Endpoint para treinar personalidade da IA

---

**Documentação atualizada em:** 18/12/2025
**Versão da API:** 1.0.0
