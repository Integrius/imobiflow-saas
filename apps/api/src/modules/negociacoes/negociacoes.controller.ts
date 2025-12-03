import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { NegociacoesService } from './negociacoes.service'
import {
  createNegociacaoSchema,
  updateNegociacaoSchema,
  queryNegociacoesSchema,
  addTimelineEventSchema,
  addComissaoSchema
} from './negociacoes.schema'

export class NegociacoesController {
  private service: NegociacoesService

  constructor(prisma: PrismaClient) {
    this.service = new NegociacoesService(prisma)
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || 'default-tenant-id'
      const data = createNegociacaoSchema.parse(request.body)
      const negociacao = await this.service.create(data, tenantId)
      return reply.status(201).send(negociacao)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors
        })
      }
      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao criar negociação'
      })
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || 'default-tenant-id'
      const query = queryNegociacoesSchema.parse(request.query)
      const result = await this.service.findAll(query, tenantId)
      return reply.send(result)
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao buscar negociações'
      })
    }
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || 'default-tenant-id'
      const { id } = request.params as { id: string }
      const negociacao = await this.service.findById(id, tenantId)
      return reply.send(negociacao)
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao buscar negociação'
      })
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || 'default-tenant-id'
      const { id } = request.params as { id: string }
      const data = updateNegociacaoSchema.parse(request.body)
      const negociacao = await this.service.update(id, data, tenantId)
      return reply.send(negociacao)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors
        })
      }
      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao atualizar negociação'
      })
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || 'default-tenant-id'
      const { id } = request.params as { id: string }
      await this.service.delete(id, tenantId)
      return reply.status(204).send()
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao excluir negociação'
      })
    }
  }

  async addTimelineEvent(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || 'default-tenant-id'
      const { id } = request.params as { id: string }
      const evento = addTimelineEventSchema.parse(request.body)
      const negociacao = await this.service.addTimelineEvent(id, evento, tenantId)
      return reply.send(negociacao)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors
        })
      }
      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao adicionar evento'
      })
    }
  }

  async addComissao(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || 'default-tenant-id'
      const { id } = request.params as { id: string }
      const comissao = addComissaoSchema.parse(request.body)
      const negociacao = await this.service.addComissao(id, comissao, tenantId)
      return reply.send(negociacao)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors
        })
      }
      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao adicionar comissão'
      })
    }
  }

  async getPipeline(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || 'default-tenant-id'
      const pipeline = await this.service.getPipeline(tenantId)
      return reply.send(pipeline)
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Erro ao buscar pipeline'
      })
    }
  }

  async getByCorretor(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || 'default-tenant-id'
      const { corretor_id } = request.params as { corretor_id: string }
      const negociacoes = await this.service.getByCorretor(corretor_id, tenantId)
      return reply.send(negociacoes)
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Erro ao buscar negociações do corretor'
      })
    }
  }
}
