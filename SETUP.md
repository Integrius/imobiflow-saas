# 🚀 Setup Inicial do ImobiFlow

Este guia explica como configurar o primeiro tenant (Vivoly) e usuário ADMIN do sistema.

## ✅ Opção 1: Via API (Recomendado)

A API está rodando em produção no Render e possui um endpoint especial para setup inicial.

### 1. Criar Tenant e ADMIN

Execute o seguinte comando no terminal:

```bash
curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/setup/tenant-admin \
  -H "Content-Type: application/json"
```

**Resposta esperada:**

```json
{
  "success": true,
  "message": "Tenant e ADMIN criados com sucesso!",
  "tenant": {
    "id": "uuid",
    "nome": "Vivoly Imobiliária",
    "slug": "vivoly",
    "subdominio": "vivoly",
    "plano": "PRO",
    "status": "ATIVO"
  },
  "admin": {
    "id": "uuid",
    "nome": "Administrador Vivoly",
    "email": "admin@vivoly.com",
    "tipo": "ADMIN"
  },
  "credentials": {
    "email": "admin@vivoly.com",
    "senha": "admin123"
  },
  "access": {
    "url_producao": "https://vivoly.integrius.com.br",
    "api_login": "POST /api/v1/auth/login"
  }
}
```

### 2. Verificar Setup

Para verificar se o setup já foi realizado:

```bash
curl https://imobiflow-saas-1.onrender.com/api/v1/setup/check
```

### 3. Fazer Login

Após criar o tenant e admin, você pode fazer login:

```bash
curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Host: vivoly.integrius.com.br" \
  -d '{
    "email": "admin@vivoly.com",
    "senha": "admin123"
  }'
```

**Ou em desenvolvimento com header:**

```bash
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: <tenant_id_do_passo_1>" \
  -d '{
    "email": "admin@vivoly.com",
    "senha": "admin123"
  }'
```

---

## 📝 Opção 2: Via Script Local

Se preferir executar localmente:

```bash
cd /home/hans/imobiflow/apps/api

# Executar script de setup
DATABASE_URL="postgresql://..." npx tsx scripts/create-tenant-admin.ts
```

---

## 🔐 Credenciais Padrão

Após o setup, use as seguintes credenciais:

- **Email**: `admin@vivoly.com`
- **Senha**: `admin123`
- **Tipo**: ADMIN

---

## 📊 Próximos Passos

### 1. Criar Usuários GESTOR e CORRETOR

Com o token do ADMIN, você pode criar outros usuários:

```bash
# Salvar o token obtido no login
TOKEN="seu_token_jwt_aqui"

# Criar GESTOR
curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Carlos Gestor",
    "email": "gestor@vivoly.com",
    "senha": "gestor123",
    "tipo": "GESTOR"
  }'

# Criar CORRETOR
curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Corretor",
    "email": "joao@vivoly.com",
    "senha": "corretor123",
    "tipo": "CORRETOR",
    "telefone": "11999999999",
    "creci": "CRECI-12345"
  }'
```

### 2. Configurar DNS Wildcard no Cloudflare

Para que os subdomínios funcionem (ex: `vivoly.integrius.com.br`):

1. Acesse o Cloudflare
2. Vá em **DNS** para o domínio `integrius.com.br`
3. Adicione um registro CNAME:
   - **Type**: CNAME
   - **Name**: `*` (wildcard)
   - **Target**: `imobiflow-web.onrender.com`
   - **Proxy status**: DNS only (nuvem cinza)
   - **TTL**: Auto

### 3. Testar Acesso pelo Subdomínio

```bash
# Login via subdomínio (produção)
curl -X POST https://vivoly.integrius.com.br/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vivoly.com",
    "senha": "admin123"
  }'
```

---

## ⚠️ IMPORTANTE - Segurança

**ATENÇÃO**: As rotas de setup (`/api/v1/setup/*`) devem ser **REMOVIDAS** ou **PROTEGIDAS** em produção!

Para remover, edite `/home/hans/imobiflow/apps/api/src/server.ts` e comente/remova a linha:

```typescript
// server.register(setupRoutes, { prefix: '/api/v1/setup' })
```

Ou proteja com autenticação de super-admin antes de abrir para produção.

---

## 🔧 Troubleshooting

### Erro: "Tenant já existe"

Se receber este erro, significa que o setup já foi executado. Use `/api/v1/setup/check` para verificar.

### Erro: "Server has closed the connection"

Isso pode acontecer se o banco do Render estiver em sleep mode. Tente novamente após alguns segundos.

### Erro: "Tenant não encontrado" no login

Certifique-se de que:
1. O tenant foi criado com sucesso (verifique com `/api/v1/setup/check`)
2. Você está usando o subdomínio correto ou header `X-Tenant-ID`
3. O DNS wildcard está configurado (em produção)

---

## 📚 Endpoints Úteis

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v1/setup/tenant-admin` | POST | Criar tenant e ADMIN inicial |
| `/api/v1/setup/check` | GET | Verificar status do setup |
| `/api/v1/auth/register` | POST | Registrar novo usuário |
| `/api/v1/auth/login` | POST | Fazer login |
| `/api/v1/auth/me` | GET | Dados do usuário autenticado |
| `/api/v1/users` | GET | Listar usuários (ADMIN/GESTOR) |
| `/api/v1/users` | POST | Criar usuário (ADMIN/GESTOR) |

---

**Data**: 28 de dezembro de 2025
**Versão**: 1.2.0
