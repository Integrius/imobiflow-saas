# ImobiFlow - Documentação para Claude Code

## Visão Geral do Projeto

**ImobiFlow** é uma plataforma SaaS **multi-tenant** de gestão imobiliária com inteligência artificial, projetada para automatizar e otimizar o processo de captação, qualificação e conversão de leads no mercado imobiliário.

### Objetivo
Conectar leads (pessoas procurando imóveis) com corretores e imobiliárias de forma inteligente, usando IA para qualificação automática, sugestões personalizadas e comunicação multicanal.

### Arquitetura Multi-Tenant
- **Modelo**: Multi-tenant com isolamento por tenant_id
- **Subdomínios**: Cada tenant possui um subdomínio único (ex: `vivoly.integrius.com.br`)
- **Domínio Base**: `integrius.com.br` (imobiflow.com.br NÃO é um domínio registrado)
- **Banco de Dados**: Compartilhado com segregação lógica via `tenant_id`
- **Customização**: Cada tenant pode ter branding, configurações e workflows próprios

---

## Arquitetura do Projeto

### Stack Tecnológica

#### Frontend (Web)
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS
- **UI Components**: Componentes customizados
- **Hospedagem**: Render.com

#### Backend (API)
- **Framework**: Fastify (Node.js)
- **Linguagem**: TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL (Render.com)
- **Hospedagem**: Render.com

#### Inteligência Artificial
- **Provedor Principal**: Anthropic Claude (Sonnet 4.5)
- **Fallback**: OpenAI GPT-4
- **Uso**: Qualificação de leads, sugestões de imóveis, respostas automáticas

#### Integrações
- **Email**: SendGrid (transacional)
- **Mensageria**: Telegram Bot (notificações para corretores)
- **Armazenamento**: Cloudinary (imagens)
- **DNS/CDN**: Cloudflare

---

## Estrutura do Monorepo

```
imobiflow/
├── apps/
│   ├── web/              # Frontend Next.js
│   │   ├── app/          # App Router (páginas)
│   │   ├── components/   # Componentes React
│   │   └── public/       # Arquivos estáticos
│   │
│   └── api/              # Backend Fastify
│       ├── src/
│       │   ├── modules/  # Módulos da aplicação
│       │   │   ├── leads/
│       │   │   ├── corretores/
│       │   │   ├── imoveis/
│       │   │   └── telegram/
│       │   ├── shared/   # Serviços compartilhados
│       │   │   ├── services/
│       │   │   │   ├── sendgrid.service.ts
│       │   │   │   └── telegram.service.ts
│       │   │   └── database/
│       │   ├── ai/       # Sistema de IA
│       │   └── server.ts
│       └── prisma/
│           └── schema.prisma
│
├── packages/             # Pacotes compartilhados
├── node_modules/
└── pnpm-workspace.yaml
```

---

## Configurações Importantes

### Variáveis de Ambiente

#### Produção (Render.com - API)
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# JWT
JWT_SECRET="seu-secret-seguro"
JWT_EXPIRES_IN="7d"

# SendGrid
SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="noreply@integrius.com.br"
SENDGRID_FROM_NAME="ImobiFlow"

# Telegram
TELEGRAM_BOT_TOKEN="8559084931:AAGq2UA-u0EM0bgoaEUi5fJwdfKtOPMirh8"

# IA
ANTHROPIC_API_KEY="sk-ant-api03-xxxxxxxxxxxxx"
AI_ENABLED="true"
AI_AUTO_RESPOND="true"

