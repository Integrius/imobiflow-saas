# 🧪 Guia Completo de Testes - IA + WhatsApp

**Data**: 2025-12-20
**Versão**: 1.0.0
**Tempo Estimado**: 30-60 minutos

---

## ✅ PRÉ-REQUISITOS

Antes de iniciar os testes, verifique:

- [x] Build compilado com sucesso ✅
- [x] TypeScript sem erros ✅
- [x] Variáveis de ambiente configuradas ✅
- [x] Chave ANTHROPIC_API_KEY válida ✅
- [ ] Servidor rodando
- [ ] Token JWT válido
- [ ] Lead de teste criado

---

## 📋 ROTEIRO DE TESTES

### FASE 1: Testes Básicos (5 min)

#### 1.1 Verificar Build ✅

```bash
cd /home/hans/imobiflow/apps/api
DATABASE_URL="temp" pnpm run build
```

**Resultado Esperado**: ✅ Build completo sem erros
**Status**: PASSOU ✅

---

#### 1.2 Iniciar Servidor

```bash
cd /home/hans/imobiflow/apps/api
pnpm dev
```

**Resultado Esperado**:
```
🚀 Server running on port 3333
📊 Dashboard API: http://localhost:3333/api/v1/dashboard
✅ WhatsApp Handler configurado
```

**Como Testar**:
1. Abra novo terminal
2. Execute o comando acima
3. Aguarde servidor iniciar (~30 segundos)
4. Verifique logs acima

---

#### 1.3 Health Check

```bash
curl http://localhost:3333/health
```

**Resultado Esperado**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-20T...",
  "service": "ImobiFlow API",
  "version": "1.0.0"
}
```

---

### FASE 2: Testes de Autenticação (5 min)

#### 2.1 Login para Obter Token

```bash
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "SEU_EMAIL@example.com",
    "password": "SUA_SENHA"
  }'
```

**Resultado Esperado**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "...",
    "nome": "..."
  }
}
```

**IMPORTANTE**: Copie o token para usar nos próximos testes!

**Salvar token**:
```bash
export TOKEN="cole_o_token_aqui"
```

---

### FASE 3: Testes de IA (10 min)

#### 3.1 Verificar Estatísticas de IA

```bash
curl http://localhost:3333/api/v1/ai/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado Esperado**:
```json
{
  "success": true,
  "data": {
    "leadsWithAI": 0,
    "totalMessages": 0,
    "highUrgencyLeads": 0,
    "escalatedLeads": 0,
    "averageScore": 0,
    "aiEnabled": true
  }
}
```

**Status**:
- ✅ PASSOU: Retornou JSON com dados
- ❌ FALHOU: Erro na resposta

---

#### 3.2 Criar Lead de Teste

Você precisa de um lead para testar. Crie um via API ou banco de dados.

**Opção A: Criar via API** (se endpoint existir):
```bash
curl -X POST http://localhost:3333/api/v1/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "João Teste",
    "email": "joao.teste@example.com",
    "telefone": "11999999999",
    "origem": "WHATSAPP",
    "interesse": "Apartamento 2 quartos",
    "ai_enabled": true
  }'
```

**Opção B: Pegar lead existente**:
```bash
curl http://localhost:3333/api/v1/leads \
  -H "Authorization: Bearer $TOKEN"
```

**Copie o ID do lead**:
```bash
export LEAD_ID="cole_o_id_aqui"
```

---

#### 3.3 Processar Mensagem com IA 🎯

**Este é o teste PRINCIPAL da IA!**

```bash
curl -X POST http://localhost:3333/api/v1/ai/process-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"leadId\": \"$LEAD_ID\",
    \"message\": \"Oi, quero saber sobre apartamentos de 2 quartos na zona sul\"
  }"
