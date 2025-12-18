import { PrismaClient } from '@prisma/client';
import { ClaudeService } from './claude.service';
import { ContextBuilderService } from './context-builder.service';
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
  analysis: MessageAnalysis;
  response: string;
  shouldNotifyBroker: boolean;
  scoreUpdate: number;
}

export class MessageProcessorService {
  private claude: ClaudeService;
  private contextBuilder: ContextBuilderService;

  constructor() {
    this.claude = new ClaudeService();
    this.contextBuilder = new ContextBuilderService();
  }

  /**
   * Processa uma mensagem recebida do lead
   */
  async processMessage(
    leadId: string,
    messageContent: string
  ): Promise<ProcessedMessage> {
    try {
      console.log(`📨 Processando mensagem do lead ${leadId}`);

      // 1. Salva a mensagem recebida no banco
      await this.saveIncomingMessage(leadId, messageContent);

      // 2. Analisa a mensagem com IA
      const analysis = await this.analyzeMessage(messageContent);
      console.log('🔍 Análise:', analysis);

      // 3. Atualiza o lead baseado na análise
      await this.updateLeadFromAnalysis(leadId, analysis);

      // 4. Constrói contexto da conversa
      const context = await this.contextBuilder.buildContext(leadId);
      const formattedContext = this.contextBuilder.formatContextForPrompt(context);

      // 5. Gera resposta apropriada
      const response = await this.generateResponse(formattedContext, messageContent);
      console.log('💬 Resposta gerada:', response.substring(0, 100) + '...');

      // 6. Salva a resposta no banco
      await this.saveOutgoingMessage(leadId, response);

      // 7. Determina se deve notificar corretor
      const shouldNotifyBroker = this.shouldNotifyBroker(analysis);

      // 8. Calcula impacto no score
      const scoreUpdate = await this.updateLeadScore(leadId, analysis.score_impact);

      return {
        analysis,
        response,
        shouldNotifyBroker,
        scoreUpdate
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
   * Gera resposta contextualizada
   */
  private async generateResponse(
    context: string,
    message: string
  ): Promise<string> {
    const prompt = RESPONSE_PROMPT(context, message);
    return await this.claude.generateResponse(prompt, undefined, {
      maxTokens: 500, // Respostas curtas
      temperature: 0.8 // Mais criatividade
    });
  }

  /**
   * Salva mensagem recebida no banco
   */
  private async saveIncomingMessage(
    leadId: string,
    content: string
  ): Promise<void> {
    await prisma.message.create({
      data: {
        leadId,
        content,
        isFromLead: true,
        status: 'delivered'
      }
    });
  }

  /**
   * Salva resposta enviada no banco
   */
  private async saveOutgoingMessage(
    leadId: string,
    content: string
  ): Promise<void> {
    await prisma.message.create({
      data: {
        leadId,
        content,
        isFromLead: false,
        status: 'sent'
      }
    });
  }

  /**
   * Atualiza informações do lead baseado na análise
   */
  private async updateLeadFromAnalysis(
    leadId: string,
    analysis: MessageAnalysis
  ): Promise<void> {
    const updateData: any = {
      urgency: analysis.urgency,
      sentiment: analysis.sentiment,
      lastContactAt: new Date()
    };

    // Atualiza preferências se mencionadas
    if (analysis.preferences.property_type) {
      updateData.propertyType = analysis.preferences.property_type;
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

    await prisma.lead.update({
      where: { id: leadId },
      data: updateData
    });
  }

  /**
   * Atualiza o score do lead
   */
  private async updateLeadScore(
    leadId: string,
    scoreImpact: number
  ): Promise<number> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { score: true }
    });

    if (!lead) return 0;

    const newScore = Math.max(0, Math.min(100, lead.score + scoreImpact));

    await prisma.lead.update({
      where: { id: leadId },
      data: { score: newScore }
    });

    return newScore;
  }

  /**
   * Determina se deve notificar o corretor
   */
  private shouldNotifyBroker(analysis: MessageAnalysis): boolean {
    // Notifica se:
    // 1. Urgência alta
    // 2. Intenção de agendamento
    // 3. Próxima ação é escalar
    // 4. Orçamento alto mencionado (>R$1M)

    if (analysis.urgency === 'alta') return true;
    if (analysis.intent === 'agendamento') return true;
    if (analysis.next_action === 'escalate') return true;
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
