import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { ProprietariosRepository } from './proprietarios.repository'
import { ProprietariosService } from './proprietarios.service'
import { ProprietariosController } from './proprietarios.controller'

const prisma = new PrismaClient()
const repository = new ProprietariosRepository(prisma)
const service = new ProprietariosService(repository)
const controller = new ProprietariosController(service)

export async function proprietariosRoutes(server: FastifyInstance) {
  server.post('/proprietarios', async (request, reply) => {
    return controller.create(request, reply)
  })

  server.get('/proprietarios', async (request, reply) => {
    return controller.list(request, reply)
  })

  server.get('/proprietarios/:id', async (request, reply) => {
    return controller.getById(request, reply)
  })

  server.put('/proprietarios/:id', async (request, reply) => {
    return controller.update(request, reply)
  })

  server.delete('/proprietarios/:id', async (request, reply) => {
    return controller.delete(request, reply)
  })
}
