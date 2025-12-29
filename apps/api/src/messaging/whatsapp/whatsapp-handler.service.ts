import { whatsappService } from './whatsapp.service';
import { aiRouter } from '../../ai/services/ai-router.service';
import { prisma } from '../../shared/database/prisma.service';

/**
 * WhatsApp Message Handler
 *
 * Integra mensagens recebidas do WhatsApp com o sistema de IA
 */
export class WhatsAppHandlerService {
  private processingMessages: Set<string> = new Set();

  constructor() {
    this.setupMessageHandler();
  }

  /**
   * Configura handler de mensagens recebidas
   */
  private setupMessageHandler() {
    whatsappService.on('message', async (data) => {
      await this.handleIncomingMessage(data);
    });

    console.log('✅ WhatsApp Handler configurado');
  }

  /**
   * Processa mensagem recebida
   */
  private async handleIncomingMessage(data: {
    from: string;
    name: string;
    body: string;
    timestamp: number;
    isForwarded: boolean;
  }) {
    // Previne processamento duplicado
    const messageKey = `${data.from}_${data.timestamp}`;
    if (this.processingMessages.has(messageKey)) {
      return;
    }
    this.processingMessages.add(messageKey);

    try {
      console.log(`🔄 Processando mensagem de ${data.name} (${data.from})`);

      // Extrai número de telefone limpo
      const phoneNumber = this.extractPhoneNumber(data.from);

      // Busca ou cria lead
      const lead = await this.findOrCreateLead(phoneNumber, data.name);

      if (!lead) {
        console.error('❌ Não foi possível encontrar/criar lead');
        return;
      }

      // Verifica se IA está habilitada para este lead
      if (!lead.ai_enabled) {
        console.log(`⏭️  IA desabilitada para lead ${lead.id}`);
        return;
      }

      // Salva mensagem recebida
      await prisma.message.create({
        data: {
          lead_id: lead.id,
          tenant_id: lead.tenant_id,
          content: data.body,
          is_from_lead: true,
          platform: 'WHATSAPP',
          status: 'SENT'
        }
      });

      // Processa com IA e gera resposta
      const aiResponse = await this.processWithAI(lead.id, lead.tenant_id, data.body);

      if (aiResponse && aiResponse.response) {
        // Envia resposta via WhatsApp
        const sent = await whatsappService.sendMessage(
          data.from,
          aiResponse.response,
          aiResponse.shouldNotifyBroker ? 'high' : 'normal'
        );

        if (sent) {
          // Salva resposta da IA
          await prisma.message.create({
            data: {
              lead_id: lead.id,
              tenant_id: lead.tenant_id,
              content: aiResponse.response,
              is_from_lead: false,
              platform: 'WHATSAPP',
              status: 'PENDING',
              ai_score_impact: aiResponse.analysis.scoreImpact
            }
          });

          console.log(`✅ Resposta gerada e enfileirada para ${data.name}`);
        }
      }

    } catch (error: any) {
      console.error('❌ Erro ao processar mensagem WhatsApp:', error.message);

      // Se for erro crítico, notifica
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        console.error('🚨 Erro crítico: Chave da API não configurada');
      }

    } finally {
      // Remove da lista de processamento após 1 minuto
      setTimeout(() => {
        this.processingMessages.delete(messageKey);
      }, 60000);
    }
  }

  /**
   * Busca ou cria lead baseado no número de telefone
   */
  private async findOrCreateLead(phoneNumber: string, name: string) {
    try {
      // Busca lead existente
      let lead = await prisma.lead.findFirst({
        where: {
          telefone: phoneNumber
        }
      });

      if (lead) {
        return lead;
      }

      // Se não existe, busca primeiro tenant disponível
      // TODO: Implementar lógica de roteamento baseada em número/origem
      const firstTenant = await prisma.tenant.findFirst();

      if (!firstTenant) {
        console.error('❌ Nenhum tenant encontrado no sistema');
        return null;
      }

      // Cria novo lead
      lead = await prisma.lead.create({
        data: {
          tenant_id: firstTenant.id,
          nome: name || 'Lead WhatsApp',
          telefone: phoneNumber,
          origem: 'WHATSAPP',
          interesse: 'Contato via WhatsApp',
          score: 30, // Score inicial moderado
          temperatura: 'MORNO',
          ai_enabled: true // Habilita IA por padrão
        }
      });

      console.log(`✨ Novo lead criado: ${lead.nome} (${lead.id})`);

      return lead;

    } catch (error: any) {
      console.error('❌ Erro ao buscar/criar lead:', error.message);
      return null;
    }
  }

  /**
   * Processa mensagem com IA
   */
  private async processWithAI(leadId: string, tenantId: string, message: string) {
    try {
      // Busca histórico de mensagens (últimas 10)
      const previousMessages = await prisma.message.findMany({
        where: {
          lead_id: leadId,
          tenant_id: tenantId
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 10
      });

      // Monta contexto da conversa
      const conversationContext = previousMessages
        .reverse()
        .map(msg => `${msg.is_from_lead ? 'Lead' : 'Sofia'}: ${msg.content}`)
        .join('\n');

      // Gera resposta usando AI Router
      const result = await aiRouter.generateResponse(
        message,
        conversationContext,
        {
          maxTokens: 512,
          temperature: 0.7
        }
      );

      // Analisa mensagem para atualizar score
      const analysis = await this.analyzeMessage(message);

      // Atualiza lead com análise
      await this.updateLeadFromAnalysis(leadId, analysis);

      // Verifica se deve notificar corretor
      const shouldNotifyBroker = analysis.urgency === 'alta' || analysis.next_action === 'escalate';

      return {
        response: result.response,
        analysis: {
          urgency: analysis.urgency,
          intent: analysis.intent,
          sentiment: analysis.sentiment,
          scoreImpact: analysis.score_impact
        },
        newScore: analysis.score_impact,
        shouldNotifyBroker
      };

    } catch (error: any) {
      console.error('❌ Erro ao processar com IA:', error.message);
      return null;
    }
  }

  /**
   * Analisa mensagem usando IA
   */
  private async analyzeMessage(message: string): Promise<any> {
    try {
      const analysisPrompt = `
Analise a mensagem do lead e retorne um JSON com:

{
  "urgency": "baixa" | "média" | "alta",
  "intent": "informacao" | "agendamento" | "negociacao" | "reclamacao",
  "sentiment": "positivo" | "neutro" | "negativo",
  "budget_mentioned": boolean,
  "preferences": {
    "property_type": string | null,
    "location": string | null,
    "bedrooms": number | null,
    "budget_max": number | null
  },
  "next_action": "respond" | "schedule" | "escalate" | "close",
  "score_impact": number,
  "tags": string[]
}

Mensagem: "${message}"
      `;

      const result = await aiRouter.analyze(analysisPrompt);
      return result;

    } catch (error) {
      // Retorna análise padrão se falhar
      return {
        urgency: 'média',
        intent: 'informacao',
        sentiment: 'neutro',
        score_impact: 0,
        next_action: 'respond'
      };
    }
  }

  /**
   * Atualiza lead baseado na análise
   */
  private async updateLeadFromAnalysis(leadId: string, analysis: any) {
    try {
      const updateData: any = {
        urgency: analysis.urgency?.toUpperCase(),
        intent: analysis.intent,
        sentiment: analysis.sentiment
      };

      // Atualiza preferências se mencionadas
      if (analysis.preferences?.property_type) {
        updateData.property_type = analysis.preferences.property_type;
      }
      if (analysis.preferences?.location) {
        updateData.location = analysis.preferences.location;
      }
      if (analysis.preferences?.bedrooms) {
        updateData.bedrooms = analysis.preferences.bedrooms;
      }
      if (analysis.preferences?.budget_max) {
        updateData.budget = analysis.preferences.budget_max;
      }

      // Atualiza score
      if (analysis.score_impact) {
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (lead) {
          const newScore = Math.max(0, Math.min(100, lead.score + analysis.score_impact));
          updateData.score = newScore;

          // Atualiza temperatura baseado no score
          if (newScore >= 70) {
            updateData.temperatura = 'QUENTE';
          } else if (newScore >= 40) {
            updateData.temperatura = 'MORNO';
          } else {
            updateData.temperatura = 'FRIO';
          }
        }
      }

      // Escala se necessário
      if (analysis.next_action === 'escalate') {
        updateData.escalated_to_broker = true;
        updateData.escalation_reason = 'Escalado automaticamente pela IA';
      }

      await prisma.lead.update({
        where: { id: leadId },
        data: updateData
      });

    } catch (error: any) {
      console.error('❌ Erro ao atualizar lead:', error.message);
    }
  }

  /**
   * Extrai número de telefone limpo
   */
  private extractPhoneNumber(from: string): string {
    // Remove @c.us e outros sufixos
    return from.replace('@c.us', '').replace('@s.whatsapp.net', '');
  }

  /**
   * Envia mensagem manual para um lead
   */
  async sendManualMessage(leadId: string, message: string): Promise<boolean> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId }
      });

      if (!lead || !lead.telefone) {
        return false;
      }

      const phoneWithSuffix = lead.telefone.includes('@c.us')
        ? lead.telefone
        : `${lead.telefone}@c.us`;

      return await whatsappService.sendMessage(phoneWithSuffix, message);

    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem manual:', error.message);
      return false;
    }
  }
}

// Exporta instância singleton
export const whatsappHandler = new WhatsAppHandlerService();
