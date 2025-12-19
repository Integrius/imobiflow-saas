# ✅ Testes Pós-Deploy - ImobiFlow

**Data**: 2025-12-19
**Frontend**: https://imobiflow-frontend-bdnqa7ebp-hans-dohmanns-projects.vercel.app
**Backend**: https://imobiflow-saas-1.onrender.com

---

## 🎯 Status Atual

### ✅ Deploy Completo
- **Frontend (Vercel)**: Online - Status 200
- **Backend (Render)**: Online - Respondendo corretamente

### ⏳ Pendente
- Google OAuth configuração no Google Cloud Console
- ANTHROPIC_API_KEY no Render Dashboard (para IA)
- Testes de integração completos

---

## 📋 Checklist de Testes

### 1. 🔐 Autenticação

#### Login com Senha
- [ ] Acesse: https://imobiflow-frontend-bdnqa7ebp-hans-dohmanns-projects.vercel.app/login
- [ ] Email: `admin@imobiflow.com`
- [ ] Senha: `Admin@123`
- [ ] **Esperado**: Redirecionar para `/dashboard`

#### Mensagem de Erro (Senha Incorreta)
- [ ] Acesse login novamente
- [ ] Digite senha ERRADA
- [ ] **Esperado**: Mensagem de erro visível por **15 SEGUNDOS**
- [ ] Abra console (F12) e veja log: `🔴 ERRO DE LOGIN: ... - Será exibido por 15 segundos`
- [ ] Após 15s, veja log: `⏰ Limpando mensagem de erro após 15 segundos`

#### Google OAuth
- [ ] Acesse login
- [ ] Clique em "Continuar com Google"
- [ ] **Esperado** (após configurar Google Cloud Console):
  - ✅ Popup do Google abre
  - ✅ Sem erro 400 origin_mismatch
  - ✅ Seleciona conta
  - ✅ Redireciona para `/dashboard`

---

### 2. 🤖 Sistema de IA (Business Intelligence)

**IMPORTANTE**: Precisa configurar `ANTHROPIC_API_KEY` no Render Dashboard primeiro!

#### Endpoint: Analisar Mensagem
```bash
# Obter token de autenticação primeiro
TOKEN="seu_token_jwt_aqui"

curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/ai/analyze-message \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: default-tenant-id" \
  -d '{
    "leadId": "id-do-lead",
    "messageText": "Olá, gostaria de agendar uma visita para amanhã às 10h"
  }'
```

**Esperado**:
```json
{
  "urgency": "ALTA",
  "sentiment": "POSITIVO",
  "intent": "AGENDAR_VISITA",
  "keywords": ["visita", "amanhã", "10h"],
  "suggested_response": "..."
}
```

#### Endpoint: Insights do Lead
```bash
curl -X GET https://imobiflow-saas-1.onrender.com/api/v1/ai/lead/{leadId}/insights \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: default-tenant-id"
```

#### Endpoint: Sugerir Resposta
```bash
curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/ai/suggest-response/{leadId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: default-tenant-id" \
  -d '{
    "context": "Cliente perguntou sobre financiamento"
  }'
```

#### Endpoint: Métricas do Dashboard
```bash
curl -X GET https://imobiflow-saas-1.onrender.com/api/v1/ai/dashboard/metrics \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: default-tenant-id"
```

---

### 3. 🔒 Segurança Multi-tenant

#### Teste 1: Acesso sem token
```bash
curl -X GET https://imobiflow-saas-1.onrender.com/api/v1/ai/dashboard/metrics \
  -H "X-Tenant-ID: default-tenant-id"
```
**Esperado**: `401 Unauthorized`

#### Teste 2: Acesso sem tenant-id
```bash
curl -X GET https://imobiflow-saas-1.onrender.com/api/v1/ai/dashboard/metrics \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado**: `400 Bad Request - Tenant ID não fornecido`

#### Teste 3: Tentar acessar dados de outro tenant
- Criar lead no tenant A
- Tentar acessar com token do tenant B
**Esperado**: `404 Not Found`

---

## 🚀 Próximos Passos

### Passo 1: Configurar Google OAuth (URGENTE)
1. Acesse: https://console.cloud.google.com/apis/credentials
2. Localize Client ID: `101518980847-9n7uovmjc8g561vmqormir1931og01ue.apps.googleusercontent.com`
3. Adicione URLs:
   - JavaScript origins: `https://imobiflow-frontend-bdnqa7ebp-hans-dohmanns-projects.vercel.app`
   - Redirect URIs: `https://imobiflow-frontend-bdnqa7ebp-hans-dohmanns-projects.vercel.app/login`
4. Salve e aguarde 1 minuto

**Guia completo**: [GOOGLE-OAUTH-SETUP.md](GOOGLE-OAUTH-SETUP.md)

### Passo 2: Configurar ANTHROPIC_API_KEY
1. Acesse: https://dashboard.render.com
2. Selecione serviço: `imobiflow-saas-1`
3. Vá em "Environment"
4. Adicione variável:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (sua chave da Anthropic)
5. Salve (fará redeploy automático)

### Passo 3: Criar Interface de BI no Frontend
Após configurar a API Key:
- [ ] Dashboard com métricas agregadas
- [ ] Visualização de insights por lead
- [ ] Sugestões de resposta em tempo real
- [ ] Alertas de leads urgentes
- [ ] Gráficos de sentimento e intenção

### Passo 4: Testes E2E
- [ ] Criar lead via interface
- [ ] Enviar mensagem
- [ ] Verificar análise automática
- [ ] Testar sugestão de resposta
- [ ] Verificar métricas no dashboard

---

## 🐛 Troubleshooting

### Erro: "Token inválido"
- Verificar se token JWT está no header: `Authorization: Bearer <token>`
- Token expira em 7 dias, fazer login novamente

### Erro: "Tenant ID não fornecido"
- Adicionar header: `X-Tenant-ID: default-tenant-id`
- Ou configurar subdomínio: `tenant.imobiflow.com`

### Erro: "Anthropic API error"
- Verificar se `ANTHROPIC_API_KEY` está configurada no Render
- Verificar se tem créditos na conta Anthropic
- Ver logs no Render Dashboard

### Frontend não carrega
- Verificar URL: https://imobiflow-frontend-bdnqa7ebp-hans-dohmanns-projects.vercel.app
- Ver logs no Vercel Dashboard
- Verificar se build passou

### API não responde
- Verificar se Render não entrou em sleep (plano free)
- Primeira request pode demorar ~30s (cold start)
- Ver logs no Render Dashboard

---

## 📊 Monitoramento

### Logs do Frontend (Vercel)
```bash
vercel logs imobiflow-frontend --follow
```

### Logs do Backend (Render)
- Acesse: https://dashboard.render.com
- Selecione `imobiflow-saas-1`
- Clique em "Logs"
- Ative "Live tail"

---

## 📞 Suporte

- **Deploy**: [DEPLOY.md](DEPLOY.md)
- **Google OAuth**: [GOOGLE-OAUTH-SETUP.md](GOOGLE-OAUTH-SETUP.md)
- **Documentação Vercel**: https://vercel.com/docs
- **Documentação Render**: https://render.com/docs
- **Anthropic API**: https://docs.anthropic.com

---

**Última atualização**: 2025-12-19
