import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { NegociacoesController } from './negociacoes.controller'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'

export async function negociacoesRoutes(server: FastifyInstance) {
  const prisma = new PrismaClient()
  const controller = new NegociacoesController(prisma)

  // Aplicar middleware de autenticação em todas as rotas
  server.addHook('preHandler', authMiddleware)

  // CRUD básico
  server.post('/', controller.create.bind(controller))
  server.get('/', controller.findAll.bind(controller))
  server.get('/:id', controller.findById.bind(controller))
  server.put('/:id', controller.update.bind(controller))
  server.delete('/:id', controller.delete.bind(controller))

  // Rotas especiais
  server.post('/:id/timeline', controller.addTimelineEvent.bind(controller))
  server.post('/:id/comissoes', controller.addComissao.bind(controller))
  server.get('/pipeline/status', controller.getPipeline.bind(controller))
  server.get('/corretor/:corretor_id', controller.getByCorretor.bind(controller))
}