```

**Resultado Esperado**:
```json
{
  "success": true,
  "data": {
    "messageId": "uuid-da-mensagem",
    "response": "Olá! Que ótimo interesse! 😊 Temos várias opções de apartamentos de 2 quartos na zona sul. Qual é o seu orçamento aproximado?",
    "analysis": {
      "urgency": "média",
      "intent": "informacao",
      "sentiment": "positivo",
      "scoreImpact": 5
    },
    "newScore": 35,
    "shouldNotifyBroker": false
  }
}
```

**Validações**:
- ✅ Recebeu resposta em português BR
- ✅ Resposta coerente com a mensagem
- ✅ Score foi atualizado
- ✅ Análise de sentimento correta
- ✅ Sofia mencionou zona sul (contexto mantido)

**Se PASSOU**: 🎉 **IA ESTÁ FUNCIONANDO!**

---

#### 3.4 Verificar Histórico de Mensagens

```bash
curl "http://localhost:3333/api/v1/ai/lead/$LEAD_ID/messages" \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado Esperado**:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "content": "Oi, quero saber sobre apartamentos...",
      "isFromLead": true,
      "platform": "WHATSAPP",
      "status": "SENT",
      "aiAnalysis": {...},
      "scoreImpact": 5,
      "createdAt": "..."
    },
    {
      "id": "...",
      "content": "Olá! Que ótimo interesse!...",
      "isFromLead": false,
      "platform": "WHATSAPP",
      "status": "PENDING",
      "createdAt": "..."
    }
  ]
}
```

**Validações**:
- ✅ Mensagem do lead salva (isFromLead: true)
- ✅ Resposta da Sofia salva (isFromLead: false)
- ✅ Platform = WHATSAPP
- ✅ Score impact registrado

---

#### 3.5 Teste de Múltiplas Mensagens (Conversa)

Envie várias mensagens em sequência:

```bash
# Mensagem 1
curl -X POST http://localhost:3333/api/v1/ai/process-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"leadId\": \"$LEAD_ID\",
    \"message\": \"Meu orçamento é até 500 mil\"
  }"

# Mensagem 2
curl -X POST http://localhost:3333/api/v1/ai/process-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"leadId\": \"$LEAD_ID\",
    \"message\": \"Quero visitar ainda esta semana\"
  }"

# Mensagem 3
curl -X POST http://localhost:3333/api/v1/ai/process-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"leadId\": \"$LEAD_ID\",
    \"message\": \"Prefiro na região de Moema\"
  }"
```

**Validações**:
- ✅ Sofia mantém contexto entre mensagens
- ✅ Score aumenta progressivamente
- ✅ Urgência muda para "alta" (terceira mensagem)
- ✅ Respostas coerentes com histórico

---

#### 3.6 Verificar Conversa Completa

```bash
curl "http://localhost:3333/api/v1/ai/lead/$LEAD_ID/conversation" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Resultado Esperado**:
```json
{
  "success": true,
  "data": {
    "lead": {
      "id": "...",
      "nome": "João Teste",
      "score": 55,
      "temperatura": "MORNO",
      "urgency": "alta",
      "sentiment": "positivo",
      "intent": "agendamento",
      "budget": 500000,
      "location": "Moema"
    },
    "messages": [...],
    "stats": {
      "totalMessages": 6,
      "leadMessages": 3,
      "aiResponses": 3
    }
  }
}
```

**Validações**:
- ✅ Lead atualizado com preferências (budget, location)
- ✅ Score aumentou (deve estar entre 50-70)
- ✅ Temperatura atualizada
- ✅ Stats corretos

---

### FASE 4: Testes WhatsApp (15 min)

#### 4.1 Verificar Status WhatsApp

```bash
curl http://localhost:3333/api/v1/whatsapp/status \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado Esperado**:
```json
{
  "success": true,
  "data": {
    "isReady": false,
    "queueLength": 0,
    "messagesSentLastHour": 0,
    "maxMessagesPerHour": 50,
    "isWorkingHours": true,
    "hasQRCode": false
  }
}
```

**Validações**:
- ✅ Endpoint responde
- ✅ isWorkingHours = true (se entre 8h-22h)
- ✅ maxMessagesPerHour = 50

---

#### 4.2 Inicializar WhatsApp

```bash
curl -X POST http://localhost:3333/api/v1/whatsapp/initialize \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado Esperado**:
```json
{
  "success": true,
  "message": "WhatsApp inicializando... Verifique o QR Code em /api/v1/whatsapp/qr"
}
```

**IMPORTANTE**:
- Aguarde 10-15 segundos para QR Code ser gerado
- Verifique logs do servidor para ver QR Code no terminal

---

#### 4.3 Obter QR Code

