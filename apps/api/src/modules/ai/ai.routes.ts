import { FastifyInstance } from 'fastify';
import { MessageProcessorV2Service } from '../../ai/services/message-processor-v2.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function aiRoutes(server: FastifyInstance) {
  /**
   * POST /api/v1/ai/process-message
   * Processa uma mensagem recebida de um lead
   */
  server.post('/process-message', async (request, reply) => {
    try {
      const { tenantId, leadId, message } = request.body as any;

      // Validação
      if (!tenantId || !leadId || !message) {
        return reply.status(400).send({
          error: 'Campos obrigatórios: tenantId, leadId, message'
        });
      }

      // Processa mensagem
      const processor = new MessageProcessorV2Service();
      const result = await processor.processMessage(tenantId, leadId, message);

      return {
        success: true,
        data: {
          messageId: result.messageId,
          response: result.response,
          analysis: {
            urgency: result.analysis.urgency,
            intent: result.analysis.intent,
            sentiment: result.analysis.sentiment,
            scoreImpact: result.analysis.score_impact
          },
          newScore: result.newScore,
          shouldNotifyBroker: result.shouldNotifyBroker
        }
      };

    } catch (error: any) {
      server.log.error('Erro ao processar mensagem:', error);
      return reply.status(500).send({
        error: 'Erro ao processar mensagem',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/ai/lead/:leadId/messages
   * Busca histórico de mensagens de um lead
   */
  server.get('/lead/:leadId/messages', async (request, reply) => {
    try {
      const { leadId } = request.params as any;
      const { tenantId } = request.query as any;

      if (!tenantId) {
        return reply.status(400).send({
          error: 'tenantId é obrigatório'
        });
      }

      // Busca mensagens
      const messages = await prisma.message.findMany({
        where: {
          lead_id: leadId,
          tenant_id: tenantId
        },
        orderBy: {
          created_at: 'asc'
        },
        select: {
          id: true,
          content: true,
          is_from_lead: true,
          platform: true,
          status: true,
          ai_analysis: true,
          ai_score_impact: true,
          created_at: true
        }
      });

      return {
        success: true,
        data: messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          isFromLead: msg.is_from_lead,
          platform: msg.platform,
          status: msg.status,
          aiAnalysis: msg.ai_analysis,
          scoreImpact: msg.ai_score_impact,
          createdAt: msg.created_at
        }))
      };

    } catch (error: any) {
      server.log.error('Erro ao buscar mensagens:', error);
      return reply.status(500).send({
        error: 'Erro ao buscar mensagens',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/ai/lead/:leadId/conversation
   * Busca lead com histórico de conversa completo
   */
  server.get('/lead/:leadId/conversation', async (request, reply) => {
    try {
      const { leadId } = request.params as any;
      const { tenantId } = request.query as any;

      if (!tenantId) {
        return reply.status(400).send({
          error: 'tenantId é obrigatório'
        });
      }

      // Busca lead com mensagens
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
          messages: {
            orderBy: { created_at: 'asc' },
            select: {
              id: true,
              content: true,
              is_from_lead: true,
              platform: true,
              status: true,
              ai_score_impact: true,
              created_at: true
            }
          }
        }
      });

      if (!lead || lead.tenant_id !== tenantId) {
        return reply.status(404).send({
          error: 'Lead não encontrado'
        });
      }

      return {
        success: true,
        data: {
          lead: {
            id: lead.id,
            nome: lead.nome,
            telefone: lead.telefone,
            email: lead.email,
            score: lead.score,
            temperatura: lead.temperatura,
            urgency: lead.urgency,
            sentiment: lead.sentiment,
            intent: lead.intent,
            propertyType: lead.property_type,
            location: lead.location,
            bedrooms: lead.bedrooms,
            budget: lead.budget ? Number(lead.budget) : null,
            aiEnabled: lead.ai_enabled,
            escalatedToBroker: lead.escalated_to_broker
          },
          messages: lead.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            isFromLead: msg.is_from_lead,
            platform: msg.platform,
            status: msg.status,
            scoreImpact: msg.ai_score_impact,
            createdAt: msg.created_at
          })),
          stats: {
            totalMessages: lead.messages.length,
            leadMessages: lead.messages.filter(m => m.is_from_lead).length,
            aiResponses: lead.messages.filter(m => !m.is_from_lead).length
          }
        }
      };

    } catch (error: any) {
      server.log.error('Erro ao buscar conversa:', error);
      return reply.status(500).send({
        error: 'Erro ao buscar conversa',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/ai/stats
   * Retorna estatísticas gerais do sistema de IA
   */
  server.get('/stats', async (request, reply) => {
    try {
      const { tenantId } = request.query as any;

      if (!tenantId) {
        return reply.status(400).send({
          error: 'tenantId é obrigatório'
        });
      }

      const [
        totalLeadsWithAI,
        totalMessages,
        leadsWithHighUrgency,
        leadsEscalated,
        avgScore
      ] = await Promise.all([
        prisma.lead.count({
          where: {
            tenant_id: tenantId,
            ai_enabled: true
          }
        }),
        prisma.message.count({
          where: {
            tenant_id: tenantId
          }
        }),
        prisma.lead.count({
          where: {
            tenant_id: tenantId,
            urgency: 'ALTA'
          }
        }),
        prisma.lead.count({
          where: {
            tenant_id: tenantId,
            escalated_to_broker: true
          }
        }),
        prisma.lead.aggregate({
          where: {
            tenant_id: tenantId,
            ai_enabled: true
          },
          _avg: {
            score: true
          }
        })
      ]);

      return {
        success: true,
        data: {
          leadsWithAI: totalLeadsWithAI,
          totalMessages,
          highUrgencyLeads: leadsWithHighUrgency,
          escalatedLeads: leadsEscalated,
          averageScore: Math.round(avgScore._avg.score || 0),
          aiEnabled: true
        }
      };

    } catch (error: any) {
      server.log.error('Erro ao buscar estatísticas:', error);
      return reply.status(500).send({
        error: 'Erro ao buscar estatísticas',
        message: error.message
      });
    }
  });

  /**
   * PATCH /api/v1/ai/lead/:leadId/toggle
   * Habilita/desabilita IA para um lead específico
   */
  server.patch('/lead/:leadId/toggle', async (request, reply) => {
    try {
      const { leadId } = request.params as any;
      const { tenantId, enabled } = request.body as any;

      if (!tenantId) {
        return reply.status(400).send({
          error: 'tenantId é obrigatório'
        });
      }

      // Atualiza lead
      const lead = await prisma.lead.update({
        where: { id: leadId },
        data: {
          ai_enabled: enabled
        }
      });

      return {
        success: true,
        data: {
          leadId: lead.id,
          aiEnabled: lead.ai_enabled
        }
      };

    } catch (error: any) {
      server.log.error('Erro ao atualizar lead:', error);
      return reply.status(500).send({
        error: 'Erro ao atualizar lead',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/ai/lead/:leadId/escalate
   * Escala um lead para corretor humano
   */
  server.post('/lead/:leadId/escalate', async (request, reply) => {
    try {
      const { leadId } = request.params as any;
      const { tenantId, reason } = request.body as any;

      if (!tenantId) {
        return reply.status(400).send({
          error: 'tenantId é obrigatório'
        });
      }

      // Atualiza lead
      const lead = await prisma.lead.update({
        where: { id: leadId },
        data: {
          escalated_to_broker: true,
          escalation_reason: reason || 'Escalado manualmente',
          ai_enabled: false // Desabilita IA quando escalado
        }
      });

      return {
        success: true,
        data: {
          leadId: lead.id,
          escalated: lead.escalated_to_broker,
          aiEnabled: lead.ai_enabled
        }
      };

    } catch (error: any) {
      server.log.error('Erro ao escalar lead:', error);
      return reply.status(500).send({
        error: 'Erro ao escalar lead',
        message: error.message
      });
    }
  });
}
