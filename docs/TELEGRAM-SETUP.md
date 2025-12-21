# 🤖 Configuração do Bot Telegram - ImobiFlow

**Data**: 2025-12-21
**Status**: ✅ **IMPLEMENTADO** - Pronto para configuração

---

## 🎯 Funcionalidade

Notificações automáticas via Telegram quando um lead for atribuído a um corretor.

**O que o corretor recebe:**
- 📱 Nome, telefone e email do lead
- 🏡 Preferências (tipo de imóvel, negócio, valores)
- 📍 Localização desejada (estado, município, bairro)
- 🛏️ Características (quartos, vagas, área, pets)
- 💬 Observações do cliente
- 🆔 ID do lead para consulta

---

## 📋 Passo a Passo - Configuração Inicial

### 1. Criar o Bot no Telegram

1. Abra o Telegram e procure por: **@BotFather**
2. Inicie uma conversa com `/start`
3. Digite `/newbot`
4. Escolha um nome para o bot (ex: "ImobiFlow Notificações")
5. Escolha um username (ex: "imobiflow_bot" - deve terminar em `_bot`)
6. **Copie o Token** que o BotFather enviar (formato: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Configurar Token no Backend

Adicione a variável de ambiente no Render:

```bash
TELEGRAM_BOT_TOKEN=seu_token_aqui
```

**No painel do Render:**
1. Acesse: https://dashboard.render.com/
2. Selecione o serviço **ImobiFlow API**
3. Vá em **Environment**
4. Clique em **Add Environment Variable**
5. Nome: `TELEGRAM_BOT_TOKEN`
6. Valor: cole o token do BotFather
7. Clique em **Save Changes**
8. Aguarde o redeploy automático

### 3. Obter Chat ID de Cada Corretor

**Para cada corretor:**

1. **Corretor inicia conversa com o bot:**
   - Abrir Telegram
   - Procurar pelo username do bot (ex: @imobiflow_bot)
   - Clicar em **START** ou enviar `/start`
   - Enviar qualquer mensagem (ex: "Olá")

2. **Admin consulta os chat_ids:**

```bash
# Via API (após configurar TELEGRAM_BOT_TOKEN)
curl https://api.integrius.com.br/api/v1/telegram/updates
```

**Resposta esperada:**
```json
{
  "success": true,
  "unique_chats": 2,
  "chats": [
    {
      "chat_id": "123456789",
      "username": "joao_corretor",
      "first_name": "João",
      "last_name": "Silva",
      "last_message": "Olá"
    }
  ]
}
```

3. **Salvar chat_id no perfil do corretor:**

```sql
-- Atualizar corretor com telegram_chat_id
UPDATE corretores
SET telegram_chat_id = '123456789'
WHERE creci = 'CRECI_DO_CORRETOR';
```

**OU via API (em breve):**

```bash
# PUT /api/v1/corretores/:id
curl -X PUT https://api.integrius.com.br/api/v1/corretores/corretor_id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_chat_id": "123456789"
  }'
```

### 4. Testar Notificação

```bash
# Enviar mensagem de teste para um corretor
curl -X POST https://api.integrius.com.br/api/v1/telegram/test \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "123456789",
    "message": "Teste de notificação ImobiFlow! 🎉"
  }'
```

**Mensagem de sucesso:**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso!",
  "chat_id": "123456789"
}
```

---

## 🔄 Fluxo Automático

### Quando um lead é atribuído:

1. Admin/Gestor atribui lead a um corretor no dashboard
2. Sistema verifica se corretor possui `telegram_chat_id`
3. Se sim: envia notificação formatada automaticamente
4. Corretor recebe no Telegram em tempo real

**Exemplo de notificação:**

```
🎯 NOVO LEAD ATRIBUÍDO

👤 Cliente: Maria Silva
📱 WhatsApp: (11) 98765-4321
📧 Email: maria@email.com

━━━━━━━━━━━━━━━━━━━━

🏡 PREFERÊNCIAS:

📋 Tipo: 🔑 Aluguel
🏢 Imóvel: Apartamento
💰 Valor: R$ 1.500,00 - R$ 2.500,00
📍 Local: Centro, São Paulo, SP
🛏️ Quartos: 2 - 3
🚗 Vagas: Mínimo 1
📐 Área mín: 60m²
🐾 Aceita pets: ✅ Sim

💬 Observações:
Preciso mudar até o final do mês. Prefiro próximo ao metrô.

━━━━━━━━━━━━━━━━━━━━

✅ Atribuído para: João Silva

🆔 ID do Lead: abc123-def456

