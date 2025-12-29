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

## Histórico de Configurações

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

**Última atualização**: 29 de dezembro de 2025
**Versão**: 1.4.0
**Status**: Em produção ✅

**Novidades da versão 1.4.0**:
- ✅ Sistema de Propostas/Lances Competitivos completo (backend + frontend)
- ✅ Migração para Supabase PostgreSQL com connection pooler
- ✅ Modal de negociações com "Melhor Oferta" e "Sua Oferta"
- ✅ Upsert automático de propostas (um lead, uma proposta por imóvel)
- ✅ API completa: criar, buscar, aceitar, recusar, contraproposta, cancelar
- ✅ Documentação CLAUDE.md com instrução de manutenção obrigatória
