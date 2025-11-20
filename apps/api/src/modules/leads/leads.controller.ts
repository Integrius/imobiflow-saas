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
    const data = createLeadSchema.parse(request.body)
    const lead = await this.leadsService.create(data)
    return reply.status(201).send(lead)
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listLeadsSchema.parse(request.query)
    const result = await this.leadsService.findAll(query)
    return reply.send(result)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const lead = await this.leadsService.findById(id)
    return reply.send(lead)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = updateLeadSchema.parse(request.body)
    const lead = await this.leadsService.update(id, data)
    return reply.send(lead)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    await this.leadsService.delete(id)
    return reply.status(204).send()
  }

  async assignCorretor(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const { corretor_id } = request.body as { corretor_id: string }
    
    if (!corretor_id) {
      return reply.status(400).send({ error: 'corretor_id é obrigatório' })
    }

    const lead = await this.leadsService.assignCorretor(id, corretor_id)
    return reply.send(lead)
  }

  async addTimelineEvent(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const event = addTimelineEventSchema.parse(request.body)
    const lead = await this.leadsService.addTimelineEvent(id, event)
    return reply.send(lead)
  }

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    const stats = await this.leadsService.getStats()
    return reply.send(stats)
  }
}
