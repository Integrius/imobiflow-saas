# 📘 Guia de Uso - Sistema de IA (Sofia)

## 🎯 Visão Geral

O **Sistema de IA Imobiflow** é composto por uma assistente virtual chamada **Sofia** que:

- Processa mensagens de leads automaticamente
- Qualifica leads com score de 0-100
- Analisa sentimento, urgência e intenção
- Gera respostas contextuais inteligentes
- Escala leads quentes para corretores humanos

---

## 🔧 Configuração Inicial

### 1. Variáveis de Ambiente

Adicione no arquivo `.env`:

```bash
# AI Configuration (OBRIGATÓRIO)
ANTHROPIC_API_KEY="sk-ant-api03-xxxxxxxxxxxxx"

# AI Configuration (OPCIONAL)
OPENAI_API_KEY="sk-xxxxxxxxxxxxx"
AI_ENABLED="true"
AI_AUTO_RESPOND="true"
AI_FALLBACK_TO_OPENAI="false"
AI_MAX_COST_PER_DAY="10.00"
```

### 2. Obter Chave API Anthropic

1. Acesse: [https://console.anthropic.com/](https://console.anthropic.com/)
2. Crie uma conta ou faça login
3. Vá em **API Keys** > **Create Key**
4. Copie a chave e adicione no `.env`

**Custos estimados** (Claude Haiku):
- 100 mensagens/dia = ~R$ 2,25/mês
- 500 mensagens/dia = ~R$ 11,25/mês
- 1000 mensagens/dia = ~R$ 22,50/mês

### 3. Obter Chave OpenAI (Opcional - Fallback)

1. Acesse: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Crie uma chave API
3. Adicione no `.env`
4. Ative fallback: `AI_FALLBACK_TO_OPENAI="true"`

---

## 📡 Endpoints Disponíveis

### Base URL
```
https://imobiflow-saas-1.onrender.com/api/v1/ai
```

Todas as rotas exigem:
- **Header**: `Authorization: Bearer {JWT_TOKEN}`
- **Multi-tenancy**: Automático via middleware

---

### 1. POST `/process-message`
**Processa mensagem de um lead e gera resposta inteligente**

#### Request:
```json
{
  "leadId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Oi, vi um apartamento de 2 quartos no site"
}
```

#### Response:
```json
{
  "success": true,
  "data": {
    "messageId": "660e8400-e29b-41d4-a716-446655440001",
    "response": "Olá! Que ótimo que você se interessou! 😊 Temos ótimas opções de apartamentos de 2 quartos. Qual região você prefere?",
    "analysis": {
      "urgency": "média",
      "intent": "informacao",
      "sentiment": "positivo",
      "scoreImpact": 5
    },
    "newScore": 45,
    "shouldNotifyBroker": false
  }
}
```

#### Exemplo cURL:
```bash
curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/ai/process-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "leadId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Preciso de um apto urgente, orçamento até 500k"
  }'
```

---

### 2. GET `/lead/:leadId/messages`
**Busca histórico de mensagens de um lead**

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "msg-001",
      "content": "Oi, vi um apartamento no site",
      "isFromLead": true,
      "platform": "whatsapp",
      "status": "delivered",
      "aiAnalysis": {
        "urgency": "média",
        "sentiment": "positivo"
      },
      "scoreImpact": 5,
      "createdAt": "2025-12-20T14:30:00Z"
    }
  ]
}
```

#### Exemplo cURL:
```bash
curl https://imobiflow-saas-1.onrender.com/api/v1/ai/lead/550e8400-e29b-41d4-a716-446655440000/messages \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

### 3. GET `/lead/:leadId/conversation`
**Busca lead com conversa completa**

#### Response:
```json
{
  "success": true,
  "data": {
    "lead": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nome": "João Silva",
      "telefone": "11999999999",
      "email": "joao@email.com",
      "score": 75,
      "temperatura": "QUENTE",
      "urgency": "alta",
      "sentiment": "positivo",
      "intent": "agendamento",
      "propertyType": "apartamento",
      "location": "São Paulo - Zona Sul",
      "bedrooms": 2,
      "budget": 500000,
      "aiEnabled": true,
      "escalatedToBroker": false
    },
    "messages": [...],
    "stats": {
      "totalMessages": 8,
      "leadMessages": 4,
      "aiResponses": 4
    }
  }
}
```