⏰ Entre em contato o quanto antes!
```

---

## 🛠️ Endpoints Disponíveis

### 1. Verificar Status do Bot

```bash
GET /api/v1/telegram/status
```

**Resposta quando configurado:**
```json
{
  "success": true,
  "configured": true,
  "botInfo": {
    "id": 123456789,
    "username": "imobiflow_bot",
    "first_name": "ImobiFlow Notificações"
  }
}
```

### 2. Obter Chat IDs (Updates)

```bash
GET /api/v1/telegram/updates
```

Retorna todas as conversas recentes com o bot para descobrir chat_ids.

### 3. Enviar Mensagem de Teste

```bash
POST /api/v1/telegram/test
{
  "chat_id": "123456789",
  "message": "Mensagem opcional"
}
```

### 4. Notificar Lead Manualmente

```bash
POST /api/v1/telegram/notify-lead
{
  "lead_id": "id_do_lead",
  "chat_id": "123456789"  // Opcional, usa o do corretor se não fornecido
}
```

---

## 📊 Dashboard - Configuração por Corretor

**Adicionar campo na interface (futuro):**

```tsx
// Em /apps/web/components/CorretorForm.tsx

<div>
  <label>Telegram Chat ID</label>
  <input
    type="text"
    placeholder="Ex: 123456789"
    helperText="Para receber notificações de leads. Ver documentação."
  />
  <button onClick={descobrirChatId}>
    Como descobrir meu Chat ID?
  </button>
</div>
```

---

## ⚙️ Variáveis de Ambiente

Adicionar no Render:

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

**Opcional (futuro):**
```bash
TELEGRAM_WEBHOOK_URL=https://api.integrius.com.br/api/v1/telegram/webhook
```

---

## 🧪 Checklist de Configuração

- [ ] Criar bot no @BotFather
- [ ] Copiar token do bot
- [ ] Adicionar `TELEGRAM_BOT_TOKEN` no Render
- [ ] Aguardar redeploy do backend
- [ ] Testar status: `GET /api/v1/telegram/status`
- [ ] Cada corretor inicia conversa com o bot
- [ ] Admin consulta chat_ids: `GET /api/v1/telegram/updates`
- [ ] Atualizar `telegram_chat_id` de cada corretor no banco
- [ ] Testar notificação: `POST /api/v1/telegram/test`
- [ ] Atribuir lead de teste e verificar se notificação chega
- [ ] ✅ Bot configurado!

---

## 🔍 Troubleshooting

### Bot não envia mensagens

**Problema:** `chat not found`
- **Solução:** Corretor precisa iniciar conversa com o bot primeiro (enviar /start)

**Problema:** `Unauthorized`
- **Solução:** Token incorreto, verificar `TELEGRAM_BOT_TOKEN`

### Corretor não recebe notificação

**Verificar:**
1. `telegram_chat_id` está salvo no banco?
2. Chat ID está correto?
3. Corretor deu /start no bot?
4. `TELEGRAM_BOT_TOKEN` está configurado?

**Logs no backend:**
```bash
# Ver logs do Render
✅ Notificação Telegram enviada para João Silva
```

ou

```bash
⚠️  Corretor João Silva não possui telegram_chat_id configurado
```

### Como resetar bot

Se precisar recriar o bot:

1. No @BotFather: `/deletebot` + escolher bot
2. Criar novo bot: `/newbot`
3. Atualizar `TELEGRAM_BOT_TOKEN` com novo token
4. Todos os corretores precisarão dar /start novamente
5. Obter novos chat_ids

---

## 📁 Arquivos Implementados

- [apps/api/src/shared/services/telegram.service.ts](../apps/api/src/shared/services/telegram.service.ts) - Serviço principal
- [apps/api/src/modules/telegram/telegram.routes.ts](../apps/api/src/modules/telegram/telegram.routes.ts) - Rotas API
- [apps/api/src/modules/leads/leads.service.ts](../apps/api/src/modules/leads/leads.service.ts) - Integração automática
- [apps/api/prisma/schema.prisma](../apps/api/prisma/schema.prisma) - Campo `telegram_chat_id`

---

## 🎯 Próximas Melhorias (Futuro)

- [ ] Interface no dashboard para configurar chat_id
- [ ] Webhook para receber comandos do bot
- [ ] Comandos: `/meus_leads`, `/stats`, `/help`
- [ ] Notificações de novos leads (não atribuídos)
- [ ] Alertas de follow-up vencido
- [ ] Confirmação de leitura pelo corretor

---

**Última Atualização**: 2025-12-21
**Status**: ✅ Backend completo, aguardando configuração do bot
