import { FastifyRequest, FastifyReply } from 'fastify'
import { CorretoresService } from './corretores.service'
import {
  createCorretorSchema,
  updateCorretorSchema,
  listCorretoresSchema,
  bulkUpdateStatusSchema,
  bulkResendCredentialsSchema,
} from './corretores.schema'

export class CorretoresController {
  constructor(private corretoresService: CorretoresService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const data = createCorretorSchema.parse(request.body)
    const corretor = await this.corretoresService.create(data, tenantId)
    return reply.status(201).send(corretor)
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const query = listCorretoresSchema.parse(request.query)
    const result = await this.corretoresService.findAll(query, tenantId)
    return reply.send(result)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    const corretor = await this.corretoresService.findById(id, tenantId)
    return reply.send(corretor)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    const data = updateCorretorSchema.parse(request.body)
    const corretor = await this.corretoresService.update(id, data, tenantId)
    return reply.send(corretor)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    await this.corretoresService.delete(id, tenantId)
    return reply.status(204).send()
  }

  async getImoveis(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    const imoveis = await this.corretoresService.getImoveis(id, tenantId)
    return reply.send(imoveis)
  }

  async bulkUpdateStatus(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const data = bulkUpdateStatusSchema.parse(request.body)
    const result = await this.corretoresService.bulkUpdateStatus(
      data.corretor_ids,
      data.status,
      data.ativo,
      tenantId
    )
    return reply.send(result)
  }

  async bulkResendCredentials(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const data = bulkResendCredentialsSchema.parse(request.body)
    const result = await this.corretoresService.bulkResendCredentials(
      data.corretor_ids,
      tenantId
    )
    return reply.send(result)
  }

  /**
   * GET /corretores/:id/dashboard
   * Busca métricas de dashboard para um corretor específico
   * Acesso: ADMIN ou GESTOR podem ver qualquer corretor
   */
  async getCorretorDashboard(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    const result = await this.corretoresService.getCorretorDashboard(id, tenantId)
    return reply.send({ success: true, data: result })
  }

  /**
   * GET /corretores/meu-dashboard
   * Busca métricas de dashboard para o corretor logado
   * Acesso: CORRETOR vê apenas o próprio dashboard
   */
  async getMeuDashboard(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const userId = (request as any).user?.id

    if (!userId) {
      return reply.status(401).send({ error: 'Usuário não autenticado' })
    }

    const result = await this.corretoresService.getMeuDashboard(userId, tenantId)
    return reply.send({ success: true, data: result })
  }
}