---

### 4. GET `/stats`
**Estatísticas gerais do sistema de IA**

#### Response:
```json
{
  "success": true,
  "data": {
    "leadsWithAI": 150,
    "totalMessages": 842,
    "highUrgencyLeads": 23,
    "escalatedLeads": 12,
    "averageScore": 58,
    "aiEnabled": true
  }
}
```

#### Exemplo cURL:
```bash
curl https://imobiflow-saas-1.onrender.com/api/v1/ai/stats \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

### 5. PATCH `/lead/:leadId/toggle`
**Habilita/desabilita IA para um lead específico**

#### Request:
```json
{
  "enabled": false
}
```

#### Response:
```json
{
  "success": true,
  "data": {
    "leadId": "550e8400-e29b-41d4-a716-446655440000",
    "aiEnabled": false
  }
}
```

---

### 6. POST `/lead/:leadId/escalate`
**Escala lead para corretor humano**

#### Request:
```json
{
  "reason": "Lead com orçamento alto, pronto para fechar"
}
```

#### Response:
```json
{
  "success": true,
  "data": {
    "leadId": "550e8400-e29b-41d4-a716-446655440000",
    "escalated": true,
    "aiEnabled": false
  }
}
```

**Importante**: Ao escalar, a IA é automaticamente desabilitada para o lead.

---

## 📊 Sistema de Scoring

### Como funciona:

O score vai de **0 a 100** e é atualizado automaticamente baseado em:

| Fator | Impacto no Score |
|-------|------------------|
| **Urgência mencionada** | +10 a +15 |
| **Orçamento informado** | +5 a +10 |
| **Localização específica** | +3 a +5 |
| **Tipo de imóvel definido** | +3 a +5 |
| **Interesse em agendamento** | +8 a +12 |
| **Sentimento positivo** | +2 a +5 |
| **Mensagens genéricas** | -2 a -5 |
| **Sentimento negativo** | -5 a -10 |

### Temperatura do Lead:

| Score | Temperatura | Ação Recomendada |
|-------|-------------|------------------|
| 0-30 | FRIO ❄️ | Nutrição com conteúdo |
| 31-60 | MORNO 🌡️ | Qualificação ativa |
| 61-100 | QUENTE 🔥 | Priorizar atendimento |

### Escalação Automática:

Leads são escalados automaticamente quando:
- Score >= 80
- Urgência = "alta"
- Orçamento > R$ 1.000.000
- Intent = "agendamento" + "negociacao"

---

## 🤖 Personalidade da Sofia

A **Sofia** foi programada para:

### ✅ Fazer:
- Ser comunicativa mas objetiva
- Usar português BR natural
- Máximo 2 emojis por mensagem
- Perguntar: tipo de imóvel, localização, orçamento, urgência
- Sugerir agendamento quando apropriado
- Escalar leads quentes

### ❌ Não Fazer:
- Inventar preços ou detalhes de imóveis
- Ser excessivamente formal
- Escrever mensagens longas
- Prometer o que não pode cumprir

### Exemplos de Respostas:

**BOM** ✅:
```
"Ótimo! Temos apartamentos incríveis na região. Qual seu orçamento?"
```

**RUIM** ❌:
```
"Muito obrigada pelo seu contato! Ficamos extremamente felizes e honrados com seu interesse..."
```

---

## 🧪 Testando o Sistema

### 1. Teste Básico (Process Message)

```bash
#!/bin/bash

# Substitua com seu token JWT real
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Substitua com um leadId real do seu banco
LEAD_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/ai/process-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"leadId\": \"$LEAD_ID\",
    \"message\": \"Oi, quero um apartamento de 2 quartos urgente\"
  }" | jq
```

### 2. Verificar Estatísticas

```bash
curl https://imobiflow-saas-1.onrender.com/api/v1/ai/stats \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 3. Ver Conversa Completa

