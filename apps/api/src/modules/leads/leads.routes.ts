import { FastifyInstance } from 'fastify'
import { LeadsController } from './leads.controller'
import { LeadsService } from './leads.service'
import { LeadsRepository } from './leads.repository'
import { prisma } from '../../shared/database/prisma'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'

export async function leadsRoutes(server: FastifyInstance) {
  const leadsRepository = new LeadsRepository(prisma)
  const leadsService = new LeadsService(leadsRepository)
  const leadsController = new LeadsController(leadsService)

  server.addHook('onRequest', authMiddleware)
  server.addHook('onRequest', tenantMiddleware)

  server.get('/stats', async (request, reply) => {
    return await leadsController.getStats(request, reply)
  })

  server.post('/', async (request, reply) => {
    return await leadsController.create(request, reply)
  })

  server.get('/', async (request, reply) => {
    return await leadsController.list(request, reply)
  })

  server.get('/:id', async (request, reply) => {
    return await leadsController.getById(request, reply)
  })

  server.put('/:id', async (request, reply) => {
    return await leadsController.update(request, reply)
  })

  server.delete('/:id', async (request, reply) => {
    return await leadsController.delete(request, reply)
  })

  server.post('/:id/assign', async (request, reply) => {
    return await leadsController.assignCorretor(request, reply)
  })

  server.post('/:id/timeline', async (request, reply) => {
    return await leadsController.addTimelineEvent(request, reply)
  })
}
