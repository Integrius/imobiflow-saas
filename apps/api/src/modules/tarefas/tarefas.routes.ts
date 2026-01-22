import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { tarefasService } from './tarefas.service'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'

const createTarefaSchema = z.object({
  lead_id: z.string().uuid().optional(),
  corretor_id: z.string().uuid().optional(),
  titulo: z.string().min(1, 'Titulo obrigatorio'),
  descricao: z.string().optional(),
  tipo: z.enum(['FOLLOW_UP', 'LIGACAO', 'EMAIL', 'WHATSAPP', 'VISITA', 'DOCUMENTO', 'REUNIAO', 'OUTRO']).optional(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
  data_vencimento: z.string().optional().transform(v => v ? new Date(v) : undefined),
  data_lembrete: z.string().optional().transform(v => v ? new Date(v) : undefined),
  recorrente: z.boolean().optional(),
  tipo_recorrencia: z.enum(['DIARIA', 'SEMANAL', 'QUINZENAL', 'MENSAL']).optional()
})

const updateTarefaSchema = z.object({
  titulo: z.string().min(1).optional(),
  descricao: z.string().optional(),
  tipo: z.enum(['FOLLOW_UP', 'LIGACAO', 'EMAIL', 'WHATSAPP', 'VISITA', 'DOCUMENTO', 'REUNIAO', 'OUTRO']).optional(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
  status: z.enum(['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA', 'ATRASADA']).optional(),
  data_vencimento: z.string().optional().transform(v => v ? new Date(v) : undefined),
  data_lembrete: z.string().optional().transform(v => v ? new Date(v) : undefined),
  lead_id: z.string().uuid().nullable().optional(),
  corretor_id: z.string().uuid().nullable().optional()
})

const listTarefasSchema = z.object({
  page: z.string().optional().transform(v => v ? parseInt(v) : 1),
  limit: z.string().optional().transform(v => v ? parseInt(v) : 20),
  status: z.string().optional(),
  tipo: z.string().optional(),
  prioridade: z.string().optional(),
  user_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  corretor_id: z.string().uuid().optional(),
  data_inicio: z.string().optional().transform(v => v ? new Date(v) : undefined),
  data_fim: z.string().optional().transform(v => v ? new Date(v) : undefined)
})

const concluirTarefaSchema = z.object({
  observacao: z.string().optional()
})

export async function tarefasRoutes(server: FastifyInstance) {
  /**
   * GET /api/v1/tarefas
   * Listar tarefas com filtros
   */
  server.get(
    '/',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const userId = request.user!.id
        const userType = request.user!.tipo
        const query = listTarefasSchema.parse(request.query)

        const result = await tarefasService.findAll(query, tenantId, userId, userType)

        return reply.send({
          success: true,
          ...result
        })
      } catch (error: any) {
        console.error('Erro ao listar tarefas:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao listar tarefas'
        })
      }
    }
  )

  /**
   * GET /api/v1/tarefas/pendentes
   * Listar tarefas pendentes do usuario (para widget)
   */
  server.get(
    '/pendentes',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const userId = request.user!.id

        const tarefas = await tarefasService.findPendentes(userId, tenantId)

        return reply.send({
          success: true,
          data: tarefas
        })
      } catch (error: any) {
        console.error('Erro ao listar tarefas pendentes:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao listar tarefas pendentes'
        })
      }
    }
  )

  /**
   * GET /api/v1/tarefas/hoje
   * Listar tarefas vencendo hoje
   */
  server.get(
    '/hoje',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const userId = request.user!.id

        const tarefas = await tarefasService.findVencendoHoje(userId, tenantId)

        return reply.send({
          success: true,
          data: tarefas
        })
      } catch (error: any) {
        console.error('Erro ao listar tarefas de hoje:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao listar tarefas de hoje'
        })
      }
    }
  )

  /**
   * GET /api/v1/tarefas/atrasadas
   * Listar tarefas atrasadas
   */
  server.get(
    '/atrasadas',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const userId = request.user!.id

        const tarefas = await tarefasService.findAtrasadas(userId, tenantId)

        return reply.send({
          success: true,
          data: tarefas
        })
      } catch (error: any) {
        console.error('Erro ao listar tarefas atrasadas:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao listar tarefas atrasadas'
        })
      }
    }
  )

  /**
   * GET /api/v1/tarefas/stats
   * Estatisticas de tarefas do usuario
   */
  server.get(
    '/stats',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const userId = request.user!.id

        const stats = await tarefasService.getStats(userId, tenantId)

        return reply.send({
          success: true,
          data: stats
        })
      } catch (error: any) {
        console.error('Erro ao buscar estatisticas:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao buscar estatisticas'
        })
      }
    }
  )

  /**
   * GET /api/v1/tarefas/:id
   * Buscar tarefa por ID
   */
  server.get(
    '/:id',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const { id } = request.params as { id: string }

        const tarefa = await tarefasService.findById(id, tenantId)

        if (!tarefa) {
          return reply.status(404).send({
            success: false,
            error: 'Tarefa nao encontrada'
          })
        }

        return reply.send({
          success: true,
          data: tarefa
        })
      } catch (error: any) {
        console.error('Erro ao buscar tarefa:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao buscar tarefa'
        })
      }
    }
  )

  /**
   * POST /api/v1/tarefas
   * Criar nova tarefa
   */
  server.post(
    '/',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const userId = request.user!.id
        const data = createTarefaSchema.parse(request.body)

        const tarefa = await tarefasService.create({
          ...data,
          user_id: userId
        }, tenantId)

        return reply.status(201).send({
          success: true,
          data: tarefa
        })
      } catch (error: any) {
        console.error('Erro ao criar tarefa:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao criar tarefa'
        })
      }
    }
  )

  /**
   * PATCH /api/v1/tarefas/:id
   * Atualizar tarefa
   */
  server.patch(
    '/:id',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const { id } = request.params as { id: string }
        const data = updateTarefaSchema.parse(request.body)

        // Verificar se tarefa existe
        const tarefaExistente = await tarefasService.findById(id, tenantId)
        if (!tarefaExistente) {
          return reply.status(404).send({
            success: false,
            error: 'Tarefa nao encontrada'
          })
        }

        const tarefa = await tarefasService.update(id, data, tenantId)

        return reply.send({
          success: true,
          data: tarefa
        })
      } catch (error: any) {
        console.error('Erro ao atualizar tarefa:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao atualizar tarefa'
        })
      }
    }
  )

  /**
   * POST /api/v1/tarefas/:id/concluir
   * Concluir tarefa
   */
  server.post(
    '/:id/concluir',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const { id } = request.params as { id: string }
        const { observacao } = concluirTarefaSchema.parse(request.body || {})

        // Verificar se tarefa existe
        const tarefaExistente = await tarefasService.findById(id, tenantId)
        if (!tarefaExistente) {
          return reply.status(404).send({
            success: false,
            error: 'Tarefa nao encontrada'
          })
        }

        const tarefa = await tarefasService.concluir(id, observacao, tenantId)

        return reply.send({
          success: true,
          data: tarefa,
          message: 'Tarefa concluida com sucesso'
        })
      } catch (error: any) {
        console.error('Erro ao concluir tarefa:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao concluir tarefa'
        })
      }
    }
  )

  /**
   * POST /api/v1/tarefas/:id/cancelar
   * Cancelar tarefa
   */
  server.post(
    '/:id/cancelar',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const { id } = request.params as { id: string }

        // Verificar se tarefa existe
        const tarefaExistente = await tarefasService.findById(id, tenantId)
        if (!tarefaExistente) {
          return reply.status(404).send({
            success: false,
            error: 'Tarefa nao encontrada'
          })
        }

        const tarefa = await tarefasService.cancelar(id, tenantId)

        return reply.send({
          success: true,
          data: tarefa,
          message: 'Tarefa cancelada'
        })
      } catch (error: any) {
        console.error('Erro ao cancelar tarefa:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao cancelar tarefa'
        })
      }
    }
  )

  /**
   * DELETE /api/v1/tarefas/:id
   * Deletar tarefa
   */
  server.delete(
    '/:id',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const { id } = request.params as { id: string }

        // Verificar se tarefa existe
        const tarefaExistente = await tarefasService.findById(id, tenantId)
        if (!tarefaExistente) {
          return reply.status(404).send({
            success: false,
            error: 'Tarefa nao encontrada'
          })
        }

        await tarefasService.delete(id, tenantId)

        return reply.send({
          success: true,
          message: 'Tarefa deletada'
        })
      } catch (error: any) {
        console.error('Erro ao deletar tarefa:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao deletar tarefa'
        })
      }
    }
  )
}
