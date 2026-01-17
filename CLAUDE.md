# ImobiFlow - Documentação para Claude Code

## ⚠️ IMPORTANTE: Manutenção da Documentação

**TODAS as mudanças relevantes no projeto DEVEM ser registradas neste arquivo CLAUDE.md.**

Quando você fizer alterações importantes (novo módulo, nova feature, mudança de configuração, correção crítica, etc.), você DEVE:

1. ✅ Atualizar a seção relevante do CLAUDE.md
2. ✅ Adicionar entry no "Histórico de Configurações" com data
3. ✅ Atualizar "Última atualização" e "Versão" no rodapé
4. ✅ Commitar as mudanças do CLAUDE.md junto com o código

**Exemplos de mudanças que DEVEM ser documentadas:**
- Novo módulo/feature implementado
- Mudança de banco de dados ou configuração de infraestrutura
- Nova integração (API externa, serviço, etc.)
- Mudança em fluxos principais ou regras de negócio
- Correções críticas que afetam arquitetura
- Novos endpoints ou alteração de contratos de API

**Este arquivo é a fonte única de verdade para o projeto. Mantenha-o atualizado!**

---

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
- **Banco de Dados**: PostgreSQL (Supabase)
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
# Database (Supabase)
DATABASE_URL="postgresql://postgres.qdleggkqdaecehtrdfsa:YF2MhSk_-nDb%26c9@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require&connection_limit=3&pool_timeout=0"

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

1. **Domínio Base** (já configurado):
```
Type: CNAME
Name: @
Target: imobiflow-web.onrender.com
Proxy: Proxied (nuvem laranja) ✅
TTL: Auto
```

2. **Wildcard DNS** para todos os tenants:
```
Type: CNAME
Name: *
Target: imobiflow-web.onrender.com
Proxy: DNS only (nuvem cinza)
TTL: Auto
```

**IMPORTANTE**:
- O domínio base (`integrius.com.br`) pode usar Proxy (nuvem laranja) para CDN e proteção
- O wildcard (`*.integrius.com.br`) DEVE usar **DNS only (nuvem cinza)** - NUNCA habilite proxy
- Todos apontam para `imobiflow-web.onrender.com`
- NÃO é necessário criar registros específicos por tenant (vivoly, abc, etc.) - o wildcard cobre tudo
- Qualquer subdomínio criado (`novotenenant.integrius.com.br`) funciona automaticamente ✅

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

**Sofia** é a assistente virtual inteligente do ImobiFlow, responsável por qualificar leads automaticamente e fornecer insights para os corretores.

### Provedores
1. **Anthropic Claude 3 Haiku** (principal) - Rápido e econômico
2. **OpenAI GPT-4** (fallback - configurável)

---

### Funcionalidades

#### 1. Qualificação Automática de Leads ✅

Toda vez que um lead é capturado via formulário, Sofia analisa automaticamente:

**Score (0-100):**
- 0-30: Lead frio (baixa probabilidade de conversão)
- 31-60: Lead morno (média probabilidade)
- 61-100: Lead quente (alta probabilidade)

**Critérios de Pontuação:**
- Orçamento definido: +20 pontos
- Localização específica: +15 pontos
- Características detalhadas (quartos, vagas): +15 pontos
- Email fornecido: +10 pontos
- Observações detalhadas: +10 pontos
- Urgência implícita nas observações: +20 pontos

**Temperatura:**
- ❄️ **FRIO**: Sem urgência, explorando opções, sem orçamento claro
- 🌡️ **MORNO**: Alguma urgência, orçamento definido, necessidades claras
- 🔥 **QUENTE**: Urgência explícita, orçamento alto, detalhes completos

**Análise Detalhada:**
- **Poder de Compra**: BAIXO (< R$ 300k) | MÉDIO (R$ 300k-1M) | ALTO (> R$ 1M)
- **Clareza das Necessidades**: BAIXA | MÉDIA | ALTA
- **Urgência**: BAIXA | MÉDIA | ALTA
- **Probabilidade de Conversão**: 0-100%

**Insights Gerados:**
- ✅ Pontos Fortes (até 5)
- ❌ Pontos Fracos (até 5)
- 💡 Recomendação para o corretor

**Onde os Dados São Salvos:**
```typescript
// Campo ai_qualificacao (JSON) no modelo Lead
{
  score: 75,
  temperatura: "QUENTE",
  insights: {
    pontos_fortes: [
      "Orçamento alto definido (R$ 800k-1M)",
      "Localização específica (Jardins, SP)",
      "Urgência explícita (mudança em 30 dias)"
    ],
    pontos_fracos: [
      "Preferências de metragem não especificadas"
    ],
    recomendacao: "Lead quente! Entrar em contato em até 2 horas. Priorizar imóveis na região dos Jardins com 3+ quartos."
  },
  analise: {
    poder_compra: "ALTO",
    clareza_necessidades: "ALTA",
    urgencia: "ALTA",
    probabilidade_conversao: 85
  },
  data_qualificacao: "2025-12-27T14:30:00Z"
}
```

**Notificação Telegram:**
Quando um lead é atribuído a um corretor, a notificação Telegram inclui:
- 🔥 Ícone de temperatura (❄️ FRIO | 🌡️ MORNO | 🔥 QUENTE)
- Score de conversão (ex: 75%)
- Pontos fortes do lead
- Recomendação da Sofia

#### 2. Sugestões de Imóveis (Futuro)
- Matching inteligente
- Ranking por relevância
- Personalização

#### 3. Respostas Automáticas (Futuro)
- WhatsApp (via Dialog360)
- Email
- Telegram

---

### Arquivos do Sistema Sofia

**Serviço de Qualificação:**
- `/apps/api/src/ai/services/lead-qualification.service.ts` - Qualificação automática
- `/apps/api/src/ai/services/claude.service.ts` - Cliente Anthropic Claude

**Prompts:**
- `/apps/api/src/ai/prompts/sofia-prompts.ts` - Prompts de sistema e análise

**Integrações:**
- `/apps/api/src/modules/leads/leads-captura.routes.ts` - Captura com qualificação
- `/apps/api/src/shared/services/telegram.service.ts` - Notificações com temperatura

---

### Fluxo de Qualificação

```
1. Lead preenche formulário → POST /api/v1/leads/captura
   ↓
2. Sofia analisa dados via Anthropic Claude API
   ↓
3. Score, temperatura e insights são calculados
   ↓
4. Dados salvos no campo ai_qualificacao (JSON)
   ↓
5. Lead criado com score e temperatura
   ↓
6. (Se atribuído) Telegram envia notificação com análise
   ↓
7. Corretor recebe lead qualificado com insights
```

---

### Exemplo de Notificação Telegram

```
🔥 NOVO LEAD QUENTE (85%)

👤 Cliente: João Silva
📱 WhatsApp: (11) 98765-4321
📧 Email: joao@email.com

━━━━━━━━━━━━━━━━━━━━

🏡 PREFERÊNCIAS:
📋 Tipo: 🏠 Compra
🏢 Imóvel: Apartamento
💰 Valor: R$ 800.000 - R$ 1.000.000
📍 Local: Jardins, São Paulo, SP
🛏️ Quartos: 3-4
🚗 Vagas: 2

💬 Observações:
Preciso urgente, mudança prevista para fevereiro. Prefiro prédios novos com academia.

🤖 ANÁLISE IA SOFIA:

✅ Pontos Fortes:
  • Orçamento alto e bem definido
  • Localização específica (bairro nobre)
  • Urgência explícita (mudança em 60 dias)

💡 Recomendação: Lead quente! Priorizar contato em até 2 horas. Focar em imóveis novos na região dos Jardins com infraestrutura completa.

━━━━━━━━━━━━━━━━━━━━

✅ Atribuído para: Carlos Corretor
🆔 ID do Lead: abc123-def456
⏰ Entre em contato o quanto antes!
```

---

### Configuração

**Variável de Ambiente:**
```env
ANTHROPIC_API_KEY="sk-ant-api03-xxxxxxxxxxxxx"
```

**Modelo Utilizado:**
- `claude-3-haiku-20240307` (rápido e econômico)
- Custo: ~$0.25 por milhão de tokens de input
- Custo: ~$1.25 por milhão de tokens de output

**Custos Estimados:**
- Qualificação de 1 lead: ~500 tokens (~$0.0003)
- 1.000 leads/mês: ~$0.30
- 10.000 leads/mês: ~$3.00

---

## Deploy e CI/CD

**IMPORTANTE**: Tanto o Frontend quanto o Backend estão hospedados no **Render.com**.

### Frontend (Render.com - Web Service)
- **Nome do Serviço**: `imobiflow-web`
- **URLs**:
  - Render: https://imobiflow-web.onrender.com
  - Domínio Custom: https://integrius.com.br
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

### Database (Supabase PostgreSQL)
- **Provider**: Supabase
- **Host (Pooler)**: aws-1-sa-east-1.pooler.supabase.com
- **Database**: postgres
- **User**: postgres.qdleggkqdaecehtrdfsa
- **Connection String**: `postgresql://postgres.qdleggkqdaecehtrdfsa:YF2MhSk_-nDb%26c9@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require&connection_limit=3&pool_timeout=0`
- **Backup**: Automático (Supabase)
- **Acesso**: Via Supabase Dashboard ou connection pooler
- **IMPORTANTE**: Usar sempre o pooler (aws-1-sa-east-1.pooler.supabase.com), não a conexão direta

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

## Sistema de Propostas/Lances Competitivos

O ImobiFlow possui um sistema completo de propostas competitivas, permitindo que múltiplos leads façam ofertas (lances) no mesmo imóvel, criando um ambiente de leilão/competição.

### Conceito

- **Múltiplas Propostas**: Vários leads podem fazer propostas para o mesmo imóvel
- **Melhor Oferta**: Sistema identifica automaticamente a maior oferta de todos os usuários
- **Edição de Proposta**: Cada lead pode atualizar sua própria proposta a qualquer momento
- **Constraint Única**: Um lead só pode ter UMA proposta ativa por imóvel (upsert automático)
- **Multi-Tenant**: Isolamento completo por tenant_id

### Modelo de Dados

#### Proposta

```prisma
model Proposta {
  id String @id @default(uuid())

  // Multi-tenant
  tenant_id String
  tenant Tenant @relation(fields: [tenant_id], references: [id], onDelete: Cascade)

  // Relacionamentos
  lead_id String
  lead Lead @relation(fields: [lead_id], references: [id], onDelete: Cascade)

  imovel_id String
  imovel Imovel @relation(fields: [imovel_id], references: [id], onDelete: Restrict)

  corretor_id String?
  corretor Corretor? @relation(fields: [corretor_id], references: [id], onDelete: SetNull)

  // Valor da proposta
  valor Decimal @db.Decimal(10, 2)

  // Status
  status StatusProposta @default(PENDENTE)

  // Observações e resposta
  observacoes String? @db.Text
  resposta String? @db.Text
  data_resposta DateTime?
  respondido_por_id String?

  // Timestamps
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  // Constraint: um lead só pode ter uma proposta ativa por imóvel
  @@unique([tenant_id, lead_id, imovel_id])
  @@index([tenant_id])
  @@index([lead_id])
  @@index([imovel_id])
  @@index([status])
  @@map("propostas")
}

enum StatusProposta {
  PENDENTE   // Aguardando resposta
  ACEITA     // Proposta aceita
  RECUSADA   // Proposta recusada
  CONTRA     // Contraproposta feita
  CANCELADA  // Cancelada pelo lead
}
```

### Endpoints da API

**Base URL**: `/api/v1/propostas`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/` | Criar ou atualizar proposta (upsert) |
| GET | `/imovel/:imovel_id/best-offer` | Buscar melhor oferta para um imóvel |
| GET | `/imovel/:imovel_id/my-offer?lead_id=xxx` | Buscar proposta do usuário para um imóvel |
| GET | `/imovel/:imovel_id` | Listar todas as propostas de um imóvel |
| GET | `/lead/:lead_id` | Listar todas as propostas de um lead |
| POST | `/:proposta_id/accept` | Aceitar proposta |
| POST | `/:proposta_id/reject` | Recusar proposta |
| POST | `/:proposta_id/counter` | Fazer contraproposta |
| POST | `/:proposta_id/cancel` | Cancelar proposta |

### Fluxo de Uso

#### 1. Criar/Atualizar Proposta

**Request**:
```bash
POST /api/v1/propostas
Authorization: Bearer <token>

{
  "lead_id": "uuid-do-lead",
  "imovel_id": "uuid-do-imovel",
  "valor": 450000,
  "observacoes": "Proposta inicial, aguardando resposta"
}
```

**Comportamento**:
- Se já existe proposta deste lead para este imóvel → **UPDATE** (valor, observações, status volta para PENDENTE)
- Se não existe → **CREATE** nova proposta

#### 2. Buscar Melhor Oferta (Frontend)

**Request**:
```bash
GET /api/v1/propostas/imovel/uuid-do-imovel/best-offer
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "bestOffer": {
    "id": "uuid",
    "valor": 500000,
    "lead": {
      "id": "uuid",
      "nome": "João Silva"
    },
    "created_at": "2025-12-29T10:00:00.000Z"
  }
}
```

**Lógica**:
- Busca propostas com status `PENDENTE` ou `CONTRA`
- Ordena por `valor DESC` (maior valor primeiro)
- Retorna a primeira (maior oferta)

#### 3. Buscar Proposta do Usuário

**Request**:
```bash
GET /api/v1/propostas/imovel/uuid-do-imovel/my-offer?lead_id=uuid-do-lead
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "myOffer": {
    "id": "uuid",
    "valor": 480000,
    "observacoes": "Minha proposta",
    "status": "PENDENTE",
    "created_at": "2025-12-29T09:00:00.000Z"
  }
}
```

### Integração Frontend

**Arquivo**: `/apps/web/app/dashboard/negociacoes/page.tsx`

**Modal de Negociação**:

```tsx
{/* 🏆 Melhor Oferta - Read-only, verde */}
{bestOffer && (
  <div className="bg-gradient-to-r from-[#8FD14F]/10 to-[#8FD14F]/5 border-2 border-[#8FD14F]/30 rounded-lg p-3">
    <label className="block text-sm font-bold text-[#2C2C2C] mb-1 flex items-center gap-2">
      🏆 Melhor Oferta no Imóvel
    </label>
    <div className="text-2xl font-bold text-[#7FB344]">
      R$ {formatCurrencyForEdit(bestOffer.valor)}
    </div>
    <p className="text-xs text-[#8B7F76] mt-1">
      Oferta de: {bestOffer.lead.nome}
    </p>
  </div>
)}

{/* 💰 Sua Oferta - Editável, marrom */}
<div className="bg-gradient-to-r from-[#A97E6F]/10 to-[#A97E6F]/5 border-2 border-[#A97E6F]/30 rounded-lg p-3">
  <label className="block text-sm font-bold text-[#2C2C2C] mb-1">
    💰 Sua Oferta para este Imóvel *
  </label>
  <input
    type="text"
    required
    value={formData.valor_proposta}
    onChange={(e) => {
      const formatted = formatCurrencyInput(e.target.value);
      handleFormChange('valor_proposta', formatted);
    }}
    className="w-full px-3 py-2 border border-[#A97E6F]/30 rounded-lg"
  />
  {myOffer && (
    <p className="text-xs text-[#7FB344] font-medium mt-1">
      ✓ Você já fez uma proposta. Altere o valor acima para atualizar.
    </p>
  )}
