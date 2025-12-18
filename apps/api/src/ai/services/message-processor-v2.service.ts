import { PrismaClient } from '@prisma/client';
import { ClaudeService } from './claude.service';
import { MessageAdapter } from '../adapters/lead.adapter';
import { ANALYSIS_PROMPT, RESPONSE_PROMPT } from '../prompts/sofia-prompts';

const prisma = new PrismaClient();

export interface MessageAnalysis {
  urgency: 'baixa' | 'média' | 'alta';
  intent: 'informacao' | 'agendamento' | 'negociacao' | 'reclamacao';
  sentiment: 'positivo' | 'neutro' | 'negativo';
  budget_mentioned: boolean;
  preferences: {
    property_type: string | null;
    location: string | null;
    bedrooms: number | null;
    budget_max: number | null;
  };
  next_action: 'respond' | 'schedule' | 'escalate' | 'close';
  score_impact: number;
  tags: string[];
}

export interface ProcessedMessage {
  messageId: string;
  analysis: MessageAnalysis;
  response: string;
  shouldNotifyBroker: boolean;
  newScore: number;
}

export class MessageProcessorV2Service {
  private claude: ClaudeService;

  constructor() {
    this.claude = new ClaudeService();
  }

  /**
   * Processa uma mensagem recebida do lead
   */
  async processMessage(
    tenantId: string,
    leadId: string,
    messageContent: string
  ): Promise<ProcessedMessage> {
    try {
      console.log(`📨 [${tenantId}] Processando mensagem do lead ${leadId}`);

      // 1. Busca lead
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
          messages: {
            orderBy: { created_at: 'desc' },
            take: 10 // Últimas 10 mensagens para contexto
          }
        }
      });

      if (!lead || lead.tenant_id !== tenantId) {
        throw new Error(`Lead ${leadId} não encontrado ou não pertence ao tenant`);
      }

      // 2. Analisa a mensagem com IA
      const analysis = await this.analyzeMessage(messageContent);
      console.log('🔍 Análise:', analysis);

      // 3. Salva mensagem recebida
      const incomingMessageData = MessageAdapter.toPrisma({
        tenantId,
        leadId,
        content: messageContent,
        isFromLead: true,
        platform: 'whatsapp',
        status: 'delivered',
        aiAnalysis: analysis,
        aiScoreImpact: analysis.score_impact
      });

      const incomingMessage = await prisma.message.create({
        data: incomingMessageData
      });

      // 4. Constrói contexto da conversa
      const context = this.buildConversationContext(lead, analysis);

      // 5. Gera resposta apropriada
      const response = await this.generateResponse(context, messageContent);
      console.log('💬 Resposta:', response.substring(0, 100) + '...');

      // 6. Salva resposta
      const outgoingMessageData = MessageAdapter.toPrisma({
        tenantId,
        leadId,
        content: response,
        isFromLead: false,
        platform: 'whatsapp',
        status: 'sent'
      });

      await prisma.message.create({
        data: outgoingMessageData
      });

      // 7. Atualiza lead com análise
      const newScore = await this.updateLeadFromAnalysis(leadId, lead.score, analysis);

      // 8. Determina se deve notificar corretor
      const shouldNotifyBroker = this.shouldNotifyBroker(analysis, newScore);

      return {
        messageId: incomingMessage.id,
        analysis,
        response,
        shouldNotifyBroker,
        newScore
      };

    } catch (error: any) {
      console.error('❌ Erro ao processar mensagem:', error);
      throw error;
    }
  }

  /**
   * Analisa a mensagem usando IA
   */
  private async analyzeMessage(message: string): Promise<MessageAnalysis> {
    const prompt = `${ANALYSIS_PROMPT}

MENSAGEM DO LEAD:
"${message}"

Retorne APENAS o JSON, sem explicações adicionais.`;

    try {
      const result = await this.claude.analyze(prompt);

      // Se o Claude retornou um objeto response, tenta extrair o JSON
      if (result.response) {
        const jsonMatch = result.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      return result;
    } catch (error) {
      console.warn('⚠️ Erro ao analisar mensagem, usando valores padrão');
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Constrói contexto da conversa
   */
  private buildConversationContext(lead: any, currentAnalysis: MessageAnalysis): string {
    const messages = lead.messages || [];

    let context = `
═══════════════════════════════════════════════════════
📋 INFORMAÇÕES DO LEAD
═══════════════════════════════════════════════════════
Nome: ${lead.nome}
Telefone: ${lead.telefone}
Score: ${lead.score}/100
Temperatura: ${lead.temperatura}
`;

    // Adiciona preferências se houver
    const preferences: string[] = [];
    if (lead.property_type) preferences.push(`Tipo: ${lead.property_type}`);
    if (lead.location) preferences.push(`Localização: ${lead.location}`);
    if (lead.bedrooms) preferences.push(`Quartos: ${lead.bedrooms}`);
    if (lead.budget) preferences.push(`Orçamento: R$ ${Number(lead.budget).toLocaleString('pt-BR')}`);
    if (currentAnalysis.preferences.property_type) preferences.push(`Tipo identificado: ${currentAnalysis.preferences.property_type}`);
    if (currentAnalysis.preferences.location) preferences.push(`Local identificado: ${currentAnalysis.preferences.location}`);

    if (preferences.length > 0) {
      context += `
═══════════════════════════════════════════════════════
🎯 PREFERÊNCIAS
═══════════════════════════════════════════════════════
${preferences.join('\n')}
`;
    }

    context += `
═══════════════════════════════════════════════════════
⚡ ANÁLISE ATUAL
═══════════════════════════════════════════════════════
Urgência: ${currentAnalysis.urgency.toUpperCase()}
Intenção: ${currentAnalysis.intent}
Sentimento: ${currentAnalysis.sentiment}
`;

    // Adiciona histórico se houver
    if (messages.length > 0) {
      const history = messages
        .reverse() // Ordem cronológica
        .slice(0, 5) // Últimas 5 mensagens
        .map((msg: any) => {
          const sender = msg.is_from_lead ? 'Lead' : 'Sofia';
          return `${sender}: "${msg.content}"`;
        })
        .join('\n');

      context += `
═══════════════════════════════════════════════════════
💬 HISTÓRICO RECENTE
═══════════════════════════════════════════════════════
${history}
`;
    }

    return context.trim();
  }

  /**
   * Gera resposta contextualizada
   */
  private async generateResponse(
    context: string,
    message: string
  ): Promise<string> {
    const prompt = RESPONSE_PROMPT(context, message);
    return await this.claude.generateResponse(prompt, undefined, {
      maxTokens: 500,
      temperature: 0.8
    });
  }

  /**
   * Atualiza lead baseado na análise
   */
  private async updateLeadFromAnalysis(
    leadId: string,
    currentScore: number,
    analysis: MessageAnalysis
  ): Promise<number> {
    const updateData: any = {
      ultimo_contato: new Date()
    };

    // Mapeia urgency para enum
    if (analysis.urgency) {
      const urgencyMap: Record<string, string> = {
        'baixa': 'BAIXA',
        'média': 'MEDIA',
        'alta': 'ALTA'
      };
      updateData.urgency = urgencyMap[analysis.urgency];
    }

    // Mapeia sentiment para enum
    if (analysis.sentiment) {
      const sentimentMap: Record<string, string> = {
        'positivo': 'POSITIVO',
        'neutro': 'NEUTRO',
        'negativo': 'NEGATIVO'
      };
      updateData.sentiment = sentimentMap[analysis.sentiment];
    }

    // Mapeia intent para enum
    if (analysis.intent) {
      const intentMap: Record<string, string> = {
        'informacao': 'INFORMACAO',
        'agendamento': 'AGENDAMENTO',
        'negociacao': 'NEGOCIACAO',
        'reclamacao': 'RECLAMACAO'
      };
      updateData.intent = intentMap[analysis.intent];
    }

    // Atualiza preferências
    if (analysis.preferences.property_type) {
      updateData.property_type = analysis.preferences.property_type;
    }
    if (analysis.preferences.location) {
      updateData.location = analysis.preferences.location;
    }
    if (analysis.preferences.bedrooms) {
      updateData.bedrooms = analysis.preferences.bedrooms;
    }
    if (analysis.preferences.budget_max) {
      updateData.budget = analysis.preferences.budget_max;
    }

    // Atualiza score
    const newScore = Math.max(0, Math.min(100, currentScore + analysis.score_impact));
    updateData.score = newScore;

    await prisma.lead.update({
      where: { id: leadId },
      data: updateData
    });

    return newScore;
  }

  /**
   * Determina se deve notificar o corretor
   */
  private shouldNotifyBroker(analysis: MessageAnalysis, score: number): boolean {
    // Notifica se:
    // 1. Urgência alta
    if (analysis.urgency === 'alta') return true;

    // 2. Intenção de agendamento
    if (analysis.intent === 'agendamento') return true;

    // 3. Próxima ação é escalar
    if (analysis.next_action === 'escalate') return true;

    // 4. Score alto (>= 70)
    if (score >= 70) return true;

    // 5. Orçamento alto mencionado (>R$1M)
    if (analysis.preferences.budget_max && analysis.preferences.budget_max > 1000000) {
      return true;
    }

    return false;
  }

  /**
   * Retorna análise padrão em caso de erro
   */
  private getDefaultAnalysis(): MessageAnalysis {
    return {
      urgency: 'média',
      intent: 'informacao',
      sentiment: 'neutro',
      budget_mentioned: false,
      preferences: {
        property_type: null,
        location: null,
        bedrooms: null,
        budget_max: null
      },
      next_action: 'respond',
      score_impact: 0,
      tags: []
    };
  }

  /**
   * Retorna estatísticas do processamento
   */
  getStats() {
    return this.claude.getStats();
  }
}