# Cloudinary
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"
```

#### Produção (Render.com - Web)
```env
NEXT_PUBLIC_API_URL="https://imobiflow-saas-1.onrender.com"
```

### Serviços Externos Configurados

#### 1. SendGrid
- **API Key**: Configurada ✅
- **Domínio Verificado**: integrius.com.br ✅
- **Single Sender**: noreply@integrius.com.br ✅
- **DNS**: Cloudflare (5 registros CNAME)
- **Uso**: Emails de boas-vindas, sugestões de imóveis

#### 2. Telegram Bot
- **Bot Username**: @imobiflow_bot (ou similar)
- **Token**: Configurado no Render ✅
- **Chat ID Admin**: 5264887594
- **Uso**: Notificações de novos leads para corretores

#### 3. Cloudflare
- **Domínio**: integrius.com.br
- **DNS**: Gerenciado
- **Email Routing**: Configurado (noreply@integrius.com.br → ia.hcdoh@gmail.com)
- **Proxy**: Desabilitado para registros SendGrid

---

## Sistema de Subdomínios e Roteamento

### Como Funciona

Cada tenant (imobiliária) possui um **subdomínio único** para acessar sua versão da plataforma:

- **Domínio Base**: `integrius.com.br`
- **Formato**: `{tenant-slug}.integrius.com.br`
- **Exemplos**:
  - `vivoly.integrius.com.br` → Tenant Vivoly (Frontend)
  - `imobiliaria-abc.integrius.com.br` → Tenant ABC

**IMPORTANTE:** `imobiflow.com.br` NÃO é um domínio registrado. Todos os subdomínios devem usar `integrius.com.br`.

### Criação de Novo Tenant

Quando um novo tenant é cadastrado:

1. **Slug gerado**: Nome da imobiliária convertido para slug (ex: "Imobiliária ABC" → `imobiliaria-abc`)
2. **Subdomínio criado**: Automaticamente fica disponível em `imobiliaria-abc.integrius.com.br`
3. **DNS configurado**: Wildcard DNS (`*.integrius.com.br`) aponta para o servidor Frontend no Render
4. **Roteamento**: Aplicação identifica tenant pelo subdomínio e carrega dados específicos

### Identificação do Tenant

```typescript
// No frontend/backend
const hostname = request.headers.host; // ex: "vivoly.integrius.com.br"
const subdomain = hostname.split('.')[0]; // "vivoly"

// Buscar tenant pelo slug
const tenant = await prisma.tenant.findUnique({
  where: { slug: subdomain }
});
```

### Configuração DNS (Cloudflare)

**No Cloudflare para integrius.com.br:**

1. **Wildcard DNS** para todos os tenants:
```
Type: CNAME
Name: *
Target: {URL-DO-FRONTEND-NO-RENDER}
Proxy: DNS only (nuvem cinza)
```

2. **Subdomínio específico Vivoly**:
```
Type: CNAME
Name: vivoly
Target: integrius.com.br (ou URL do Frontend no Render)
Proxy: DNS only (nuvem cinza)
```

### Domínios Customizados (Futuro)

Tenants premium poderão usar domínios próprios:
- `www.imobiliariaabc.com.br` → mapeado para tenant específico
- Configurado via `dominio_customizado` no modelo Tenant

---

## Fluxos Principais

### 1. Captura de Lead (Landing Page)

**Endpoint**: `POST /api/v1/leads/captura`

**Fluxo**:
```
1. Lead preenche formulário na landing page
   ↓
2. Frontend envia dados para API
   ↓
3. API valida dados e salva no PostgreSQL
   ↓
4. Email de boas-vindas enviado via SendGrid (assíncrono)
   ↓
5. IA Sofia analisa perfil do lead (futuro)
   ↓
6. Notificação enviada para corretor via Telegram (se atribuído)
```

**Dados Capturados**:
- Dados pessoais: nome, telefone, email
- Preferências: tipo de negócio, tipo de imóvel
- Localização: estado, município, bairro
- Valores: mínimo e máximo
- Características: quartos, vagas, área, pets

**Arquivo**: `/apps/api/src/modules/leads/leads-captura.routes.ts`

### 2. Envio de Email (SendGrid)

**Serviço**: `/apps/api/src/shared/services/sendgrid.service.ts`

**Tipos de Email**:
1. **Boas-vindas**: Enviado automaticamente ao capturar lead
2. **Sugestões de Imóveis**: Enviado após IA processar

**Templates**:
- HTML responsivo com gradientes (#8FD14F verde, #A97E6F marrom)
- Informações personalizadas do lead
- CTAs para próximos passos

### 3. Notificações Telegram

**Serviço**: `/apps/api/src/shared/services/telegram.service.ts`

**Endpoints**:
- `GET /api/v1/telegram/status` - Verificar status do bot
- `GET /api/v1/telegram/updates` - Obter chat_id
- `POST /api/v1/telegram/test` - Enviar mensagem de teste
- `POST /api/v1/telegram/notify-lead` - Notificar lead atribuído

**Formato da Mensagem**:
```
🎯 NOVO LEAD ATRIBUÍDO

