import { FastifyRequest, FastifyReply } from 'fastify'
import { ProprietariosService } from './proprietarios.service'
import { 
  createProprietarioSchema, 
  updateProprietarioSchema,
  filterProprietariosSchema 
} from './proprietarios.schema'

export class ProprietariosController {
  constructor(private proprietariosService: ProprietariosService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    console.log('=== CREATE PROPRIETARIO REQUEST ===')
    console.log('Body recebido:', JSON.stringify(request.body, null, 2))
    console.log('Tenant ID:', tenantId)

    try {
      const data = createProprietarioSchema.parse(request.body)
      console.log('Dados após validação:', JSON.stringify(data, null, 2))

      const proprietario = await this.proprietariosService.create(data, tenantId)
      console.log('Proprietário criado:', JSON.stringify(proprietario, null, 2))

      return reply.status(201).send(proprietario)
    } catch (error) {
      console.error('ERRO AO CRIAR PROPRIETÁRIO:', error)
      throw error
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const filters = filterProprietariosSchema.parse(request.query)
    const result = await this.proprietariosService.findAll(filters, tenantId)
    return reply.send(result)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    const proprietario = await this.proprietariosService.findById(id, tenantId)
    return reply.send(proprietario)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    const data = updateProprietarioSchema.parse(request.body)
    const proprietario = await this.proprietariosService.update(id, data, tenantId)
    return reply.send(proprietario)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || 'default-tenant-id'
    const { id } = request.params as { id: string }
    await this.proprietariosService.delete(id, tenantId)
    return reply.status(204).send()
  }
}