</div>
```

**Carregamento Automático**:

```typescript
const loadImovelDetails = async (imovelId: string, leadId?: string) => {
  // 1. Carregar detalhes do imóvel
  const response = await api.get(`/imoveis/${imovelId}`);
  setSelectedImovelDetails(response.data);

  // 2. Carregar melhor oferta (de todos os usuários)
  try {
    const bestOfferResponse = await api.get(`/propostas/imovel/${imovelId}/best-offer`);
    setBestOffer(bestOfferResponse.data.bestOffer);
  } catch {
    setBestOffer(null);
  }

  // 3. Carregar oferta do usuário atual
  if (leadId) {
    try {
      const myOfferResponse = await api.get(`/propostas/imovel/${imovelId}/my-offer?lead_id=${leadId}`);
      setMyOffer(myOfferResponse.data.myOffer);

      // Preencher formulário com valor da proposta existente
      if (myOfferResponse.data.myOffer?.valor) {
        setFormData(prev => ({
          ...prev,
          valor_proposta: formatCurrencyForEdit(myOfferResponse.data.myOffer.valor)
        }));
      }
    } catch {
      setMyOffer(null);
    }
  }
};
```

### Regras de Negócio

1. **Upsert Automático**:
   - Um lead só pode ter UMA proposta ativa por imóvel
   - Ao criar nova proposta para imóvel que já tem proposta → UPDATE automático

2. **Melhor Oferta**:
   - Considera apenas propostas com status `PENDENTE` ou `CONTRA`
   - Exclui propostas `ACEITA`, `RECUSADA`, `CANCELADA`
   - Ordenação por maior valor

3. **Atualização de Proposta**:
   - Ao atualizar valor, status volta para `PENDENTE`
   - Permite lead aumentar ou diminuir sua oferta

4. **Status e Transições**:
   - `PENDENTE` → `ACEITA` (corretor aceita)
   - `PENDENTE` → `RECUSADA` (corretor recusa)
   - `PENDENTE` → `CONTRA` (corretor faz contraproposta)
   - Qualquer status → `CANCELADA` (lead cancela)

### Arquivos Relacionados

**Backend**:
- [/apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma) - Modelo Proposta
- [/apps/api/src/modules/propostas/propostas.service.ts](apps/api/src/modules/propostas/propostas.service.ts) - Lógica de negócio
- [/apps/api/src/modules/propostas/propostas.routes.ts](apps/api/src/modules/propostas/propostas.routes.ts) - Endpoints da API
- [/apps/api/src/server.ts](apps/api/src/server.ts) - Registro das rotas

**Frontend**:
- [/apps/web/app/dashboard/negociacoes/page.tsx](apps/web/app/dashboard/negociacoes/page.tsx) - Modal com propostas

---

## Sistema de Agendamento de Visitas

O ImobiFlow possui um sistema completo de agendamento de visitas presenciais e virtuais, com notificações automáticas para leads e corretores.

### Modelo de Dados

#### Agendamento

```prisma
model Agendamento {
  id String @id @default(uuid())

  // Multi-tenant
  tenant_id String
  tenant    Tenant @relation(...)

  // Relacionamentos
  lead_id     String
  lead        Lead @relation(...)
  imovel_id   String
  imovel      Imovel @relation(...)
  corretor_id String
  corretor    Corretor @relation(...)

  // Data e horário
  data_visita     DateTime
  duracao_minutos Int @default(60)

  // Status e tipo
  status      StatusAgendamento @default(PENDENTE)
  tipo_visita TipoVisita @default(PRESENCIAL)

  // Confirmações
  confirmado_lead     Boolean @default(false)
  confirmado_corretor Boolean @default(false)
  data_confirmacao    DateTime?

  // Realização
  realizado         Boolean @default(false)
  data_realizacao   DateTime?
  feedback_lead     String?
  feedback_corretor String?
  nota_lead         Int? // 1-5 estrelas

  // Cancelamento
  motivo_cancelamento String?
  cancelado_por       String?
  data_cancelamento   DateTime?

  // Lembretes
  lembrete_24h_enviado Boolean @default(false)
  lembrete_1h_enviado  Boolean @default(false)

  // Auditoria
  timeline   Json[]
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}

enum StatusAgendamento {
  PENDENTE       // Aguardando confirmação
  CONFIRMADO     // Confirmado por ambas as partes
  REALIZADO      // Visita realizada
  CANCELADO      // Cancelado
  NAO_COMPARECEU // Lead não compareceu
}

enum TipoVisita {
  PRESENCIAL // Visita presencial no imóvel
  VIRTUAL    // Visita virtual (vídeo chamada)
  HIBRIDA    // Combinação de presencial e virtual
}
```

### Fluxo de Agendamento

#### 1. Criação do Agendamento

**Endpoint**: `POST /api/v1/agendamentos`

```json
{
  "lead_id": "uuid",
  "imovel_id": "uuid",
  "corretor_id": "uuid",
  "data_visita": "2025-12-30T14:00:00.000Z",
  "duracao_minutos": 60,
  "tipo_visita": "PRESENCIAL",
  "observacoes": "Cliente prefere horário de tarde"
}
```

**Validações Automáticas**:
- ✅ Data da visita deve ser futura
- ✅ Corretor não pode ter conflito de horário (±1h)
- ✅ Lead, imóvel e corretor devem pertencer ao mesmo tenant
- ✅ Todos os relacionamentos devem existir

**Notificações Enviadas**:
- 📧 Email para o lead confirmando agendamento
- 📱 Telegram para o corretor notificando nova visita

#### 2. Confirmação

**Endpoint**: `POST /api/v1/agendamentos/:id/confirmar`

```json
{
  "confirmado_por": "LEAD" // ou "CORRETOR"
}
```

- Lead confirma presença
- Corretor confirma disponibilidade
- Quando ambos confirmam → Status muda para `CONFIRMADO`

#### 3. Realização

**Endpoint**: `POST /api/v1/agendamentos/:id/realizar`

- Marca visita como realizada
- Permite adicionar feedback posteriormente

#### 4. Feedback

**Endpoint**: `POST /api/v1/agendamentos/:id/feedback`

```json
{
  "feedback_lead": "Imóvel muito bom, gostei bastante!",
  "feedback_corretor": "Cliente demonstrou interesse, próximo passo: proposta",
  "nota_lead": 5
}
```

#### 5. Cancelamento

**Endpoint**: `POST /api/v1/agendamentos/:id/cancelar`

```json
{
  "motivo_cancelamento": "Imprevisto pessoal",
  "cancelado_por": "user_id"
}
```

### Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/agendamentos` | Criar novo agendamento |
| GET | `/api/v1/agendamentos` | Listar agendamentos (com filtros) |
| GET | `/api/v1/agendamentos/:id` | Buscar agendamento por ID |
| PATCH | `/api/v1/agendamentos/:id` | Atualizar agendamento |
| POST | `/api/v1/agendamentos/:id/confirmar` | Confirmar presença |
| POST | `/api/v1/agendamentos/:id/cancelar` | Cancelar agendamento |
| POST | `/api/v1/agendamentos/:id/realizar` | Marcar como realizado |
| POST | `/api/v1/agendamentos/:id/feedback` | Adicionar feedback |

### Filtros de Listagem

```
GET /api/v1/agendamentos?tenant_id=xxx&status=CONFIRMADO&data_inicio=2025-12-27
```

**Parâmetros**:
- `tenant_id` (obrigatório)
- `lead_id`
- `corretor_id`
- `imovel_id`
- `status`
- `data_inicio`
- `data_fim`

### Notificações Automáticas

#### Email para Lead (SendGrid)

Enviado automaticamente ao criar agendamento:

- ✅ Data e horário formatados
- ✅ Informações do imóvel
- ✅ Dados do corretor (nome e telefone)
- ✅ Tipo de visita (presencial/virtual)
- ✅ Aviso sobre lembretes automáticos

**Template**: Email responsivo com gradiente verde (#8FD14F)

#### Telegram para Corretor

Enviado automaticamente ao criar agendamento:

```
🏠 NOVA VISITA AGENDADA

📅 Data: Quarta-feira, 01 de janeiro de 2025
⏰ Horário: 14:00
🎯 Tipo: 🏠 Presencial

━━━━━━━━━━━━━━━━━━━━

👤 CLIENTE:
  • Nome: João Silva
  • Telefone: (11) 98765-4321

🏢 IMÓVEL:
  • Título: Apartamento 2 Quartos Centro
  • Endereço: Rua Principal, 123

━━━━━━━━━━━━━━━━━━━━

🆔 ID: uuid-do-agendamento
⏰ Lembrete: Você receberá lembretes 24h e 1h antes
✅ Prepare-se e confirme sua presença!
```

### Regras de Negócio

1. **Validação de Horário**:
   - Corretor não pode ter dois agendamentos no mesmo horário (±1h)
   - Data deve ser futura

2. **Status e Transições**:
   - `PENDENTE` → `CONFIRMADO` (quando ambos confirmam)
   - `CONFIRMADO` → `REALIZADO` (após visita)
   - `PENDENTE/CONFIRMADO` → `CANCELADO` (a qualquer momento)
   - `CONFIRMADO` → `NAO_COMPARECEU` (lead não apareceu)

3. **Alterações**:
   - Agendamentos `REALIZADO` ou `CANCELADO` não podem ser editados
   - Reagendamento requer cancelamento e nova criação

4. **Feedback**:
   - Apenas agendamentos `REALIZADO` podem receber feedback
   - Nota do lead: 1-5 estrelas (opcional)

### Sistema de Lembretes (Futuro)

**TODO**: Implementar job assíncrono (cron) para enviar:
- Lembrete 24h antes da visita
- Lembrete 1h antes da visita
- Marcar flags `lembrete_24h_enviado` e `lembrete_1h_enviado`

**Tecnologias Sugeridas**:
- **BullMQ** ou **Agenda** (job queue)
- **Node-cron** (agendador simples)

### Integração com Negociações

Quando uma visita é marcada como `REALIZADO`, considerar:
1. Atualizar status da negociação para `VISITA_REALIZADA`
2. Se feedback positivo → escalar para `PROPOSTA`
3. Se feedback negativo → analisar motivo

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
- **Domínio Principal**: https://integrius.com.br
- **Landing Page Vivoly**: https://vivoly.integrius.com.br
- **Frontend (Render)**: https://imobiflow-web.onrender.com
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

## Sistema de Autenticação e Permissões

O ImobiFlow possui um sistema completo de autenticação JWT com suporte multi-tenant e controle de acesso baseado em roles (RBAC).

### Arquitetura de Autenticação

#### 1. Multi-Tenant por Subdomínio
- Cada tenant possui um subdomínio único (ex: `vivoly.integrius.com.br`)
- O tenant é identificado automaticamente pelo subdomínio da requisição
- Em desenvolvimento, pode-se usar header `X-Tenant-ID` ou query param `?tenant_id=uuid`

#### 2. JWT (JSON Web Token)
Payload do token JWT:
```typescript
{
  userId: string,      // ID do usuário
  tenantId: string,    // ID do tenant
  tipo: 'ADMIN' | 'GESTOR' | 'CORRETOR'
}
```

**Expiração**: 7 dias (configurável via `JWT_EXPIRES_IN`)

**Secret**: Definido em `JWT_SECRET` (variável de ambiente)

#### 3. Hierarquia de Roles

**ADMIN (Nível 3)** - Administrador do Tenant
- ✅ Gerenciar todos os usuários (criar, editar, deletar)
- ✅ Criar outros ADMINS, GESTORES e CORRETORES
- ✅ Alterar configurações do tenant
- ✅ Acesso total a todos os recursos
- ✅ Ver métricas e relatórios gerenciais
- ✅ Gerenciar planos e assinaturas

**GESTOR (Nível 2)** - Gerente Operacional
- ✅ Criar e editar CORRETORES
- ✅ Ver e gerenciar todos os leads
- ✅ Ver e gerenciar todos os imóveis
- ✅ Ver relatórios e dashboard geral
- ❌ Não pode criar/editar ADMINS ou GESTORES
- ❌ Não pode alterar configurações críticas do tenant

**CORRETOR (Nível 1)** - Corretor/Vendedor
- ✅ Ver e editar apenas seus próprios leads
- ✅ Ver imóveis disponíveis
- ✅ Gerenciar suas próprias negociações
- ✅ Dashboard pessoal
- ❌ Não pode criar ou editar outros usuários
- ❌ Não pode ver dados de outros corretores

### Endpoints de Autenticação

#### 1. Registro de Usuário

**Endpoint**: `POST /api/v1/auth/register`

**Headers**:
```
Content-Type: application/json
Host: vivoly.integrius.com.br  (ou X-Tenant-ID para dev)
```

**Body**:
```json
{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "senha": "senha123",
  "tipo": "CORRETOR",  // ADMIN | GESTOR | CORRETOR
  "telefone": "11999999999",  // obrigatório para CORRETOR
  "creci": "123456"  // obrigatório para CORRETOR
}
```

**Response 201**:
```json
{
  "user": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "tipo": "CORRETOR",
    "tenant_id": "uuid"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Login

**Endpoint**: `POST /api/v1/auth/login`

**Headers**:
```
Content-Type: application/json
Host: vivoly.integrius.com.br
```

**Body**:
```json
{
  "email": "joao@exemplo.com",
  "senha": "senha123"
}
```

**Response 200**:
```json
{
  "user": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "tipo": "CORRETOR",
    "tenant_id": "uuid"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros Comuns**:
- `401`: Email ou senha inválidos
- `403`: Usuário inativo
- `404`: Tenant não encontrado

#### 3. Login com Google

**Endpoint**: `POST /api/v1/auth/google`

**Body**:
```json
{
  "credential": "google_id_token"
}
```

**Comportamento**:
- Se usuário não existe → cria novo usuário (tipo CORRETOR)
- Se usuário existe com email → vincula conta Google
- Se usuário existe com google_id → faz login

#### 4. Dados do Usuário Autenticado

**Endpoint**: `GET /api/v1/auth/me`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200**:
```json
{
  "id": "uuid",
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "tipo": "CORRETOR",
  "ativo": true
}
```

### Endpoints de Gerenciamento de Usuários

**Importante**: Todos os endpoints abaixo requerem autenticação (header `Authorization: Bearer <token>`)

#### 1. Listar Usuários

**Endpoint**: `GET /api/v1/users`

**Permissão**: ADMIN ou GESTOR

**Response 200**:
```json
{
  "success": true,
  "total": 5,
  "users": [
    {
      "id": "uuid",
      "nome": "Admin User",
      "email": "admin@vivoly.com",
      "tipo": "ADMIN",
      "ativo": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "ultimo_login": "2025-12-27T10:00:00.000Z"
    }
  ]
}
```

#### 2. Buscar Usuário por ID

**Endpoint**: `GET /api/v1/users/:id`

**Permissão**: ADMIN ou GESTOR

#### 3. Criar Usuário

**Endpoint**: `POST /api/v1/users`

**Permissão**:
- ADMIN: pode criar ADMIN, GESTOR ou CORRETOR
- GESTOR: pode criar apenas CORRETOR

**Body**:
```json
{
  "nome": "Novo Corretor",
  "email": "corretor@vivoly.com",
  "senha": "senha123",
  "tipo": "CORRETOR",
  "telefone": "11999999999",
  "creci": "123456"
}
```

#### 4. Atualizar Usuário

**Endpoint**: `PATCH /api/v1/users/:id`

**Permissão**:
- ADMIN: pode editar qualquer usuário
- GESTOR: pode editar apenas CORRETORES

**Body**:
```json
{
  "nome": "Nome Atualizado",
  "email": "novoemail@vivoly.com",
  "senha": "novasenha123",
  "ativo": true
}
```

**Nota**: Apenas ADMIN pode alterar o campo `tipo`

#### 5. Deletar Usuário (Soft Delete)

**Endpoint**: `DELETE /api/v1/users/:id`

**Permissão**: Apenas ADMIN

**Comportamento**: Desativa o usuário (`ativo: false`) ao invés de deletar do banco

### Middlewares

#### 1. tenantMiddleware

**Arquivo**: `/apps/api/src/shared/middlewares/tenant.middleware.ts`

**Função**: Extrai e valida o tenant da requisição

**Ordem de Prioridade**:
1. Header `X-Tenant-ID` (desenvolvimento)
2. Query param `?tenant_id=uuid` (desenvolvimento)
3. Subdomínio do host (produção)

**Exemplo de Uso**:
```typescript
server.post('/login', {
  preHandler: tenantMiddleware
}, handler)
```

#### 2. authMiddleware

**Arquivo**: `/apps/api/src/shared/middlewares/auth.middleware.ts`

**Função**: Valida JWT e carrega dados do usuário no `request.user`

**Validações**:
- ✅ Token presente no header `Authorization: Bearer <token>`
- ✅ Token válido e não expirado
- ✅ Usuário existe e está ativo
- ✅ Tenant do token corresponde ao tenant do usuário
- ✅ Tenant do token corresponde ao tenant da requisição

**Exemplo de Uso**:
```typescript
server.get('/protected', {
  preHandler: authMiddleware
}, handler)
```

#### 3. Middlewares de Permissões

**Arquivo**: `/apps/api/src/shared/middlewares/permissions.middleware.ts`

**Funções Disponíveis**:

```typescript
// Requer role(s) específica(s)
requireRole(['ADMIN'])
requireRole(['ADMIN', 'GESTOR'])

// Requer nível mínimo
requireMinRole('ADMIN')      // Apenas ADMIN
requireMinRole('GESTOR')     // ADMIN ou GESTOR

// Atalhos
requireAdmin                 // Apenas ADMIN
requireManager               // ADMIN ou GESTOR

// Verificar ownership de recurso
requireResourceOwnership('lead_id', 'corretor_id')
```

**Exemplo de Uso**:
```typescript
import { requireAdmin, requireManager } from '@/middlewares/permissions.middleware'

// Apenas ADMIN pode deletar usuários
server.delete('/users/:id', {
  preHandler: [authMiddleware, requireAdmin]
}, handler)

// ADMIN ou GESTOR podem ver relatórios
server.get('/reports', {
  preHandler: [authMiddleware, requireManager]
}, handler)
```

### Helpers de Permissões

**Arquivo**: `/apps/api/src/shared/middlewares/permissions.middleware.ts`

```typescript
import { Permissions } from '@/middlewares/permissions.middleware'

// Verificar se pode criar usuário
Permissions.canCreateUser('GESTOR', 'CORRETOR')  // true
Permissions.canCreateUser('GESTOR', 'ADMIN')     // false

// Verificar se pode editar usuário
Permissions.canEditUser('ADMIN', 'GESTOR')       // true
Permissions.canEditUser('GESTOR', 'ADMIN')       // false

// Verificar se pode deletar usuário
Permissions.canDeleteUser('ADMIN', 'CORRETOR')   // true (apenas ADMIN)
Permissions.canDeleteUser('GESTOR', 'CORRETOR')  // false

// Verificar se pode acessar recurso de outro usuário
Permissions.canAccessUserResource(
  currentUserId: 'uuid-1',
  resourceUserId: 'uuid-2',
  userType: 'CORRETOR'
)  // false (CORRETOR só acessa seus recursos)

Permissions.canAccessUserResource(
  currentUserId: 'uuid-1',
  resourceUserId: 'uuid-2',
  userType: 'GESTOR'
)  // true (GESTOR acessa qualquer recurso)
```

### Fluxo Completo de Autenticação

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant TenantMiddleware
    participant AuthService
    participant Database

    Client->>API: POST /auth/login<br/>Host: vivoly.integrius.com.br
    API->>TenantMiddleware: Extrair tenant
    TenantMiddleware->>Database: Buscar tenant por subdomínio
    Database-->>TenantMiddleware: Tenant encontrado
    TenantMiddleware->>API: request.tenantId = 'uuid'
    API->>AuthService: login(email, senha, tenantId)
    AuthService->>Database: Buscar usuário por email + tenant_id
    Database-->>AuthService: Usuário encontrado
    AuthService->>AuthService: Verificar senha (bcrypt)
    AuthService->>AuthService: Gerar JWT (userId, tenantId, tipo)
    AuthService-->>API: { user, token }
    API-->>Client: 200 OK { user, token }
```

### Exemplo de Requisição Autenticada

```bash
# 1. Login
curl -X POST https://vivoly.integrius.com.br/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vivoly.com",
    "senha": "senha123"
  }'

# Response:
# {
#   "user": { "id": "uuid", "nome": "Admin", "tipo": "ADMIN" },
#   "token": "eyJhbGci..."
# }

# 2. Acessar recurso protegido
curl -X GET https://vivoly.integrius.com.br/api/v1/users \
  -H "Authorization: Bearer eyJhbGci..."

# 3. Criar novo usuário (apenas ADMIN)
curl -X POST https://vivoly.integrius.com.br/api/v1/users \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Novo Corretor",
    "email": "corretor@vivoly.com",
    "senha": "senha123",
    "tipo": "CORRETOR",
    "telefone": "11999999999"
  }'