```bash
curl "https://imobiflow-saas-1.onrender.com/api/v1/ai/lead/$LEAD_ID/conversation" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 🔍 Análise de Campos

### Urgency (Urgência)
- **baixa**: Lead só explorando opções
- **média**: Interesse real, mas sem pressa
- **alta**: Precisa comprar/alugar em breve

### Intent (Intenção)
- **informacao**: Apenas coletando informações
- **agendamento**: Quer agendar visita
- **negociacao**: Pronto para negociar
- **reclamacao**: Problema ou insatisfação

### Sentiment (Sentimento)
- **positivo**: Animado, interessado
- **neutro**: Apenas perguntando
- **negativo**: Frustrado, insatisfeito

---

## 🚨 Troubleshooting

### Erro: "ANTHROPIC_API_KEY não configurada"

**Solução**:
1. Verifique se a chave está no `.env`
2. Reinicie o servidor: `pnpm dev` ou redeploy no Render
3. Verifique se a chave é válida no console da Anthropic

### Erro: "Ambos provedores de IA falharam"

**Solução**:
1. Verifique créditos da Anthropic
2. Configure OpenAI como fallback
3. Verifique logs: `pnpm logs` ou Render dashboard

### Erro: "Lead não encontrado"

**Solução**:
1. Verifique se o `leadId` existe no banco
2. Verifique se o lead pertence ao seu tenant
3. Use endpoint correto com autenticação

### IA não responde automaticamente

**Solução**:
1. Verifique: `AI_ENABLED="true"`
2. Verifique: `AI_AUTO_RESPOND="true"`
3. Verifique se o lead tem `ai_enabled: true`

### Custos muito altos

**Solução**:
1. Ajuste: `AI_MAX_COST_PER_DAY` para valor menor
2. Use apenas Claude (sem fallback)
3. Desabilite IA para leads frios
4. Revise prompts para serem mais concisos

---

## 📈 Monitoramento de Custos

### Verificar custos via código:

```typescript
import { aiRouter } from './ai/services/ai-router.service'

// Ver estatísticas combinadas
const stats = aiRouter.getCombinedStats()
console.log('Custo total hoje:', stats.total.cost)
console.log('Requests Claude:', stats.claude.requests)
console.log('Requests OpenAI:', stats.openai.requests)
```

### Resetar estatísticas diárias:

```typescript
aiRouter.resetAllStats()
```

**Recomendação**: Configure um cron job para resetar às 00:00:

```bash
0 0 * * * curl -X POST https://sua-api.com/api/v1/ai/reset-stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🔐 Segurança

Todas as rotas possuem:

✅ **Autenticação JWT** via `authMiddleware`
✅ **Multi-tenancy** via `tenantMiddleware`
✅ **Validação de ownership** (lead pertence ao tenant)
✅ **Sanitização de inputs**
✅ **Rate limiting** automático nos provedores de IA

**Importante**: NUNCA exponha suas chaves API no frontend ou repositório público.

---

## 📚 Próximos Passos

1. ✅ Sistema de IA básico funcionando
2. ⏳ Integração com WhatsApp (whatsapp-web.js)
3. ⏳ Dashboard de métricas de IA no frontend
4. ⏳ Sistema de templates de resposta
5. ⏳ A/B testing de prompts
6. ⏳ Análise preditiva de fechamento

---

## 💡 Dicas de Uso

### Para Desenvolvedores:
- Use `forceProvider` para testar OpenAI: `{ forceProvider: 'openai' }`
- Logs detalhados: procure por 🤖, 📊, ❌ nos logs
- Ajuste `temperature` para respostas mais/menos criativas

### Para Gestores:
- Monitore `/stats` diariamente
- Leads com score > 80: atendimento prioritário
- Revise escalações automáticas semanalmente
- Ajuste prompts baseado em feedback dos corretores

---

## 🆘 Suporte

**Documentação completa**:
- [BI-IA-STATUS-FASE1.md](./BI-IA-STATUS-FASE1.md) - Status da implementação
- [planejamento-bi-ia.md](./planejamento-bi-ia.md) - Roadmap completo

**Arquivos principais**:
- [claude.service.ts](../apps/api/src/ai/services/claude.service.ts)
- [openai.service.ts](../apps/api/src/ai/services/openai.service.ts)
- [ai-router.service.ts](../apps/api/src/ai/services/ai-router.service.ts)
- [message-processor-v2.service.ts](../apps/api/src/ai/services/message-processor-v2.service.ts)
- [sofia-prompts.ts](../apps/api/src/ai/prompts/sofia-prompts.ts)
- [ai.routes.ts](../apps/api/src/modules/ai/ai.routes.ts)

---

**Versão**: 1.0
**Última atualização**: 2025-12-20
