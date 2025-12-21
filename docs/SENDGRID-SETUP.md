# 📧 Configuração do SendGrid - ImobiFlow

**Data**: 2025-12-21
**Status**: ✅ **IMPLEMENTADO** - Pronto para configuração

---

## 🎯 Funcionalidade

Envio de emails transacionais e de marketing para leads via SendGrid.

**Emails automáticos enviados:**
1. ✅ **Email de boas-vindas** - Enviado imediatamente quando lead preenche formulário
2. 🔜 **Email com sugestões de imóveis** - Após Sofia (IA) analisar e buscar imóveis compatíveis
3. 🔜 **Email de follow-up** - Lembretes e atualizações sobre imóveis

---

## 📋 Passo a Passo - Configuração Inicial

### 1. Criar Conta no SendGrid

1. Acesse: https://signup.sendgrid.com/
2. Escolha plano **FREE** (até 100 emails/dia - suficiente para teste)
3. Complete o cadastro e verificação de email

**Planos:**
- **Free**: 100 emails/dia = 3.000 emails/mês (grátis)
- **Essentials**: $19.95/mês = 50.000 emails/mês
- **Pro**: $89.95/mês = 100.000 emails/mês

### 2. Verificar Domínio (Single Sender Authentication)

**Opção Rápida - Single Sender:**

1. No dashboard SendGrid: **Settings** > **Sender Authentication**
2. Clique em **Verify a Single Sender**
3. Preencha:
   - **From Name**: ImobiFlow
   - **From Email Address**: noreply@integrius.com.br
   - **Reply To**: contato@integrius.com.br
   - **Company**: Integrius / ImobiFlow
   - **Address**: Seu endereço
4. Clique em **Create**
5. Verifique o email recebido e clique no link de verificação

**Opção Profissional - Domain Authentication (Recomendado):**

1. No dashboard SendGrid: **Settings** > **Sender Authentication**
2. Clique em **Authenticate Your Domain**
3. Selecione **DNS Provider**: onde está hospedado seu domínio (Cloudflare, GoDaddy, etc)
4. Digite seu domínio: `integrius.com.br`
5. SendGrid irá fornecer **DNS records** (CNAME) para adicionar:

```
# Exemplo de records fornecidos pelo SendGrid
em9876.integrius.com.br → CNAME → u12345.wl234.sendgrid.net
s1._domainkey.integrius.com.br → CNAME → s1.domainkey.u12345.wl234.sendgrid.net
s2._domainkey.integrius.com.br → CNAME → s2.domainkey.u12345.wl234.sendgrid.net
```

6. Adicione esses records no painel DNS do seu domínio
7. Aguarde propagação (até 48h, geralmente 1-2 horas)
8. Volte no SendGrid e clique em **Verify**

### 3. Criar API Key

1. No dashboard SendGrid: **Settings** > **API Keys**
2. Clique em **Create API Key**
3. Nome: `ImobiFlow Production API`
4. Permissões: **Full Access** (ou no mínimo **Mail Send**)
5. Clique em **Create & View**
6. **COPIE A KEY** (você só verá uma vez!)
   - Formato: `SG.aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789...`

### 4. Configurar no Backend (Render)

Adicione as seguintes variáveis de ambiente no Render:

```bash
SENDGRID_API_KEY=SG.aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789...
SENDGRID_FROM_EMAIL=noreply@integrius.com.br
SENDGRID_FROM_NAME=ImobiFlow
```

**No painel do Render:**
1. Acesse: https://dashboard.render.com/
2. Selecione o serviço **ImobiFlow API**
3. Vá em **Environment**
4. Adicione as 3 variáveis acima
5. Clique em **Save Changes**
6. Aguarde o redeploy automático

---

## 🧪 Testar Envio de Email

### Teste Manual via CURL

```bash
# Testar envio de email direto via SendGrid API
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer SG.sua_api_key_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{
      "to": [{"email": "seu-email@gmail.com"}]
    }],
    "from": {"email": "noreply@integrius.com.br", "name": "ImobiFlow"},
    "subject": "Teste SendGrid",
    "content": [{
      "type": "text/html",
      "value": "<h1>Teste funcionando!</h1>"
    }]
  }'
```

### Teste via ImobiFlow

1. **Preencher formulário de captura:**
   - Acesse: https://integrius.com.br (quando frontend deployed)
   - Preencha o formulário com **SEU EMAIL**
   - Envie

2. **Verificar logs do backend:**