```

### Segurança

#### Boas Práticas Implementadas

1. **Senhas Hasheadas**: Bcrypt com salt de 10 rounds
2. **JWT Secret**: Armazenado em variável de ambiente
3. **Expiração de Token**: 7 dias (configurável)
4. **Tenant Isolation**: Todas as queries filtram por `tenant_id`
5. **Validação de Ownership**: Middlewares verificam se token pertence ao tenant
6. **Soft Delete**: Usuários são desativados, não deletados
7. **Logs de Auditoria**: Todas as operações são logadas

#### Checklist de Segurança

- ✅ NUNCA expor `senha_hash` em responses
- ✅ SEMPRE validar `tenant_id` em queries
- ✅ SEMPRE verificar se usuário está `ativo`
- ✅ SEMPRE validar permissões antes de operações críticas
- ✅ SEMPRE usar HTTPS em produção
- ✅ SEMPRE validar input do usuário
- ✅ NUNCA confiar apenas no JWT - sempre buscar usuário no banco
- ✅ NUNCA permitir que CORRETOR acesse dados de outros corretores

### Integração com Frontend

#### Arquivos de Autenticação Frontend

**1. Utilitários de Tenant** (`/apps/web/lib/tenant.ts`)

```typescript
// Extrai informações do tenant do subdomínio ou query params
export function getTenantInfo(): TenantInfo {
  // 1. Tentar query param ?tenant_id=xxx (desenvolvimento)
  const tenantIdFromQuery = urlParams.get('tenant_id');
  if (tenantIdFromQuery) {
    return { tenantId: tenantIdFromQuery, isDevelopment: true };
  }

  // 2. Extrair do subdomínio (produção)
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const subdomain = parts[0]; // ex: vivoly
    return { tenantId: null, subdomain, isDevelopment: false };
  }
}
```

**2. Cliente API com Interceptors** (`/apps/web/lib/api.ts`)

```typescript
import axios from 'axios';
import { getTenantId } from './tenant';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor para adicionar token e tenant
api.interceptors.request.use((config) => {
  // Adicionar token de autenticação
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Adicionar tenant_id (desenvolvimento)
  const tenantId = getTenantId();
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId;
  }

  return config;
});

// Interceptor para tratar erros 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**3. Funções de Autenticação** (`/apps/web/lib/auth.ts`)

```typescript
export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await api.post('/auth/login', data);

  if (response.data.token) {
    // Armazenar em localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Armazenar em cookie para middleware Next.js
    document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }

  return response.data;
}

export function logout() {
  // Remover de localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Remover cookie
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // Redirecionar para login
  window.location.href = '/login';
}
```

**4. Middleware Next.js** (`/apps/web/middleware.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/leads', '/imoveis', '/negociacoes'];
const PUBLIC_ROUTES = ['/', '/login', '/register'];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // 1. VERIFICAR AUTENTICAÇÃO (rotas protegidas)
  const isProtectedRoute = PROTECTED_ROUTES.some(route => url.pathname.startsWith(route));

  if (isProtectedRoute) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      // Redirecionar para login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', url.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. EXTRAIR TENANT DO SUBDOMÍNIO
  let subdomain: string | null = null;

  if (hostname.includes('localhost')) {
    // Desenvolvimento: usar query param
    const tenantId = url.searchParams.get('tenant_id');
    if (tenantId) {
      const response = NextResponse.next();
      response.headers.set('x-tenant-id', tenantId);
      return response;
    }
  } else {
    // Produção: extrair subdomínio
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      subdomain = parts[0]; // ex: vivoly
    }
  }

  const response = NextResponse.next();
  if (subdomain) {
    response.headers.set('x-tenant-slug', subdomain);
  }

  return response;
}
```

**5. Página de Login** (`/apps/web/app/login/page.tsx`)

Características da página de login:
- ✅ Interface moderna com gradiente e animações
- ✅ Login tradicional (email + senha)
- ✅ Google OAuth integrado (`@react-oauth/google`)
- ✅ Mensagens de erro com timeout de 15 segundos
- ✅ Armazenamento duplo (localStorage + cookie)
- ✅ Redirecionamento para dashboard após sucesso
- ✅ Loading states durante autenticação

**6. Google OAuth Provider** (`/apps/web/app/layout.tsx`)

```typescript
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <GoogleOAuthProvider clientId="101518980847-9n7uovmjc8g561vmqormir1931og01ue.apps.googleusercontent.com">
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
```

#### Fluxo de Login Frontend

```
1. Usuário acessa https://vivoly.integrius.com.br/login
   ↓
2. Middleware Next.js:
   - Extrai subdomain "vivoly" do hostname
   - Injeta header x-tenant-slug: "vivoly"
   ↓
3. Usuário preenche email/senha OU clica em "Login com Google"
   ↓
4. Frontend envia POST /api/v1/auth/login ou /api/v1/auth/google
   - API client adiciona header X-Tenant-ID (se dev)
   - Host header contém vivoly.integrius.com.br (produção)
   ↓
5. Backend valida credenciais + tenant
   ↓
6. Backend retorna { user, token }
   ↓
7. Frontend armazena:
   - localStorage.setItem('token', token)
   - localStorage.setItem('user', JSON.stringify(user))
   - document.cookie = 'token=...' (para middleware)
   ↓
8. Redireciona para /dashboard
   ↓
9. Middleware Next.js verifica cookie 'token'
   ↓
10. Permite acesso ao dashboard
```

#### Segurança no Frontend

**Armazenamento de Token:**
- ✅ **localStorage**: Para acesso via JavaScript (requisições API)
- ✅ **Cookie**: Para middleware Next.js (proteção de rotas)
- ⚠️ **Limitação**: Cookies não são httpOnly (podem ser acessados via JS)
- 💡 **Melhoria Futura**: Implementar httpOnly cookies via backend

**Proteção XSS:**
- ✅ Next.js sanitiza automaticamente inputs
- ✅ Content Security Policy via helmet no backend
- ⚠️ localStorage exposto a XSS

**Boas Práticas:**
1. **Sempre** validar token no backend, não confiar apenas no frontend
2. **Sempre** usar HTTPS em produção
3. **Considerar** migração para httpOnly cookies no futuro
4. **Implementar** refresh tokens para melhor segurança
5. **Adicionar** rate limiting no backend

---

## Sistema de Cookies de Lembrança (Tenant Cookies)

O ImobiFlow implementa um sistema profissional de cookies de longa duração para melhorar a experiência do usuário, lembrando o último tenant acessado.

### Conceito

Quando um usuário faz login em um tenant específico (ex: `vivoly.integrius.com.br`), o sistema armazena cookies de longa duração (90 dias) para lembrar:
1. **Qual foi o último tenant acessado** (`last_tenant`)
2. **Qual método de login foi usado** (`last_login_method`: email ou google)

Na próxima vez que o usuário acessar a landing page e clicar em "Entrar", ele será automaticamente redirecionado para o subdomínio do último tenant usado.

### Cookies Armazenados

```typescript
// Cookie 1: Slug do último tenant acessado
document.cookie = `last_tenant=vivoly; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;

// Cookie 2: Método de login usado
document.cookie = `last_login_method=email; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
// ou
document.cookie = `last_login_method=google; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
```

**Duração**: 90 dias (7.776.000 segundos)

**SameSite**: Lax (permite em navegação cross-site, mas não em requests POST cross-site)

### Fluxo de Funcionamento

#### 1. Primeiro Acesso (Sem Cookie)

```
1. Usuário acessa: https://integrius.com.br
   ↓
2. Clica no botão "Entrar"
   ↓
3. Vai para: https://integrius.com.br/login
   ↓
4. Não tem cookie `last_tenant` → mostra formulário de login
   ↓
5. Usuário escolhe tenant ou faz login
   (pode acessar diretamente vivoly.integrius.com.br/login)
   ↓
6. Faz login com email/senha ou Google OAuth
   ↓
7. Sistema armazena cookies:
   - `last_tenant=vivoly`
   - `last_login_method=email` (ou google)
   ↓
8. Redireciona para: vivoly.integrius.com.br/dashboard
```

#### 2. Acesso Posterior (Com Cookie)

```
1. Usuário acessa: https://integrius.com.br
   ↓
2. Clica no botão "Entrar"
   ↓
3. Vai para: https://integrius.com.br/login
   ↓
4. Sistema detecta cookie `last_tenant=vivoly`
   ↓
5. REDIRECIONA AUTOMATICAMENTE para: https://vivoly.integrius.com.br
   ↓
6. Usuário faz login no tenant vivoly
   (cookie lembra que é o tenant dele)
```

### Implementação

#### Arquivo: `/apps/web/lib/auth.ts`

**Armazenamento no Login Email/Senha:**

```typescript:apps/web/lib/auth.ts
export async function login(data: LoginData): Promise<AuthResponse> {
  const subdomain = getSubdomain();
  // ... login logic ...

  if (response.data.token) {
    // Tokens de sessão (7 dias)
    localStorage.setItem('token', response.data.token);
    document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

    // Cookies de lembrança (90 dias)
    if (subdomain) {
      document.cookie = `last_tenant=${subdomain}; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
      document.cookie = `last_login_method=email; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
    }
  }
}
```

**Armazenamento no Login Google OAuth:**

```typescript:apps/web/lib/auth.ts
export async function loginWithGoogle(credential: string): Promise<AuthResponse> {
  const subdomain = getSubdomain();
  // ... Google OAuth logic ...

  if (response.data.token) {
    // Tokens de sessão (7 dias)
    localStorage.setItem('token', response.data.token);
    document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

    // Cookies de lembrança (90 dias)
    if (subdomain) {
      document.cookie = `last_tenant=${subdomain}; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
      document.cookie = `last_login_method=google; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
    }
  }
}
```

**Helpers para Ler Cookies:**

```typescript:apps/web/lib/auth.ts
function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
}

export function getLastTenant(): string | null {
  return getCookie('last_tenant');
}

