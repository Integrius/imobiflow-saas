# 📱 Integração WhatsApp - whatsapp-web.js

**Status**: ✅ Implementado
**Versão**: 1.0.0
**Data**: 2025-12-20

---

## 🎯 Visão Geral

Integração completa do WhatsApp com o sistema Imobiflow usando **whatsapp-web.js** (não-oficial) com **controles anti-ban** para evitar bloqueios.

### Funcionalidades:

✅ Recepção automática de mensagens
✅ Respostas automatizadas via IA (Sofia)
✅ QR Code para autenticação
✅ Controles anti-ban robustos
✅ Fila de mensagens inteligente
✅ Simulação de digitação
✅ Horário de funcionamento
✅ Limite de mensagens/hora
✅ Criação automática de leads

---

## 🛡️ Controles Anti-Ban Implementados

### 1. **Delays Humanizados**
- Delay mínimo: 3 segundos entre mensagens
- Delay máximo: 8 segundos entre mensagens
- Variação aleatória para parecer humano

### 2. **Simulação de Digitação**
- Estado "digitando..." antes de enviar
- Duração: 2 segundos
- Simula comportamento real

### 3. **Limite de Mensagens**
- Máximo: 50 mensagens/hora (conservador)
- Reset automático a cada hora
- Mensagens excedentes vão para fila

### 4. **Horário de Funcionamento**
- Horário: 8h - 22h
- Mensagens fora do horário são enfileiradas
- Previne envios suspeitos de madrugada

### 5. **Fila Inteligente**
- Processamento gradual
- Priorização (alta/normal)
- Retry automático (máx 3 tentativas)

---

## 🏗️ Arquitetura

```
WhatsApp → whatsapp-web.js → WhatsAppService → WhatsAppHandler → AI Router → Sofia
                                     ↓                                  ↓
                              Anti-Ban Controls                    Database
                                     ↓
                              Message Queue
```

### Componentes:

1. **WhatsAppService** ([whatsapp.service.ts](../apps/api/src/messaging/whatsapp/whatsapp.service.ts))
   - Gerencia conexão WhatsApp
   - Controles anti-ban
   - Fila de mensagens
   - QR Code

2. **WhatsAppHandler** ([whatsapp-handler.service.ts](../apps/api/src/messaging/whatsapp/whatsapp-handler.service.ts))
   - Processa mensagens recebidas
   - Integra com IA
   - Cria/atualiza leads
   - Salva histórico

3. **WhatsApp Routes** ([whatsapp.routes.ts](../apps/api/src/modules/whatsapp/whatsapp.routes.ts))
   - 6 endpoints REST
   - Controle manual
   - Status e monitoramento

---

## 📡 Endpoints REST

Base URL: `https://imobiflow-saas-1.onrender.com/api/v1/whatsapp`

### 1. GET `/status`
**Retorna status da conexão**

#### Response:
```json
{
  "success": true,
  "data": {
    "isReady": true,
    "queueLength": 5,
    "messagesSentLastHour": 12,
    "maxMessagesPerHour": 50,
    "isWorkingHours": true,
    "hasQRCode": false
  }
}
```

#### Exemplo:
```bash
curl https://imobiflow-saas-1.onrender.com/api/v1/whatsapp/status \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### 2. GET `/qr`
**Retorna QR Code para autenticação**

#### Response:
```json
{
  "success": true,
  "data": {
    "qrCode": "2@xKj3mN...",
    "instructions": "Abra o WhatsApp no celular > Aparelhos conectados > Conectar aparelho > Escaneie este QR Code"
  }
}
```

#### Exemplo:
```bash
curl https://imobiflow-saas-1.onrender.com/api/v1/whatsapp/qr \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Nota**: Só retorna QR Code se WhatsApp ainda não estiver conectado.

---

### 3. POST `/send`
**Envia mensagem manual para um lead**

#### Request:
```json
{
  "leadId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Olá! Vi que você está interessado em apartamentos. Posso ajudar?"
}
```

#### Response:
```json
{
  "success": true,
  "data": {
    "leadId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Olá! Vi que você está interessado...",
    "status": "queued"
  }
}
```

#### Exemplo:
```bash
curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "leadId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Olá! Como posso ajudar?"
  }'
```

---

### 4. POST `/initialize`
**Inicializa conexão WhatsApp**

#### Response:
```json
{
  "success": true,
  "message": "WhatsApp inicializando... Verifique o QR Code em /api/v1/whatsapp/qr"
}
```

