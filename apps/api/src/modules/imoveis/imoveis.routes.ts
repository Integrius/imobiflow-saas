import { FastifyInstance } from 'fastify'
import { ImoveisRepository } from './imoveis.repository'
import { ImoveisService } from './imoveis.service'
import { ImoveisController } from './imoveis.controller'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { requireMinRole } from '../../shared/middlewares/permissions.middleware'
import { prisma } from '../../shared/database/prisma.service'

const repository = new ImoveisRepository(prisma)
const service = new ImoveisService(repository)
const controller = new ImoveisController(service)

export async function imoveisRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authMiddleware)
  server.addHook('preHandler', tenantMiddleware)

  // Criar imóvel: apenas ADMIN e GESTOR
  server.post('/', {
    preHandler: [authMiddleware, tenantMiddleware, requireMinRole('GESTOR')]
  }, async (request, reply) => {
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

  // Deletar imóvel: apenas ADMIN e GESTOR
  server.delete('/:id', {
    preHandler: [authMiddleware, tenantMiddleware, requireMinRole('GESTOR')]
  }, async (request, reply) => {
    return controller.delete(request, reply)
  })

  // Upload de foto
  server.post('/:id/upload-foto', async (request, reply) => {
    return controller.uploadFoto(request, reply)
  })

  // Deletar foto
  server.delete('/:id/fotos/:fotoIndex', async (request, reply) => {
    return controller.deleteFoto(request, reply)
  })

  // Reordenar fotos
  server.put('/:id/reorder-fotos', async (request, reply) => {
    return controller.reorderFotos(request, reply)
  })

  // Trocar corretor responsável: apenas ADMIN e GESTOR
  server.put('/:id/corretor', {
    preHandler: [authMiddleware, tenantMiddleware, requireMinRole('GESTOR')]
  }, async (request, reply) => {
    return controller.changeCorretor(request, reply)
  })
}
