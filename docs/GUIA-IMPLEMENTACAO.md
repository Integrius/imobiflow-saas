# 🚀 GUIA PRÁTICO DE IMPLEMENTAÇÃO - BI + IA

## 📋 Índice Rápido

1. [Preparação Inicial (Esta Semana)](#1-preparação-inicial)
2. [FASE 1: MVP - Fundação (Semanas 1-6)](#fase-1-mvp---fundação-6-semanas)
3. [FASE 2: Inteligência (Semanas 7-14)](#fase-2-inteligência-avançada-8-semanas)
4. [FASE 3: Automações (Semanas 15-20)](#fase-3-automações-e-refinamento-6-semanas)
5. [Checklist de Verificação](#checklist-de-verificação)

---

## 1. PREPARAÇÃO INICIAL (Esta Semana)

### 📝 Passo 1.1: Criar Contas nas APIs (30 minutos)

#### API da Anthropic (Claude)

1. Acesse: https://console.anthropic.com/
2. Crie uma conta ou faça login
3. Vá em "API Keys"
4. Gere uma nova chave
5. **IMPORTANTE**: Anote a chave (começa com `sk-ant-`)

**Custo estimado**: $150-300/mês

#### API da OpenAI (Backup)

1. Acesse: https://platform.openai.com/
2. Crie uma conta ou faça login
3. Vá em "API Keys"
4. Gere uma nova chave
5. **IMPORTANTE**: Anote a chave (começa com `sk-`)

**Custo estimado**: $100/mês

### 📝 Passo 1.2: Adicionar Variáveis de Ambiente (10 minutos)

Crie o arquivo `.env` na raiz do backend:

```bash
cd /home/hans/imobiflow/apps/api
nano .env
```

Adicione estas variáveis:

```env
# APIs de IA
ANTHROPIC_API_KEY=sk-ant-seu-key-aqui
OPENAI_API_KEY=sk-seu-key-aqui

# WhatsApp (deixar vazio por enquanto)
WHATSAPP_SESSION_PATH=/tmp/whatsapp-session
WHATSAPP_WEBHOOK_SECRET=seu-secret-aleatorio

# Telegram (deixar vazio por enquanto)
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=seu-secret-aleatorio

# Redis (se usar cloud)
REDIS_URL=redis://localhost:6379

# Feature Flags
ENABLE_AI_RESPONSES=true
ENABLE_AUTO_ASSIGNMENT=false
AI_CONFIDENCE_THRESHOLD=0.75
MAX_TOKENS_PER_REQUEST=2000
```

### 📝 Passo 1.3: Instalar Dependências (15 minutos)

```bash
cd /home/hans/imobiflow/apps/api

# Instalar pacotes principais
pnpm add @anthropic-ai/sdk openai

# Para mensageria
pnpm add whatsapp-web.js qrcode-terminal
pnpm add node-telegram-bot-api

# Para filas de mensagens
pnpm add bull ioredis

# Para processamento de IA
pnpm add langchain @langchain/anthropic @langchain/openai

# Para análise de sentimento
pnpm add sentiment natural
```

### 📝 Passo 1.4: Criar Estrutura de Pastas (5 minutos)

```bash
cd /home/hans/imobiflow/apps/api/src

# Criar estrutura
mkdir -p ai/{agents,prompts,context,services}
mkdir -p messaging/{whatsapp,telegram,queue/processors}
mkdir -p analytics
mkdir -p integrations
```

---

## FASE 1: MVP - Fundação (6 semanas)

### 🎯 Objetivo
Criar sistema funcional de IA que responde leads no WhatsApp e notifica corretores no Telegram.

---

### 📅 SPRINT 1 (Semanas 1-2): Setup Básico

#### ✅ Tarefa 1.1: Serviço Claude AI (2h)

Crie o arquivo `apps/api/src/ai/services/claude.service.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateResponse(prompt: string, context?: string): Promise<string> {
    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: context
              ? `${context}\n\n${prompt}`
              : prompt
          }
        ]
      });

      return message.content[0].type === 'text'
        ? message.content[0].text
        : '';
    } catch (error) {
      console.error('Erro ao chamar Claude:', error);
      throw error;
    }
  }

  async analyze(prompt: string): Promise<any> {
    const response = await this.generateResponse(prompt);

    try {
      // Tenta parsear como JSON se possível
      return JSON.parse(response);
    } catch {
      return { response };
    }
  }
}
```

**Teste:**

```typescript
// apps/api/src/test-claude.ts
import { ClaudeService } from './ai/services/claude.service';

async function test() {
  const claude = new ClaudeService();

  const response = await claude.generateResponse(
    'Responda em português: Por que você quer comprar um imóvel?',
    'Você é Sofia, assistente de uma imobiliária.'
  );

  console.log('Resposta:', response);
}

test();
```

Execute:
```bash
npx tsx src/test-claude.ts
```

---

#### ✅ Tarefa 1.2: Serviço WhatsApp (4h)

Crie o arquivo `apps/api/src/messaging/whatsapp/whatsapp.service.ts`:

```typescript
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

export class WhatsAppService {
  private client: Client;
  private isReady = false;
  private messageHandlers: Array<(msg: Message) => Promise<void>> = [];

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: process.env.WHATSAPP_SESSION_PATH || './wpp-session'
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.client.on('qr', (qr) => {
      console.log('📱 QR Code para WhatsApp:');
      qrcode.generate(qr, { small: true });
      console.log('Escaneie com o WhatsApp no seu celular');
    });

    this.client.on('ready', () => {
      console.log('✅ WhatsApp conectado com sucesso!');
      this.isReady = true;
    });

    this.client.on('authenticated', () => {
      console.log('🔐 WhatsApp autenticado');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('❌ Falha na autenticação:', msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log('📴 WhatsApp desconectado:', reason);
      this.isReady = false;
    });

    this.client.on('message', async (msg) => {
      // Ignora grupos e mensagens próprias
      if (msg.from.includes('@g.us') || msg.fromMe) return;

      // Processa com todos os handlers registrados
      for (const handler of this.messageHandlers) {
        try {
          await handler(msg);
        } catch (error) {
          console.error('Erro ao processar mensagem:', error);
        }
      }
    });
  }

  async initialize() {
    await this.client.initialize();
  }

  onMessage(handler: (msg: Message) => Promise<void>) {
    this.messageHandlers.push(handler);
  }

  async sendMessage(phoneNumber: string, message: string) {
    if (!this.isReady) {
      throw new Error('WhatsApp não está conectado');
    }

    const chatId = phoneNumber.includes('@c.us')
      ? phoneNumber
      : `${phoneNumber}@c.us`;

    await this.client.sendMessage(chatId, message);
  }

  async sendMessageWithButtons(
    phoneNumber: string,
    message: string,
    buttons: string[]
  ) {
    // Implementação básica - WhatsApp Web não suporta botões
    // Usa números como opções
    const numberedOptions = buttons
      .map((btn, idx) => `${idx + 1}️⃣ ${btn}`)
      .join('\n');

    await this.sendMessage(
      phoneNumber,
      `${message}\n\n${numberedOptions}\n\nResponda com o número da opção.`
    );
  }

  getClient() {
    return this.client;
  }
}
```

**Teste:**

```typescript
// apps/api/src/test-whatsapp.ts
import { WhatsAppService } from './messaging/whatsapp/whatsapp.service';

async function test() {
  const whatsapp = new WhatsAppService();

  whatsapp.onMessage(async (msg) => {
    console.log('📨 Mensagem recebida:', {
      from: msg.from,
      body: msg.body
    });

    // Echo de teste
    await msg.reply('Recebi sua mensagem! Sistema de teste ativo.');
  });

  await whatsapp.initialize();
  console.log('WhatsApp inicializado. Aguardando mensagens...');
}

test();
```

Execute e escaneie o QR Code:
```bash
npx tsx src/test-whatsapp.ts
```

---

#### ✅ Tarefa 1.3: Serviço Telegram (2h)

Crie o arquivo `apps/api/src/messaging/telegram/telegram.service.ts`:

```typescript
import TelegramBot from 'node-telegram-bot-api';

export class TelegramService {
  private bot: TelegramBot;
  private commandHandlers: Map<string, (msg: any, match: any) => Promise<void>> = new Map();

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN não configurado');
    }

    this.bot = new TelegramBot(token, { polling: true });
    this.setupBasicCommands();
  }

  private setupBasicCommands() {
    this.bot.onText(/\/start/, (msg) => {
      this.bot.sendMessage(
        msg.chat.id,
        '👋 Bem-vindo ao sistema de BI da Vivoly!\n\n' +
        'Comandos disponíveis:\n' +
        '/status - Ver status do sistema\n' +
        '/leads - Ver leads quentes\n' +
        '/briefing - Briefing do dia'
      );
    });

    this.bot.onText(/\/status/, async (msg) => {
      await this.bot.sendMessage(
        msg.chat.id,
        '✅ Sistema ativo\n' +
        '📊 IA: Operacional\n' +
        '📱 WhatsApp: Conectado\n' +
        '🤖 Telegram: Conectado'
      );
    });
  }

  async sendNotification(chatId: number, message: string) {
    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });
  }

  async sendHotLeadAlert(chatId: number, lead: any) {
    const message = `
🔥 *LEAD QUENTE - Ação Imediata*

━━━━━━━━━━━━━━━━━━━━
👤 *DADOS DO LEAD*
━━━━━━━━━━━━━━━━━━━━
Nome: ${lead.nome}
📱 Telefone: ${lead.telefone}
📊 Score: ${lead.score}/100 🔥
🌡️ Temperatura: ${lead.temperatura}

━━━━━━━━━━━━━━━━━━━━
💼 *INTERESSE*
━━━━━━━━━━━━━━━━━━━━
${lead.interesse ? JSON.stringify(lead.interesse, null, 2) : 'Não especificado'}

━━━━━━━━━━━━━━━━━━━━
📋 *INSIGHTS DA IA*
━━━━━━━━━━━━━━━━━━━━
${lead.insights || 'Processando...'}
`;

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Assumir Lead', callback_data: `assume_${lead.id}` },
          { text: '📊 Ver Histórico', callback_data: `history_${lead.id}` }
        ]]
      }
    });
  }

  async sendDailyBriefing(chatId: number, data: any) {
    const message = `
☀️ *Bom dia! Seu briefing de hoje*

━━━━━━━━━━━━━━━━━━━━
📊 *PIPELINE ATUAL*
━━━━━━━━━━━━━━━━━━━━
📅 ${data.visitasAgendadas} visitas agendadas hoje
📝 ${data.propostasAguardando} propostas aguardando
📞 ${data.leadsFollowUp} leads para follow-up
💰 R$ ${data.negociacoesAtivas} em negociações

━━━━━━━━━━━━━━━━━━━━
🎯 *PRIORIDADES*
━━━━━━━━━━━━━━━━━━━━
${data.prioridades.map((p: any, i: number) =>
  `${i + 1}. ${p.emoji} ${p.descricao}`
).join('\n')}

━━━━━━━━━━━━━━━━━━━━
📈 *PERFORMANCE MENSAL*
━━━━━━━━━━━━━━━━━━━━
├─ ${data.negociacoes} negociações ativas
├─ Meta: ${data.metaPercentual}% atingida
└─ Projeção: ${data.projecao}
`;

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });
  }

  onCommand(command: string, handler: (msg: any, match: any) => Promise<void>) {
    this.bot.onText(new RegExp(`/${command}`), handler);
  }

  onCallbackQuery(handler: (query: any) => Promise<void>) {
    this.bot.on('callback_query', handler);
  }

  getBot() {
    return this.bot;
  }
}
```

**Como criar o Bot do Telegram:**

1. Abra o Telegram e busque por "@BotFather"
2. Envie `/newbot`
3. Escolha um nome (ex: "Vivoly BI Assistant")
4. Escolha um username (ex: "vivoly_bi_bot")
5. Copie o token que ele enviar
6. Adicione no `.env`: `TELEGRAM_BOT_TOKEN=seu-token-aqui`

**Teste:**

```typescript
// apps/api/src/test-telegram.ts
import { TelegramService } from './messaging/telegram/telegram.service';

async function test() {
  const telegram = new TelegramService();

  console.log('✅ Bot Telegram iniciado');
  console.log('Envie /start para seu bot no Telegram para testar');

  // Teste de notificação quando receber /test
  telegram.onCommand('test', async (msg) => {
    await telegram.sendHotLeadAlert(msg.chat.id, {
      id: 'test-123',
      nome: 'João da Silva',
      telefone: '(21) 98765-4321',
      score: 85,
      temperatura: 'QUENTE',
      interesse: {
        tipo: 'Apartamento 2Q',
        regiao: 'Zona Sul',
        budget: 'R$ 850k'
      },
      insights: '✅ Urgência alta\n✅ Budget definido\n⚠️ Mencionou concorrente'
    });
  });
}

test();
```

---

### 📅 SPRINT 2 (Semanas 3-4): Integração IA + Mensageria

#### ✅ Tarefa 2.1: Gerenciador de Contexto (3h)

Crie `apps/api/src/ai/context/context-builder.ts`:

```typescript
import { prisma } from '@/lib/prisma';

export interface LeadContext {
  nome?: string;
  telefone: string;
  origem: string;
  score_atual: number;
  temperatura: string;
  interesse_registrado?: any;
  timeline: any[];
  ultima_mensagem: string;
  imoveis_portfolio: any[];
  historico_resumido: string;
}

export class ContextBuilder {
  async buildLeadContext(
    leadId: string,
    mensagemAtual: string
  ): Promise<LeadContext> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        corretor: {
          include: { user: true }
        }
      }
    });

    if (!lead) {
      throw new Error('Lead não encontrado');
    }

    // Busca imóveis disponíveis
    const imoveis = await prisma.imovel.findMany({
      where: {
        tenant_id: lead.tenant_id,
        status: 'DISPONIVEL'
      },
      take: 10,
      orderBy: { created_at: 'desc' }
    });

    // Resume histórico de conversas
    const timeline = Array.isArray(lead.timeline) ? lead.timeline : [];
    const historico = timeline
      .filter((t: any) => t.tipo?.includes('mensagem'))
      .slice(-5) // Últimas 5 mensagens
      .map((t: any) => `${t.tipo}: ${t.conteudo}`)
      .join('\n');

    return {
      nome: lead.nome,
      telefone: lead.telefone,
      origem: lead.origem,
      score_atual: lead.score,
      temperatura: lead.temperatura,
      interesse_registrado: lead.interesse,
      timeline: timeline,
      ultima_mensagem: mensagemAtual,
      imoveis_portfolio: imoveis.map(i => ({
        codigo: i.codigo,
        tipo: i.tipo,
        categoria: i.categoria,
        endereco: i.endereco,
        preco: i.preco,
        caracteristicas: i.caracteristicas
      })),
      historico_resumido: historico || 'Primeiro contato'
    };
  }
}
```

---

#### ✅ Tarefa 2.2: Prompts Otimizados (2h)

Crie `apps/api/src/ai/prompts/lead-qualification.prompt.ts`:

```typescript
import { LeadContext } from '../context/context-builder';

export function generateQualificationPrompt(context: LeadContext): string {
  return `Você é Sofia, assistente virtual da Vivoly, uma imobiliária premium.

PERSONALIDADE:
- Amigável e acolhedora, mas profissional
- Consultiva, nunca vendedora
- Paciente e atenta aos detalhes
- Usa linguagem natural brasileira
- Demonstra empatia genuína

CONTEXTO DO LEAD:
Nome: ${context.nome || 'Cliente'}
Telefone: ${context.telefone}
Origem: ${context.origem}
Score Atual: ${context.score_atual}/100
Temperatura: ${context.temperatura}
Total de Interações: ${context.timeline.length}

${context.historico_resumido ? `
HISTÓRICO RECENTE:
${context.historico_resumido}
` : ''}

${context.interesse_registrado ? `
INTERESSE JÁ REGISTRADO:
${JSON.stringify(context.interesse_registrado, null, 2)}
` : ''}

IMÓVEIS DISPONÍVEIS (contexto):
${context.imoveis_portfolio.slice(0, 5).map((i, idx) =>
  `${idx + 1}. ${i.tipo} - ${i.caracteristicas?.quartos || '?'}Q em ${
    typeof i.endereco === 'object' ? i.endereco.cidade : 'Local'
  } por R$ ${Number(i.preco).toLocaleString('pt-BR')}`
).join('\n')}

SUA MISSÃO:
1. Responder à mensagem do cliente de forma natural e útil
2. Se for primeira interação: cumprimentar e entender necessidade
3. Se já há histórico: continuar a conversa contextualmente
4. Fazer perguntas abertas para qualificar (máximo 3 por vez)
5. Identificar: tipo de imóvel, localização, budget, finalidade, urgência
6. Quando tiver informações suficientes, sugerir 2-3 imóveis específicos
7. Se cliente demonstrar interesse alto, sugerir agendamento de visita

REGRAS IMPORTANTES:
- Máximo 3 perguntas por mensagem
- Use 1-2 emojis apenas (não exagere)
- Seja genuinamente útil, não robotizada
- NUNCA invente dados sobre imóveis
- Se não souber algo técnico, ofereça conectar com corretor
- Mensagens curtas e objetivas (máximo 4 linhas)

ÚLTIMA MENSAGEM DO CLIENTE:
"${context.ultima_mensagem}"

RESPONDA AGORA:
(Apenas a mensagem para o cliente, sem explicações adicionais)`;
}

export function generateSentimentAnalysisPrompt(conversaCompleta: string): string {
  return `Analise o sentimento e intenção de compra desta conversa imobiliária.

CONVERSA:
${conversaCompleta}

Retorne APENAS um JSON válido com esta estrutura:
{
  "sentimento": <0-10>,
  "interesse": <0-10>,
  "urgencia": <0-10>,
  "objecoes": ["lista", "de", "objecoes"],
  "poder_compra": "baixo|medio|alto|indefinido",
  "proxima_acao": "continuar_qualificacao|agendar_visita|conectar_corretor|abandonar",
  "justificativa": "breve explicação"
}

Critérios:
- sentimento: 0-3 negativo, 4-6 neutro, 7-10 positivo
- interesse: 0-3 baixo, 4-6 moderado, 7-10 alto
- urgencia: 0-3 sem pressa, 4-6 planejando, 7-10 urgente

RETORNE APENAS O JSON, SEM TEXTO ADICIONAL.`;
}
```

---

#### ✅ Tarefa 2.3: Processador de Mensagens de Lead (4h)

Crie `apps/api/src/messaging/queue/processors/lead-message.processor.ts`:

```typescript
import { ClaudeService } from '@/ai/services/claude.service';
import { ContextBuilder } from '@/ai/context/context-builder';
import {
  generateQualificationPrompt,
  generateSentimentAnalysisPrompt
} from '@/ai/prompts/lead-qualification.prompt';
import { prisma } from '@/lib/prisma';
import { TelegramService } from '@/messaging/telegram/telegram.service';

export class LeadMessageProcessor {
  private claude: ClaudeService;
  private contextBuilder: ContextBuilder;
  private telegram: TelegramService;

  constructor() {
    this.claude = new ClaudeService();
    this.contextBuilder = new ContextBuilder();
    this.telegram = new TelegramService();
  }

  async processMessage(
    leadId: string,
    phoneNumber: string,
    message: string,
    tenantId: string
  ) {
    try {
      // 1. Busca ou cria lead
      let lead = await this.findOrCreateLead(phoneNumber, tenantId);

      // 2. Adiciona mensagem ao histórico
      await this.addToTimeline(lead.id, {
        tipo: 'mensagem_recebida',
        conteudo: message,
        timestamp: new Date(),
        canal: 'whatsapp'
      });

      // 3. Constrói contexto
      const context = await this.contextBuilder.buildLeadContext(
        lead.id,
        message
      );

      // 4. Gera resposta com IA
      const prompt = generateQualificationPrompt(context);
      const aiResponse = await this.claude.generateResponse(prompt);

      // 5. Analisa sentimento e calcula novo score
      const analysis = await this.analyzeSentiment(lead.id);

      // 6. Atualiza lead
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          score: analysis.newScore,
          temperatura: analysis.temperatura,
          interesse: analysis.interesse,
          ultimo_contato: new Date()
        }
      });

      // 7. Registra resposta da IA
      await this.addToTimeline(lead.id, {
        tipo: 'mensagem_enviada_ia',
        conteudo: aiResponse,
        timestamp: new Date(),
        metadata: {
          score: analysis.newScore,
          insights: analysis.insights
        }
      });

      // 8. Se lead ficou quente, notifica corretor
      if (analysis.newScore >= 75 && !lead.corretor_id) {
        await this.notifyHotLead(lead, analysis);
      }

      return {
        response: aiResponse,
        score: analysis.newScore,
        temperatura: analysis.temperatura
      };

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      return {
        response: 'Desculpe, tive um problema técnico. Vou conectar você com um de nossos corretores.',
        score: 0,
        temperatura: 'FRIO'
      };
    }
  }

  private async findOrCreateLead(phoneNumber: string, tenantId: string) {
    const telefone = phoneNumber.replace(/\D/g, '');

    let lead = await prisma.lead.findFirst({
      where: {
        tenant_id: tenantId,
        telefone: telefone
      }
    });

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          tenant_id: tenantId,
          telefone: telefone,
          nome: `Cliente ${telefone.slice(-4)}`,
          origem: 'WHATSAPP',
          temperatura: 'FRIO',
          score: 30, // Score inicial
          interesse: {},
          timeline: []
        }
      });
    }

    return lead;
  }

  private async addToTimeline(leadId: string, event: any) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    const timeline = Array.isArray(lead?.timeline) ? lead.timeline : [];
    timeline.push(event);

    await prisma.lead.update({
      where: { id: leadId },
      data: { timeline }
    });
  }

  private async analyzeSentiment(leadId: string) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    const timeline = Array.isArray(lead?.timeline) ? lead.timeline : [];
    const conversaCompleta = timeline
      .filter(t => t.tipo?.includes('mensagem'))
      .map(t => `${t.tipo}: ${t.conteudo}`)
      .join('\n');

    const prompt = generateSentimentAnalysisPrompt(conversaCompleta);
    const analysis = await this.claude.analyze(prompt);

    // Calcula novo score baseado na análise
    const baseScore = lead?.score || 30;
    const sentimentWeight = analysis.sentimento * 3;
    const interesseWeight = analysis.interesse * 5;
    const urgenciaWeight = analysis.urgencia * 2;

    const newScore = Math.min(100, Math.round(
      baseScore * 0.3 +
      sentimentWeight +
      interesseWeight +
      urgenciaWeight
    ));

    // Define temperatura
    let temperatura = 'FRIO';
    if (newScore >= 70) temperatura = 'QUENTE';
    else if (newScore >= 50) temperatura = 'MORNO';

    return {
      newScore,
      temperatura,
      interesse: {
        sentimento: analysis.sentimento,
        nivel_interesse: analysis.interesse,
        urgencia: analysis.urgencia,
        objecoes: analysis.objecoes,
        poder_compra: analysis.poder_compra
      },
      insights: analysis.justificativa
    };
  }

  private async notifyHotLead(lead: any, analysis: any) {
    // Busca chat_id do gestor/admin para notificar
    // Por enquanto, usa um chat_id de teste
    const ADMIN_CHAT_ID = parseInt(process.env.TELEGRAM_ADMIN_CHAT_ID || '0');

    if (ADMIN_CHAT_ID) {
      await this.telegram.sendHotLeadAlert(ADMIN_CHAT_ID, {
        id: lead.id,
        nome: lead.nome,
        telefone: lead.telefone,
        score: analysis.newScore,
        temperatura: analysis.temperatura,
        interesse: analysis.interesse,
        insights: analysis.insights
      });
    }
  }
}
```

---

### 📅 SPRINT 3 (Semanas 5-6): Integração Completa

#### ✅ Tarefa 3.1: Orquestrador Principal (3h)

Crie `apps/api/src/ai/ai-orchestrator.ts`:

```typescript
import { WhatsAppService } from '@/messaging/whatsapp/whatsapp.service';
import { TelegramService } from '@/messaging/telegram/telegram.service';
import { LeadMessageProcessor } from '@/messaging/queue/processors/lead-message.processor';

export class AIOrchestrator {
  private whatsapp: WhatsAppService;
  private telegram: TelegramService;
  private processor: LeadMessageProcessor;
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.whatsapp = new WhatsAppService();
    this.telegram = new TelegramService();
    this.processor = new LeadMessageProcessor();
  }

  async initialize() {
    console.log('🚀 Inicializando IA Orchestrator...');

    // Inicializa WhatsApp
    this.whatsapp.onMessage(async (msg) => {
      await this.handleWhatsAppMessage(msg);
    });
    await this.whatsapp.initialize();

    // Configura comandos Telegram
    this.setupTelegramCommands();

    console.log('✅ Sistema ativo e pronto!');
  }

  private async handleWhatsAppMessage(msg: any) {
    console.log(`📨 Nova mensagem de ${msg.from}: ${msg.body}`);

    try {
      // Processa com IA
      const result = await this.processor.processMessage(
        '', // leadId será buscado/criado pelo processor
        msg.from,
        msg.body,
        this.tenantId
      );

      // Envia resposta
      await msg.reply(result.response);

      console.log(`✅ Resposta enviada (Score: ${result.score})`);

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      await msg.reply(
        'Desculpe, tive um problema. Vou conectar você com nossa equipe. ' +
        'Por favor, aguarde um momento.'
      );
    }
  }

  private setupTelegramCommands() {
    // Comando /leads - Lista leads quentes
    this.telegram.onCommand('leads', async (msg) => {
      const leads = await prisma.lead.findMany({
        where: {
          tenant_id: this.tenantId,
          temperatura: 'QUENTE',
          corretor_id: null // Ainda não atribuídos
        },
        take: 5,
        orderBy: { score: 'desc' }
      });

      if (leads.length === 0) {
        await this.telegram.sendNotification(
          msg.chat.id,
          '📊 Nenhum lead quente pendente no momento.'
        );
        return;
      }

      let message = '🔥 *Leads Quentes Disponíveis*\n\n';

      leads.forEach((lead, idx) => {
        message += `${idx + 1}. *${lead.nome}*\n`;
        message += `   Score: ${lead.score}/100\n`;
        message += `   Tel: ${lead.telefone}\n`;
        message += `   /assumir\\_${lead.id}\n\n`;
      });

      await this.telegram.sendNotification(msg.chat.id, message);
    });

    // Comando /briefing - Briefing diário
    this.telegram.onCommand('briefing', async (msg) => {
      // TODO: Implementar cálculo de métricas
      await this.telegram.sendDailyBriefing(msg.chat.id, {
        visitasAgendadas: 3,
        propostasAguardando: 2,
        leadsFollowUp: 5,
        negociacoesAtivas: '3.2M',
        prioridades: [
          { emoji: '🔥', descricao: 'Lead Maria Silva - Visita 10h' },
          { emoji: '⚠️', descricao: 'Proposta vence hoje 18h' },
          { emoji: '🧊', descricao: 'Follow-up urgente com 3 leads' }
        ],
        negociacoes: 12,
        metaPercentual: 67,
        projecao: '3 fechamentos esta semana'
      });
    });
  }
}

// Importações necessárias
import { prisma } from '@/lib/prisma';
```

---

#### ✅ Tarefa 3.2: Arquivo Principal do Servidor (2h)

Modifique `apps/api/src/server.ts` para incluir o orquestrador:

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { AIOrchestrator } from './ai/ai-orchestrator';

const app = Fastify({ logger: true });

// Plugins
app.register(cors, { origin: true });
app.register(helmet);
app.register(jwt, { secret: process.env.JWT_SECRET || 'seu-secret-aqui' });

// Rotas existentes...
// (suas rotas atuais continuam aqui)

// Rota de health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Inicializa servidor
const start = async () => {
  try {
    const PORT = Number(process.env.PORT) || 3333;
    await app.listen({ port: PORT, host: '0.0.0.0' });

    console.log(`✅ Servidor rodando na porta ${PORT}`);

    // Inicializa IA Orchestrator
    if (process.env.ENABLE_AI_RESPONSES === 'true') {
      const orchestrator = new AIOrchestrator(
        process.env.DEFAULT_TENANT_ID || 'default'
      );
      await orchestrator.initialize();
    } else {
      console.log('⚠️  IA desabilitada (ENABLE_AI_RESPONSES=false)');
    }

  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

---

#### ✅ Tarefa 3.3: Teste End-to-End (2h)

Crie um script de teste completo:

```typescript
// apps/api/src/test-e2e.ts
import { AIOrchestrator } from './ai/ai-orchestrator';

async function testE2E() {
  console.log('🧪 Iniciando teste end-to-end...\n');

  // 1. Inicializa sistema
  const orchestrator = new AIOrchestrator('test-tenant-id');
  await orchestrator.initialize();

  console.log('\n✅ Sistema inicializado');
  console.log('\n📱 TESTE WHATSAPP:');
  console.log('1. Escaneie o QR Code com seu WhatsApp');
  console.log('2. Envie uma mensagem para o número conectado');
  console.log('3. A IA deve responder automaticamente\n');

  console.log('🤖 TESTE TELEGRAM:');
  console.log('1. Busque seu bot no Telegram');
  console.log('2. Envie /start');
  console.log('3. Teste os comandos:');
  console.log('   - /status');
  console.log('   - /leads');
  console.log('   - /briefing\n');

  console.log('🔥 TESTE NOTIFICAÇÃO:');
  console.log('1. Envie mensagens simulando um lead quente');
  console.log('2. Quando o score passar de 75, você deve receber');
  console.log('   uma notificação no Telegram\n');

  console.log('⏳ Sistema em execução. Pressione Ctrl+C para sair.');
}

testE2E();
```

Execute:
```bash
npx tsx src/test-e2e.ts
```

---

## ✅ CHECKLIST - FASE 1 COMPLETA

Marque cada item quando concluído:

- [ ] Claude API configurada e testada
- [ ] OpenAI API configurada (backup)
- [ ] WhatsApp conectado e respondendo
- [ ] Telegram bot criado e respondendo comandos
- [ ] IA gerando respostas contextuais
- [ ] Leads sendo criados/atualizados automaticamente
- [ ] Score sendo calculado corretamente
- [ ] Notificações de leads quentes funcionando
- [ ] Teste E2E passando

**Quando todos os itens estiverem marcados, você tem um MVP funcional!** 🎉

---

## 🎯 Próximos Passos

Após concluir a Fase 1, você terá:
- ✅ IA respondendo leads no WhatsApp 24/7
- ✅ Sistema de scoring automático
- ✅ Notificações para corretores via Telegram
- ✅ Base sólida para evoluir o sistema

**Continua na Fase 2...**

(Este documento tem 800+ linhas. Quer que eu continue com as Fases 2 e 3?)