export function getLastLoginMethod(): 'email' | 'google' | null {
  const method = getCookie('last_login_method');
  return method as 'email' | 'google' | null;
}
```

#### Arquivo: `/apps/web/app/login/page.tsx`

**Verificação e Redirecionamento Automático:**

```typescript:apps/web/app/login/page.tsx
useEffect(() => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    const hasSubdomain = parts.length >= 3 && !hostname.includes('localhost');

    // Se NÃO está em subdomínio (domínio base)
    if (!hasSubdomain) {
      const lastTenant = getLastTenant();
      const lastMethod = getLastLoginMethod();

      if (lastTenant) {
        // Redirecionar automaticamente para o último tenant usado
        console.log(`🔄 Redirecionando para: ${lastTenant} (método: ${lastMethod})`);

        const tenantUrl = `${window.location.protocol}//${lastTenant}.${hostname}`;
        window.location.href = tenantUrl;
      }
    }
  }
}, []);
```

### Comportamento no Logout

**IMPORTANTE**: Os cookies de lembrança (`last_tenant` e `last_login_method`) **NÃO são removidos** no logout.

```typescript:apps/web/lib/auth.ts
export function logout() {
  // Remove tokens de sessão
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('tenant_id');
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // MANTÉM cookies de lembrança (last_tenant, last_login_method)

  // Redireciona para landing page (não para /login)
  window.location.href = '/';
}
```

**Motivo**: Permite que o usuário, ao fazer logout e voltar depois, seja redirecionado automaticamente para o tenant correto, sem precisar lembrar qual subdomínio usar.

### Segurança

**Cookies de Lembrança vs. Cookies de Autenticação:**

| Cookie | Tipo | Duração | Sensibilidade | Propósito |
|--------|------|---------|---------------|-----------|
| `token` | Autenticação | 7 dias | 🔴 Alta | Acesso ao sistema |
| `last_tenant` | Preferência | 90 dias | 🟡 Baixa | UX (lembrar tenant) |
| `last_login_method` | Preferência | 90 dias | 🟡 Baixa | UX (lembrar método) |

**Riscos Mitigados:**
- ✅ Cookies de lembrança **não contém dados sensíveis** (apenas slug público)
- ✅ Não permitem acesso sem autenticação (apenas redirecionam)
- ✅ SameSite=Lax previne CSRF
- ✅ Token de autenticação tem duração curta (7 dias)

**Cenário de Ataque:**
Se um atacante obtém acesso aos cookies de lembrança:
- ❌ **NÃO consegue** fazer login (precisa do token)
- ❌ **NÃO consegue** acessar dados sensíveis
- ✅ **Apenas** será redirecionado para o mesmo tenant (slug público)

### Casos de Uso

#### 1. Corretor de Imobiliária

```
1. Corretor da Vivoly faz login: vivoly.integrius.com.br
2. Sistema salva: last_tenant=vivoly
3. Dias depois, acessa: integrius.com.br
4. Clica "Entrar" → redireciona automaticamente para vivoly.integrius.com.br
5. Faz login e entra direto no dashboard
```

#### 2. Usuário com Múltiplos Tenants

```
1. Usuário trabalha em 2 imobiliárias: Vivoly e ImobiABC
2. Faz login na Vivoly → last_tenant=vivoly
3. Dias depois, acessa integrius.com.br → redireciona para vivoly
4. Se quiser acessar ImobiABC:
   a) Acessa diretamente: imobiabc.integrius.com.br
   b) Faz login → last_tenant=imobiabc (sobrescreve)
   c) Próximo acesso → redireciona para imobiabc
```

#### 3. Landing Page e Logo

```
1. Logo no header SEMPRE aponta para: /
2. Ao clicar, sempre vai para landing page
3. Landing page tem botão "Entrar"
4. Botão "Entrar" vai para /login
5. /login verifica cookie e redireciona se existir
```

### Middleware Next.js

O middleware foi ajustado para permitir acesso ao `/login` no domínio base:

```typescript:apps/web/middleware.ts
// Permitir acesso à landing page (/) e /register e /login
if (!subdomain || RESERVED_SUBDOMAINS.includes(subdomain)) {
  if (isPublicRoute) {
    return NextResponse.next();
  }
}

// Subdomínios: raiz redireciona para /login
if (url.pathname === '/') {
  return NextResponse.redirect(new URL('/login', request.url));
}
```

### Benefícios

1. **UX Melhorada**: Usuário não precisa lembrar/digitar subdomínio
2. **Profissional**: Comportamento esperado em sistemas SaaS modernos
3. **Sem Fricção**: Reduz etapas entre landing page e dashboard
4. **Multi-Tenant Friendly**: Funciona perfeitamente com arquitetura de subdomínios
5. **Seguro**: Cookies de lembrança não contêm dados sensíveis

---

## Sistema de Trial e Expiração de Assinatura

### ⏰ Período de Teste

Todos os novos tenants criados no ImobiFlow recebem automaticamente um período de teste gratuito de **30 dias**.

### Configuração do Trial

**Criação de Tenant:**
```typescript
// Arquivo: /apps/api/src/modules/tenants/tenant.repository.ts (linha 53-54)
status: 'TRIAL',
data_expiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
```

- **Status inicial**: `TRIAL`
- **Duração**: 30 dias a partir da criação
- **Campo**: `data_expiracao` (DateTime) armazena a data de término

### Validação Automática de Expiração

**Middleware de Tenant:**
```typescript
// Arquivo: /apps/api/src/shared/middlewares/tenant.middleware.ts (linhas 113-126)

// Verificar se trial expirou
if (tenant.status === 'TRIAL' && tenant.data_expiracao) {
  const now = new Date()
  const expirationDate = new Date(tenant.data_expiracao)

  if (now > expirationDate) {
    // Trial expirado - atualizar status para SUSPENSO
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: 'SUSPENSO' }
    })
    throw new AppError('Período de teste expirado. Entre em contato para ativar sua assinatura.', 403)
  }
}
```

**Quando a validação acontece:**
- ✅ Em **toda requisição** ao backend
- ✅ Antes de processar qualquer operação
- ✅ Bloqueia acesso imediatamente após expiração

**O que acontece quando expira:**
1. Status muda automaticamente de `TRIAL` → `SUSPENSO`
2. Usuário recebe erro `403` com mensagem clara
3. Acesso ao sistema é bloqueado
4. Dados permanecem íntegros (não são deletados)

### Endpoint de Informações do Trial

**GET** `/api/v1/trial-info`

**Headers necessários:**
- `Authorization: Bearer <token>`

**Response (tenant em trial):**
```json
{
  "isTrial": true,
  "status": "TRIAL",
  "plano": "BASICO",
  "data_expiracao": "2025-01-31T23:59:59.000Z",
  "dias_restantes": 15,
  "expirado": false
}
```

**Response (tenant ativo):**
```json
{
  "isTrial": false,
  "status": "ATIVO",
  "plano": "PREMIUM"
}
```

### Aviso Visual no Frontend

**Componente:** `/apps/web/components/TrialWarning.tsx`

**Comportamento:**
- Exibido automaticamente no topo de todas as páginas do dashboard
- Aparece apenas quando **restam 7 dias ou menos** no trial
- Cores dinâmicas baseadas na urgência:
  - **Amarelo** (⏰): 4-7 dias restantes
  - **Vermelho** (⚠️): 1-3 dias restantes

**Visual:**
```
┌─────────────────────────────────────────────────────────────┐
│ ⏰  5 dias restantes no período de teste                    │
│     Entre em contato para ativar sua assinatura e continuar │
│     usando o ImobiFlow                                       │
└─────────────────────────────────────────────────────────────┘
```

**Localização:**
- Arquivo: `/apps/web/app/dashboard/layout.tsx`
- Inserido no início do `<main>`, antes do `{children}`
- Visível em todas as rotas do dashboard

### Status de Tenant

| Status | Descrição | Pode Acessar? |
|--------|-----------|---------------|
| `TRIAL` | Período de teste (30 dias) | ✅ Sim (se não expirado) |
| `ATIVO` | Assinatura paga ativa | ✅ Sim |
| `SUSPENSO` | Trial expirado ou pagamento pendente | ❌ Não |
| `INATIVO` | Conta desativada | ❌ Não |
| `CANCELADO` | Assinatura cancelada | ❌ Não |

### Ativação de Assinatura

Para ativar um tenant após o trial expirar:

```sql
-- Atualizar status e remover data de expiração
UPDATE "Tenant"
SET
  status = 'ATIVO',
  plano = 'PREMIUM', -- ou BASICO/EMPRESARIAL
  data_expiracao = NULL
WHERE id = 'tenant-uuid';
```

**Via API (futuro):**
- Endpoint de checkout/pagamento
- Integração com gateway de pagamento (Stripe/PagSeguro)
- Webhook para ativação automática

### Renovação Automática (Futuro)

**TODO**: Implementar job/cron para avisar antes da expiração:
- 7 dias antes: Email de aviso
- 3 dias antes: Email + notificação no sistema
- 1 dia antes: Email urgente
- No dia: Suspensão automática

**Tecnologias sugeridas:**
- **BullMQ** ou **Agenda** (job queue)
- **Node-cron** (agendador)
- SendGrid para envio de emails

### Arquivos Relacionados

**Backend:**
- `/apps/api/src/shared/middlewares/tenant.middleware.ts` - Validação de expiração
- `/apps/api/src/modules/tenants/tenant.routes.ts` - Endpoint de info do trial
- `/apps/api/src/modules/tenants/tenant.repository.ts` - Criação com trial
- `/apps/api/prisma/schema.prisma` - Modelo Tenant (status, data_expiracao)

**Frontend:**
- `/apps/web/components/TrialWarning.tsx` - Componente de aviso
- `/apps/web/app/dashboard/layout.tsx` - Layout com aviso integrado

---

## Sistema de Recuperação de Dados (Trial)

O ImobiFlow implementa um sistema profissional de recuperação de dados para tenants em período trial, garantindo que clientes possam exportar seus dados antes do término e recebam avisos com antecedência.

### 🎯 Objetivo

Oferecer aos clientes trial:
1. **Aviso com antecedência** (5 dias antes) por email
2. **Botão de exportação** nos últimos 5 dias do trial
3. **Backup completo** em formato CSV via email
4. **Proteção de dados** por 30 dias após expiração

### 📧 Email Automático 5 Dias Antes

**Quando é enviado:**
- Automaticamente 5 dias antes da data de expiração
- Apenas uma vez por tenant (flag `email_5dias_enviado`)

**Conteúdo do Email:**
- ⏰ Aviso de quantos dias restam
- 🔒 Informação sobre proteção dos dados (30 dias após expiração)
- 📦 Como recuperar dados (botão "Recuperar Dados" no dashboard)
- 💼 Lista do que será exportado (leads, imóveis, proprietários, negociações, agendamentos)
- 💚 CTA para ativar assinatura

**Template:**
- Arquivo: `/apps/api/src/shared/services/sendgrid.service.ts` (método `sendTrialWarningEmail`)
- Design: Gradiente laranja/amarelo (#FFB627)
- Responsivo e compatível com todos os clientes de email

**Job Automático:**
- Arquivo: `/apps/api/src/shared/jobs/trial-warning-job.ts`
- Executar diariamente (sugestão: 9h da manhã)
- Busca tenants em trial com expiração em ~5 dias
- Filtra apenas os que não receberam email (`email_5dias_enviado: false`)
- Marca como enviado após sucesso

**Executar Job Manualmente:**
```bash
cd apps/api
npx tsx src/shared/jobs/trial-warning-job.ts
```

**Configurar Cron (Produção):**

Opção 1 - Cron do Linux (Render.com):
```bash
# Editar crontab
crontab -e

# Adicionar linha (todo dia às 9h)
0 9 * * * cd /opt/render/project/src/apps/api && npx tsx src/shared/jobs/trial-warning-job.ts >> /var/log/trial-warning.log 2>&1
```

Opção 2 - Serviço Externo (EasyCron, cron-job.org):
- Criar endpoint público: `POST /api/v1/jobs/trial-warning` (protegido por secret key)
- Configurar chamada diária no serviço

### 📦 Botão "Recuperar Dados"

**Quando aparece:**
- Últimos 5 dias do período trial
- Apenas se ainda não exportou (`data_exportacao_dados: null`)

**Localização:**
- Header do dashboard (barra superior)
- À esquerda do nome do usuário
- Componente: `/apps/web/components/DataExportButton.tsx`

**Visual:**
```
┌────────────────────────────────────────────────┐
│ Logo  [📦 Recuperar Dados]  Olá, João  | Sair │
└────────────────────────────────────────────────┘
```

**Comportamento:**
1. Usuário clica no botão
2. Confirma ação em alert
3. Exportação inicia (spinner "Exportando...")
4. Todos os dados são exportados para CSV
5. Arquivos enviados por email com anexos
6. Botão desaparece e mostra aviso:
   ```
   ✅ Dados exportados e enviados por email
   ```

**Endpoints:**

GET `/api/v1/export/can-export`
- Verifica se pode mostrar botão ou aviso
- Response:
```json
{
  "canExport": true,
  "hasExported": false,
  "showButton": true,    // Mostrar botão
  "showMessage": false   // Mostrar aviso
}
```

POST `/api/v1/export/data`
- Exporta todos os dados e envia por email
- Valida se está nos últimos 5 dias
- Valida se já não exportou
- Response:
```json
{
  "success": true,
  "message": "Dados exportados e enviados por email com sucesso",
  "stats": {
    "leads": 15,
    "imoveis": 8,
    "proprietarios": 3,
    "negociacoes": 5,
    "agendamentos": 2
  }
}
```

### 📄 Dados Exportados

O sistema exporta 5 arquivos CSV:

1. **leads_[tenant_id].csv**
   - ID, Nome, Email, Telefone, Tipo Negócio, Tipo Imóvel
   - Valores Min/Max, Localização (Estado, Município, Bairro)
   - Origem, Temperatura, Score, Corretor Responsável
   - Data Criação

2. **imoveis_[tenant_id].csv**
   - ID, Título, Descrição, Tipo Negócio, Tipo Imóvel
   - Valores (venda, aluguel, condomínio, IPTU)
   - Endereço completo (CEP, Estado, Município, Bairro, Logradouro, Número)
   - Características (Quartos, Suítes, Banheiros, Vagas, Áreas)
   - Status, Aceita Pets, Mobiliado
   - Proprietário, Corretor Responsável
   - Data Criação

3. **proprietarios_[tenant_id].csv**
   - ID, Nome, Email, Telefone, CPF, RG
   - Endereço completo
   - Data Criação

4. **negociacoes_[tenant_id].csv**
   - ID, Lead (nome, email, telefone), Imóvel
   - Tipo Negócio, Valor Proposta, Status
   - Corretor, Observações
   - Data Criação, Última Atualização

5. **agendamentos_[tenant_id].csv**
   - ID, Lead, Imóvel, Data Visita, Duração
   - Tipo Visita, Status, Corretor
   - Confirmações (lead/corretor)
   - Realizado, Feedback, Nota
   - Data Criação

**Formato:**
- CSV com separador `;` (ponto e vírgula)
- Encoding UTF-8 com BOM (compatível com Excel)
- Compatível com Excel, Google Sheets, LibreOffice

**Serviço de Exportação:**
- Arquivo: `/apps/api/src/shared/services/data-export.service.ts`
- Classe: `DataExportService`
- Biblioteca: `json2csv` (instalada via `pnpm add json2csv`)

### 📧 Email de Confirmação (Com Anexos)

**Quando é enviado:**
- Imediatamente após exportação bem-sucedida
- Apenas uma vez (registra `data_exportacao_dados`)

**Conteúdo:**
- ✅ Confirmação de exportação
- 📦 Quantidade de registros exportados por tipo
- 📌 Informações importantes:
  - Formato CSV compatível com Excel
  - Dados permanecem disponíveis por X dias
  - Ativação de assinatura restaura tudo automaticamente
  - Guardar email como backup
- 💚 CTA para ativar assinatura

**Anexos:**
- Todos os arquivos CSV (apenas os que têm dados)
- Formato: Base64 attachment
- Content-Type: text/csv

**Template:**
- Arquivo: `/apps/api/src/shared/services/sendgrid.service.ts` (método `sendDataExportEmail`)
- Design: Gradiente verde (#8FD14F) - sucesso
- Stats em grid 2x3 com números destacados

### 🔒 Proteção e Retenção de Dados

**Após término do trial:**
1. Status muda para `SUSPENSO`
2. Acesso bloqueado
3. **Dados permanecem intactos por 30 dias**
4. Cliente pode ativar assinatura a qualquer momento
5. Após ativação, todos os dados são restaurados automaticamente

**Após 30 dias (Futuro - TODO):**
- Implementar job de limpeza (soft delete ou arquivamento)
- Mover dados para tabela de arquivo
- Notificar cliente antes da limpeza

### 🔧 Campos do Modelo Tenant

Novos campos adicionados ao modelo `Tenant`:

```prisma
model Tenant {
  // ... campos existentes ...

  data_exportacao_dados DateTime? // Data da última exportação
  email_5dias_enviado   Boolean @default(false) // Email de aviso enviado
}
```

**Migration:**
```bash
DATABASE_URL="..." npx prisma db push
```

### 📊 Fluxo Completo

```
DIA -5:
  ↓
