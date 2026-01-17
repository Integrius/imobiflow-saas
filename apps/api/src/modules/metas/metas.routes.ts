import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { metasService } from './metas.service'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { requireManager } from '../../shared/middlewares/permissions.middleware'

const createMetaSchema = z.object({
  corretor_id: z.string().uuid(),
  mes: z.number().min(1).max(12),
  ano: z.number().min(2020).max(2100),
  meta_leads: z.number().min(0).optional(),
  meta_visitas: z.number().min(0).optional(),
  meta_propostas: z.number().min(0).optional(),
  meta_fechamentos: z.number().min(0).optional(),
  meta_valor: z.number().min(0).optional(),
  observacoes: z.string().optional()
})

const updateMetaSchema = z.object({
  meta_leads: z.number().min(0).optional(),
  meta_visitas: z.number().min(0).optional(),
  meta_propostas: z.number().min(0).optional(),
  meta_fechamentos: z.number().min(0).optional(),
  meta_valor: z.number().min(0).optional(),
  observacoes: z.string().optional(),
  status: z.enum(['EM_ANDAMENTO', 'ATINGIDA', 'NAO_ATINGIDA', 'CANCELADA']).optional()
})

const criarLoteSchema = z.object({
  mes: z.number().min(1).max(12),
  ano: z.number().min(2020).max(2100),
  meta_padrao: z.object({
    meta_leads: z.number().min(0).optional(),
    meta_visitas: z.number().min(0).optional(),
    meta_propostas: z.number().min(0).optional(),
    meta_fechamentos: z.number().min(0).optional(),
    meta_valor: z.number().min(0).optional()
  })
})