👤 Cliente: Nome do Lead
📱 WhatsApp: (11) 98765-4321
📧 Email: lead@example.com

━━━━━━━━━━━━━━━━━━━━

🏡 PREFERÊNCIAS:
📋 Tipo: 🏠 Compra
🏢 Imóvel: Apartamento
💰 Valor: R$ 300.000 - R$ 500.000
📍 Local: São Paulo, SP
🛏️ Quartos: 2-3

━━━━━━━━━━━━━━━━━━━━

✅ Atribuído para: [Nome Corretor]
🆔 ID do Lead: [UUID]
⏰ Entre em contato o quanto antes!
```

---

## Landing Page (Frontend)

### Estrutura
**Arquivo Principal**: `/apps/web/app/page.tsx`

### Seções

#### 1. Hero Section
- Logo ImobiFlow
- Título principal
- Subtítulo
- CTA principal

#### 2. Dual CTA Section
- **CTA Leads** (Verde): "Procurando um Imóvel?"
  - Link: `#buscar-imovel`
  - Gradiente: #8FD14F → #6E9B3B

- **CTA Corretores** (Marrom): "É Corretor ou Imobiliária?"
  - Link: `#para-corretores`
  - Gradiente: #A97E6F → #8B6F5C

#### 3. Seção de Busca (#buscar-imovel)
- Formulário de captura de leads
- Campos dinâmicos
- Validação frontend

#### 4. Seção Para Corretores (#para-corretores)
- Benefícios da plataforma
- Cards: IA Sofia, Dashboard BI, Automação
- CTAs para `/register`

#### 5. Footer
- Links institucionais
- Redes sociais
- Copyright

### Componentes Especiais

#### ChristmasFloat
**Arquivo**: `/apps/web/components/ChristmasFloat.tsx`

**Funcionalidade**:
- Papai Noel flutuante na tela
- Animação de movimento
- Mensagem "Feliz Natal! Boas Festas!"

**Períodos de Exibição**:
1. **Período 1**: Até 21/12/2025 23:59:59
2. **Oculto**: 22/12/2025 - 23/12/2025
3. **Período 2**: 24/12/2025 00:00:00 - 02/01/2026 23:59:59

**Lógica de Data**:
```typescript
const now = new Date();
const endFirstPeriod = new Date(2025, 11, 21, 23, 59, 59);
const startSecondPeriod = new Date(2025, 11, 24, 0, 0, 0);
const endSecondPeriod = new Date(2026, 0, 2, 23, 59, 59);

const shouldShow =
  (now <= endFirstPeriod) ||
  (now >= startSecondPeriod && now <= endSecondPeriod);
```

---

## Banco de Dados (Prisma)

### Arquitetura Multi-Tenant

O ImobiFlow utiliza um modelo **multi-tenant com banco de dados compartilhado**:

- **Isolamento**: Cada registro possui `tenant_id` que identifica a qual imobiliária/tenant pertence
- **Segurança**: Todas as queries devem filtrar por `tenant_id` para garantir isolamento de dados
- **Escalabilidade**: Permite múltiplos tenants no mesmo banco sem duplicação de infraestrutura
- **Subdomínios**: Cada tenant acessa via subdomínio único (ex: `imobiliaria-nome.integrius.com.br`)

### Modelos Principais

#### Tenant
```prisma
model Tenant {
  id                String @id @default(uuid())
  slug              String @unique  // usado no subdomínio
  nome              String
  email             String
  telefone          String?

  // Configurações
  dominio_customizado String?
  logo_url           String?

  // Relacionamentos
  leads              Lead[]
  corretores         Corretor[]
  imoveis            Imovel[]

  created_at         DateTime @default(now())
  updated_at         DateTime @updatedAt
}
```