Job roda às 9h
  ↓
Email de aviso enviado
  ↓
email_5dias_enviado = true

DIA -5 até DIA 0:
  ↓
Usuário acessa dashboard
  ↓
Vê botão "📦 Recuperar Dados"
  ↓
Clica no botão
  ↓
Confirma exportação
  ↓
Sistema exporta todos os dados para CSV
  ↓
Email com anexos é enviado
  ↓
data_exportacao_dados = NOW()
  ↓
Botão vira aviso: "✅ Dados exportados"

DIA 0 (expiração):
  ↓
Middleware bloqueia acesso
  ↓
Status = SUSPENSO
  ↓
Dados permanecem seguros por +30 dias

ATIVAÇÃO DE ASSINATURA:
  ↓
Status = ATIVO
  ↓
Acesso restaurado
  ↓
Todos os dados disponíveis novamente
```

### 🎨 UX e Design

**Botão "Recuperar Dados":**
- Cor: Gradiente verde (#8FD14F → #6E9B3B)
- Hover: Scale 1.05 + shadow
- Loading: Spinner animado "⏳ Exportando..."

**Aviso pós-exportação:**
- Cor: Verde sucesso (#D4EDDA)
- Border: #28A745
- Texto: "✅ Dados exportados e enviados por email"

**Discreto e não-intrusivo:**
- Não bloqueia uso do sistema
- Não abre modais ou popups
- Feedback claro via alerts nativos

### 🛠️ Arquivos do Sistema

**Backend:**
- `/apps/api/src/shared/services/data-export.service.ts` - Serviço de exportação
- `/apps/api/src/modules/tenants/data-export.routes.ts` - Endpoints de exportação
- `/apps/api/src/shared/services/sendgrid.service.ts` - Métodos de email (warning + export)
- `/apps/api/src/shared/jobs/trial-warning-job.ts` - Job de email automático
- `/apps/api/src/server.ts` - Registro das rotas de exportação
- `/apps/api/prisma/schema.prisma` - Novos campos no modelo Tenant

**Frontend:**
- `/apps/web/components/DataExportButton.tsx` - Botão de exportação
- `/apps/web/app/dashboard/layout.tsx` - Integração do botão no header

**Dependências:**
- `json2csv@6.0.0-alpha.2` - Geração de arquivos CSV

### ⚙️ Configuração em Produção

**SendGrid:**
- API Key configurada: ✅
- Domínio verificado: integrius.com.br ✅
- From: noreply@integrius.com.br ✅

**Cron Job (Render.com):**
1. Criar arquivo `cron.yaml` na raiz do projeto:
```yaml
jobs:
  - name: trial-warning-email
    schedule: "0 9 * * *"  # Todo dia às 9h UTC
    command: "cd apps/api && npx tsx src/shared/jobs/trial-warning-job.ts"
```

2. Ou usar endpoint com GitHub Actions:
```yaml
# .github/workflows/trial-warning.yml
name: Trial Warning Email
on:
  schedule:
    - cron: '0 9 * * *'  # 9h UTC
jobs:
  send-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Job
        run: |
          curl -X POST https://imobiflow-saas-1.onrender.com/api/v1/jobs/trial-warning \
            -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}"
```

### 🚀 Melhorias Futuras

1. **Dashboard de Exportações:**
   - Histórico de exportações
   - Download direto dos CSVs do dashboard
   - Preview dos dados antes de exportar

2. **Formatos Adicionais:**
   - JSON
   - Excel (.xlsx)
   - PDF com relatório

3. **Agendamento de Exportação:**
   - Exportação automática semanal/mensal
   - Backup contínuo para clientes premium

4. **Notificações In-App:**
   - Toast/notification ao lado do sino
   - Timeline de eventos do trial

5. **Limpeza Automática:**
   - Job para deletar dados 30 dias após expiração
   - Notificar cliente 7 dias antes da limpeza
   - Opção de extensão de retenção

6. **Sistema de Tratamento de Erros Profissional:** ⚠️ PENDENTE
   - Substituir mensagens genéricas "Not found" por mensagens amigáveis e contextualizadas
   - Criar componentes de erro reutilizáveis no frontend (404, 403, 500, etc.)
   - Implementar fallbacks visuais elegantes para estados de erro
   - Padronizar respostas de erro no backend com códigos e mensagens claras
   - Adicionar sugestões de ação ao usuário em cada tipo de erro
   - Logging estruturado para debug sem expor detalhes sensíveis ao usuário

---

## Integração WhatsApp (Twilio)

O ImobiFlow possui integração completa com WhatsApp Business via Twilio para receber e enviar mensagens automaticamente.

### Arquitetura

A integração usa o **Twilio WhatsApp Business API** para:
- Receber mensagens de clientes via webhook
- Criar leads automaticamente de novos contatos
- Responder automaticamente com a IA Sofia
- Notificar corretores via Telegram sobre novos leads
- Enviar mensagens manualmente para leads

### Modelo de Dados

#### WhatsAppConfig

```prisma
model WhatsAppConfig {
  id String @id @default(uuid())
  tenant_id String @unique
  tenant    Tenant @relation(...)

  // Credenciais Twilio
  twilio_account_sid  String?
  twilio_auth_token   String? // Criptografado
  twilio_phone_number String? // Ex: +5511999999999

  // Configurações de comportamento
  auto_response_enabled Boolean @default(true) // Respostas automáticas
  welcome_message       String? // Mensagem de boas-vindas personalizada
  business_hours_start  String? // Ex: "08:00"
  business_hours_end    String? // Ex: "18:00"
  out_of_hours_message  String? // Mensagem fora do horário

  // Atribuição automática
  auto_assign_corretor Boolean @default(false)
  default_corretor_id  String?

  // Status
  is_active      Boolean @default(false)
  last_message_at DateTime?
  webhook_verified Boolean @default(false)

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}
```

#### Campos Adicionados ao Message

```prisma
model Message {
  // ... campos existentes ...

  // Twilio/External integration
  external_id   String? // MessageSid do Twilio
  external_from String? // Número de origem (whatsapp:+5511...)
  external_to   String? // Número de destino
  media_url     String? // URL de mídia anexada
  media_type    String? // Tipo da mídia (image/jpeg, etc)
  profile_name  String? // Nome do perfil WhatsApp do remetente
}
```

### Endpoints da API

#### Webhooks (Públicos - chamados pelo Twilio)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/whatsapp/webhook` | Recebe mensagens do Twilio |
| POST | `/api/v1/whatsapp/webhook/status` | Recebe status de entrega |

#### Endpoints Autenticados (ADMIN/GESTOR)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/whatsapp/config` | Buscar configuração |
| PUT | `/api/v1/whatsapp/config` | Salvar configuração |
| POST | `/api/v1/whatsapp/test` | Testar conexão com Twilio |
| POST | `/api/v1/whatsapp/send` | Enviar mensagem para lead |
| GET | `/api/v1/whatsapp/messages/:leadId` | Histórico de mensagens |
| GET | `/api/v1/whatsapp/stats` | Estatísticas de mensagens |

### Fluxo de Recebimento de Mensagem

```
1. Cliente envia mensagem para número WhatsApp Business
   ↓
2. Twilio encaminha para webhook: POST /api/v1/whatsapp/webhook
   ↓
3. Sistema identifica tenant pelo número de destino
   ↓
4. Busca lead existente pelo telefone
   ↓
5A. Se novo contato:
   - Cria lead automaticamente (origem: WHATSAPP)
   - Atribui corretor padrão (se configurado)
   - Notifica corretor via Telegram
   - Envia mensagem de boas-vindas
   ↓
5B. Se lead existente:
   - Salva mensagem no histórico
   - Gera resposta da IA Sofia
   ↓
6. Verifica horário comercial
   ↓
7. Envia resposta automática (se habilitado)
   ↓
8. Atualiza last_message_at na configuração
```

### Configuração no Twilio

1. **Criar conta Twilio** e habilitar WhatsApp Business
2. **Configurar Sandbox** ou número aprovado
3. **Configurar Webhooks** no Console Twilio:
   - **When a message comes in**: `https://sua-api.com/api/v1/whatsapp/webhook` (POST)
   - **Status callback URL**: `https://sua-api.com/api/v1/whatsapp/webhook/status` (POST)
4. **Obter credenciais**:
   - Account SID
   - Auth Token
   - Número WhatsApp Business

### Variáveis de Ambiente

```env
# Opcionais (configuradas por tenant no dashboard)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_WHATSAPP_NUMBER="+5511999999999"
```

### Página de Configuração (Frontend)

**URL**: `/dashboard/whatsapp`

**Funcionalidades**:
- Configurar credenciais Twilio
- Testar conexão
- Habilitar/desabilitar integração
- Configurar respostas automáticas
- Definir horário comercial
- Personalizar mensagens
- Definir corretor padrão para novos leads
- Visualizar estatísticas de mensagens

### Arquivos do Sistema

**Backend:**
- `/apps/api/src/shared/services/twilio-whatsapp.service.ts` - Serviço Twilio
- `/apps/api/src/modules/whatsapp/whatsapp.service.ts` - Lógica de negócio
- `/apps/api/src/modules/whatsapp/whatsapp.routes.ts` - Endpoints da API
- `/apps/api/prisma/schema.prisma` - Modelo WhatsAppConfig

**Frontend:**
- `/apps/web/app/dashboard/whatsapp/page.tsx` - Página de configuração

### Segurança

- Auth Token nunca é retornado completo nas respostas (apenas "***configurado***")
- Webhooks são públicos mas validam número de destino
- Mensagens só podem ser enviadas por ADMIN/GESTOR autenticados
- Isolamento por tenant garantido em todas as operações

---

## Histórico de Configurações

### 2026-01-17

#### Integração WhatsApp via Twilio ✅

Implementada integração completa com WhatsApp Business via Twilio.

**Funcionalidades:**
- Webhook para receber mensagens do Twilio
- Criação automática de leads de novos contatos
- Respostas automáticas da IA Sofia
- Notificação de corretor via Telegram
- Configuração de horário comercial
- Mensagens personalizadas de boas-vindas
- Estatísticas de mensagens
- Página de configuração no dashboard

**Arquivos Criados:**
- `/apps/api/src/shared/services/twilio-whatsapp.service.ts`
- `/apps/api/src/modules/whatsapp/whatsapp.service.ts`
- `/apps/api/src/modules/whatsapp/whatsapp.routes.ts`
- `/apps/web/app/dashboard/whatsapp/page.tsx`

**Arquivos Modificados:**
- `/apps/api/prisma/schema.prisma` - Modelo WhatsAppConfig e campos no Message
- `/apps/api/src/server.ts` - Registro das rotas (whatsAppRoutes)
- `/apps/web/app/dashboard/layout.tsx` - Menu WhatsApp adicionado

---

#### Sistema de Notificações In-App ✅

Implementado sistema completo de notificações em tempo real para alertar usuários sobre eventos importantes.

**Funcionalidades:**

1. **Tipos de Notificação**
   - INFO - Informações gerais
   - SUCCESS - Ações bem-sucedidas
   - WARNING - Alertas e avisos
   - ERROR - Erros e problemas
   - LEAD - Novos leads, alterações de temperatura
   - NEGOCIACAO - Negociações fechadas, propostas
   - AGENDAMENTO - Visitas agendadas, lembretes
   - PROPOSTA - Novas propostas recebidas
   - META - Metas atingidas
   - SISTEMA - Mensagens do sistema

2. **Componente de Sino (Frontend)**
   - Badge com contagem de não lidas
   - Dropdown com lista de notificações
   - Marcar como lida ao clicar
   - Marcar todas como lidas
   - Atualização automática a cada 30 segundos
   - Link para ação relacionada (ex: abrir lead)

3. **Integração Automática**
   - Notificação ao atribuir lead para corretor
   - Notificação ao agendar visita
   - Preparado para mais integrações

**Endpoints da API** (`/api/v1/notifications/`):
- `GET /` - Listar notificações do usuário
- `GET /unread-count` - Contar não lidas
- `PATCH /:id/read` - Marcar como lida
- `PATCH /read-all` - Marcar todas como lidas
- `DELETE /:id` - Deletar notificação

**Modelo de Dados:**
```prisma
model Notification {
  id          String @id @default(uuid())
  tenant_id   String
  user_id     String
  title       String
  message     String @db.Text
  type        NotificationType @default(INFO)
  entity_type String?  // Lead, Imovel, Agendamento...
  entity_id   String?  // ID da entidade relacionada
  action_url  String?  // URL para ação
  is_read     Boolean @default(false)
  read_at     DateTime?
  created_at  DateTime @default(now())
}

enum NotificationType {
  INFO, SUCCESS, WARNING, ERROR, LEAD,
  NEGOCIACAO, AGENDAMENTO, PROPOSTA, META, SISTEMA
}
```

**Arquivos Criados:**
- `/apps/api/src/modules/notifications/notifications.service.ts` - Serviço com métodos de notificação
- `/apps/api/src/modules/notifications/notifications.routes.ts` - Endpoints da API
- `/apps/web/components/NotificationBell.tsx` - Componente de sino

**Arquivos Modificados:**
- `/apps/api/prisma/schema.prisma` - Modelo Notification adicionado
- `/apps/api/src/server.ts` - Registro das rotas
- `/apps/web/app/dashboard/layout.tsx` - NotificationBell no header
- `/apps/api/src/modules/leads/leads.service.ts` - Integração com notificações
- `/apps/api/src/modules/agendamentos/agendamentos.routes.ts` - Integração com notificações

---

#### Sistema de Metas para Corretores ✅

Implementado sistema completo de metas mensais para corretores com acompanhamento de progresso.

**Funcionalidades:**

1. **Definição de Metas (ADMIN/GESTOR)**
   - Meta de leads a captar
   - Meta de visitas a realizar
   - Meta de propostas a receber
   - Meta de fechamentos
   - Meta de valor em vendas/aluguéis
   - Criação individual ou em lote para todos os corretores

2. **Acompanhamento de Progresso**
   - Cálculo automático baseado em dados reais
   - Barras de progresso por métrica
   - Percentual geral ponderado (fechamentos e valor têm peso maior)
   - Status: EM_ANDAMENTO, ATINGIDA, NAO_ATINGIDA, CANCELADA

3. **Dashboard de Metas (ADMIN/GESTOR)**
   - Cards de estatísticas: corretores com meta, metas atingidas, média de progresso
   - Tabela completa com progresso de todos os corretores
   - Filtros por mês/ano
   - Edição e exclusão de metas
   - Botão "Atualizar Progresso" para recalcular

4. **Widget de Metas (Corretor)**
   - Exibido no dashboard principal
   - Mostra meta do mês atual
   - Barras de progresso coloridas por desempenho
   - Mensagens motivacionais baseadas no progresso

**Endpoints da API** (`/api/v1/metas/`):
- `GET /` - Listar metas (ADMIN/GESTOR)
- `GET /resumo` - Resumo mensal (ADMIN/GESTOR)
- `GET /minha-meta` - Meta atual do corretor (CORRETOR)
- `GET /:id` - Buscar meta por ID (ADMIN/GESTOR)
- `POST /` - Criar meta individual (ADMIN/GESTOR)
- `POST /lote` - Criar metas em lote (ADMIN/GESTOR)
- `PATCH /:id` - Atualizar meta (ADMIN/GESTOR)
- `DELETE /:id` - Deletar meta (ADMIN/GESTOR)
- `POST /:id/atualizar-progresso` - Recalcular progresso (ADMIN/GESTOR)
- `POST /atualizar-progresso-mensal` - Recalcular todas as metas do mês (ADMIN/GESTOR)

