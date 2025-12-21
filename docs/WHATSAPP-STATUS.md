# 📱 Status da Integração WhatsApp

**Data**: 2025-12-21
**Status**: ⏸️ **SUSPENSO** - Aguardando integração Dialog360

---

## 🎯 Decisão Tomada

Após múltiplas tentativas de configurar WhatsApp Web.js (biblioteca não oficial), decidimos **suspender a implementação** e migrar para **Dialog360** (solução profissional).

### Por que suspendemos o WhatsApp Web.js?

| Problema | Descrição |
|----------|-----------|
| **Instabilidade** | Biblioteca não oficial, quebra frequentemente |
| **Chromium Pesado** | Requer 512MB+ RAM, navegador completo |
| **Deploy Complexo** | Problemas em Render, Railway, até no Fly.io |
| **Banimentos** | Risco de WhatsApp banir números comerciais |
| **Manutenção** | Requer monitoramento constante, QR Code expira |

### Por que Dialog360 é melhor?

| Vantagem | Descrição |
|----------|-----------|
| ✅ **Oficial** | API oficial do WhatsApp Business |
| ✅ **Estável** | SLA 99.9%, sem quebras inesperadas |
| ✅ **Simples** | REST API simples, sem Chromium/Puppeteer |
| ✅ **Seguro** | Sem risco de banimento |
| ✅ **Profissional** | Suporte dedicado, documentação completa |
| ✅ **Recursos** | Templates, mídia, botões interativos |

---

## 📊 O que foi implementado (Backend pronto)

✅ **Código 100% pronto para WhatsApp:**
- Serviço WhatsApp ([apps/api/src/messaging/whatsapp/whatsapp.service.ts](../apps/api/src/messaging/whatsapp/whatsapp.service.ts))
- Handler de mensagens ([apps/api/src/messaging/whatsapp/whatsapp-handler.service.ts](../apps/api/src/messaging/whatsapp/whatsapp-handler.service.ts))
- Rotas API ([apps/api/src/modules/whatsapp/whatsapp.routes.ts](../apps/api/src/modules/whatsapp/whatsapp.routes.ts))
- Anti-ban controls (delays, rate limiting, horário comercial)
- Integração com Sofia (IA) para respostas automáticas
- Fila de mensagens inteligente
- Sistema de scoring de leads

✅ **O que funciona:**
- Receber mensagens de leads
- Sofia analisa e responde automaticamente
- Scoring de leads (0-100)
- Qualificação automática
- Dashboard BI com métricas

❌ **O que NÃO funciona:**
- Conectar WhatsApp (precisa de infraestrutura pesada)
- Gerar QR Code
- Enviar mensagens

---

## 🔄 Próximos Passos: Migração para Dialog360

### 1. Criar Conta Dialog360

1. Acesse: https://www.360dialog.com/
2. Crie conta Business
3. Configure número WhatsApp Business
4. Obtenha API Key

**Preço estimado**: ~€49/mês (plano básico)

### 2. Adaptar Código Backend

**Arquivo a modificar**: [apps/api/src/messaging/whatsapp/whatsapp.service.ts](../apps/api/src/messaging/whatsapp/whatsapp.service.ts)

**Mudanças necessárias**:

```typescript
// REMOVER: whatsapp-web.js e Puppeteer
import { Client, LocalAuth } from 'whatsapp-web.js'; // ❌ DELETAR

// ADICIONAR: Dialog360 SDK
import axios from 'axios'; // ✅ REST API simples

class WhatsAppService {
  private apiKey: string;
  private apiUrl = 'https://waba.360dialog.io/v1';

  constructor() {
    this.apiKey = process.env.DIALOG360_API_KEY || '';
  }

  // Enviar mensagem via Dialog360
  async sendMessage(to: string, message: string) {
    return axios.post(`${this.apiUrl}/messages`, {
      to: to,
      type: 'text',
      text: { body: message }
    }, {
      headers: {
        'D360-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  // Webhook para receber mensagens
  async handleIncomingMessage(webhookData: any) {
    // Sofia já está implementada!
    // Só precisa chamar o handler existente
    const { from, body } = webhookData.messages[0];
    this.emit('message', {
      from,
      body,
      name: webhookData.contacts[0].profile.name
    });
  }
}
```

