import { FastifyInstance } from 'fastify';
import { MessageProcessorV2Service } from '../../ai/services/message-processor-v2.service';
import { propertyMatchingService, LeadProfile } from '../../ai/services/property-matching.service';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware';
import { prisma } from '../../shared/database/prisma.service';

export async function aiRoutes(server: FastifyInstance) {
  // 🔒 SEGURANÇA CRÍTICA: Adiciona autenticação e validação de tenant em TODAS as rotas
  server.addHook('onRequest', authMiddleware);
  server.addHook('onRequest', tenantMiddleware);
  /**
   * POST /api/v1/ai/process-message
   * Processa uma mensagem recebida de um lead
   */
  server.post('/process-message', async (request, reply) => {
    try {
      const { leadId, message } = request.body as any;
      const tenantId = request.tenantId; // 🔒 SEGURO: vem do middleware, não do body

      // Validação
      if (!leadId || !message) {
        return reply.status(400).send({
          error: 'Campos obrigatórios: leadId, message'
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
      const tenantId = request.tenantId; // 🔒 SEGURO: vem do middleware

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
      const tenantId = request.tenantId; // 🔒 SEGURO: vem do middleware

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
      const tenantId = request.tenantId; // 🔒 SEGURO: vem do middleware

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
      const { enabled } = request.body as any;
      const tenantId = request.tenantId; // 🔒 SEGURO: vem do middleware

      // 🔒 SEGURANÇA: Valida que o lead pertence ao tenant antes de atualizar
      const leadExists = await prisma.lead.findFirst({
        where: { id: leadId, tenant_id: tenantId }
      });

      if (!leadExists) {
        return reply.status(404).send({
          error: 'Lead não encontrado'
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
      const { reason } = request.body as any;
      const tenantId = request.tenantId; // 🔒 SEGURO: vem do middleware

      // 🔒 SEGURANÇA: Valida que o lead pertence ao tenant antes de escalar
      const leadExists = await prisma.lead.findFirst({
        where: { id: leadId, tenant_id: tenantId }
      });

      if (!leadExists) {
        return reply.status(404).send({
          error: 'Lead não encontrado'
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

  /**
   * GET /api/v1/ai/lead/:leadId/sugestoes
   * Busca sugestões de imóveis para um lead específico
   */
  server.get('/lead/:leadId/sugestoes', async (request, reply) => {
    try {
      const { leadId } = request.params as any;
      const { max } = request.query as any;
      const tenantId = request.tenantId;

      // Buscar lead com todas as informações necessárias
      const lead = await prisma.lead.findFirst({
        where: {
          id: leadId,
          tenant_id: tenantId
        }
      });

      if (!lead) {
        return reply.status(404).send({
          error: 'Lead não encontrado'
        });
      }

      // Montar perfil do lead para matching
      const leadProfile: LeadProfile = {
        id: lead.id,
        nome: lead.nome,
        email: lead.email || undefined,
        telefone: lead.telefone,
        tipo_negocio: lead.tipo_negocio || 'COMPRA',
        tipo_imovel_desejado: lead.tipo_imovel_desejado || 'APARTAMENTO',
        valor_minimo: lead.valor_minimo ? Number(lead.valor_minimo) : undefined,
        valor_maximo: lead.valor_maximo ? Number(lead.valor_maximo) : undefined,
        estado: lead.estado || undefined,
        municipio: lead.municipio || undefined,
        bairro: lead.bairro || undefined,
        quartos_min: lead.quartos_min || undefined,
        quartos_max: lead.quartos_max || undefined,
        vagas_min: lead.vagas_min || undefined,
        vagas_max: lead.vagas_max || undefined,
        area_minima: lead.area_minima ? Number(lead.area_minima) : undefined,
        aceita_pets: lead.aceita_pets || undefined,
        observacoes: lead.observacoes || undefined
      };

      // Buscar sugestões
      const maxResults = max ? parseInt(max, 10) : 5;
      const resultado = await propertyMatchingService.findMatchingProperties(
        tenantId,
        leadProfile,
        maxResults
      );

      return {
        success: true,
        data: resultado
      };

    } catch (error: any) {
      server.log.error('Erro ao buscar sugestões:', error);
      return reply.status(500).send({
        error: 'Erro ao buscar sugestões de imóveis',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/ai/sugestoes
   * Busca sugestões de imóveis com base em um perfil fornecido
   * (útil para busca manual ou para leads ainda não cadastrados)
   */
  server.post('/sugestoes', async (request, reply) => {
    try {
      const tenantId = request.tenantId;
      const { perfil, max } = request.body as any;

      if (!perfil) {
        return reply.status(400).send({
          error: 'Campo obrigatório: perfil'
        });
      }

      // Validar campos mínimos
      if (!perfil.tipo_negocio || !perfil.tipo_imovel_desejado) {
        return reply.status(400).send({
          error: 'Perfil deve conter tipo_negocio e tipo_imovel_desejado'
        });
      }

      const leadProfile: LeadProfile = {
        id: 'busca-manual',
        nome: perfil.nome || 'Cliente',
        telefone: perfil.telefone || '',
        email: perfil.email,
        tipo_negocio: perfil.tipo_negocio,
        tipo_imovel_desejado: perfil.tipo_imovel_desejado,
        valor_minimo: perfil.valor_minimo,
        valor_maximo: perfil.valor_maximo,
        estado: perfil.estado,
        municipio: perfil.municipio,
        bairro: perfil.bairro,
        quartos_min: perfil.quartos_min,
        quartos_max: perfil.quartos_max,
        vagas_min: perfil.vagas_min,
        vagas_max: perfil.vagas_max,
        area_minima: perfil.area_minima,
        aceita_pets: perfil.aceita_pets,
        observacoes: perfil.observacoes
      };

      const maxResults = max ? parseInt(max, 10) : 5;
      const resultado = await propertyMatchingService.findMatchingProperties(
        tenantId,
        leadProfile,
        maxResults
      );

      return {
        success: true,
        data: resultado
      };

    } catch (error: any) {
      server.log.error('Erro ao buscar sugestões:', error);
      return reply.status(500).send({
        error: 'Erro ao buscar sugestões de imóveis',
        message: error.message
      });
    }
  });
}