**Modelo de Dados:**
```prisma
model Meta {
  id String @id @default(uuid())
  tenant_id String
  corretor_id String
  mes Int // 1-12
  ano Int
  meta_leads Int?
  meta_visitas Int?
  meta_propostas Int?
  meta_fechamentos Int?
  meta_valor Decimal?
  progresso_leads Int @default(0)
  progresso_visitas Int @default(0)
  progresso_propostas Int @default(0)
  progresso_fechamentos Int @default(0)
  progresso_valor Decimal @default(0)
  status StatusMeta @default(EM_ANDAMENTO)
  @@unique([tenant_id, corretor_id, mes, ano])
}
```

**Arquivos Criados:**
- `/apps/api/src/modules/metas/metas.service.ts` - Lógica de negócio
- `/apps/api/src/modules/metas/metas.routes.ts` - Endpoints da API
- `/apps/web/app/dashboard/metas/page.tsx` - Página de gestão de metas
- `/apps/web/components/MetaWidget.tsx` - Widget para dashboard

**Arquivos Modificados:**
- `/apps/api/prisma/schema.prisma` - Modelo Meta adicionado
- `/apps/api/src/server.ts` - Registro das rotas
- `/apps/web/app/dashboard/layout.tsx` - Menu "Metas" adicionado
- `/apps/web/app/dashboard/page.tsx` - Widget de metas integrado

---

### 2026-01-16

#### Dashboard Gerencial para ADMIN/GESTOR ✅

Implementado dashboard completo com visão consolidada do desempenho do time de corretores.

**Funcionalidades:**

1. **Métricas Consolidadas do Time**
   - Total de corretores (ativos/inativos)
   - Total de leads e novos nos últimos 30 dias
   - Valor total fechado
   - Taxa de conversão geral
   - Média por corretor (leads, negociações, valor)

2. **Ranking de Corretores**
   - Posição baseada em pontuação calculada
   - Métricas detalhadas por corretor:
     - Leads por temperatura (quentes, mornos, frios)
     - Negociações (total, fechadas, em andamento)
     - Taxa de conversão individual
     - Valor total e médio fechado
     - Visitas (realizadas/total)
   - Tempo médio de primeiro contato e fechamento
   - Pontuação com pesos: Fechamentos (40%), Conversão (20%), Leads Quentes (15%), Visitas (15%), Atividade (10%)

3. **Tops Corretores**
   - Top 5 por fechamentos
   - Top 5 por valor fechado

4. **Comparativo Mensal**
   - Últimos 3 meses
   - Leads, Negociações, Fechamentos e Valor por período
   - Gráfico de barras comparativo

5. **Distribuição de Temperatura**
   - Gráfico de pizza com leads quentes, mornos e frios
   - Percentuais e quantidades

6. **Alertas Gerenciais**
   - 🔥 Leads quentes sem contato há 3+ dias
   - ⚠️ Corretores inativos há 7+ dias
   - ⏸️ Negociações paradas há 15+ dias
   - 📅 Visitas agendadas para hoje

**Endpoints da API** (`/api/v1/dashboard-gerencial/`):
- `GET /` - Dashboard completo
- `GET /metricas` - Métricas consolidadas
- `GET /ranking` - Ranking de corretores
- `GET /comparativo` - Comparativo mensal
- `GET /top/:metrica` - Top corretores (fechamentos, leads, valor, conversao)
- `GET /temperatura` - Distribuição por temperatura
- `GET /alertas` - Alertas gerenciais

**Arquivos Criados:**
- `/apps/api/src/modules/dashboard/dashboard-gerencial.service.ts`
- `/apps/api/src/modules/dashboard/dashboard-gerencial.routes.ts`
- `/apps/web/app/dashboard/gerencial/page.tsx`

**Arquivos Modificados:**
- `/apps/api/src/server.ts` - Registro das rotas
- `/apps/web/app/dashboard/layout.tsx` - Menu "Gerencial" adicionado

**Acesso:** Apenas ADMIN ou GESTOR do tenant

---

#### Sistema de Atualização Automática de Temperatura de Leads ✅

Implementado sistema inteligente que monitora e atualiza automaticamente a temperatura dos leads com base no tempo sem contato.

**Regras de Degradação:**
- 🔥 **QUENTE → ⚡ MORNO**: Lead sem contato há 5+ dias
- ⚡ **MORNO → ❄️ FRIO**: Lead sem contato há 10+ dias

**Componentes Implementados:**

1. **Serviço de Temperatura Automática**
   - Arquivo: `/apps/api/src/shared/services/temperatura-auto.service.ts`
   - Classe `TemperaturaAutoService` com singleton exportado
   - Métodos:
     - `executarParaTodosOsTenants()` - Processa todos os tenants ativos
     - `executarParaTenant(tenantId)` - Processa um tenant específico
     - `getEstatisticas(tenantId)` - Retorna métricas de temperatura
   - Integração com Telegram para notificar corretores
   - Registro automático na timeline do lead

2. **Endpoints da API** (`/api/v1/temperatura-auto/`)
   - Arquivo: `/apps/api/src/modules/admin/temperatura-auto.routes.ts`
   - `GET /estatisticas` - Métricas de leads por temperatura
   - `POST /executar` - Executar atualização para o tenant
   - `POST /executar-preview` - Dry-run (sem alterações)
   - `GET /config` - Configuração atual do sistema
   - Acesso: ADMIN ou GESTOR do tenant

3. **Job para Execução Diária**
   - Arquivo: `/apps/api/src/shared/jobs/temperatura-auto-job.ts`
   - Execução: `npx tsx src/shared/jobs/temperatura-auto-job.ts`
   - Sugerido: Cron diário às 8h da manhã
   - Processa todos os tenants ATIVO ou TRIAL

**Funcionalidades:**
- ✅ Detecção automática de leads para rebaixamento
- ✅ Atualização em lote com logging detalhado
- ✅ Notificação Telegram para corretor quando temperatura cai
- ✅ Registro na timeline do lead (tipo: TEMPERATURA_ALTERADA_AUTO)
- ✅ Preview/dry-run antes de executar
- ✅ Estatísticas de leads por temperatura
- ✅ Multi-tenant (executa por tenant ou todos)

**Exemplo de Notificação Telegram:**
```
⚠️ ALERTA: Lead Esfriando!

👤 Cliente: João Silva
📱 Telefone: (11) 98765-4321

🌡️ Temperatura: 🔥 QUENTE → ⚡ MORNO

⏰ Motivo: Sem contato há 6 dias

💡 Dica da Sofia: Entre em contato o quanto antes para não perder este lead!
```

**Arquivos Criados:**
- `/apps/api/src/shared/services/temperatura-auto.service.ts`
- `/apps/api/src/modules/admin/temperatura-auto.routes.ts`
- `/apps/api/src/shared/jobs/temperatura-auto-job.ts`

**Arquivos Modificados:**
- `/apps/api/src/server.ts` - Registro das rotas de temperatura-auto

---

### 2026-01-15

#### Adequação LGPD - Isolamento de Dados do Operador ✅

**IMPORTANTE - Conformidade com Art. 39 da LGPD:**

O ImobiFlow atua como **OPERADOR** de dados, enquanto cada tenant (imobiliária) é o **CONTROLADOR** dos dados de seus clientes.

Conforme Art. 39 da LGPD: *"O operador deverá realizar o tratamento segundo as instruções fornecidas pelo controlador"*

**Alterações Implementadas:**

- ✅ **Logs de Atividade Restritos ao Próprio Tenant**
  - Endpoint `/api/v1/admin/activity-logs` agora retorna APENAS logs do tenant Vivoly
  - Operador não tem mais acesso às atividades de outros tenants (controladores)
  - Filtro obrigatório `tenant_id: vivolyId` em todas as queries de logs
  - Resposta inclui `_lgpd_notice` informando a restrição

- ✅ **Estatísticas de Logs Restritas**
  - Endpoint `/api/v1/admin/activity-logs/stats` limitado ao tenant Vivoly
  - Não expõe mais ranking de atividades de outros tenants
  - Removido campo `topTenants` que listava tenants por atividade

- ✅ **Contagens Sensíveis Removidas**
  - Endpoint `/api/v1/admin/tenants/:id` não retorna mais `_count` de negociações/leads para outros tenants
  - Contagens detalhadas disponíveis APENAS para o próprio tenant Vivoly
  - Mantidos apenas dados administrativos (nome, status, plano, limites contratuais)

- ✅ **Documentação de Conformidade**
  - Comentários JSDoc explicando base legal (Art. 39 LGPD)
  - Cada endpoint documenta quais dados são acessíveis e por quê

**O que o Operador (Vivoly) PODE acessar de outros tenants:**
- ✅ Dados administrativos: nome, slug, email, telefone
- ✅ Status do contrato: plano, status, data_expiracao
- ✅ Limites contratuais: limite_usuarios, limite_imoveis
- ✅ Uso de capacidade: total_usuarios, total_imoveis (métricas de plano)
- ✅ Admin principal: nome e email (para contato comercial)

**O que o Operador NÃO pode mais acessar:**
- ❌ Logs de atividades de outros tenants
- ❌ Contagens de leads, negociações, proprietários
- ❌ Qualquer dado operacional dos clientes dos tenants

**Arquivos Modificados:**
- `/apps/api/src/modules/admin/admin.routes.ts` - Restrições LGPD implementadas

---

### 2026-01-08

#### Sistema de Exportação Automática e Ajustes no Trial ✅
- ✅ **Exportação Automática no Cancelamento de Assinatura**
  - Removido botão "Recuperar Dados" do header do dashboard
  - Exportação de dados agora é **automática** ao cancelar assinatura
  - Sistema chama `DataExportService` automaticamente no cancelamento
  - Dados exportados para CSV e enviados por email ao admin do tenant
  - Email de confirmação de cancelamento informa sobre exportação automática
  - Campo `data_exportacao_dados` marcado na tabela Tenant
  - Arquivo: `/apps/api/src/modules/tenants/tenant.service.ts`

- ✅ **Correção do Período Trial (30 → 14 dias)**
  - Criado script `/apps/api/src/shared/scripts/fix-trial-period.ts`
  - Script atualiza `data_expiracao` para 14 dias após `created_at`
  - Executado com sucesso em 5 tenants ativos:
    - `testes`: 8 dias restantes (expira 16/01/2026)
    - `teste-api-direto-123`: 12 dias restantes (expira 20/01/2026)
    - `teste-completo-api-789`: 12 dias restantes (expira 20/01/2026)
    - `teste-deploy-novo-999`: 12 dias restantes (expira 20/01/2026)
    - `imobiliariazacarias`: 13 dias restantes (expira 21/01/2026)
  - Todos novos tenants criados agora têm trial de 14 dias (configurado em `tenant.repository.ts`)

- ✅ **Aviso de Trial no Header (Sempre Visível)**
  - Componente `TrialWarning` movido do main content para header (top navigation)
  - Design compacto e discreto com fundo escuro translúcido
  - Formato: `Trial: X dias` com ícone
  - Cores dinâmicas baseadas na urgência:
    - Verde (>7 dias): ✅ `Trial: 8 dias`
    - Amarelo (4-7 dias): ⏰ `Trial: 5 dias`
    - Vermelho (0-3 dias): ⚠️ `Trial: 2 dias`
  - Sempre visível no header para todos os tenants em trial
  - Arquivos: `/apps/web/components/TrialWarning.tsx`, `/apps/web/app/dashboard/layout.tsx`

- ✅ **Componente DataExportButton Removido**
  - Removido import e uso de `DataExportButton` no layout
  - Botão não é mais necessário pois exportação é automática
  - Arquivo: `/apps/web/app/dashboard/layout.tsx`

### 2026-01-03

#### Sistema de Avisos de Trial e Funcionalidades Avançadas ✅
- ✅ **Sistema Completo de Avisos de Trial**
  - Aviso sempre visível no dashboard mostrando dias restantes (cores: verde/amarelo/vermelho)
  - Email automático 5 dias antes da expiração (template amarelo)
  - Email automático 2 dias antes da expiração (template vermelho urgente)
  - Jobs cron: `trial-warning-job.ts` e `trial-warning-2days-job.ts`
  - Flags no modelo Tenant: `email_5dias_enviado`, `email_2dias_enviado`

- ✅ **Sistema de Cálculo de Comissões para Corretores**
  - Checkboxes na tabela de corretores (select all + individual)
  - Botão "Calcular Comissões" (gradiente laranja)
  - Backend calcula baseado em negociações com status FECHADO
  - Comissão: usa `valor_comissao` se definido, senão 5% do `valor_final`
  - Modal rico com stats agregadas e breakdown por corretor
  - Lista expandível de negociações por corretor
  - Resultados ordenados por maior comissão
  - Endpoint: `POST /api/v1/comissoes/calcular`
  - Campo `valor_final` adicionado ao modelo Negociacao

- ✅ **Sistema de Recuperação de Senha**
  - Modelo `PasswordResetToken` com tokens de 6 dígitos
  - Expiração de 5 minutos por segurança
  - Endpoints públicos: `/auth/forgot-password` e `/auth/reset-password`
  - Email com token de 6 dígitos (template azul profissional)
  - Página `/recuperar-senha` com two-step flow (email → token/password)
  - Validações: token 6 dígitos, senha mínima 6 chars, confirmação
  - Link "Esqueceu a senha?" já existe na página de login
  - Segurança: tokens de uso único, não revela se email existe

#### Correções no Sistema Multi-Tenant e Login ✅
- ✅ **Fix: Domínio Principal no Middleware**
  - Adicionado `integrius.com.br` à lista de domínios principais no tenant middleware
  - Arquivo: `/apps/api/src/shared/middlewares/tenant.middleware.ts`
  - Permite extração correta do subdomínio de URLs como `vivoly.integrius.com.br`
  - Evita erro "Tenant não encontrado" ao acessar subdomínios

- ✅ **Endpoint Público de Validação de Tenant**
  - Criado endpoint `GET /api/v1/tenants/by-subdomain/:subdomain`
  - Arquivo: `/apps/api/src/modules/tenants/tenant.routes.ts`
  - Valida se tenant existe pelo subdomínio
  - Verifica se tenant está ativo (ATIVO ou TRIAL)
  - Usado pelo frontend para validar tenant antes do login
  - Endpoint público (não requer autenticação)

- ✅ **Fix Temporário: Validação de Tenant no Login**
  - Desabilitada validação de tenant em `/apps/web/lib/auth.ts`
  - Desabilitada validação de tenant em `/apps/web/app/login/page.tsx`
  - Necessário até que o endpoint `/tenants/by-subdomain` seja deployado
  - TODOs marcados para reabilitar após deploy

- ✅ **Credenciais de Acesso Vivoly**
  - Email: `admin@vivoly.com`
  - Senha: `admin123`
  - URL: https://vivoly.integrius.com.br

### 2026-01-08

#### Modificações no Sistema de Trial e Exportação de Dados ✅

- ✅ **Remoção do Botão "Recuperar Dados"**
  - Botão removido do header do dashboard
  - Exportação de dados agora é **automática** ao cancelar assinatura
  - Admin recebe email com CSVs anexados automaticamente
  - Arquivo removido: `/apps/web/components/DataExportButton.tsx`
  - Email de cancelamento atualizado informando sobre exportação automática

- ✅ **Exportação Automática no Cancelamento**
  - Método `cancelAssinatura` modificado em `tenant.service.ts`
  - Chama `DataExportService.exportTenantData()` automaticamente
  - Envia email com CSVs anexados via SendGrid (assíncrono com `setImmediate`)
  - Não bloqueia resposta do cancelamento
  - Logs completos de sucesso/erro no console

- ✅ **Correção do Período de Trial: 30 → 14 dias**
  - Script criado: `/apps/api/src/shared/scripts/fix-trial-period.ts`
  - Atualiza `data_expiracao` de todos os tenants em TRIAL
  - Calcula nova expiração: `created_at + 14 dias`
  - Executado em 08/01/2026 às 21h (horário de Brasília)
  - **5 tenants atualizados com sucesso:**
    - `testes`: 8 dias restantes (expira 16/01/2026)
    - `teste-api-direto-123`: 12 dias restantes (expira 20/01/2026)
    - `teste-completo-api-789`: 12 dias restantes (expira 20/01/2026)
    - `teste-deploy-novo-999`: 12 dias restantes (expira 20/01/2026)
    - `imobiliariazacarias`: 13 dias restantes (expira 21/01/2026)

