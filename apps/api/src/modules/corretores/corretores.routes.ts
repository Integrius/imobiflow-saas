import { FastifyInstance } from 'fastify'
import { CorretoresRepository } from './corretores.repository'
import { CorretoresService } from './corretores.service'
import { CorretoresController } from './corretores.controller'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { prisma } from '../../shared/database/prisma.service'

const repository = new CorretoresRepository(prisma)
const service = new CorretoresService(repository)
const controller = new CorretoresController(service)

export async function corretoresRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authMiddleware)
  server.addHook('preHandler', tenantMiddleware)

  server.post('/', async (request, reply) => {
    return controller.create(request, reply)
  })

  server.get('/', async (request, reply) => {
    return controller.list(request, reply)
  })

  server.get('/:id', async (request, reply) => {
    return controller.getById(request, reply)
  })

  server.get('/:id/imoveis', async (request, reply) => {
    return controller.getImoveis(request, reply)
  })

  // TODO: Implement performance endpoint
  // server.get('/:id/performance', async (request, reply) => {
  //   return controller.getPerformance(request, reply)
  // })

  server.put('/:id', async (request, reply) => {
    return controller.update(request, reply)
  })

  server.delete('/:id', async (request, reply) => {
    return controller.delete(request, reply)
  })
}
