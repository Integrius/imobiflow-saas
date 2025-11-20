import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { ImoveisRepository } from './imoveis.repository'
import { ImoveisService } from './imoveis.service'
import { ImoveisController } from './imoveis.controller'

const prisma = new PrismaClient()
const repository = new ImoveisRepository(prisma)
const service = new ImoveisService(repository)
const controller = new ImoveisController(service)

export async function imoveisRoutes(server: FastifyInstance) {
  server.post('/imoveis', async (request, reply) => {
    return controller.create(request, reply)
  })

  server.get('/imoveis', async (request, reply) => {
    return controller.list(request, reply)
  })

  server.get('/imoveis/proximidade', async (request, reply) => {
    return controller.findByProximidade(request, reply)
  })

  server.get('/imoveis/:id', async (request, reply) => {
    return controller.getById(request, reply)
  })

  server.put('/imoveis/:id', async (request, reply) => {
    return controller.update(request, reply)
  })

  server.delete('/imoveis/:id', async (request, reply) => {
    return controller.delete(request, reply)
  })
}
