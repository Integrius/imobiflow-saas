import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { notificationsService } from './notifications.service'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { NotificationType } from '@prisma/client'

const getNotificationsQuerySchema = z.object({
  is_read: z.enum(['true', 'false']).optional().transform(v => v === 'true' ? true : v === 'false' ? false : undefined),
  type: z.nativeEnum(NotificationType).optional(),
  limit: z.string().optional().transform(v => v ? parseInt(v) : 20),
  offset: z.string().optional().transform(v => v ? parseInt(v) : 0)
})

export async function notificationsRoutes(server: FastifyInstance) {
  /**
   * GET /api/v1/notifications
   * Listar notificações do usuário autenticado
   */
  server.get(
    '/',
    {
      preHandler: [authMiddleware]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const userId = request.user!.id
        const query = getNotificationsQuerySchema.parse(request.query)

        const result = await notificationsService.getByUser({
          tenantId,
          userId,
          isRead: query.is_read,
          type: query.type,
          limit: query.limit,
          offset: query.offset
        })

        return reply.send({
          success: true,
          data: result.notifications,
          total: result.total,
          unreadCount: result.unreadCount
        })
      } catch (error: any) {
        console.error('Erro ao buscar notificações:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao buscar notificações'
        })
      }
    }
  )

  /**
   * GET /api/v1/notifications/unread-count
   * Contar notificações não lidas
   */
  server.get(
    '/unread-count',
    {
      preHandler: [authMiddleware]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const userId = request.user!.id

        const count = await notificationsService.getUnreadCount(tenantId, userId)

        return reply.send({
          success: true,
          unreadCount: count
        })
      } catch (error: any) {
        console.error('Erro ao contar notificações:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao contar notificações'
        })
      }
    }
  )

  /**
   * PATCH /api/v1/notifications/:id/read
   * Marcar notificação como lida
   */
  server.patch(
    '/:id/read',
    {
      preHandler: [authMiddleware]
    },
    async (request, reply) => {
      try {
        const userId = request.user!.id
        const { id } = request.params as { id: string }

        const success = await notificationsService.markAsRead(id, userId)

        if (!success) {
          return reply.status(404).send({
            success: false,
            error: 'Notificação não encontrada'
          })
        }

        return reply.send({
          success: true,
          message: 'Notificação marcada como lida'
        })
      } catch (error: any) {
        console.error('Erro ao marcar notificação como lida:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao marcar notificação como lida'
        })
      }
    }
  )

  /**
   * PATCH /api/v1/notifications/read-all
   * Marcar todas as notificações como lidas
   */
  server.patch(
    '/read-all',
    {
      preHandler: [authMiddleware]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const userId = request.user!.id

        const count = await notificationsService.markAllAsRead(tenantId, userId)

        return reply.send({
          success: true,
          message: `${count} notificações marcadas como lidas`
        })
      } catch (error: any) {
        console.error('Erro ao marcar todas notificações como lidas:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao marcar notificações como lidas'
        })
      }
    }
  )

  /**
   * DELETE /api/v1/notifications/:id
   * Deletar uma notificação
   */
  server.delete(
    '/:id',
    {
      preHandler: [authMiddleware]
    },
    async (request, reply) => {
      try {
        const userId = request.user!.id
        const { id } = request.params as { id: string }

        const success = await notificationsService.delete(id, userId)

        if (!success) {
          return reply.status(404).send({
            success: false,
            error: 'Notificação não encontrada'
          })
        }

        return reply.send({
          success: true,
          message: 'Notificação deletada'
        })
      } catch (error: any) {
        console.error('Erro ao deletar notificação:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao deletar notificação'
        })
      }
    }
  )
}
