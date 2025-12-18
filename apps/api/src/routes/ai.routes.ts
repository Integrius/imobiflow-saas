import { Router, Request, Response } from 'express';
import { MessageProcessorV2Service } from '../ai/services/message-processor-v2.service';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/ai/process-message
 * Processa uma mensagem recebida de um lead
 */
router.post('/process-message', async (req: Request, res: Response) => {
  try {
    const { tenantId, leadId, message } = req.body;

    // Validação
    if (!tenantId || !leadId || !message) {
      return res.status(400).json({
        error: 'Campos obrigatórios: tenantId, leadId, message'
      });
    }

    // Processa mensagem
    const processor = new MessageProcessorV2Service();
    const result = await processor.processMessage(tenantId, leadId, message);

    res.json({
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
    });

  } catch (error: any) {
    console.error('Erro ao processar mensagem:', error);
    res.status(500).json({
      error: 'Erro ao processar mensagem',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/lead/:leadId/messages
 * Busca histórico de mensagens de um lead
 */
router.get('/lead/:leadId/messages', async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({
        error: 'tenantId é obrigatório'
      });
    }

    // Busca mensagens
    const messages = await prisma.message.findMany({
      where: {
        lead_id: leadId,
        tenant_id: tenantId as string
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

    res.json({
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
    });

  } catch (error: any) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({
      error: 'Erro ao buscar mensagens',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/lead/:leadId/conversation
 * Busca lead com histórico de conversa completo
 */
router.get('/lead/:leadId/conversation', async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({
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
      return res.status(404).json({
        error: 'Lead não encontrado'
      });
    }

    res.json({
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
    });

  } catch (error: any) {
    console.error('Erro ao buscar conversa:', error);
    res.status(500).json({
      error: 'Erro ao buscar conversa',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/stats
 * Retorna estatísticas gerais do sistema de IA
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({
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
          tenant_id: tenantId as string,
          ai_enabled: true
        }
      }),
      prisma.message.count({
        where: {
          tenant_id: tenantId as string
        }
      }),
      prisma.lead.count({
        where: {
          tenant_id: tenantId as string,
          urgency: 'ALTA'
        }
      }),
      prisma.lead.count({
        where: {
          tenant_id: tenantId as string,
          escalated_to_broker: true
        }
      }),
      prisma.lead.aggregate({
        where: {
          tenant_id: tenantId as string,
          ai_enabled: true
        },
        _avg: {
          score: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        leadsWithAI: totalLeadsWithAI,
        totalMessages,
        highUrgencyLeads: leadsWithHighUrgency,
        escalatedLeads: leadsEscalated,
        averageScore: Math.round(avgScore._avg.score || 0),
        aiEnabled: true
      }
    });

  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      message: error.message
    });
  }
});

/**
 * PATCH /api/ai/lead/:leadId/toggle
 * Habilita/desabilita IA para um lead específico
 */
router.patch('/lead/:leadId/toggle', async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const { tenantId, enabled } = req.body;

    if (!tenantId) {
      return res.status(400).json({
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

    res.json({
      success: true,
      data: {
        leadId: lead.id,
        aiEnabled: lead.ai_enabled
      }
    });

  } catch (error: any) {
    console.error('Erro ao atualizar lead:', error);
    res.status(500).json({
      error: 'Erro ao atualizar lead',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/lead/:leadId/escalate
 * Escala um lead para corretor humano
 */
router.post('/lead/:leadId/escalate', async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const { tenantId, reason } = req.body;

    if (!tenantId) {
      return res.status(400).json({
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

    res.json({
      success: true,
      data: {
        leadId: lead.id,
        escalated: lead.escalated_to_broker,
        aiEnabled: lead.ai_enabled
      }
    });

  } catch (error: any) {
    console.error('Erro ao escalar lead:', error);
    res.status(500).json({
      error: 'Erro ao escalar lead',
      message: error.message
    });
  }
});

export default router;
