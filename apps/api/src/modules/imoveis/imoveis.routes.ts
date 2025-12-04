import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { ImoveisRepository } from './imoveis.repository'
import { ImoveisService } from './imoveis.service'
import { ImoveisController } from './imoveis.controller'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'

const prisma = new PrismaClient()
const repository = new ImoveisRepository(prisma)
const service = new ImoveisService(repository)
const controller = new ImoveisController(service)

export async function imoveisRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authMiddleware)
  server.addHook('preHandler', tenantMiddleware)

  server.post('/', async (request, reply) => {
    return controller.create(request, reply)
  })

  server.get('/', async (request, reply) => {
    return controller.list(request, reply)
  })

  server.get('/proximidade', async (request, reply) => {
    return controller.findByProximidade(request, reply)
  })

  server.get('/:id', async (request, reply) => {
    return controller.getById(request, reply)
  })

  server.put('/:id', async (request, reply) => {
    return controller.update(request, reply)
  })

  server.delete('/:id', async (request, reply) => {
    return controller.delete(request, reply)
  })
}
