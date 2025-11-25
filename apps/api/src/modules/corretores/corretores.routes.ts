import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { CorretoresRepository } from './corretores.repository'
import { CorretoresService } from './corretores.service'
import { CorretoresController } from './corretores.controller'

const prisma = new PrismaClient()
const repository = new CorretoresRepository(prisma)
const service = new CorretoresService(repository)
const controller = new CorretoresController(service)

export async function corretoresRoutes(server: FastifyInstance) {
  server.post('/corretores', async (request, reply) => {
    return controller.create(request, reply)
  })

  server.get('/corretores', async (request, reply) => {
    return controller.list(request, reply)
  })

  server.get('/corretores/:id', async (request, reply) => {
    return controller.getById(request, reply)
  })

  // TODO: Implement performance endpoint
  // server.get('/corretores/:id/performance', async (request, reply) => {
  //   return controller.getPerformance(request, reply)
  // })

  server.put('/corretores/:id', async (request, reply) => {
    return controller.update(request, reply)
  })

  server.delete('/corretores/:id', async (request, reply) => {
    return controller.delete(request, reply)
  })
}
