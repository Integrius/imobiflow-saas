# Sistema Multi-Tenant com Subdomínios - Vivoly

## Visão Geral

O Vivoly implementa um sistema de **multi-tenancy baseado em subdomínios**, onde cada imobiliária (tenant) possui seu próprio subdomínio exclusivo.

**Exemplo**:
- Imobiliária ACME → `acme.vivoly.com.br`
- Imobiliária Remax → `remax.vivoly.com.br`
- Imobiliária Lopes → `lopes.vivoly.com.br`

## Arquitetura

### 1. Fluxo de Requisição

```
Cliente acessa: acme.vivoly.com.br/dashboard/leads

↓ [DNS Wildcard]
*.vivoly.com.br → Servidor (IP ou CNAME)

↓ [Middleware Next.js] (apps/web/middleware.ts)
- Detecta subdomain "acme"
- Busca tenant no banco: GET /api/tenants/by-subdomain/acme
- Injeta headers: x-tenant-id, x-tenant-slug

↓ [API Backend]
- Recebe x-tenant-id do header
- Filtra dados por tenant_id
- Retorna apenas dados do tenant "acme"

↓ [Frontend]
- Renderiza dados isolados do tenant
```

### 2. Estrutura do Banco de Dados

```prisma
model Tenant {
  id                  String        @id @default(uuid())
  nome                String        // Nome da imobiliária
  slug                String        @unique  // URL-friendly (ex: "acme")
  subdominio          String?       @unique  // Subdomínio (ex: "acme")
  dominio_custom      String?       @unique  // Domínio próprio (opcional)

  // ... outros campos
}
```

### 3. Componentes Principais

#### A) Middleware Next.js (`apps/web/middleware.ts`)

Responsável por:
- Detectar o subdomínio da requisição
- Validar se é um subdomínio reservado (www, api, admin, etc)
- Buscar o tenant correspondente na API
- Injetar headers com informações do tenant
- Redirecionar para página de erro se tenant não encontrado

#### B) API Endpoint (`/api/tenants/by-subdomain/:subdomain`)

- **Método**: GET
- **Rota**: `/tenants/by-subdomain/:subdomain`
- **Público**: Sim (usado pelo middleware)
- **Retorna**: Dados do tenant (id, nome, slug, status, plano)

#### C) Página de Erro (`apps/web/app/tenant-not-found/page.tsx`)

Exibida quando:
- Subdomínio não corresponde a nenhum tenant
- Tenant está suspenso ou cancelado
- Erro na busca do tenant

## Configuração

### 1. Variáveis de Ambiente

#### Frontend (apps/web/.env)

```bash
# Domínio base da aplicação
NEXT_PUBLIC_BASE_DOMAIN=vivoly.com.br

# URL da API
NEXT_PUBLIC_API_URL=https://api.vivoly.com.br
```

#### Backend (apps/api/.env)

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/vivoly"
```

### 2. Configuração DNS

Para que o sistema funcione em produção, é necessário configurar um **DNS Wildcard**:

#### Opção 1: Cloudflare (Recomendado)

1. Acesse o painel do Cloudflare
2. Vá em **DNS → Records**
3. Adicione um registro A ou CNAME:
   - **Type**: A (ou CNAME se apontar para outro domínio)
   - **Name**: `*` (asterisco indica wildcard)
   - **Content**: IP do servidor (ou CNAME do servidor)
   - **Proxy status**: Proxied (laranja) ✅
   - **TTL**: Auto

**Exemplo com IP direto**:
```
Type: A
Name: *
Content: 123.456.789.10
Proxy: Proxied
```

**Exemplo com CNAME (Render, Vercel, etc)**:
```
Type: CNAME
Name: *
Content: seu-app.onrender.com
Proxy: Proxied
```

#### Opção 2: Registro.br ou outro provedor DNS

Adicione um registro wildcard:
```
*.vivoly.com.br  A  123.456.789.10
```

ou
```
*.vivoly.com.br  CNAME  seu-app.onrender.com
```

### 3. Subdomínios Reservados

Os seguintes subdomínios são **reservados para a plataforma** e não podem ser usados por tenants:

- `www` - Site institucional
- `app` - Aplicação principal (alternativo)
- `api` - Backend/API
- `admin` - Painel administrativo
- `portal` - Portal principal
- `dashboard` - Dashboard principal
- `staging` - Ambiente de testes
- `dev` - Ambiente de desenvolvimento
- `test` - Testes

Esses subdomínios são verificados no middleware e redirecionam para a home.

### 4. Desenvolvimento Local

Em ambiente local (localhost), o sistema funciona de forma diferente:

#### Opção 1: Query Parameter (mais simples)
```
http://localhost:3000/dashboard?tenant=acme
```

#### Opção 2: Header HTTP
```bash
curl -H "x-tenant-slug: acme" http://localhost:3000/dashboard
```

Para simular subdomínios em localhost, você pode editar o arquivo `/etc/hosts`:

```bash
# /etc/hosts
127.0.0.1  acme.localhost
127.0.0.1  remax.localhost
127.0.0.1  lopes.localhost
```

Depois acesse:
```
http://acme.localhost:3000/dashboard
http://remax.localhost:3000/dashboard
```

## Cadastro de Novo Tenant

### 1. Via API

```bash
POST /api/tenants
Content-Type: application/json