#### Exemplo:
```bash
curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/whatsapp/initialize \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Importante**: Após inicializar, escaneie o QR Code rapidamente (2 minutos de validade).

---

### 5. POST `/disconnect`
**Desconecta WhatsApp**

#### Response:
```json
{
  "success": true,
  "message": "WhatsApp desconectado com sucesso"
}
```

#### Exemplo:
```bash
curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/whatsapp/disconnect \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### 6. GET `/queue`
**Informações sobre fila de mensagens**

#### Response:
```json
{
  "success": true,
  "data": {
    "queueLength": 8,
    "messagesSentLastHour": 23,
    "remainingCapacity": 27,
    "estimatedWaitTime": "40 segundos"
  }
}
```

---

## 🚀 Como Usar

### 1. Primeiro Uso - Autenticação

```bash
# 1. Inicializar WhatsApp
curl -X POST http://localhost:3333/api/v1/whatsapp/initialize \
  -H "Authorization: Bearer TOKEN"

# 2. Pegar QR Code
curl http://localhost:3333/api/v1/whatsapp/qr \
  -H "Authorization: Bearer TOKEN"

# 3. Escanear QR Code no WhatsApp do celular
# WhatsApp > Configurações > Aparelhos conectados > Conectar aparelho

# 4. Verificar status
curl http://localhost:3333/api/v1/whatsapp/status \
  -H "Authorization: Bearer TOKEN"
```

### 2. Fluxo Automático

Após autenticado, o sistema funciona automaticamente:

1. Lead envia mensagem no WhatsApp
2. Sistema recebe e cria/atualiza lead
3. IA (Sofia) analisa mensagem
4. Score e temperatura são atualizados
5. IA gera resposta contextual
6. Mensagem é enfileirada com delay anti-ban
7. Resposta é enviada de forma humanizada

### 3. Envio Manual

```bash
curl -X POST http://localhost:3333/api/v1/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "leadId": "ID_DO_LEAD",
    "message": "Olá! Temos novos apartamentos disponíveis."
  }'
```

---

## 🔒 Segurança

### Autenticação:
✅ Todas as rotas protegidas com JWT
✅ Multi-tenancy via middleware
✅ Validação de ownership (lead pertence ao tenant)

### Dados:
✅ Sessão WhatsApp criptografada localmente
✅ Mensagens salvas no banco com tenant_id
✅ Números de telefone formatados e validados

### Anti-Spam:
✅ Limite de 50 msg/hora
✅ Fila inteligente
✅ Delays humanizados
✅ Horário de funcionamento

---

## 📊 Monitoramento

### Logs Importantes:

```bash
# WhatsApp conectado
✅ WhatsApp conectado com sucesso!

# QR Code gerado
📱 QR Code recebido. Escaneie com WhatsApp:

# Nova mensagem recebida
📩 Nova mensagem de 5511999999999:

# Mensagem processada com IA
🔄 Processando mensagem de João Silva (5511999999999)

# Mensagem enviada
✅ Mensagem enviada para 5511999999999

# Fora do horário
⚠️  Fora do horário de funcionamento. Mensagem agendada para amanhã.

# Limite atingido
⚠️  Limite de mensagens/hora atingido. Mensagem enfileirada.
```

### Métricas:

```bash
# Status geral
curl http://localhost:3333/api/v1/whatsapp/status \
  -H "Authorization: Bearer TOKEN"

# Fila de mensagens
curl http://localhost:3333/api/v1/whatsapp/queue \
  -H "Authorization: Bearer TOKEN"
```

---

## ⚠️ Limitações e Riscos

### 1. **Não é API Oficial**
- whatsapp-web.js simula navegador
- WhatsApp pode detectar e banir
- Não recomendado para produção de larga escala

### 2. **Riscos de Ban**
Mesmo com controles anti-ban, há risco se:
- Enviar muitas mensagens (>100/dia)
- Comportamento muito repetitivo
- Múltiplos números em curto período
- Mensagens idênticas para múltiplos contatos

### 3. **Recomendações**
- ✅ Use para MVP e testes
- ✅ Máximo 50 leads/dia inicialmente
- ✅ Varie mensagens
- ✅ Evite spam
- ⚠️ Migre para WhatsApp Business API após validação
- ⚠️ Tenha número backup

---

## 🔄 Migração para WhatsApp Business API

Quando escalar, migre para API oficial:

### Vantagens:
- ✅ Oficial e suportado pelo Meta
- ✅ Sem risco de ban
- ✅ Webhooks confiáveis
- ✅ Templates pré-aprovados
- ✅ Suporte a mídia