```bash
curl http://localhost:3333/api/v1/whatsapp/qr \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado Esperado**:
```json
{
  "success": true,
  "data": {
    "qrCode": "2@xKj3mN...",
    "instructions": "Abra o WhatsApp no celular > Aparelhos conectados > Conectar aparelho > Escaneie este QR Code"
  }
}
```

**Como Escanear**:
1. Abra WhatsApp no celular
2. Vá em **Configurações** > **Aparelhos conectados**
3. Toque em **Conectar aparelho**
4. Escaneie o QR Code exibido no terminal OU use uma ferramenta para converter a string em QR visual

**Validações**:
- ✅ QR Code retornado
- ✅ Após escanear, servidor loga: "✅ WhatsApp conectado com sucesso!"

---

#### 4.4 Verificar Conexão

Após escanear QR Code:

```bash
curl http://localhost:3333/api/v1/whatsapp/status \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado Esperado**:
```json
{
  "success": true,
  "data": {
    "isReady": true,  // ← MUDOU!
    "queueLength": 0,
    "messagesSentLastHour": 0,
    "maxMessagesPerHour": 50,
    "isWorkingHours": true,
    "hasQRCode": false  // ← QR Code some após conectar
  }
}
```

**Validações**:
- ✅ isReady = true
- ✅ hasQRCode = false

---

#### 4.5 Teste de Envio Manual

```bash
curl -X POST http://localhost:3333/api/v1/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"leadId\": \"$LEAD_ID\",
    \"message\": \"Olá! Esta é uma mensagem de teste do sistema Imobiflow.\"
  }"
```

**Resultado Esperado**:
```json
{
  "success": true,
  "data": {
    "leadId": "...",
    "message": "Olá! Esta é uma mensagem...",
    "status": "queued"
  }
}
```

**IMPORTANTE**:
- Mensagem é enfileirada (não enviada imediatamente)
- Aguarde 3-8 segundos (delay anti-ban)
- Verifique se mensagem chegou no WhatsApp do lead

**Validações**:
- ✅ Endpoint retornou success
- ✅ Status = "queued"
- ✅ Mensagem apareceu no WhatsApp (aguarde até 10s)

---

#### 4.6 Verificar Fila

```bash
curl http://localhost:3333/api/v1/whatsapp/queue \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado Esperado**:
```json
{
  "success": true,
  "data": {
    "queueLength": 0,
    "messagesSentLastHour": 1,
    "remainingCapacity": 49,
    "estimatedWaitTime": "0 segundos"
  }
}
```

**Validações**:
- ✅ messagesSentLastHour incrementou
- ✅ remainingCapacity correto (50 - enviadas)

---

#### 4.7 Teste COMPLETO: Mensagem Real → IA → Resposta 🎯

**Este é o teste FINAL e MAIS IMPORTANTE!**

1. **Envie mensagem do seu celular** para o número WhatsApp conectado:
   ```
   "Oi, tenho interesse em apartamentos de 3 quartos com vaga de garagem"
   ```

2. **Verifique logs do servidor**:
   ```
   📩 Nova mensagem de 5511999999999
   🔄 Processando mensagem de João Silva (5511999999999)
   ✨ Novo lead criado: João Silva (uuid)
   ✅ Resposta gerada e enfileirada para João Silva
   ✅ Mensagem enviada para 5511999999999
   ```

3. **Aguarde resposta da Sofia** (3-10 segundos)

4. **Verifique no WhatsApp**: Sofia deve responder algo como:
   ```
   "Olá! Que ótimo que você se interessou! 😊 Temos ótimas opções de apartamentos de 3 quartos com garagem. Qual região você prefere?"
   ```

5. **Verifique banco de dados**:
   ```bash
   # Listar leads recentes
   curl http://localhost:3333/api/v1/leads \
     -H "Authorization: Bearer $TOKEN" | jq '.data | .[-1]'
   ```

**Validações COMPLETAS**:
- ✅ Lead criado automaticamente
- ✅ Mensagem do lead salva no banco
- ✅ IA processou e gerou resposta
- ✅ Resposta contextual em português BR
- ✅ Score inicial atribuído (~30)
- ✅ Temperatura inicial = MORNO
- ✅ Resposta enviada no WhatsApp
- ✅ Delay anti-ban funcionou (3-8s)
- ✅ Simulação de "digitando..." apareceu

**Se TODOS passaram**: 🎉 **SISTEMA 100% FUNCIONAL!**

---

### FASE 5: Testes de Stress (Opcional - 10 min)

#### 5.1 Teste de Fila (Múltiplas Mensagens)

```bash
# Envia 10 mensagens rápidas
for i in {1..10}; do
  curl -X POST http://localhost:3333/api/v1/whatsapp/send \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"leadId\": \"$LEAD_ID\",
      \"message\": \"Mensagem de teste $i\"
    }"
  echo "Mensagem $i enviada"
