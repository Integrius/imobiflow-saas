# 🛑 Guia: Suspender Frontend no Render

**Objetivo**: Suspender o serviço `imobiflow-web` no Render para evitar custos duplicados.

**Economia**: $7/mês (~R$42/mês)

---

## ⚠️ IMPORTANTE - Ler Antes de Suspender

### Por que suspender?
- ✅ Frontend já está rodando no Cloudflare Pages (vivoly.integrius.com.br)
- ✅ Cloudflare Pages é gratuito e mais rápido
- ✅ Evita confusão com dois frontends rodando
- ✅ Economiza $7/mês

### O que acontece ao suspender?
- ❌ O serviço `imobiflow-web` no Render para de responder
- ✅ O backend `imobiflow-saas-1` continua funcionando normalmente
- ✅ O frontend no Cloudflare continua funcionando normalmente
- ✅ Você pode reativar a qualquer momento

---

## 📋 Passo a Passo para Suspender

### 1. Confirmar que Cloudflare está funcionando

Antes de suspender, teste:

```bash
# Teste 1: Frontend responde
curl -I https://vivoly.integrius.com.br

# Teste 2: Login funciona
# Acesse: https://vivoly.integrius.com.br/login
# Faça login com: admin@imobiflow.com / Admin@123
```

**✅ Se ambos funcionarem, pode prosseguir!**

---

### 2. Acessar Render Dashboard

1. Acesse: https://dashboard.render.com
2. Faça login com sua conta
3. Você verá a lista de serviços

---

### 3. Localizar o Serviço Frontend

Procure pelo serviço **`imobiflow-web`** (ou nome similar para o frontend)

**Como identificar:**
- Tipo: "Web Service"
- Configuração: Serve Next.js
- Diferente de `imobiflow-saas-1` (que é a API)

---

### 4. Suspender o Serviço

#### Opção A: Suspender Temporariamente (Recomendado)

1. Click no serviço `imobiflow-web`
2. Vá em **"Settings"** (menu lateral)
3. Role até o final da página
4. Click em **"Suspend Service"**
5. Confirme a ação

**Resultado:**
- ✅ Serviço para de rodar
- ✅ Para de cobrar imediatamente
- ✅ Pode reativar a qualquer momento com 1 click

#### Opção B: Deletar Permanentemente (Não Recomendado)

⚠️ **Só faça isso se tiver 100% de certeza!**

1. Click no serviço `imobiflow-web`
2. Vá em **"Settings"**
3. Role até o final
4. Click em **"Delete Service"**
5. Digite o nome do serviço para confirmar
6. Confirme a exclusão

**Resultado:**
- ❌ Serviço deletado permanentemente
- ❌ Configurações perdidas
- ❌ Precisa reconfigurar tudo se quiser reativar

---

## ✅ Verificação Pós-Suspensão

### 1. Confirmar que serviço foi suspenso

No Render Dashboard:
- Status deve mostrar: **"Suspended"** ou **"Deleted"**

### 2. Testar que sistema continua funcionando

```bash
# Frontend deve responder (Cloudflare)
curl -I https://vivoly.integrius.com.br
# Esperado: HTTP/2 200

# API deve responder (Render)
curl -I https://imobiflow-saas-1.onrender.com/api/v1/auth/login
# Esperado: HTTP/2 404 (rota não existe, mas API está online)
```

### 3. Fazer login completo

1. Acesse: https://vivoly.integrius.com.br/login
2. Email: `admin@imobiflow.com`
3. Senha: `Admin@123`
4. Deve redirecionar para `/dashboard`

**✅ Se tudo funcionar, suspensão foi bem-sucedida!**

---

## 🔄 Como Reativar (se necessário)

Se precisar reativar o frontend no Render:

1. Acesse Render Dashboard
2. Click no serviço suspenso
3. Click em **"Resume Service"**
4. Aguarde 2-3 minutos para voltar online

---

## 💰 Economia Estimada

| Antes | Depois | Economia |
|-------|--------|----------|
| $21/mês | $14/mês | $7/mês |
| $252/ano | $168/ano | $84/ano |

**Em reais (aprox.)**: R$500/ano de economia

---

## 🆘 Troubleshooting

### "Não encontro o serviço imobiflow-web"

Possíveis motivos:
1. Nome pode ser diferente (procure por serviços do tipo "Web Service")
2. Pode já estar suspenso
3. Pode estar em outro account/team

**Solução**: Procure por todos os serviços e identifique qual serve o frontend

### "Frontend parou de funcionar após suspender"

⚠️ **Você suspendeu o serviço errado!**

**Solução imediata**:
1. Reative o serviço que você suspendeu
2. Verifique qual é realmente o frontend
3. Identifique pela URL ou configuração

### "Quero confirmar antes de suspender"

**Verifique**:
```bash
# No serviço que você quer suspender, veja:
# - Build Command: deve incluir "next build" ou similar
# - Start Command: deve incluir "next start" ou "npm start"
# - Não deve ter "fastify" ou "prisma"
```

---

## 📞 Suporte

- Render Docs: https://render.com/docs
- Render Support: https://render.com/support

---

**Última atualização**: 2025-12-19

**Próximos passos após suspensão**:
1. ✅ Atualizar Google OAuth com vivoly.integrius.com.br
2. ✅ Testar login completo
3. ✅ Deletar deploy temporário do Vercel (se aplicável)
