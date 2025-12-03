import { FastifyRequest, FastifyReply } from 'fastify'
import { ImoveisService } from './imoveis.service'
import { 
  createImovelSchema, 
  updateImovelSchema,
  filterImoveisSchema,
  proximidadeSchema
} from './imoveis.schema'

export class ImoveisController {
  constructor(private imoveisService: ImoveisService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const data = createImovelSchema.parse(request.body)
    const imovel = await this.imoveisService.create(data, tenantId)
    return reply.status(201).send(imovel)
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const filters = filterImoveisSchema.parse(request.query)
    const result = await this.imoveisService.findAll(filters, tenantId)
    return reply.send(result)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    const imovel = await this.imoveisService.findById(id, tenantId)
    return reply.send(imovel)
  }

  async findByProximidade(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const data = proximidadeSchema.parse(request.query)
    const imoveis = await this.imoveisService.findByProximidade(data, tenantId)
    return reply.send(imoveis)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    const data = updateImovelSchema.parse(request.body)
    const imovel = await this.imoveisService.update(id, data, tenantId)
    return reply.send(imovel)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    await this.imoveisService.delete(id, tenantId)
    return reply.status(204).send()
  }
}
