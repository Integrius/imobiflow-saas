# 🚨 Correção URGENTE - Login Não Funciona

**Problemas identificados no Console:**

## 1️⃣ URL da API Incorreta

O frontend está tentando chamar:
```
❌ https://api.integrius.com.br/api/v1/auth/login1
```

Deveria chamar:
```
✅ https://imobiflow-saas-1.onrender.com/api/v1/auth/login
```

### ✅ Solução:

1. Acesse: https://dashboard.render.com
2. Localize o serviço **FRONTEND** (não a API)
3. Click no serviço → **Environment**
4. Procure por `NEXT_PUBLIC_API_URL`
5. Se existir, edite para: `https://imobiflow-saas-1.onrender.com`
6. Se NÃO existir, adicione:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://imobiflow-saas-1.onrender.com`
7. Click em **Save**
8. Aguarde o redeploy automático (2-3 minutos)

---

## 2️⃣ Google OAuth - Origin Mismatch

Erro no console:
```
[GSI_LOGGER]: The given origin is not allowed for the given client id
```

### ✅ Solução:

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Localize: `101518980847-9n7uovmjc8g561vmqormir1931og01ue.apps.googleusercontent.com`
3. Click para editar
4. **Authorized JavaScript origins** → Adicione:
   ```
   https://vivoly.integrius.com.br
   ```
5. **Authorized redirect URIs** → Adicione:
   ```
   https://vivoly.integrius.com.br/login
   ```
6. Click em **SAVE**
7. Aguarde 1 minuto para propagação

---

## 3️⃣ URL Estranha com "login1"

Você notou que a URL termina com `login1` em vez de `login`?

Isso pode ser:
- Cache do navegador
- Configuração errada no código

### ✅ Solução:
1. Após corrigir o item 1, limpe o cache:
   - Chrome: Ctrl+Shift+Del → Limpar cache
   - Ou use modo anônimo (Ctrl+Shift+N)

---

## 🧪 Como Testar Após Correções:

### Teste 1: Verificar URL da API
```bash
# Deve mostrar a URL correta
curl -s https://vivoly.integrius.com.br | grep -i "imobiflow-saas-1.onrender.com"
```

### Teste 2: Login com Senha
1. Acesse: https://vivoly.integrius.com.br/login
2. Abra Console (F12)
3. Digite: admin@imobiflow.com / Admin@123
4. Click em "Entrar"
5. **Deve ver no Network tab**:
   - Request para: `imobiflow-saas-1.onrender.com/api/v1/auth/login`
   - Status: 200 OK
   - Response com token

### Teste 3: Google OAuth
1. Click em "Continuar com Google"
2. **Não deve** aparecer erro de origin
3. Deve abrir popup do Google
4. Deve fazer login

---

## 📋 Checklist de Correção

- [ ] Item 1: Configurei `NEXT_PUBLIC_API_URL` no Render
- [ ] Item 1: Aguardei redeploy (2-3 min)
- [ ] Item 2: Adicionei vivoly.integrius.com.br no Google OAuth
- [ ] Item 2: Aguardei 1 minuto
- [ ] Item 3: Limpei cache do navegador
- [ ] Teste 1: URL da API está correta
- [ ] Teste 2: Login com senha funciona
- [ ] Teste 3: Google OAuth funciona

---

## ❓ Se Ainda Não Funcionar

**Me envie:**
1. Screenshot do Console (F12) após tentar fazer login
2. Screenshot da aba Network mostrando a requisição
3. Confirmação de que configurou a variável de ambiente no Render

---

**Última atualização**: 2025-12-19