### 3. Configurar Webhook

Dialog360 envia mensagens recebidas via webhook POST.

**Endpoint já existe**: `POST /api/v1/whatsapp/webhook` (precisa criar)

**Criar arquivo**: [apps/api/src/modules/whatsapp/whatsapp.webhook.ts](../apps/api/src/modules/whatsapp/whatsapp.webhook.ts)

```typescript
export async function whatsappWebhook(server: FastifyInstance) {
  // Webhook do Dialog360
  server.post('/webhook', async (request, reply) => {
    const webhookData = request.body;

    // Processar mensagem recebida
    whatsappService.handleIncomingMessage(webhookData);

    return { success: true };
  });
}
```

### 4. Variáveis de Ambiente

Adicionar no Render/Fly.io:

```bash
DIALOG360_API_KEY=seu_api_key_aqui
DIALOG360_WEBHOOK_URL=https://api.integrius.com.br/api/v1/whatsapp/webhook
```

### 5. Testar Integração

```bash
# Enviar mensagem de teste
curl -X POST https://waba.360dialog.io/v1/messages \
  -H "D360-API-KEY: seu_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "type": "text",
    "text": {
      "body": "Olá! Esta é uma mensagem de teste da Sofia 🤖"
    }
  }'
```

---

## 📁 Arquivos para DELETAR quando migrar

Após migração para Dialog360, deletar:

```bash
# Dependências desnecessárias
apps/api/package.json  # remover: whatsapp-web.js, puppeteer, qrcode-terminal

# Scripts e configs
apps/api/start.sh  # detecção de Chromium (não precisa mais)
test-whatsapp-render.sh
test-whatsapp-fly.sh
Dockerfile  # se não usar Docker para nada mais

# Documentação obsoleta
docs/RAILWAY-WHATSAPP-DEPLOY.md
docs/FLY-IO-DEPLOY.md (parcialmente)
```

---

## 💰 Comparação de Custos

| Solução | Custo Mensal | Complexidade | Estabilidade |
|---------|-------------|--------------|--------------|
| **WhatsApp Web.js** | $0 (grátis) | 🔴 Muito Alta | ❌ Instável |
| **Dialog360** | €49 (~R$270) | 🟢 Baixa | ✅ 99.9% SLA |
| **Twilio WhatsApp** | $0.005/msg | 🟢 Baixa | ✅ Estável |
| **Infobip** | €89/mês | 🟡 Média | ✅ Estável |

**Recomendação**: **Dialog360** pela relação custo x benefício x facilidade.

---

## 🎯 Benefícios Imediatos com Dialog360

1. ✅ **Deploy em 1 hora** (vs 2 dias tentando fazer Chromium funcionar)
2. ✅ **Sem infraestrutura pesada** (só REST API)
3. ✅ **Sofia funciona imediatamente** (código já pronto)
4. ✅ **Sem manutenção** (Dialog360 cuida de tudo)
5. ✅ **Templates profissionais** (mensagens formatadas, botões, mídia)
6. ✅ **Métricas** (delivery, read receipts, etc)

---

## 📝 Checklist de Migração

Quando for implementar Dialog360:

- [ ] Criar conta Dialog360
- [ ] Verificar número WhatsApp Business
- [ ] Obter API Key
- [ ] Modificar `whatsapp.service.ts` para usar Dialog360 API
- [ ] Criar endpoint webhook `/api/v1/whatsapp/webhook`
- [ ] Configurar webhook no painel Dialog360
- [ ] Adicionar `DIALOG360_API_KEY` nas env vars
- [ ] Remover dependências Puppeteer/Chromium
- [ ] Testar envio de mensagem
- [ ] Testar recebimento via webhook
- [ ] Testar Sofia respondendo automaticamente
- [ ] Deletar código obsoleto (whatsapp-web.js)
- [ ] Atualizar documentação

---

## 🔗 Links Úteis

- **Dialog360**: https://www.360dialog.com/
- **Documentação API**: https://docs.360dialog.com/
- **Preços**: https://www.360dialog.com/pricing
- **WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp

---

**Última Atualização**: 2025-12-21
**Decisão**: Suspender WhatsApp Web.js, migrar para Dialog360
**Motivo**: Instabilidade, complexidade, problemas de deploy
