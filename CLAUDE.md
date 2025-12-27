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

## Histórico de Configurações

### 2025-12-27
- ✅ **Sistema de Agendamento de Visitas Implementado**
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

**Última atualização**: 27 de dezembro de 2025
**Versão**: 1.1.0
**Status**: Em produção ✅