#### Lead
```prisma
model Lead {
  id                      String @id @default(uuid())
  tenant_id               String

  // Dados pessoais
  nome                    String
  telefone                String
  email                   String?

  // Origem e status
  origem                  LeadOrigem
  temperatura             LeadTemperatura
  score                   Int @default(50)

  // Preferências
  tipo_negocio            TipoNegocio?
  tipo_imovel_desejado    TipoImovel?
  valor_minimo            Decimal?
  valor_maximo            Decimal?

  // Localização
  estado                  String?
  municipio               String?
  bairro                  String?

  // Características
  quartos_min             Int?
  quartos_max             Int?
  vagas_min               Int?
  vagas_max               Int?
  area_minima             Decimal?
  aceita_pets             Boolean?

  // IA
  ai_enabled              Boolean @default(true)
  ai_qualificacao         Json?

  // Relacionamentos
  tenant                  Tenant @relation(...)
  corretor_id             String?
  corretor                Corretor? @relation(...)

  // Timestamps
  created_at              DateTime @default(now())
  updated_at              DateTime @updatedAt
}
```

### Enums

```prisma
enum LeadOrigem {
  SITE
  TELEGRAM
  WHATSAPP
  TELEFONE
  INDICACAO
  REDES_SOCIAIS
}

enum LeadTemperatura {
  FRIO
  MORNO
  QUENTE
}

enum TipoNegocio {
  COMPRA
  ALUGUEL
  TEMPORADA
  VENDA
}

enum TipoImovel {
  APARTAMENTO
  CASA
  TERRENO
  COMERCIAL
  RURAL
  // ... outros
}
```

---

## Sistema de IA (Sofia)

### Provedores
1. **Anthropic Claude Sonnet 4.5** (principal)
2. **OpenAI GPT-4** (fallback)

### Funcionalidades

#### 1. Qualificação de Leads
- Análise de perfil
- Score automático (0-100)
- Temperatura (Frio, Morno, Quente)

#### 2. Sugestões de Imóveis
- Matching inteligente
- Ranking por relevância
- Personalização

#### 3. Respostas Automáticas
- WhatsApp (futuro)
- Email
- Telegram

### Configuração
```typescript
// apps/api/src/ai/ai.config.ts
{
  provider: 'anthropic',
  model: 'claude-sonnet-4.5',
  temperature: 0.7,
  maxTokens: 4000,
  fallback: {
    enabled: true,
    provider: 'openai',
    model: 'gpt-4'
  }
}
```

---

## Deploy e CI/CD

**IMPORTANTE**: Tanto o Frontend quanto o Backend estão hospedados no **Render.com**.

### Frontend (Render.com - Web Service)
- **URL**: https://imobiflow-web.onrender.com (ou similar)
- **Build Command**: `cd apps/web && pnpm install && pnpm run build`
- **Start Command**: `cd apps/web && pnpm start`
- **Node Version**: 20.x
- **Auto Deploy**: Push para `main`

### Backend (Render.com - Web Service)
- **URL**: https://imobiflow-saas-1.onrender.com
- **Build Command**: `cd apps/api && pnpm install && pnpm run build`
- **Start Command**: `cd apps/api && pnpm start`
- **Node Version**: 20.x
- **Auto Deploy**: Push para `main`

### Database (Render.com PostgreSQL)
- **Host**: dpg-d4kgd33e5dus73f7b480-a.ohio-postgres.render.com
- **Database**: imobiflow
- **Backup**: Automático diário

---

## Testes e Debugging

### Testar SendGrid
```bash
# Local
cd apps/api
SENDGRID_API_KEY="SG.xxx" node -e "
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
sgMail.send({
  to: 'teste@email.com',
  from: 'noreply@integrius.com.br',
  subject: 'Teste',
  text: 'Teste SendGrid'
});
"
```