done
```

**Verificar fila**:
```bash
curl http://localhost:3333/api/v1/whatsapp/queue \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado Esperado**:
```json
{
  "queueLength": 10,
  "messagesSentLastHour": 0,
  "remainingCapacity": 50,
  "estimatedWaitTime": "50 segundos"
}
```

**Validações**:
- ✅ Fila aceita múltiplas mensagens
- ✅ Mensagens processadas gradualmente (1 a cada 3-8s)
- ✅ Todas mensagens enviadas eventualmente
- ✅ Logs mostram delay entre envios

---

#### 5.2 Teste de Limite de Mensagens/Hora

```bash
# Tenta enviar 51 mensagens (acima do limite)
for i in {1..51}; do
  curl -X POST http://localhost:3333/api/v1/whatsapp/send \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"leadId\": \"$LEAD_ID\",
      \"message\": \"Teste limite $i\"
    }" &
done
wait

# Aguarda processamento
sleep 300  # 5 minutos

# Verifica quantas foram enviadas
curl http://localhost:3333/api/v1/whatsapp/queue \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado Esperado**:
```json
{
  "queueLength": 1,
  "messagesSentLastHour": 50,
  "remainingCapacity": 0,
  "estimatedWaitTime": "..."
}
```

**Validações**:
- ✅ Máximo 50 mensagens enviadas
- ✅ Mensagem 51 permanece na fila
- ✅ Logs: "⚠️ Limite de mensagens/hora atingido"

---

#### 5.3 Teste de Horário Fora do Expediente

**Se estiver fora de 8h-22h**:

```bash
curl -X POST http://localhost:3333/api/v1/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"leadId\": \"$LEAD_ID\",
    \"message\": \"Mensagem fora do horário\"
  }"
```

**Resultado Esperado**:
- ✅ Status = "queued"
- ✅ isWorkingHours = false
- ✅ Logs: "⚠️ Fora do horário de funcionamento. Mensagem agendada para amanhã."
- ✅ Mensagem só envia depois das 8h

---

### FASE 6: Testes de Fallback (5 min)

#### 6.1 Teste de Fallback OpenAI

Para testar fallback, você precisa:

1. **Desabilitar Claude temporariamente** (remover/invalidar chave):
   ```bash
   # No .env
   ANTHROPIC_API_KEY=""
   AI_FALLBACK_TO_OPENAI="true"
   ```

2. **Reiniciar servidor**

3. **Processar mensagem**:
   ```bash
   curl -X POST http://localhost:3333/api/v1/ai/process-message \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d "{
       \"leadId\": \"$LEAD_ID\",
       \"message\": \"Teste de fallback\"
     }"
   ```

4. **Verificar logs**:
   ```
   ❌ Erro no provider claude: ANTHROPIC_API_KEY não configurada
   🔄 Tentando fallback para OpenAI...
   ✅ Resposta gerada via OpenAI
   ```

**Validações**:
- ✅ Erro no Claude logado
- ✅ Fallback automático para OpenAI
- ✅ Resposta gerada normalmente
- ✅ Provider = "openai" no response

**IMPORTANTE**: Restaure chave Claude após teste!

---

## 📊 RESUMO DOS TESTES

### Checklist Completo:

#### Build e Infraestrutura:
- [x] TypeScript compila sem erros ✅
- [x] Build gera arquivos JS ✅
- [ ] Servidor inicia sem erros
- [ ] Health check responde

#### Autenticação:
- [ ] Login retorna token JWT
- [ ] Token válido por 7 dias

#### IA - Endpoints:
- [ ] GET /ai/stats funciona
- [ ] POST /ai/process-message funciona
- [ ] GET /ai/lead/:id/messages funciona
- [ ] GET /ai/lead/:id/conversation funciona

#### IA - Funcionalidades:
- [ ] Sofia gera respostas em português BR
- [ ] Respostas são contextuais
- [ ] Score é atualizado
- [ ] Análise de sentimento correta
- [ ] Lead é atualizado com preferências
- [ ] Escalação automática funciona (score > 80)

#### WhatsApp - Endpoints:
- [ ] GET /whatsapp/status funciona
- [ ] POST /whatsapp/initialize funciona
- [ ] GET /whatsapp/qr retorna QR Code
- [ ] POST /whatsapp/send enfileira mensagem
- [ ] GET /whatsapp/queue mostra fila

#### WhatsApp - Funcionalidades:
- [ ] QR Code conecta WhatsApp
- [ ] Mensagens são enfileiradas
- [ ] Delay anti-ban funciona (3-8s)
- [ ] Simulação de "digitando..." funciona
- [ ] Limite de 50 msg/hora respeitado
- [ ] Horário 8h-22h respeitado
- [ ] Mensagens fora do horário enfileiradas

#### Integração Completa:
- [ ] Mensagem WhatsApp → Lead criado
- [ ] Mensagem → IA processa → Resposta
- [ ] Score atualizado automaticamente
- [ ] Histórico salvo no banco
- [ ] Escalação automática funciona

#### Fallback:
- [ ] Fallback Claude → OpenAI funciona
- [ ] Retry automático funciona

---

## 🐛 TROUBLESHOOTING

### Problema: "ANTHROPIC_API_KEY não configurada"

**Solução**:
```bash
# Verifique .env
cat apps/api/.env | grep ANTHROPIC

