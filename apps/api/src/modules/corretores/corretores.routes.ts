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

  /**
   * GET /corretores/meu-dashboard
   * Dashboard do corretor logado - acesso CORRETOR e ADMIN
   * IMPORTANTE: Esta rota deve vir ANTES de /:id para não conflitar
   */
  server.get('/meu-dashboard', async (request, reply) => {
    const user = (request as any).user
    // Apenas CORRETOR e ADMIN podem acessar
    if (!user || !['CORRETOR', 'ADMIN'].includes(user.tipo)) {
      return reply.status(403).send({
        error: 'Acesso negado',
        message: 'Apenas corretores e administradores podem acessar o dashboard'
      })
    }
    return controller.getMeuDashboard(request, reply)
  })

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

  /**
   * GET /corretores/:id/dashboard
   * Dashboard de um corretor específico - acesso ADMIN apenas
   */
  server.get('/:id/dashboard', async (request, reply) => {
    const user = (request as any).user
    // Apenas ADMIN pode ver dashboard de qualquer corretor
    if (!user || user.tipo !== 'ADMIN') {
      return reply.status(403).send({
        error: 'Acesso negado',
        message: 'Apenas administradores podem acessar o dashboard de outros corretores'
      })
    }
    return controller.getCorretorDashboard(request, reply)
  })

  server.put('/:id', async (request, reply) => {
    return controller.update(request, reply)
  })

  server.delete('/:id', async (request, reply) => {
    return controller.delete(request, reply)
  })

  // Bulk operations
  server.patch('/bulk-status', async (request, reply) => {
    return controller.bulkUpdateStatus(request, reply)
  })

  server.post('/bulk-resend-credentials', async (request, reply) => {
    return controller.bulkResendCredentials(request, reply)
  })
}