{
  "nome": "Imobiliária ACME",
  "slug": "acme",
  "email": "contato@acme.com.br",
  "telefone": "(11) 98765-4321",
  "plano": "PRO"
}
```

**Resposta**:
```json
{
  "id": "uuid-tenant",
  "nome": "Imobiliária ACME",
  "slug": "acme",
  "subdominio": "acme",  // Criado automaticamente = slug
  "email": "contato@acme.com.br",
  "plano": "PRO",
  "status": "TRIAL",
  "data_expiracao": "2024-02-15T00:00:00.000Z",  // 14 dias
  "limite_usuarios": 10,
  "limite_imoveis": 500
}
```

### 2. Via Interface (Futura)

Criar página de registro onde o usuário:
1. Preenche nome da imobiliária
2. Escolhe o slug/subdomínio (ex: "acme")
3. Sistema valida se está disponível
4. Cria conta com 14 dias de trial
5. Redireciona para: `acme.vivoly.com.br/dashboard`

## Planos e Limites

| Plano | Usuários | Imóveis | Storage |
|-------|----------|---------|---------|
| **BASICO** | 3 | 100 | 1 GB |
| **PRO** | 10 | 500 | 5 GB |
| **ENTERPRISE** | 999 | 99.999 | 50 GB |
| **CUSTOM** | Ilimitado | Ilimitado | 100 GB |

## Isolamento de Dados

Todos os dados são filtrados pelo `tenant_id`:

```typescript
// Exemplo: Buscar leads de um tenant
const leads = await prisma.lead.findMany({
  where: {
    tenant_id: tenantId  // ← Isolamento
  }
});
```

**Nível de Isolamento**:
- ✅ Leads
- ✅ Imóveis
- ✅ Proprietários
- ✅ Corretores
- ✅ Negociações
- ✅ Usuários
- ✅ Configurações

## Domínios Personalizados (Futuro)

O sistema já suporta domínios personalizados no banco:

```prisma
dominio_custom String? @unique
```

**Exemplo**: Uma imobiliária pode usar:
- `sistema.acmeimoveis.com.br` (domínio próprio)

**Configuração necessária**:
1. Cliente cria registro CNAME apontando para Vivoly
2. Vivoly valida propriedade do domínio
3. Configura certificado SSL (Let's Encrypt)
4. Ativa domínio personalizado

## Segurança

### 1. Validação de Tenant
- Middleware valida tenant em TODAS as requisições
- Tenant inativo/suspenso retorna erro
- Tenant expirado exibe mensagem

### 2. Isolamento
- Dados são SEMPRE filtrados por `tenant_id`
- Não é possível acessar dados de outro tenant
- Headers são injetados pelo middleware (não podem ser forjados)

### 3. Rate Limiting (Futuro)
- Por tenant (não global)
- Baseado no plano contratado

## Monitoramento

### Métricas por Tenant:
- Total de usuários
- Total de imóveis cadastrados
- Storage utilizado
- Taxa de conversão (leads → negociações)
- Última atividade

### Logs:
- Acesso por subdomínio
- Criação/modificação de tenants
- Upgrades/downgrades de plano

## Troubleshooting

### Problema: "Tenant não encontrado"

**Causas**:
1. Subdomínio digitado errado
2. Tenant não cadastrado
3. DNS não configurado corretamente
4. API offline ou com erro

**Solução**:
```bash
# Verificar se tenant existe
curl https://api.vivoly.com.br/api/tenants/by-subdomain/acme

# Verificar DNS
nslookup acme.vivoly.com.br
dig acme.vivoly.com.br
```

### Problema: Dados de outro tenant aparecem

**URGENTE - Falha de segurança!**

Verificar:
1. Middleware está ativo?
2. Header `x-tenant-id` está sendo injetado?
3. Todas as queries filtram por `tenant_id`?

### Problema: Localhost não funciona

Use query parameter:
```
http://localhost:3000/dashboard?tenant=seu-slug
```

Ou configure `/etc/hosts` (ver seção Desenvolvimento Local)

## Próximos Passos

- [ ] Página de registro de tenants (signup)
- [ ] Sistema de pagamentos (Stripe/Mercado Pago)
- [ ] Domínios personalizados
- [ ] Painel administrativo para gerenciar tenants
- [ ] Analytics por tenant
- [ ] Customização de tema por tenant (logo, cores)
- [ ] Migração/exportação de dados

## Referências

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Multi-tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/multitenancy)
- [DNS Wildcard](https://en.wikipedia.org/wiki/Wildcard_DNS_record)