export async function metasRoutes(server: FastifyInstance) {
  /**
   * GET /api/v1/metas
   * Lista metas do tenant (ADMIN/GESTOR)
   */
  server.get(
    '/',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const query = request.query as {
          corretor_id?: string
          mes?: string
          ano?: string
          status?: string
        }

        const filtros = {
          corretor_id: query.corretor_id,
          mes: query.mes ? parseInt(query.mes) : undefined,
          ano: query.ano ? parseInt(query.ano) : undefined,
          status: query.status
        }

        const metas = await metasService.listar(tenantId, filtros)

        return reply.send({
          success: true,
          total: metas.length,
          data: metas
        })
      } catch (error: any) {
        console.error('Erro ao listar metas:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao listar metas'
        })
      }
    }
  )

  /**
   * GET /api/v1/metas/resumo
   * Resumo mensal de metas (ADMIN/GESTOR)
   */
  server.get(
    '/resumo',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const query = request.query as { mes?: string; ano?: string }

        const mes = query.mes ? parseInt(query.mes) : undefined
        const ano = query.ano ? parseInt(query.ano) : undefined

        const resumo = await metasService.resumoMensal(tenantId, mes, ano)

        return reply.send({
          success: true,
          data: resumo
        })
      } catch (error: any) {
        console.error('Erro ao buscar resumo de metas:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao buscar resumo'
        })
      }
    }
  )

  /**
   * GET /api/v1/metas/minha-meta
   * Buscar meta atual do corretor logado (CORRETOR)
   */
  server.get(
    '/minha-meta',
    {
      preHandler: [authMiddleware]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const userId = request.user!.id

        // Buscar corretor pelo user_id
        const { prisma } = await import('../../shared/database/prisma')
        const corretor = await prisma.corretor.findFirst({
          where: {
            tenant_id: tenantId,
            user_id: userId
          }
        })

        if (!corretor) {
          return reply.status(404).send({
            success: false,
            error: 'Corretor não encontrado para este usuário'
          })
        }

        const meta = await metasService.buscarMetaAtual(corretor.id, tenantId)

        if (!meta) {
          return reply.send({
            success: true,
            data: null,
            message: 'Nenhuma meta definida para o mês atual'
          })
        }

        // Atualizar progresso antes de retornar
        const metaAtualizada = await metasService.atualizarProgresso(meta.id, tenantId)

        return reply.send({
          success: true,
          data: metaAtualizada
        })
      } catch (error: any) {
        console.error('Erro ao buscar meta do corretor:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao buscar meta'
        })
      }
    }
  )

  /**
   * GET /api/v1/metas/:id
   * Buscar meta por ID (ADMIN/GESTOR)
   */
  server.get(
    '/:id',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const { id } = request.params as { id: string }

        const meta = await metasService.buscarPorId(id, tenantId)

        return reply.send({
          success: true,
          data: meta
        })
      } catch (error: any) {
        console.error('Erro ao buscar meta:', error)
        const status = error.message === 'Meta não encontrada' ? 404 : 500
        return reply.status(status).send({
          success: false,
          error: error.message || 'Erro ao buscar meta'
        })
      }
    }
  )

  /**
   * POST /api/v1/metas
   * Criar nova meta (ADMIN/GESTOR)
   */
  server.post(
    '/',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const userId = request.user!.id
        const data = createMetaSchema.parse(request.body)

        const meta = await metasService.criar({
          tenant_id: tenantId,
          corretor_id: data.corretor_id,
          mes: data.mes,
          ano: data.ano,
          meta_leads: data.meta_leads,
          meta_visitas: data.meta_visitas,
          meta_propostas: data.meta_propostas,
          meta_fechamentos: data.meta_fechamentos,
          meta_valor: data.meta_valor,
          observacoes: data.observacoes,
          criado_por_id: userId
        })

        return reply.status(201).send({
          success: true,
          message: 'Meta criada com sucesso',
          data: meta
        })
      } catch (error: any) {
        console.error('Erro ao criar meta:', error)

        if (error.name === 'ZodError') {
          return reply.status(400).send({
            success: false,
            error: 'Dados inválidos',
            details: error.errors
          })
        }

        const status = error.message.includes('Já existe') ? 409 : 500
        return reply.status(status).send({
          success: false,
          error: error.message || 'Erro ao criar meta'
        })
      }
    }
  )

  /**
   * POST /api/v1/metas/lote
   * Criar metas em lote para todos os corretores (ADMIN/GESTOR)
   */
  server.post(
    '/lote',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const userId = request.user!.id
        const data = criarLoteSchema.parse(request.body)

        const resultado = await metasService.criarMetasEmLote(
          tenantId,
          data.mes,
          data.ano,
          data.meta_padrao,
          userId
        )

        return reply.status(201).send({
          success: true,
          message: `Metas criadas em lote: ${resultado.criadas} criadas, ${resultado.ignoradas} ignoradas`,
          data: resultado
        })
      } catch (error: any) {
        console.error('Erro ao criar metas em lote:', error)

        if (error.name === 'ZodError') {
          return reply.status(400).send({
            success: false,
            error: 'Dados inválidos',
            details: error.errors
          })
        }

        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao criar metas em lote'
        })
      }
    }
  )

  /**
   * PATCH /api/v1/metas/:id
   * Atualizar meta (ADMIN/GESTOR)
   */
  server.patch(
    '/:id',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const { id } = request.params as { id: string }
        const data = updateMetaSchema.parse(request.body)

        const meta = await metasService.atualizar(id, tenantId, data)

        return reply.send({
          success: true,
          message: 'Meta atualizada com sucesso',
          data: meta
        })
      } catch (error: any) {
        console.error('Erro ao atualizar meta:', error)

        if (error.name === 'ZodError') {
          return reply.status(400).send({
            success: false,
            error: 'Dados inválidos',
            details: error.errors
          })
        }

        const status = error.message === 'Meta não encontrada' ? 404 : 500
        return reply.status(status).send({
          success: false,
          error: error.message || 'Erro ao atualizar meta'
        })
      }
    }
  )

  /**
   * DELETE /api/v1/metas/:id
   * Deletar meta (ADMIN/GESTOR)
   */
  server.delete(
    '/:id',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const { id } = request.params as { id: string }

        await metasService.deletar(id, tenantId)

        return reply.send({
          success: true,
          message: 'Meta deletada com sucesso'
        })
      } catch (error: any) {
        console.error('Erro ao deletar meta:', error)
        const status = error.message === 'Meta não encontrada' ? 404 : 500
        return reply.status(status).send({
          success: false,
          error: error.message || 'Erro ao deletar meta'
        })
      }
    }
  )

  /**
   * POST /api/v1/metas/:id/atualizar-progresso
   * Recalcular progresso de uma meta (ADMIN/GESTOR)
   */
  server.post(
    '/:id/atualizar-progresso',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const { id } = request.params as { id: string }

        const meta = await metasService.atualizarProgresso(id, tenantId)

        return reply.send({
          success: true,
          message: 'Progresso atualizado com sucesso',
          data: meta
        })
      } catch (error: any) {
        console.error('Erro ao atualizar progresso:', error)
        const status = error.message === 'Meta não encontrada' ? 404 : 500
        return reply.status(status).send({
          success: false,
          error: error.message || 'Erro ao atualizar progresso'
        })
      }
    }
  )

  /**
   * POST /api/v1/metas/atualizar-progresso-mensal
   * Recalcular progresso de todas as metas do mês (ADMIN/GESTOR)
   */
  server.post(
    '/atualizar-progresso-mensal',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id

        const metas = await metasService.atualizarProgressoMensal(tenantId)

        return reply.send({
          success: true,
          message: `Progresso atualizado para ${metas.length} metas`,
          data: metas
        })
      } catch (error: any) {
        console.error('Erro ao atualizar progresso mensal:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao atualizar progresso mensal'
        })
      }
    }
  )
}