### Testar Telegram
```bash
# Obter chat_id
curl "https://api.telegram.org/bot{TOKEN}/getUpdates"

# Enviar mensagem
curl -X POST "https://api.telegram.org/bot{TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"5264887594","text":"Teste"}'
```

### Endpoints de Teste
```bash
# Status Telegram
GET https://imobiflow-saas-1.onrender.com/api/v1/telegram/status

# Teste SendGrid (quando implementado)
POST https://imobiflow-saas-1.onrender.com/api/v1/test/sendgrid
```

---

## Guias de Desenvolvimento

### Adicionar Nova Rota

1. Criar arquivo em `/apps/api/src/modules/[modulo]/[nome].routes.ts`
2. Implementar handlers Fastify
3. Registrar em `/apps/api/src/server.ts`

```typescript
// exemplo.routes.ts
export async function exemploRoutes(server: FastifyInstance) {
  server.get('/exemplo', async (request, reply) => {
    return { message: 'Hello' };
  });
}

// server.ts
import { exemploRoutes } from './modules/exemplo/exemplo.routes';
server.register(exemploRoutes, { prefix: '/api/v1/exemplo' });
```

### Adicionar Nova Página (Next.js)

1. Criar arquivo em `/apps/web/app/[rota]/page.tsx`
2. Usar App Router conventions

```typescript
// app/exemplo/page.tsx
export default function ExemploPage() {
  return (
    <div>
      <h1>Exemplo</h1>
    </div>
  );
}
```

### Adicionar Modelo Prisma

1. Editar `/apps/api/prisma/schema.prisma`
2. Rodar migrations

```bash
cd apps/api
DATABASE_URL="..." npx prisma migrate dev --name add_modelo
DATABASE_URL="..." npx prisma generate
```

---

## Troubleshooting

### Emails não chegam
1. Verificar logs no SendGrid Activity
2. Checar pasta SPAM
3. Confirmar domínio verificado
4. Verificar DNS no Cloudflare

### Telegram não envia
1. Verificar `TELEGRAM_BOT_TOKEN` no Render
2. Testar com `GET /api/v1/telegram/status`
3. Verificar chat_id do usuário
4. Checar logs do Render

### Build falha no Render
1. Verificar `DATABASE_URL` configurada
2. Checar `NODE_VERSION` (20.x)
3. Ver logs de build no Render
4. Confirmar todas env vars

### Erro de CORS
1. Verificar `NEXT_PUBLIC_API_URL` no Render (Frontend)
2. Checar headers no Fastify
3. Confirmar domínios permitidos

---

## Contatos e Recursos

### Desenvolvedores
- **Email**: ia.hcdoh@gmail.com
- **Telegram**: @HC_Dohm

### URLs Importantes
- **Domínio Principal**: integrius.com.br
- **Landing Page Vivoly**: https://vivoly.integrius.com.br
- **Frontend (Render)**: https://imobiflow-web.onrender.com (ou similar)
- **API (Render)**: https://imobiflow-saas-1.onrender.com
- **SendGrid**: https://app.sendgrid.com
- **Render Dashboard**: https://dashboard.render.com
- **Cloudflare**: https://dash.cloudflare.com

**NOTA:** `imobiflow.com.br` NÃO é um domínio registrado. Use sempre `integrius.com.br`.

### Documentação Externa
- [Next.js](https://nextjs.org/docs)
- [Fastify](https://fastify.dev/)
- [Prisma](https://www.prisma.io/docs)
- [SendGrid](https://docs.sendgrid.com/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Anthropic Claude](https://docs.anthropic.com/)

---

## Histórico de Configurações

### 2025-12-26
- ✅ ChristmasFloat configurado com datas específicas
- ✅ SendGrid 100% configurado e testado
- ✅ Telegram Bot criado e testado
- ✅ CTAs para corretores e leads adicionados à landing page
- ✅ Sistema completo testado end-to-end
- ✅ Documentação CLAUDE.md criada

---

**Última atualização**: 26 de dezembro de 2025
**Versão**: 1.0.0
**Status**: Em produção ✅
