import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { DashboardService } from './dashboard.service'

export class DashboardController {
  private service: DashboardService

  constructor(prisma: PrismaClient) {
    this.service = new DashboardService(prisma)
  }

  async getOverview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).user.tenantId
      const overview = await this.service.getOverview(tenantId)
      return reply.send(overview)
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Erro ao buscar overview do dashboard'
      })
    }
  }

  async getLeadsByOrigem(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).user.tenantId
      const data = await this.service.getLeadsByOrigem(tenantId)
      return reply.send(data)
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Erro ao buscar leads por origem'
      })
    }
  }

  async getLeadsByTemperatura(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).user.tenantId
      const data = await this.service.getLeadsByTemperatura(tenantId)
      return reply.send(data)
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Erro ao buscar leads por temperatura'
      })
    }
  }

  async getNegociacoesByStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).user.tenantId
      const data = await this.service.getNegociacoesByStatus(tenantId)
      return reply.send(data)
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Erro ao buscar negociações por status'
      })
    }
  }

  async getImoveisByTipo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).user.tenantId
      const data = await this.service.getImoveisByTipo(tenantId)
      return reply.send(data)
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Erro ao buscar imóveis por tipo'
      })
    }
  }

  async getImoveisByCategoria(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).user.tenantId
      const data = await this.service.getImoveisByCategoria(tenantId)
      return reply.send(data)
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Erro ao buscar imóveis por categoria'
      })
    }
  }

  async getPerformanceCorretores(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).user.tenantId
      const data = await this.service.getPerformanceCorretores(tenantId)
      return reply.send(data)
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Erro ao buscar performance dos corretores'
      })
    }
  }

  async getFunilVendas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).user.tenantId
      const data = await this.service.getFunilVendas(tenantId)
      return reply.send(data)
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Erro ao buscar funil de vendas'
      })
    }
  }

  async getRecentActivity(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).user.tenantId
      const { limit } = request.query as { limit?: string }
      const data = await this.service.getRecentActivity(tenantId, limit ? parseInt(limit) : 10)
      return reply.send(data)
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Erro ao buscar atividades recentes'
      })
    }
  }

  async getValorMedioNegociacoes(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).user.tenantId
      const data = await this.service.getValorMedioNegociacoes(tenantId)
      return reply.send(data)
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Erro ao buscar valor médio de negociações'
      })
    }
  }

  async getChartsData(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).user.tenantId
      const data = await this.service.getChartsData(tenantId)
      return reply.send(data)
    } catch (error: any) {
      console.error('Erro ao buscar dados históricos:', error)
      return reply.status(500).send({
        error: 'Erro ao buscar dados históricos para gráficos'
      })
    }
  }
}
