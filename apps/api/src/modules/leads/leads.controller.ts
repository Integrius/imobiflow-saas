import { FastifyRequest, FastifyReply } from 'fastify'
import { LeadsService } from './leads.service'
import {
  createLeadSchema,
  updateLeadSchema,
  listLeadsSchema,
  addTimelineEventSchema,
} from './leads.schema'

export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const data = createLeadSchema.parse(request.body)
    const lead = await this.leadsService.create(data, tenantId)
    return reply.status(201).send(lead)
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const query = listLeadsSchema.parse(request.query)
    const result = await this.leadsService.findAll(query, tenantId)
    return reply.send(result)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    const lead = await this.leadsService.findById(id, tenantId)
    return reply.send(lead)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    const data = updateLeadSchema.parse(request.body)
    const lead = await this.leadsService.update(id, data, tenantId)
    return reply.send(lead)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    await this.leadsService.delete(id, tenantId)
    return reply.status(204).send()
  }

  async assignCorretor(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    const { corretor_id } = request.body as { corretor_id: string }

    if (!corretor_id) {
      return reply.status(400).send({ error: 'corretor_id é obrigatório' })
    }

    const lead = await this.leadsService.assignCorretor(id, corretor_id, tenantId)
    return reply.send(lead)
  }

  async addTimelineEvent(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    const event = addTimelineEventSchema.parse(request.body)
    const lead = await this.leadsService.addTimelineEvent(id, event, tenantId)
    return reply.send(lead)
  }

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const stats = await this.leadsService.getStats(tenantId)
    return reply.send(stats)
  }
}
