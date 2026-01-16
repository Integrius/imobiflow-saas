import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { insightsService } from './insights.service'
import { interactionsService } from './interactions.service'
import { TipoInteracao, DirecaoInteracao, SentimentoInteracao } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../../shared/database/prisma.service'

// Schema de validação para criar interação
const createInteractionSchema = z.object({
  lead_id: z.string().uuid(),
  tipo: z.enum(['WHATSAPP', 'EMAIL', 'LIGACAO', 'VISITA', 'NOTA', 'SMS', 'TELEGRAM']),
  direcao: z.enum(['ENTRADA', 'SAIDA']),
  conteudo: z.string().optional(),
  sentimento: z.enum(['POSITIVO', 'NEUTRO', 'NEGATIVO']).optional(),
  duracao_minutos: z.number().int().positive().optional()
})

// Schema para interação rápida (atalho)
const quickInteractionSchema = z.object({
  lead_id: z.string().uuid(),
  tipo: z.enum(['LIGACAO', 'WHATSAPP', 'VISITA', 'NOTA']),
  observacao: z.string().optional(),
  duracao_minutos: z.number().int().positive().optional()
})

export async function insightsRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authMiddleware)
  server.addHook('preHandler', tenantMiddleware)

  // ============================================
  // ENDPOINTS DE INSIGHTS
  // ============================================

  /**
   * GET /insights/meus
   * Busca insights personalizados para o corretor logado
   */
  server.get('/meus', async (request, reply) => {
    const tenantId = (request as any).tenantId
    const userId = (request as any).user?.id

    if (!userId) {
      return reply.status(401).send({ error: 'Usuário não autenticado' })
    }

    // Buscar corretor_id pelo user_id
    const corretor = await prisma.corretor.findFirst({
      where: {
        user_id: userId,
        tenant_id: tenantId
      }
    })

    if (!corretor) {
      // Se não é corretor, retornar insights do tenant (visão admin)
      const insights = await insightsService.gerarInsightsTenant(tenantId)
      return reply.send({ success: true, insights })
    }

    const insights = await insightsService.gerarInsightsCorretor(corretor.id, tenantId)
    return reply.send({ success: true, insights })
  })

  /**
   * GET /insights/tenant
   * Busca insights gerais do tenant (apenas ADMIN/GESTOR)
   */
  server.get('/tenant', async (request, reply) => {
    const tenantId = (request as any).tenantId
    const user = (request as any).user

    if (!user || !['ADMIN', 'GESTOR'].includes(user.tipo)) {
      return reply.status(403).send({ error: 'Acesso negado' })
    }

    const insights = await insightsService.gerarInsightsTenant(tenantId)
    return reply.send({ success: true, insights })
  })

  /**
   * GET /insights/corretor/:id
   * Busca insights de um corretor específico (ADMIN/GESTOR)
   */
  server.get('/corretor/:id', async (request, reply) => {
    const tenantId = (request as any).tenantId
    const user = (request as any).user
    const { id: corretorId } = request.params as { id: string }

    if (!user || !['ADMIN', 'GESTOR'].includes(user.tipo)) {
      return reply.status(403).send({ error: 'Acesso negado' })
    }

    const insights = await insightsService.gerarInsightsCorretor(corretorId, tenantId)
    return reply.send({ success: true, insights })
  })

  // ============================================
  // ENDPOINTS DE INTERAÇÕES
  // ============================================

  /**
   * POST /insights/interacoes
   * Registra uma nova interação com um lead
   */
  server.post('/interacoes', async (request, reply) => {
    const tenantId = (request as any).tenantId
    const userId = (request as any).user?.id

    try {
      const data = createInteractionSchema.parse(request.body)

      // Buscar corretor_id pelo user_id
      const corretor = await prisma.corretor.findFirst({
        where: {
          user_id: userId,
          tenant_id: tenantId
        }
      })

      const interaction = await interactionsService.registrar({
        ...data,
        tipo: data.tipo as TipoInteracao,
        direcao: data.direcao as DirecaoInteracao,
        sentimento: data.sentimento as SentimentoInteracao | undefined,
        corretor_id: corretor?.id
      }, tenantId)

      return reply.status(201).send({ success: true, data: interaction })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      return reply.status(400).send({ error: error.message })
    }
  })

  /**
   * POST /insights/interacoes/rapida
   * Registra uma interação de forma rápida (atalho)
   */
  server.post('/interacoes/rapida', async (request, reply) => {
    const tenantId = (request as any).tenantId
    const userId = (request as any).user?.id

    try {
      const data = quickInteractionSchema.parse(request.body)

      // Buscar corretor_id pelo user_id
      const corretor = await prisma.corretor.findFirst({
        where: {
          user_id: userId,
          tenant_id: tenantId
        }
      })

      if (!corretor) {
        return reply.status(400).send({ error: 'Usuário não é corretor' })
      }

      let interaction

      switch (data.tipo) {
        case 'LIGACAO':
          interaction = await interactionsService.registrarLigacao(
            data.lead_id,
            tenantId,
            corretor.id,
            data.duracao_minutos,
            data.observacao
          )
          break
        case 'WHATSAPP':
          interaction = await interactionsService.registrarWhatsApp(
            data.lead_id,
            tenantId,
            corretor.id,
            data.observacao
          )
          break
        case 'VISITA':
          interaction = await interactionsService.registrarVisita(
            data.lead_id,
            tenantId,
            corretor.id,
            data.observacao
          )
          break
        case 'NOTA':
          interaction = await interactionsService.registrarNota(
            data.lead_id,
            tenantId,
            corretor.id,
            data.observacao || ''
          )
          break
      }

      return reply.status(201).send({ success: true, data: interaction })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ error: 'Dados inválidos', details: error.errors })
      }
      return reply.status(400).send({ error: error.message })
    }
  })

  /**
   * GET /insights/interacoes/lead/:id
   * Lista interações de um lead específico
   */
  server.get('/interacoes/lead/:id', async (request, reply) => {
    const tenantId = (request as any).tenantId
    const { id: leadId } = request.params as { id: string }
    const { limit } = request.query as { limit?: string }

    const interacoes = await interactionsService.listarPorLead(
      leadId,
      tenantId,
      limit ? parseInt(limit) : 50
    )

    return reply.send({ success: true, data: interacoes })
  })

  /**
   * GET /insights/interacoes/minhas
   * Lista interações recentes do corretor logado
   */
  server.get('/interacoes/minhas', async (request, reply) => {
    const tenantId = (request as any).tenantId
    const userId = (request as any).user?.id
    const { limit } = request.query as { limit?: string }

    const corretor = await prisma.corretor.findFirst({
      where: {
        user_id: userId,
        tenant_id: tenantId
      }
    })

    if (!corretor) {
      return reply.status(400).send({ error: 'Usuário não é corretor' })
    }

    const interacoes = await interactionsService.listarPorCorretor(
      corretor.id,
      tenantId,
      limit ? parseInt(limit) : 50
    )

    return reply.send({ success: true, data: interacoes })
  })

  /**
   * GET /insights/interacoes/estatisticas
   * Estatísticas de interações do corretor logado
   */
  server.get('/interacoes/estatisticas', async (request, reply) => {
    const tenantId = (request as any).tenantId
    const userId = (request as any).user?.id
    const { dias } = request.query as { dias?: string }

    const corretor = await prisma.corretor.findFirst({
      where: {
        user_id: userId,
        tenant_id: tenantId
      }
    })

    if (!corretor) {
      return reply.status(400).send({ error: 'Usuário não é corretor' })
    }

    const stats = await interactionsService.estatisticas(
      corretor.id,
      tenantId,
      dias ? parseInt(dias) : 30
    )

    return reply.send({ success: true, data: stats })
  })
}
