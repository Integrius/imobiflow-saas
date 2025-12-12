import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { DashboardController } from './dashboard.controller'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'

export async function dashboardRoutes(server: FastifyInstance) {
  const prisma = new PrismaClient()
  const controller = new DashboardController(prisma)

  // Aplicar middleware de autenticação
  server.addHook('preHandler', authMiddleware)

  // Rotas de dashboard
  server.get('/overview', controller.getOverview.bind(controller))
  server.get('/leads/origem', controller.getLeadsByOrigem.bind(controller))
  server.get('/leads/temperatura', controller.getLeadsByTemperatura.bind(controller))
  server.get('/negociacoes/status', controller.getNegociacoesByStatus.bind(controller))
  server.get('/imoveis/tipo', controller.getImoveisByTipo.bind(controller))
  server.get('/imoveis/categoria', controller.getImoveisByCategoria.bind(controller))
  server.get('/corretores/performance', controller.getPerformanceCorretores.bind(controller))
  server.get('/funil', controller.getFunilVendas.bind(controller))
  server.get('/activity', controller.getRecentActivity.bind(controller))
  server.get('/valores', controller.getValorMedioNegociacoes.bind(controller))
  server.get('/charts', controller.getChartsData.bind(controller))
}
