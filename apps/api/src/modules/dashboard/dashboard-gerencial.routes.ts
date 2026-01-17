/**
 * Dashboard Gerencial - Rotas
 *
 * Endpoints para ADMIN e GESTOR visualizarem métricas consolidadas do time.
 *
 * Acesso: ADMIN ou GESTOR do tenant
 */

import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { DashboardGerencialService } from './dashboard-gerencial.service'
import { prisma } from '../../shared/database/prisma.service'

export async function dashboardGerencialRoutes(server: FastifyInstance) {
  const service = new DashboardGerencialService(prisma)

  /**
   * Middleware para verificar se é ADMIN ou GESTOR
   */
  const requireManagerOrAdmin = async (request: any, reply: any) => {
    const user = request.user

    if (!user) {
      return reply.status(401).send({ error: 'Não autenticado' })
    }

    if (!['ADMIN', 'GESTOR'].includes(user.tipo)) {
      return reply.status(403).send({
        error: 'Acesso negado',
        message: 'Apenas ADMIN ou GESTOR podem acessar o dashboard gerencial'
      })
    }
  }

  /**
   * GET /api/v1/dashboard-gerencial
   *
   * Retorna dados completos do dashboard gerencial
   * Inclui: métricas do time, ranking, comparativo, alertas, tops
   */
  server.get(
    '/',
    {
      preHandler: [authMiddleware, requireManagerOrAdmin]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user.tenant_id
        const dados = await service.getDashboardCompleto(tenantId)

        return reply.send({
          success: true,
          data: dados
        })
      } catch (error: any) {
        server.log.error({ error }, 'Erro ao buscar dashboard gerencial')
        return reply.status(500).send({
          error: 'Erro ao buscar dashboard',
          message: error.message
        })
      }
    }
  )

  /**
   * GET /api/v1/dashboard-gerencial/metricas
   *
   * Retorna apenas métricas consolidadas do time
   */
  server.get(
    '/metricas',
    {
      preHandler: [authMiddleware, requireManagerOrAdmin]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user.tenant_id
        const metricas = await service.getMetricasTime(tenantId)

        return reply.send({
          success: true,
          data: metricas
        })
      } catch (error: any) {
        server.log.error({ error }, 'Erro ao buscar métricas do time')
        return reply.status(500).send({
          error: 'Erro ao buscar métricas',
          message: error.message
        })
      }
    }
  )

  /**
   * GET /api/v1/dashboard-gerencial/ranking
   *
   * Retorna ranking completo de corretores com métricas detalhadas
   */
  server.get(
    '/ranking',
    {
      preHandler: [authMiddleware, requireManagerOrAdmin]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user.tenant_id
        const ranking = await service.getRankingCorretores(tenantId)

        return reply.send({
          success: true,
          total: ranking.length,
          data: ranking
        })
      } catch (error: any) {
        server.log.error({ error }, 'Erro ao buscar ranking de corretores')
        return reply.status(500).send({
          error: 'Erro ao buscar ranking',
          message: error.message
        })
      }
    }
  )

  /**
   * GET /api/v1/dashboard-gerencial/comparativo
   *
   * Retorna comparativo dos últimos 3 meses
   */
  server.get(
    '/comparativo',
    {
      preHandler: [authMiddleware, requireManagerOrAdmin]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user.tenant_id
        const comparativo = await service.getComparativoPeriodos(tenantId)

        return reply.send({
          success: true,
          data: comparativo
        })
      } catch (error: any) {
        server.log.error({ error }, 'Erro ao buscar comparativo de períodos')
        return reply.status(500).send({
          error: 'Erro ao buscar comparativo',
          message: error.message
        })
      }
    }
  )

  /**
   * GET /api/v1/dashboard-gerencial/top/:metrica
   *
   * Retorna top 5 corretores por métrica específica
   * Métricas: fechamentos, leads, valor, conversao
   */
  server.get(
    '/top/:metrica',
    {
      preHandler: [authMiddleware, requireManagerOrAdmin]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user.tenant_id
        const { metrica } = request.params as { metrica: 'fechamentos' | 'leads' | 'valor' | 'conversao' }
        const query = request.query as { limit?: string }
        const limit = query.limit ? parseInt(query.limit) : 5

        const metricasValidas = ['fechamentos', 'leads', 'valor', 'conversao']
        if (!metricasValidas.includes(metrica)) {
          return reply.status(400).send({
            error: 'Métrica inválida',
            message: `Use uma das seguintes: ${metricasValidas.join(', ')}`
          })
        }

        const top = await service.getTopCorretores(tenantId, metrica, limit)

        return reply.send({
          success: true,
          metrica,
          data: top
        })
      } catch (error: any) {
        server.log.error({ error }, 'Erro ao buscar top corretores')
        return reply.status(500).send({
          error: 'Erro ao buscar top corretores',
          message: error.message
        })
      }
    }
  )

  /**
   * GET /api/v1/dashboard-gerencial/temperatura
   *
   * Retorna distribuição de leads por temperatura no time
   */
  server.get(
    '/temperatura',
    {
      preHandler: [authMiddleware, requireManagerOrAdmin]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user.tenant_id
        const distribuicao = await service.getDistribuicaoTemperaturaTime(tenantId)

        return reply.send({
          success: true,
          data: distribuicao
        })
      } catch (error: any) {
        server.log.error({ error }, 'Erro ao buscar distribuição de temperatura')
        return reply.status(500).send({
          error: 'Erro ao buscar distribuição',
          message: error.message
        })
      }
    }
  )

  /**
   * GET /api/v1/dashboard-gerencial/alertas
   *
   * Retorna alertas gerenciais
   */
  server.get(
    '/alertas',
    {
      preHandler: [authMiddleware, requireManagerOrAdmin]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user.tenant_id
        const alertas = await service.getAlertasGerenciais(tenantId)

        return reply.send({
          success: true,
          total: alertas.length,
          data: alertas
        })
      } catch (error: any) {
        server.log.error({ error }, 'Erro ao buscar alertas gerenciais')
        return reply.status(500).send({
          error: 'Erro ao buscar alertas',
          message: error.message
        })
      }
    }
  )
}
