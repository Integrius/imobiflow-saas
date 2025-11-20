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
    const data = createCorretorSchema.parse(request.body)
    const corretor = await this.corretoresService.create(data)
    return reply.status(201).send(corretor)
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listCorretoresSchema.parse(request.query)
    const result = await this.corretoresService.findAll(query)
    return reply.send(result)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const corretor = await this.corretoresService.findById(id)
    return reply.send(corretor)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = updateCorretorSchema.parse(request.body)
    const corretor = await this.corretoresService.update(id, data)
    return reply.send(corretor)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    await this.corretoresService.delete(id)
    return reply.status(204).send()
  }

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const stats = await this.corretoresService.getStats(id)
    return reply.send(stats)
  }
}
