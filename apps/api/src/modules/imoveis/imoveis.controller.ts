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
    const data = createImovelSchema.parse(request.body)
    const imovel = await this.imoveisService.create(data)
    return reply.status(201).send(imovel)
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const filters = filterImoveisSchema.parse(request.query)
    const result = await this.imoveisService.findAll(filters)
    return reply.send(result)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const imovel = await this.imoveisService.findById(id)
    return reply.send(imovel)
  }

  async findByProximidade(request: FastifyRequest, reply: FastifyReply) {
    const data = proximidadeSchema.parse(request.query)
    const imoveis = await this.imoveisService.findByProximidade(data)
    return reply.send(imoveis)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = updateImovelSchema.parse(request.body)
    const imovel = await this.imoveisService.update(id, data)
    return reply.send(imovel)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    await this.imoveisService.delete(id)
    return reply.status(204).send()
  }
}
