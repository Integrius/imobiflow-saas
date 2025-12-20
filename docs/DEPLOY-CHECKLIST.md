# ✅ Checklist de Deploy - Render

**Data**: 2025-12-20
**Commit**: `9c61a9f`
**Status**: 🚀 Push realizado, aguardando deploy automático

---

## 📦 O QUE FOI DEPLOYADO

### Código:
- ✅ Sistema de IA completo (Claude + OpenAI)
- ✅ Integração WhatsApp (whatsapp-web.js)
- ✅ Landing Page atualizada
- ✅ 13 novos endpoints REST
- ✅ 14 novos arquivos
- ✅ ~5.500 linhas adicionadas

### Documentação:
- ✅ 7 documentos criados (40+ páginas)
- ✅ Guias de uso e testes
- ✅ Configuração completa

---

## 🔧 VARIÁVEIS DE AMBIENTE (Render)

### Já Configuradas ✅:
- `DATABASE_URL` ✅
- `JWT_SECRET` ✅
- `CLOUDINARY_*` ✅
- `ANTHROPIC_API_KEY` ✅

### Novas Variáveis Adicionadas no render.yaml:
- `OPENAI_API_KEY` (sync: false) - Opcional
- `AI_ENABLED` (value: true)
- `AI_AUTO_RESPOND` (value: true)
- `AI_FALLBACK_TO_OPENAI` (value: false)
- `AI_MAX_COST_PER_DAY` (value: 10.00)
- `WHATSAPP_SESSION_PATH` (value: ./whatsapp-session)

### ⚠️ AÇÃO NECESSÁRIA:

O Render vai ler as variáveis do `render.yaml`, mas você precisa:

1. **Acessar Render Dashboard**:
   - https://dashboard.render.com/

2. **Ir no serviço**: `imobiflow-saas-1`

3. **Verificar Environment Variables**:
   - As novas variáveis devem aparecer automaticamente
   - Se `OPENAI_API_KEY` não aparecer, adicione manualmente (opcional)

4. **Trigger Manual Deploy** (se necessário):
   - Se deploy automático não iniciar
   - Click em "Manual Deploy" > "Deploy latest commit"

---

## 📊 MONITORAMENTO DO DEPLOY

### Como Verificar:

1. **Render Dashboard**:
   ```
   https://dashboard.render.com/web/srv-YOUR-SERVICE-ID
   ```

2. **Ver Logs em Tempo Real**:
   - Render Dashboard > Logs
   - Procure por:
     ```
     🚀 Server running on port 3333
     ✅ WhatsApp Handler configurado
     ```

3. **Tempo Estimado**:
   - Build: ~3-5 minutos
   - Deploy: ~1-2 minutos
   - **Total**: ~5-7 minutos

---

## ✅ VALIDAÇÃO PÓS-DEPLOY

### 1. Health Check (Imediato)

```bash
curl https://imobiflow-saas-1.onrender.com/health
```

**Esperado**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-20T...",
  "service": "ImobiFlow API",
  "version": "1.0.0"
}
```

---

### 2. Endpoints de IA (5 min após deploy)

```bash
# Obter token primeiro
export TOKEN="seu_token_aqui"

# Testar stats
curl https://imobiflow-saas-1.onrender.com/api/v1/ai/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado**:
```json
{
  "success": true,
  "data": {
    "leadsWithAI": 0,
    "totalMessages": 0,
    "aiEnabled": true
  }
}
```

---

### 3. Endpoints WhatsApp (5 min após deploy)