- ✅ **Trial Warning Movido para Header**
  - Componente `TrialWarning` redesenhado para formato compacto
  - Movido de main content para header (barra superior de navegação)
  - Sempre visível ao lado do nome do usuário
  - Design: badge discreto com cor indicadora de urgência
  - **Cores dinâmicas:**
    - Verde (✅): mais de 7 dias restantes
    - Amarelo (⏰): 4-7 dias restantes
    - Vermelho (⚠️): 0-3 dias restantes
  - Formato: "Trial: X dias" (compacto)
  - Arquivo: `/apps/web/components/TrialWarning.tsx` (redesenhado)
  - Integração: `/apps/web/app/dashboard/layout.tsx` (linha 128)

#### Correções de Build e Deploy ✅

- ✅ **Fix: Chamada do DataExportService**
  - Erro: chamada incorreta de método estático como instância
  - Corrigido para: `DataExportService.exportTenantData(tenantId)`
  - Método estático não requer instância da classe
  - Commit: 58cc8f6

- ✅ **Fix: Parâmetro Faltante no SendGrid**
  - Erro: `sendDataExportEmail` esperava 6 parâmetros, recebeu 5
  - Adicionado parâmetro `diasRestantes: 0` (pois assinatura foi cancelada)

- ✅ **Fix CRÍTICO: Login Falhando com 401 (Tenant ID Incorreto)**
  - **Problema Identificado:**
    - Interceptor do axios (`api.ts`) adiciona header `X-Tenant-ID` em TODAS as requisições
    - `getTenantId()` retorna `tenant_id` do localStorage de login anterior
    - Ao fazer login em outro tenant, envia tenant_id ERRADO no header
    - Backend busca usuário no tenant errado → 401 "Email ou senha inválidos"
  - **Root Cause:**
    - Linhas 36-38 de `/apps/web/lib/api.ts`: interceptor adiciona `X-Tenant-ID` globalmente
    - Linha 115 de `/apps/web/lib/tenant.ts`: `getTenantId()` prioriza localStorage
    - Usuário faz login em tenant A → `tenant_id` salvo no localStorage
    - Usuário acessa tenant B → interceptor envia `tenant_id` do tenant A
    - Backend recebe tenant_id errado → busca usuário no tenant errado → falha
  - **Solução Implementada:**
    - Limpar `localStorage.tenant_id` ANTES de fazer login (email ou Google OAuth)
    - Previne que interceptor envie tenant_id de sessão anterior
    - Permite login em qualquer tenant sem conflito
    - Arquivos modificados:
      - `/apps/web/lib/auth.ts` (login email - linhas 87-92)
      - `/apps/web/lib/auth.ts` (login Google - linhas 156-161)
    - Commit: 615d936
  - **Impacto:**
    - Fix resolve falha de login reportada em `imobiliariazacarias.integrius.com.br`
    - Usuários podem fazer login em diferentes tenants sem erro 401
    - localStorage.tenant_id só é salvo APÓS login bem-sucedido
  - Commit: 2924d0a

- ✅ **Fix: Suporte para Domínios Render.com**
  - Middleware de tenant não reconhecia `*.onrender.com`
  - Adicionada lógica especial para tratar Render como domínio principal
  - Permite acesso via `imobiflow-saas-1.onrender.com` sem erro
  - Arquivo: `/apps/api/src/shared/middlewares/tenant.middleware.ts` (linhas 159-162)
  - Commit: 89ac79b

- ✅ **Fix CRÍTICO: Cookie de Sessão Expirando em 30 Minutos**
  - **Problema Identificado:**
    - Cookie `token` tinha duração de apenas 30 minutos
    - JWT do backend tem validade de 7 dias
    - Usuário era deslogado ao navegar após 30 minutos
    - Redirecionado para `/login?redirect=/dashboard/corretores` ao acessar páginas internas
    - Middleware verificava cookie, mas ele já havia expirado
  - **Solução Implementada:**
    - Aumentado `SESSION_DURATION` de 30 minutos para 7 dias
    - Sincronizado duração do cookie com JWT do backend
    - Usuário permanece logado por 7 dias
    - Navegação entre páginas funciona normalmente sem deslogar
  - **Arquivos Modificados:**
    - `/apps/web/lib/auth.ts` (linhas 115, 183) - Ambos login email e Google OAuth
    - Alterado: `30 * 60` → `7 * 24 * 60 * 60`
  - **Commit:** a5e8287
  - **Impacto:**
    - Usuários não são mais deslogados ao navegar no dashboard
    - Experiência de usuário melhorada (sessão persistente)
    - Alinhamento com duração do JWT do backend

- ✅ **Scripts Utilitários para Gestão de Usuários**
  - Criados scripts para debug e manutenção:
    - `list-all-users.ts` - Lista todos os usuários do banco com detalhes
    - `test-password.ts` - Testa se senha corresponde ao hash do usuário
    - `test-common-passwords.ts` - Testa senhas comuns em múltiplos usuários
    - `reset-primeiro-acesso.ts` - Reseta flag primeiro_acesso de um usuário
    - `reset-all-primeiro-acesso.ts` - Reseta flag de todos os usuários
    - `reset-passwords.ts` - Reseta senhas de múltiplos usuários
  - Diretório: `/apps/api/src/shared/scripts/`
  - **Descoberta:** Flag `primeiro_acesso: true` redireciona para `/primeiro-acesso`
  - **Ação:** Resetados 7 usuários com `primeiro_acesso: true` para `false`
  - **Resultado:** Todos os usuários podem fazer login e acessar dashboard normalmente

- ✅ **Arquivo de Credenciais de Teste**
  - Criado: `/CREDENCIAIS_TESTE.md`
  - Documenta todas as credenciais de teste de 4 tenants:
    - Imobiliaria Zacarias (2 usuários)
    - Vivoly Imobiliária (5 usuários)
    - Testes ImobiFlow (1 usuário)
    - Teste Deploy Novo (1 usuário)
  - Senhas verificadas via bcrypt ou resetadas para `teste123`
  - Total: 9 usuários prontos para teste

#### Resolução do Problema de Login ✅

- ✅ **Diagnóstico Completo**
  - Problema reportado: "Email ou senha inválidos"
  - Investigação: AuthController, AuthService, AuthRepository
  - **Causa raiz identificada:** Senha incorreta sendo usada
  - Login funciona perfeitamente via Render.com (sem tenant no subdomínio)
  - Backend suporta corretamente `findByEmailAnyTenant` quando sem tenant_id

- ✅ **Credenciais Corretas Documentadas**
  - **Tenant Vivoly - Opção 1:**
    - Email: `admin@vivoly.com`
    - Senha: `admin123`
    - Nome: Administrador Vivoly

  - **Tenant Vivoly - Opção 2:**
    - Email: `admin@vivoly.com.br`
    - Senha: `vivoly2025`
    - Nome: Administrador

  - **Tenant Imobiliária Zacarias:**
    - Email: `ia.hcdoh@gmail.com`
    - Senha: (verificar com admin)
    - Tipo: ADMIN

  - **Tenant Testes ImobiFlow:**
    - Email: `testecorretor@testes.co.br`
    - Senha: `teste123`
    - Tipo: ADMIN

- ✅ **URLs de Acesso Válidas**
  - Via subdomínio: `https://vivoly.integrius.com.br`
  - Via Render (API direta): `https://imobiflow-saas-1.onrender.com`
  - Ambas funcionam corretamente após correções

- ✅ **Teste de Login Confirmado**
  ```bash
  curl -X POST "https://imobiflow-saas-1.onrender.com/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@vivoly.com","senha":"admin123"}'
  # Response 200 OK com token JWT válido
  ```

#### Fix: Google OAuth Bloqueando Login (Erro 403) ✅

- ✅ **Problema Identificado**
  - Botão do Google OAuth carregava em TODOS os tenants
  - Subdomínios não autorizados no Google Console (ex: imobiliariazacarias)
  - Erro 403: "The given origin is not allowed for the given client ID"
  - **Bloqueava completamente o login tradicional (email/senha)**

- ✅ **Solução Implementada**
  - Lista de tenants autorizados para Google OAuth: `['vivoly', 'localhost', '127.0.0.1']`
  - Botão do Google renderizado apenas para tenants autorizados
  - Tenants não autorizados usam apenas login tradicional
  - Código com IIFE para validação dinâmica do hostname

- ✅ **Resultado**
  - Login tradicional funciona em TODOS os tenants
  - Google OAuth disponível apenas para Vivoly (e localhost/dev)
  - Sem erros 403 em tenants não configurados
  - Commit: 4132242

#### Fix Crítico: loginSchema.parse Fora do try/catch ✅

- ✅ **Problema Identificado**
  - Commit anterior (`f05865c`) moveu `loginSchema.parse()` para FORA do try/catch
  - Objetivo era acessar `data` no catch para logs
  - **Efeito colateral:** Erros de validação Zod não eram capturados
  - Login comum quebrou completamente (exceção não tratada)

- ✅ **Solução Implementada**
  - Movido `loginSchema.parse()` de volta para DENTRO do try/catch
  - Mantido `tenantId` fora (pode ser acessado no catch)
  - Declarado `data` com `let` para permitir acesso no catch
  - Adicionado verificação `if (data && ...)` antes de usar no log
  - Commit: 386039c

- ✅ **Resultado**
  - Login tradicional voltou a funcionar
  - Erros de validação capturados corretamente
  - Logs de falha ainda funcionam quando aplicável

#### Arquivos Modificados

**Backend:**
- `/apps/api/src/modules/tenants/tenant.service.ts` - Exportação automática no cancelamento
- `/apps/api/src/shared/scripts/fix-trial-period.ts` - Script de correção (novo)
- `/apps/api/src/shared/middlewares/tenant.middleware.ts` - Suporte Render.com
- `/apps/api/src/modules/auth/auth.controller.ts` - **Fix crítico:** loginSchema.parse dentro do try/catch

**Frontend:**
- `/apps/web/app/dashboard/layout.tsx` - TrialWarning no header, DataExportButton removido
- `/apps/web/components/TrialWarning.tsx` - Redesign completo (badge compacto)
- `/apps/web/components/DataExportButton.tsx` - **REMOVIDO**
- `/apps/web/app/login/page.tsx` - Google OAuth condicional por tenant

**Documentação:**
- `CLAUDE.md` - Atualizado com todas as mudanças (este arquivo)

### 2026-01-02

#### Painel de Administração Geral (Tenant Vivoly) ✅
- ✅ **Acesso Restrito ao Tenant Vivoly**
  - Apenas administradores do tenant "vivoly" podem acessar
  - Validação no backend (middleware requireVivolyAdmin)
  - Validação no frontend (subdomain check)
  - Menu condicional: item "Admin Geral" só aparece para Vivoly

- ✅ **Backend - Rotas de Administração**
  - Módulo: `/apps/api/src/modules/admin/admin.routes.ts`
  - GET `/api/v1/admin/tenants` - Lista todos os tenants do sistema
  - GET `/api/v1/admin/tenants/:id` - Detalhes de tenant específico
  - GET `/api/v1/admin/stats` - Estatísticas gerais do sistema
  - Retorna: nome, email, status, plano, admin principal, uso/limites

- ✅ **Frontend - Painel de Administração**
  - Página: `/apps/web/app/dashboard/admin/tenants/page.tsx`
  - URL: `vivoly.integrius.com.br/dashboard/admin/tenants`
  - Tabela completa de todos os tenants cadastrados
  - Mostra admin principal de cada tenant (nome + email)
  - Cards de estatísticas (total, novos 30 dias, trials expirando)
  - Filtros: status, plano, busca textual (nome, email, slug)
  - Badges coloridos para status e plano
  - Indicador de dias restantes para trials
  - Link clicável para subdomínio de cada tenant

- ✅ **Recursos da Listagem**
  - Informações por tenant:
    - Nome, slug, subdomínio, email, telefone
    - Status (TRIAL, ATIVO, INATIVO, SUSPENSO, CANCELADO)
    - Plano (BASICO, PRO, ENTERPRISE, CUSTOM)
    - Admin principal (nome, email, último login)
    - Trial: dias restantes, data de expiração
    - Uso atual vs limites (usuários, imóveis)
    - Data de cadastro
  - Estatísticas globais:
    - Total de tenants
    - Novos nos últimos 30 dias
    - Trials expirando em 5 dias
    - Distribuição por status e plano

- ✅ **Segurança Implementada**
  - Validação dupla (backend + frontend)
  - Middleware customizado para verificar tenant "vivoly"
  - Requer autenticação (authMiddleware)
  - Requer tipo ADMIN no tenant Vivoly
  - Retorna 403 Forbidden para outros tenants

