import { FastifyRequest, FastifyReply } from 'fastify'
import { CorretoresService } from './corretores.service'
import {
  createCorretorSchema,
  updateCorretorSchema,
  listCorretoresSchema,
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
}