### Desvantagens:
- ❌ Custo (R$ 0.10-0.50 por conversa)
- ❌ Processo de aprovação
- ❌ Requer verificação de negócio

### Providers Recomendados:
1. **360Dialog** - Popular no Brasil
2. **Wati.io** - All-in-one
3. **MessageBird** - Global

---

## 🧪 Testes

### 1. Teste Local

```bash
# Terminal 1: Inicia servidor
cd apps/api
pnpm dev

# Terminal 2: Inicializa WhatsApp
curl -X POST http://localhost:3333/api/v1/whatsapp/initialize \
  -H "Authorization: Bearer TOKEN"

# Terminal 3: Monitora logs
tail -f logs/whatsapp.log
```

### 2. Teste de Mensagem

1. Autentique WhatsApp (QR Code)
2. Envie mensagem do seu celular para o número conectado
3. Verifique se Sofia respondeu
4. Confira score atualizado no banco

### 3. Teste de Fila

```bash
# Envia 10 mensagens rápidas
for i in {1..10}; do
  curl -X POST http://localhost:3333/api/v1/whatsapp/send \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer TOKEN" \
    -d "{\"leadId\":\"$LEAD_ID\",\"message\":\"Teste $i\"}"
done

# Verifica fila
curl http://localhost:3333/api/v1/whatsapp/queue \
  -H "Authorization: Bearer TOKEN"
```

---

## 🔧 Troubleshooting

### Problema: QR Code não aparece

**Solução**:
```bash
# 1. Limpa sessão antiga
rm -rf whatsapp-session/

# 2. Reinicia servidor
pnpm dev

# 3. Inicializa novamente
curl -X POST http://localhost:3333/api/v1/whatsapp/initialize
```

### Problema: "WhatsApp não está pronto"

**Solução**:
```bash
# Verifica status
curl http://localhost:3333/api/v1/whatsapp/status

# Se isReady = false, reautentique
curl http://localhost:3333/api/v1/whatsapp/qr
```

### Problema: Mensagens não são enviadas

**Causas possíveis**:
1. Fora do horário (8h-22h)
2. Limite de 50 msg/hora atingido
3. Fila muito grande

**Solução**:
```bash
# Verifica fila
curl http://localhost:3333/api/v1/whatsapp/queue

# Aguarda processamento ou ajusta limites em whatsapp.service.ts
```

### Problema: "Auth failure"

**Solução**:
1. Desconecte aparelhos vinculados no WhatsApp
2. Delete pasta `whatsapp-session/`
3. Reautentique com QR Code novo

---

## 📈 Métricas de Sucesso

### MVP (Primeiros 30 dias):
- ✅ 10-30 leads atendidos/dia
- ✅ Taxa de resposta automática: >90%
- ✅ Score médio aumentado: >20%
- ✅ Zero banimentos

### Produção (Após validação):
- Migrar para WhatsApp Business API
- 100-500 conversas/dia
- Integração com CRM completo
- Templates aprovados pelo Meta

---

## 🎓 Boas Práticas

### 1. **Varie as Mensagens**
- ❌ "Olá! Temos apartamentos disponíveis." (repetitiva)
- ✅ Use IA para gerar respostas únicas

### 2. **Respeite Horários**
- ✅ 8h-22h (já implementado)
- ✅ Evite fins de semana (configurável)

### 3. **Monitore Métricas**
```bash
# Diariamente
curl http://localhost:3333/api/v1/whatsapp/queue
```

### 4. **Backup**
```bash
# Backup da sessão WhatsApp
tar -czf whatsapp-session-backup.tar.gz whatsapp-session/
```

---

## 📚 Referências

- [whatsapp-web.js Docs](https://wwebjs.dev/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [360Dialog](https://www.360dialog.com/)
- [Anti-Ban Best Practices](https://github.com/pedroslopez/whatsapp-web.js/issues/1234)

---

## ✅ Checklist de Implementação

- [x] Instalar whatsapp-web.js
- [x] Criar WhatsAppService com anti-ban
- [x] Implementar fila de mensagens
- [x] Delays humanizados (3-8s)
- [x] Simulação de digitação
- [x] Limite de mensagens/hora (50)
- [x] Horário de funcionamento (8h-22h)
- [x] WhatsAppHandler para processar msgs
- [x] Integração com AI Router
- [x] Criação automática de leads
- [x] 6 endpoints REST
- [x] Autenticação e multi-tenancy
- [x] Documentação completa

**Status**: ✅ **100% COMPLETO**

---

**Versão**: 1.0.0
**Última atualização**: 2025-12-20
**Próximo passo**: Testar em produção com leads reais