# Deve mostrar:
ANTHROPIC_API_KEY="sk-ant-api03-..."
```

---

### Problema: "Lead não encontrado"

**Solução**:
1. Verifique se LEAD_ID está correto
2. Verifique se lead pertence ao seu tenant
3. Crie novo lead se necessário

---

### Problema: QR Code não aparece

**Solução**:
```bash
# Limpa sessão antiga
rm -rf whatsapp-session/

# Reinicia servidor
pkill -f "pnpm dev"
pnpm dev

# Inicializa novamente
curl -X POST http://localhost:3333/api/v1/whatsapp/initialize
```

---

### Problema: "WhatsApp não está pronto"

**Causas**:
1. Não escaneou QR Code
2. QR Code expirou
3. WhatsApp desconectado

**Solução**:
```bash
# Verifica status
curl http://localhost:3333/api/v1/whatsapp/status

# Se isReady = false, reautentique
curl http://localhost:3333/api/v1/whatsapp/qr
```

---

### Problema: Mensagens não enviadas

**Causas**:
1. Fora do horário (8h-22h)
2. Limite de 50/hora atingido
3. WhatsApp desconectado

**Solução**:
```bash
# Verifica fila
curl http://localhost:3333/api/v1/whatsapp/queue

# Verifica status
curl http://localhost:3333/api/v1/whatsapp/status

# Aguarda ou ajusta limites em whatsapp.service.ts
```

---

## 📈 MÉTRICAS DE SUCESSO

### MVP Validado Se:
- ✅ IA responde 100% das mensagens
- ✅ Score atualizado corretamente
- ✅ WhatsApp envia/recebe sem erros
- ✅ Delay anti-ban funcionando
- ✅ Zero mensagens perdidas
- ✅ Lead criado automaticamente

### Produção Ready Se:
- ✅ Todos testes acima +
- ✅ Fallback testado
- ✅ Stress test passou (50 msgs/hora)
- ✅ Logs limpos (sem errors)
- ✅ Documentação completa

---

## 📝 RELATÓRIO DE TESTES

Use este template para documentar seus resultados:

```markdown
# Relatório de Testes - [Data]

## Ambiente:
- SO: Linux/Mac/Windows
- Node: v20.x.x
- pnpm: 10.x.x
- Banco: PostgreSQL (Render)

## Resultados:

### Build:
- [x] TypeScript: PASSOU
- [x] Build: PASSOU
- [ ] Servidor: PASSOU/FALHOU

### IA:
- [ ] Stats: PASSOU/FALHOU
- [ ] Process Message: PASSOU/FALHOU
- [ ] Histórico: PASSOU/FALHOU
- [ ] Conversa: PASSOU/FALHOU

### WhatsApp:
- [ ] Status: PASSOU/FALHOU
- [ ] QR Code: PASSOU/FALHOU
- [ ] Envio: PASSOU/FALHOU
- [ ] Fila: PASSOU/FALHOU

### Integração:
- [ ] Mensagem → Lead: PASSOU/FALHOU
- [ ] IA → Resposta: PASSOU/FALHOU
- [ ] Score: PASSOU/FALHOU

## Bugs Encontrados:
1. [Descreva bug]
2. [Descreva bug]

## Observações:
[Suas observações]
```

---

**Versão**: 1.0.0
**Última Atualização**: 2025-12-20
**Tempo Total**: 30-60 minutos
**Dificuldade**: Média

🧪 **Bons testes!**