```bash
curl https://imobiflow-saas-1.onrender.com/api/v1/whatsapp/status \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado**:
```json
{
  "success": true,
  "data": {
    "isReady": false,
    "queueLength": 0,
    "maxMessagesPerHour": 50,
    "isWorkingHours": true
  }
}
```

---

### 4. Landing Page (Imediato)

Acesse no navegador:
```
https://imobiflow-saas-1.onrender.com/
```

**Validações**:
- ✅ Landing page carrega
- ✅ Imagem emoticon.png aparece
- ✅ Botões "Entrar" e "Começar Grátis" visíveis
- ✅ Se logado, aparece "Ir para Dashboard"

---

## 🚨 TROUBLESHOOTING

### Deploy Falhou

**Erro comum**: Variáveis de ambiente faltando

**Solução**:
1. Render Dashboard > Environment
2. Adicione variáveis manualmente:
   ```
   AI_ENABLED=true
   AI_AUTO_RESPOND=true
   AI_FALLBACK_TO_OPENAI=false
   WHATSAPP_SESSION_PATH=./whatsapp-session
   ```
3. Trigger manual deploy

---

### Build Passou mas API Não Responde

**Verificar logs**:
```
Render Dashboard > Logs
```

**Procurar por**:
- ❌ "Error: ANTHROPIC_API_KEY não configurada"
- ❌ "Error connecting to database"
- ❌ TypeScript compilation errors

**Soluções**:
- Verificar ANTHROPIC_API_KEY está configurada
- Verificar DATABASE_URL está correta
- Verificar build logs completos

---

### Endpoints 404

**Possível causa**: Rotas não registradas

**Verificar**:
1. Logs do servidor mostram:
   ```
   🚀 Server running on port 3333
   ```
2. Arquivo `server.ts` tem:
   ```typescript
   server.register(aiRoutes, { prefix: '/api/v1/ai' })
   server.register(whatsappRoutes, { prefix: '/api/v1/whatsapp' })
   ```

---

## 📝 CHECKLIST PÓS-DEPLOY

Marque conforme validar:

### Build e Deploy:
- [ ] Push para GitHub realizado ✅
- [ ] Render iniciou build automático
- [ ] Build completou com sucesso
- [ ] Deploy completou com sucesso
- [ ] Logs mostram "Server running"

### Endpoints:
- [ ] `/health` responde 200
- [ ] `/api/v1/ai/stats` responde (com auth)
- [ ] `/api/v1/whatsapp/status` responde (com auth)
- [ ] Landing page (`/`) carrega

### Funcionalidades:
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Estatísticas de IA aparecem
- [ ] WhatsApp status retorna JSON válido

### Próximos Passos:
- [ ] Executar testes completos ([GUIA-TESTES-COMPLETO.md](./GUIA-TESTES-COMPLETO.md))
- [ ] Conectar WhatsApp via QR Code
- [ ] Testar mensagem real → Sofia
- [ ] Validar score automático

---

## 🎯 PRÓXIMOS PASSOS APÓS DEPLOY

### Imediato (Hoje):
1. ✅ Aguardar deploy completar (~5-7 min)
2. ✅ Validar health check
3. ✅ Testar landing page
4. ✅ Fazer login
5. ✅ Acessar dashboard

### Curto Prazo (Próximas Horas):
1. Executar testes de IA
2. Inicializar WhatsApp
3. Escanear QR Code
4. Testar mensagem real

### Médio Prazo (Amanhã):
1. Testar com 5-10 leads reais
2. Monitorar logs e performance
3. Ajustar prompts se necessário

---

## 📊 MONITORAMENTO CONTÍNUO

### Logs:
```bash
# Via Render Dashboard
Render > Logs > Live Logs

# Procurar por:
✅ WhatsApp conectado
📩 Nova mensagem
🔄 Processando mensagem
✅ Resposta enviada
```

### Métricas:
```bash
# Estatísticas IA
curl https://imobiflow-saas-1.onrender.com/api/v1/ai/stats \
  -H "Authorization: Bearer $TOKEN"

# Status WhatsApp
curl https://imobiflow-saas-1.onrender.com/api/v1/whatsapp/status \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔒 SEGURANÇA

### Variáveis Secretas (Não expor):
- ⚠️ `ANTHROPIC_API_KEY`
- ⚠️ `OPENAI_API_KEY`
- ⚠️ `DATABASE_URL`
- ⚠️ `JWT_SECRET`

### Variáveis Públicas (OK):
- ✅ `AI_ENABLED`
- ✅ `AI_AUTO_RESPOND`
- ✅ `PORT`

---

## 📞 SUPORTE

### Documentação:
- [IA-GUIA-USO.md](./IA-GUIA-USO.md) - Como usar IA
- [WHATSAPP-INTEGRACAO.md](./WHATSAPP-INTEGRACAO.md) - Como usar WhatsApp
- [GUIA-TESTES-COMPLETO.md](./GUIA-TESTES-COMPLETO.md) - Como testar

### Render:
- Dashboard: https://dashboard.render.com/
- Docs: https://render.com/docs
- Status: https://status.render.com/

---

**Status**: 🚀 **DEPLOY EM ANDAMENTO**
**Commit**: `9c61a9f`
**Última Atualização**: 2025-12-20

---

## 🎉 APÓS DEPLOY COMPLETO

Quando tudo estiver funcionando:

✅ Sistema de IA em produção
✅ WhatsApp pronto para conectar
✅ Landing page acessível
✅ 13 novos endpoints disponíveis
✅ Documentação completa
✅ Pronto para receber leads 24/7

**A Sofia está pronta para trabalhar! 🤖📱**
