import { FastifyInstance } from 'fastify'
import { DashboardController } from './dashboard.controller'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'

export async function dashboardRoutes(server: FastifyInstance) {
  const controller = new DashboardController(server.prisma)

  // Todas as rotas requerem autenticação
  server.addHook('preHandler', authMiddleware)

  // Overview geral (resumo, financeiro, distribuição, top corretores)
  server.get('/overview', async (request, reply) => {
    return controller.getOverview(request, reply)
  })

  // Funil de vendas
  server.get('/funil', async (request, reply) => {
    return controller.getFunil(request, reply)
  })

  // Últimas atividades
  server.get('/atividades', async (request, reply) => {
    return controller.getAtividades(request, reply)
  })

  // Performance de corretores
  server.get('/performance-corretores', async (request, reply) => {
    return controller.getPerformanceCorretores(request, reply)
  })
}