```bash
# No Render, ver logs
✅ Lead capturado: Seu Nome (abc-123-def)
✅ Email enviado para seuemail@gmail.com
```

3. **Verificar caixa de entrada:**
   - Você deve receber email de boas-vindas
   - Subject: "Olá [Seu Nome]! Recebemos sua solicitação 🏡"

---

## 📧 Emails Implementados

### 1. Email de Boas-Vindas (Ativo)

**Quando é enviado:**
- Automaticamente ao preencher formulário de captura

**Conteúdo:**
- Confirmação de recebimento
- Resumo da busca (tipo de imóvel, localização, etc)
- Próximos passos (IA analisando, corretor entrará em contato)
- Design responsivo com cores do ImobiFlow

**Preview:**
![Email Preview](https://via.placeholder.com/600x400?text=Email+Boas-Vindas)

### 2. Email de Sugestões de Imóveis (Futuro)

**Quando será enviado:**
- Após Sofia (IA) analisar perfil e encontrar imóveis compatíveis

**Conteúdo:**
- Lista de 3-5 imóveis recomendados
- Fotos, valores, características
- Botão "Ver detalhes" para cada imóvel
- Call-to-action para agendar visita

**Arquivo:**
[apps/api/src/shared/services/sendgrid.service.ts](../apps/api/src/shared/services/sendgrid.service.ts#L200)

**Função:**
```typescript
sendGridService.enviarSugestoesImoveis({
  leadNome: 'João Silva',
  leadEmail: 'joao@email.com',
  imoveis: [
    {
      titulo: 'Apartamento Moderno no Centro',
      tipo: 'Apartamento',
      valor: 350000,
      localizacao: 'Centro, São Paulo, SP',
      quartos: 3,
      vagas: 2,
      area: 85,
      descricao: 'Apartamento completamente reformado...',
      url: 'https://integrius.com.br/imoveis/123'
    }
  ],
  totalSugestoes: 5
})
```

---

## 🔄 Fluxo Automático

### Lead Capture → Email

```
1. Lead preenche formulário
   ↓
2. Backend cria lead no banco
   ↓
3. SendGrid Service envia email de boas-vindas (async)
   ↓
4. Lead recebe email em segundos
   ↓
5. (Futuro) Sofia analisa e busca imóveis
   ↓
6. (Futuro) SendGrid envia sugestões de imóveis
```

---

## 📊 Monitoramento

### Ver estatísticas no SendGrid

1. Dashboard SendGrid: **Activity**
2. Métricas disponíveis:
   - Emails enviados (delivered)
   - Taxa de abertura (opens)
   - Taxa de cliques (clicks)
   - Bounces (emails inválidos)
   - Spam reports

### Logs no Backend

```bash
# Ver logs no Render
✅ Email enviado para joao@email.com
❌ Erro ao enviar email: Invalid API key
⚠️  SendGrid não configurado - email não enviado
```

---

## ⚙️ Variáveis de Ambiente

**Obrigatórias:**
```bash
SENDGRID_API_KEY=SG.aBcDeFgHiJkLmNoPqRsTuVwXyZ...
```

**Opcionais (com defaults):**
```bash
SENDGRID_FROM_EMAIL=noreply@integrius.com.br
SENDGRID_FROM_NAME=ImobiFlow
```

---

## 🛠️ Métodos Disponíveis

### 1. Enviar Email Genérico

```typescript
import { sendGridService } from '@/shared/services/sendgrid.service';

await sendGridService.sendEmail({
  to: 'destinatario@email.com',
  subject: 'Assunto do email',
  html: '<h1>Conteúdo HTML</h1>',
  replyTo: 'contato@integrius.com.br' // opcional
});
```

### 2. Email de Boas-Vindas

```typescript
await sendGridService.enviarBoasVindasLead({
  leadNome: 'Maria Silva',
  leadEmail: 'maria@email.com',
  tipoNegocio: 'ALUGUEL',
  tipoImovel: 'APARTAMENTO',
  localizacao: 'Centro, São Paulo, SP'
});
```

### 3. Email de Sugestões (futuro)

```typescript
await sendGridService.enviarSugestoesImoveis({
  leadNome: 'João Santos',
  leadEmail: 'joao@email.com',
  imoveis: [...],
  totalSugestoes: 5
});
```

---

## 🎨 Customização de Templates

### Cores utilizadas:

```css
/* Gradiente principal */
background: linear-gradient(135deg, #8FD14F 0%, #6E9B3B 100%);

/* Cores de destaque */
--verde-principal: #8FD14F;
--verde-escuro: #6E9B3B;
--verde-claro: #DFF9C7;
--bege: #F4E2CE;
--fundo: #FAF8F5;
--texto: #2C2C2C;
```

### Fontes:

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Modificar templates:

Edite o arquivo:
[apps/api/src/shared/services/sendgrid.service.ts](../apps/api/src/shared/services/sendgrid.service.ts)

---

## 🔍 Troubleshooting

### Email não chega

**Verificar:**
1. ✅ `SENDGRID_API_KEY` está configurado?
2. ✅ API Key é válida?
3. ✅ Sender (noreply@...) está verificado no SendGrid?
4. ✅ Email está na caixa de spam?
5. ✅ Email destinatário é válido?

**Logs para verificar:**
```bash
✅ Email enviado para joao@email.com  # ← Sucesso
⚠️  SendGrid não configurado           # ← Falta SENDGRID_API_KEY
❌ Erro ao enviar email: ...           # ← Ver detalhes do erro
```

### Erro: "403 Forbidden"

**Problema:** Sender não verificado

**Solução:**
1. No SendGrid: **Settings** > **Sender Authentication**
2. Verificar que o email `noreply@integrius.com.br` está ✅ Verified
3. Se não, criar Single Sender e verificar email

### Erro: "401 Unauthorized"

**Problema:** API Key inválida

**Solução:**
1. Criar nova API Key no SendGrid
2. Atualizar `SENDGRID_API_KEY` no Render
3. Redeploy backend

### Email vai para spam

**Soluções:**
1. ✅ Autenticar domínio (Domain Authentication, não só Single Sender)
2. ✅ Adicionar **SPF** e **DKIM** records no DNS
3. ✅ Evitar palavras de spam no subject/conteúdo
4. ✅ Incluir link de "unsubscribe" nos emails de marketing
5. ✅ Não enviar para listas compradas (só leads orgânicos)

---

## 📈 Limites por Plano

| Plano | Emails/Mês | Preço | Ideal Para |
|-------|-----------|-------|------------|
| **Free** | 3.000 (100/dia) | $0 | Testes, MVP |
| **Essentials** | 50.000 | $19.95/mês | Startup |
| **Pro** | 100.000 | $89.95/mês | Growth |
| **Premier** | 200.000+ | Custom | Enterprise |

**Recomendação inicial:** Começar com **Free**, migrar para **Essentials** ao atingir 50+ leads/dia.

---

## 🧪 Checklist de Configuração

- [ ] Criar conta no SendGrid
- [ ] Verificar Single Sender (noreply@integrius.com.br)
- [ ] (Opcional mas recomendado) Autenticar domínio completo
- [ ] Criar API Key com permissão **Full Access**
- [ ] Copiar API Key
- [ ] Adicionar `SENDGRID_API_KEY` no Render
- [ ] Adicionar `SENDGRID_FROM_EMAIL` e `SENDGRID_FROM_NAME`
- [ ] Aguardar redeploy do backend
- [ ] Testar: preencher formulário de captura com SEU email
- [ ] Verificar inbox (e spam) para email de boas-vindas
- [ ] Verificar logs no Render
- [ ] ✅ SendGrid configurado!

---

## 📁 Arquivos Implementados

- [apps/api/src/shared/services/sendgrid.service.ts](../apps/api/src/shared/services/sendgrid.service.ts) - Serviço principal
- [apps/api/src/modules/leads/leads-captura.routes.ts](../apps/api/src/modules/leads/leads-captura.routes.ts) - Integração automática

---

## 🎯 Próximas Melhorias (Futuro)

- [ ] Templates no SendGrid Dashboard (Dynamic Templates)
- [ ] Segmentação de leads por interesse
- [ ] A/B testing de subject lines
- [ ] Email de follow-up automático (3 dias, 7 dias, 15 dias)
- [ ] Newsletter semanal com novos imóveis
- [ ] Email de confirmação de visita agendada
- [ ] Relatório mensal para corretores

---

## 🔗 Links Úteis

- **SendGrid Dashboard**: https://app.sendgrid.com/
- **Documentação API**: https://docs.sendgrid.com/api-reference
- **Templates**: https://mc.sendgrid.com/dynamic-templates
- **Status Page**: https://status.sendgrid.com/
- **Preços**: https://sendgrid.com/pricing/

---

**Última Atualização**: 2025-12-21
**Status**: ✅ Email de boas-vindas implementado e pronto para uso