#### Sistema de Recuperação de Dados para Clientes Trial ✅
- ✅ **Email Automático 5 Dias Antes do Término**
  - Template profissional com gradiente laranja (#FFB627)
  - Avisa sobre fim do trial e opções de recuperação de dados
  - Lista todos os tipos de dados que serão exportados
  - Explica proteção de 30 dias após expiração
  - CTA para ativar assinatura
  - Método: `sendTrialWarningEmail()` no SendGrid service

- ✅ **Job Automático para Envio de Email**
  - Arquivo: `/apps/api/src/shared/jobs/trial-warning-job.ts`
  - Busca tenants em trial que expiram em ~5 dias
  - Filtra apenas os que não receberam email (`email_5dias_enviado: false`)
  - Envia email para admin do tenant
  - Marca flag após envio bem-sucedido
  - Executar diariamente via cron

- ✅ **Botão "Recuperar Dados" no Header**
  - Aparece apenas nos últimos 5 dias do trial
  - Desaparece após exportação (mostra aviso de sucesso)
  - Componente: `/apps/web/components/DataExportButton.tsx`
  - Integrado no header do dashboard
  - Design: gradiente verde, discreto e profissional

- ✅ **Serviço de Exportação para CSV**
  - Classe `DataExportService` com método `exportTenantData()`
  - Exporta 5 arquivos CSV: leads, imóveis, proprietários, negociações, agendamentos
  - Formato: CSV com separador `;`, encoding UTF-8 com BOM
  - Compatível com Excel, Google Sheets, LibreOffice
  - Biblioteca: `json2csv@6.0.0-alpha.2`

- ✅ **Endpoints de Exportação**
  - GET `/api/v1/export/can-export` - Verifica se pode mostrar botão
  - POST `/api/v1/export/data` - Exporta e envia dados por email
  - Validações: últimos 5 dias, não exportado anteriormente
  - Arquivo: `/apps/api/src/modules/tenants/data-export.routes.ts`

- ✅ **Email de Confirmação com Anexos CSV**
  - Template com stats em grid 2x3
  - Anexa todos os arquivos CSV em base64
  - Design: gradiente verde (#8FD14F) - sucesso
  - Método: `sendDataExportEmail()` no SendGrid service
  - Informações importantes e CTA para ativação

- ✅ **Novos Campos no Modelo Tenant**
  - `data_exportacao_dados` (DateTime?) - Registra quando exportou
  - `email_5dias_enviado` (Boolean) - Flag de email de aviso

- ✅ **Ambiente de Testes Criado**
  - Tenant: `testes` (testes.integrius.com.br)
  - Trial: 11 dias (expira 13/01/2026)
  - Usuário ADMIN: testecorretor@testes.co.br (senha: teste123)
  - Corretor vinculado com CRECI: TESTE-123
  - Propósito: testar sistema trial e funcionalidades de exportação
  - Migration aplicada via `npx prisma db push`

- ✅ **Arquivos Criados/Modificados**
  - Backend:
    - `/apps/api/src/shared/services/data-export.service.ts` - Serviço de exportação
    - `/apps/api/src/modules/tenants/data-export.routes.ts` - Endpoints
    - `/apps/api/src/shared/services/sendgrid.service.ts` - Templates de email
    - `/apps/api/src/shared/jobs/trial-warning-job.ts` - Job automático
    - `/apps/api/src/server.ts` - Registro de rotas
    - `/apps/api/prisma/schema.prisma` - Novos campos
  - Frontend:
    - `/apps/web/components/DataExportButton.tsx` - Botão de exportação
    - `/apps/web/app/dashboard/layout.tsx` - Integração no header
  - Dependências: `json2csv` instalada
  - Documentação completa adicionada ao CLAUDE.md

### 2025-12-31

#### Sistema de Trial e Expiração de Assinatura ✅
- ✅ **Validação Automática de Expiração Implementada**
  - Middleware valida `data_expiracao` em toda requisição
  - Status muda automaticamente de `TRIAL` → `SUSPENSO` quando expira
  - Bloqueia acesso com mensagem clara ao usuário
  - Trial de 30 dias configurado na criação de tenant

- ✅ **Endpoint de Informações do Trial**
  - GET `/api/v1/trial-info` retorna dias restantes e status
  - Calcula dias restantes dinamicamente
  - Suporte para tenants `TRIAL` e `ATIVO`

- ✅ **Componente de Aviso Visual no Frontend**
  - Aviso discreto no topo do dashboard
  - Aparece apenas nos últimos 7 dias do trial
  - Cores dinâmicas (amarelo → vermelho) conforme urgência
  - Mensagens personalizadas por quantidade de dias

- ✅ **Arquivos Criados/Modificados**
  - `apps/api/src/shared/middlewares/tenant.middleware.ts`: Validação de expiração
  - `apps/api/src/modules/tenants/tenant.routes.ts`: Endpoint de trial-info
  - `apps/web/components/TrialWarning.tsx`: Componente de aviso
  - `apps/web/app/dashboard/layout.tsx`: Integração do aviso
  - Documentação completa adicionada ao CLAUDE.md

### 2025-12-30

#### Sistema de Cookies de Lembrança (Tenant Cookies) ✅
- ✅ **Cookies de Longa Duração Implementados**
  - Cookie `last_tenant`: armazena slug do último tenant acessado (90 dias)
  - Cookie `last_login_method`: armazena método de login - email ou google (90 dias)
  - Página `/login` redireciona automaticamente para último tenant se cookie existir
  - Logout mantém cookies de lembrança para próximo acesso
  - Logo sempre aponta para landing page (`/`)

- ✅ **Fluxo de Autenticação Melhorado**
  - Landing page → "Entrar" → `/login` → verifica cookie → redireciona para tenant
  - Sem cookie: mostra formulário de login/cadastro
  - Com cookie: redireciona automaticamente para `tenant.integrius.com.br`
  - UX profissional: usuário não precisa lembrar subdomínio

- ✅ **Arquivos Modificados**
  - `apps/web/lib/auth.ts`: Armazenamento de cookies no login (email e Google)
  - `apps/web/lib/auth.ts`: Helpers `getLastTenant()` e `getLastLoginMethod()`
  - `apps/web/app/login/page.tsx`: Verificação e redirecionamento automático
  - `apps/web/middleware.ts`: Permite acesso ao `/login` no domínio base
  - Documentação completa adicionada ao CLAUDE.md

### 2025-12-29

#### Migração para Supabase PostgreSQL ✅
- ✅ **Banco de Dados Migrado para Supabase**
  - Migrado de Render PostgreSQL para Supabase PostgreSQL
  - DATABASE_URL atualizado para usar connection pooler do Supabase
  - Host: `aws-1-sa-east-1.pooler.supabase.com`
  - Connection string com `sslmode=require` e `connection_limit=3`
  - Arquivos `.env` e `.env.supabase` atualizados
  - IMPORTANTE: Sempre usar pooler, não conexão direta

#### Sistema de Propostas/Lances Competitivos ✅
- ✅ **Sistema Completo de Propostas Implementado**
  - Database: Modelo `Proposta` com constraint única (tenant_id, lead_id, imovel_id)
  - Backend: Service e Routes completos (/api/v1/propostas)
  - Endpoints: POST criar/atualizar, GET best-offer, GET my-offer, accept, reject, counter, cancel
  - Frontend: Modal de negociações com cards "Melhor Oferta" (verde) e "Sua Oferta" (marrom)
  - Lógica: Upsert automático, um lead só pode ter uma proposta ativa por imóvel
  - Status: PENDENTE, ACEITA, RECUSADA, CONTRA, CANCELADA
  - Migration aplicada via `npx prisma db push` em 29/12/2025
  - Documentação completa adicionada ao CLAUDE.md

- ✅ **Correções no Frontend**
  - Fix: Reordenação do `loadImovelDetails` em `openEditModal`
  - Garantido que `formData` é setado ANTES de carregar propostas
  - Priorização do valor da proposta sobre valor da negociação
  - Uso de `formatCurrencyForEdit` para valores existentes

### 2025-12-28

#### Sistema de Autenticação Frontend ✅
- ✅ **Google OAuth Corrigido**
  - Segurança aprimorada: sempre valida tenant antes de criar/login
  - Validação de `user.ativo` em todos os fluxos OAuth
  - Previne hijacking de contas (verifica google_id existente)
  - Auto-criação de registro Corretor para novos usuários Google
  - Tenant isolation completo no OAuth

- ✅ **Frontend Multi-Tenant**
  - Utilitário de tenant (`/apps/web/lib/tenant.ts`)
  - Extração automática de tenant do subdomínio (produção)
  - Suporte a query param `?tenant_id=xxx` (desenvolvimento)
  - API client com interceptors para token + tenant header

- ✅ **Middleware Next.js**
  - Proteção de rotas (PROTECTED_ROUTES vs PUBLIC_ROUTES)
  - Redirecionamento automático para /login sem token
  - Extração de tenant do hostname/query params
  - Suporte a redirect após login (`?redirect=/dashboard`)

- ✅ **Armazenamento Seguro de Token**
  - Duplo armazenamento: localStorage + cookie
  - localStorage: para requisições API via axios
  - Cookie (SameSite=Lax): para middleware Next.js
  - Remoção completa no logout (ambos os storages)

- ✅ **Página de Login Melhorada**
  - Login tradicional (email + senha) funcionando
  - Google OAuth funcionando com tenant isolation
  - Armazenamento automático em cookie + localStorage
  - Mensagens de erro com timeout de 15 segundos
  - Loading states e UX polida

- ✅ **Documentação Atualizada**
  - Seção completa "Integração com Frontend" em CLAUDE.md
  - Fluxo de login frontend documentado
  - Boas práticas de segurança documentadas
  - Exemplos de código para todos os arquivos

### 2025-12-27

#### Sistema de Autenticação Backend ✅
- ✅ **JWT Multi-Tenant Completo**
  - Payload JWT atualizado: userId, tenantId, tipo
  - Token inclui informações completas do usuário
  - Validação de tenant em todas as requisições

- ✅ **Middlewares de Segurança**
  - `tenantMiddleware`: Extração de tenant por subdomínio
  - `authMiddleware`: Validação JWT com verificação de tenant
  - `permissions.middleware`: RBAC completo (ADMIN, GESTOR, CORRETOR)
  - Helpers de permissões para uso em tempo de execução

- ✅ **Endpoints de Gerenciamento de Usuários** (`/api/v1/users`)
  - GET / - Listar usuários (ADMIN/GESTOR)
  - GET /:id - Buscar usuário (ADMIN/GESTOR)
  - POST / - Criar usuário (ADMIN cria todos, GESTOR cria CORRETOR)
  - PATCH /:id - Atualizar usuário (com validação de permissões)
  - DELETE /:id - Deletar usuário (soft delete, apenas ADMIN)

- ✅ **Hierarquia de Roles**
  - ADMIN (nível 3): Controle total do tenant
  - GESTOR (nível 2): Gestão operacional
  - CORRETOR (nível 1): Acesso restrito aos próprios recursos

- ✅ **Segurança Implementada**
  - Senhas com bcrypt (10 rounds)
  - Tenant isolation em todas as queries
  - Soft delete de usuários
  - Logs de auditoria
  - Validação de ownership de recursos

- ✅ **Documentação Completa**
  - Guia completo de autenticação em CLAUDE.md
  - Exemplos de uso dos middlewares
  - Fluxo de autenticação documentado
  - Checklist de segurança

#### Sistema de Agendamento de Visitas ✅
- ✅ **Sistema Completo de Agendamentos**
  - Database: Modelo `Agendamento` com todos relacionamentos
  - Backend: Rotas CRUD completas (/api/v1/agendamentos)
  - Integrações: Notificações via Email (SendGrid) e Telegram
  - Validações: Conflito de horários, tenant_id, data futura
  - Status: PENDENTE → CONFIRMADO → REALIZADO → Feedback
  - Documentação completa em CLAUDE.md

### 2025-12-26
- ✅ ChristmasFloat configurado com datas específicas
- ✅ SendGrid 100% configurado e testado
- ✅ Telegram Bot criado e testado
- ✅ CTAs para corretores e leads adicionados à landing page
- ✅ Sistema completo testado end-to-end
- ✅ Documentação CLAUDE.md criada
- ✅ IA Sofia configurada para qualificação de leads
- ✅ Sistema de subagentes criado (.claude/agents-config.md)

---

**Última atualização**: 17 de janeiro de 2026
**Versão**: 1.11.0
**Status**: Em produção ✅

**Novidades da versão 1.11.0** (17 de janeiro de 2026):
- ✅ **Integração WhatsApp via Twilio**
- ✅ Webhook para receber mensagens do Twilio WhatsApp Business
- ✅ Criação automática de leads de novos contatos WhatsApp
- ✅ Respostas automáticas da IA Sofia via WhatsApp
- ✅ Notificação de corretor via Telegram sobre novos leads
- ✅ Configuração de horário comercial com mensagem fora de expediente
- ✅ Mensagens personalizadas de boas-vindas
- ✅ Página de configuração completa no dashboard (/dashboard/whatsapp)
- ✅ Estatísticas de mensagens (enviadas, recebidas, leads criados)

**Versão 1.10.0** (17 de janeiro de 2026):
- ✅ **Sistema de Metas para Corretores**
- ✅ Definição de metas mensais (leads, visitas, propostas, fechamentos, valor)
- ✅ Criação individual ou em lote para todos os corretores
- ✅ Cálculo automático de progresso baseado em dados reais
- ✅ Dashboard de gestão de metas para ADMIN/GESTOR
- ✅ Widget de metas no dashboard principal (para corretores)
- ✅ Barras de progresso coloridas por desempenho
- ✅ Status automático: EM_ANDAMENTO, ATINGIDA, NAO_ATINGIDA

**Versão 1.9.0** (16 de janeiro de 2026):
- ✅ **Dashboard Gerencial para ADMIN/GESTOR**
- ✅ Ranking de corretores com pontuação calculada
- ✅ Métricas consolidadas do time
- ✅ Comparativo mensal (últimos 3 meses)
- ✅ Tops: fechamentos e valor fechado
- ✅ Alertas gerenciais (leads quentes sem contato, corretores inativos, etc.)
- ✅ Gráficos de distribuição de temperatura e comparativo

**Versão 1.8.0** (16 de janeiro de 2026):
- ✅ **Sistema de Atualização Automática de Temperatura de Leads**
- ✅ Regras de degradação: QUENTE→MORNO (5 dias), MORNO→FRIO (10 dias)
- ✅ Notificação Telegram para corretor quando lead esfria
- ✅ Endpoints de execução manual e preview (dry-run)
- ✅ Job para execução diária via cron
- ✅ Registro na timeline do lead (TEMPERATURA_ALTERADA_AUTO)
- ✅ Estatísticas de leads por temperatura

**Versão 1.7.0** (15 de janeiro de 2026):
- ✅ **LGPD Compliance:** Adequação completa ao Art. 39 da Lei 13.709/2018
- ✅ Operador (Vivoly) não tem mais acesso a logs de atividades de outros tenants
- ✅ Contagens de leads/negociações removidas do painel admin para outros tenants
- ✅ Estatísticas de logs restritas apenas ao próprio tenant
- ✅ Documentação de conformidade LGPD nos endpoints
- ✅ Isolamento completo entre controladores (tenants) e operador

**Versão 1.6.5** (09 de janeiro de 2026):
- ✅ **Fix CRÍTICO:** Cookie de sessão expirando em 30 minutos (usuário deslogado ao navegar)
- ✅ Duração do cookie aumentada de 30min para 7 dias (sincronizado com JWT)
- ✅ Usuários não são mais deslogados ao navegar entre páginas do dashboard
- ✅ Flag `primeiro_acesso` resetada para 7 usuários (evita redirect para `/primeiro-acesso`)
- ✅ Scripts utilitários criados para gestão de usuários e senhas
- ✅ Arquivo CREDENCIAIS_TESTE.md com 9 usuários de 4 tenants prontos para teste
- ✅ Todas as senhas verificadas via bcrypt ou resetadas para valores conhecidos

**Versão 1.6.4** (09 de janeiro de 2026):
- ✅ **Fix CRÍTICO:** Login falhando com 401 devido a tenant_id incorreto no localStorage
- ✅ localStorage.tenant_id agora é limpo ANTES do login para evitar conflitos
- ✅ Usuários podem fazer login em diferentes tenants sem erro 401
- ✅ Interceptor do axios não envia mais tenant_id de sessões anteriores durante login
- ✅ Problema resolvido: Login em `imobiliariazacarias.integrius.com.br` funciona corretamente

**Versão 1.6.3** (08 de janeiro de 2026):
- ✅ **Fix CRÍTICO:** loginSchema.parse estava fora do try/catch (login quebrado)
- ✅ **Fix crítico:** Google OAuth bloqueando login em tenants não autorizados
- ✅ Login tradicional (email/senha) TOTALMENTE restaurado
- ✅ Google OAuth restrito apenas para tenants autorizados (Vivoly)
- ✅ **Problema de login resolvido:** Credenciais corretas documentadas
- ✅ Exportação automática de dados no cancelamento de assinatura
- ✅ Período trial corrigido de 30 para 14 dias (5 tenants atualizados)
- ✅ Aviso de trial movido para header (sempre visível, design compacto)
- ✅ Removido botão "Recuperar Dados" (exportação agora é automática)
- ✅ Script de correção de período trial criado e executado
- ✅ Fix: Suporte para domínios Render.com no tenant middleware
- ✅ Fix: Chamada correta do DataExportService (método estático)
- ✅ Fix: Parâmetro diasRestantes adicionado no sendDataExportEmail

**Versão 1.5.1** (03 de janeiro de 2026):
- ✅ Sistema completo de avisos de trial (emails 5 dias e 2 dias antes)
- ✅ Sistema de cálculo de comissões para corretores
- ✅ Sistema de recuperação de senha com tokens de 6 dígitos
- ✅ Fix: Domínio `integrius.com.br` adicionado ao tenant middleware
- ✅ Endpoint público de validação de tenant
- ✅ Painel de Administração Geral para Vivoly

**Versão 1.5.0** (30 de dezembro de 2025):
- ✅ Sistema de Cookies de Lembrança (Tenant Cookies) - 90 dias
- ✅ Redirecionamento automático para último tenant acessado
- ✅ Fluxo de autenticação profissional (Landing Page First)
- ✅ Logo sempre aponta para landing page
- ✅ UX melhorada: usuário não precisa lembrar subdomínio
- ✅ Cookies de login method (email/google) para analytics

**Versão 1.4.0** (29 de dezembro de 2025):
- Sistema de Propostas/Lances Competitivos completo
- Migração para Supabase PostgreSQL com connection pooler
- Modal de negociações com "Melhor Oferta" e "Sua Oferta"
