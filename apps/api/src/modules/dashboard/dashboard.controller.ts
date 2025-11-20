import { FastifyRequest, FastifyReply } from 'fastify'
import { DashboardService } from './dashboard.service'
import { PrismaClient } from '@prisma/client'

export class DashboardController {
  private service: DashboardService

  constructor(prisma: PrismaClient) {
    this.service = new DashboardService(prisma)
  }

  async getOverview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { corretor_id, data_inicio, data_fim } = request.query as any
      
      const filters: any = {}
      if (corretor_id) filters.corretor_id = corretor_id
      if (data_inicio) filters.data_inicio = new Date(data_inicio)
      if (data_fim) filters.data_fim = new Date(data_fim)

      const overview = await this.service.getOverview(filters)
      return reply.send(overview)
    } catch (error) {
      throw error
    }
  }

  async getFunil(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { corretor_id, data_inicio, data_fim } = request.query as any
      
      const filters: any = {}
      if (corretor_id) filters.corretor_id = corretor_id
      if (data_inicio) filters.data_inicio = new Date(data_inicio)
      if (data_fim) filters.data_fim = new Date(data_fim)

      const funil = await this.service.getFunil(filters)
      return reply.send(funil)
    } catch (error) {
      throw error
    }
  }

  async getAtividades(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { limit } = request.query as any
      const atividades = await this.service.getAtividades(limit ? parseInt(limit) : 10)
      return reply.send(atividades)
    } catch (error) {
      throw error
    }
  }

  async getPerformanceCorretores(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { data_inicio, data_fim } = request.query as any
      
      const filters: any = {}
      if (data_inicio) filters.data_inicio = new Date(data_inicio)
      if (data_fim) filters.data_fim = new Date(data_fim)

      const performance = await this.service.getPerformanceCorretores(filters)
      return reply.send(performance)
    } catch (error) {
      throw error
    }
  }
}
