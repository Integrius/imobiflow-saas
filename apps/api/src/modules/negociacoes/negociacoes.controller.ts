import { FastifyRequest, FastifyReply } from 'fastify'
import { NegociacoesService } from './negociacoes.service'
import { PrismaClient } from '@prisma/client'
import {
  createNegociacaoSchema,
  updateNegociacaoSchema,
  changeStatusSchema,
  addComissaoSchema,
  addDocumentoSchema,
  listNegociacoesSchema,
} from './negociacoes.schema'
import { AppError } from '../../shared/errors/AppError'

export class NegociacoesController {
  private service: NegociacoesService

  constructor(prisma: PrismaClient) {
    this.service = new NegociacoesService(prisma)
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createNegociacaoSchema.parse(request.body)
      const negociacao = await this.service.create(data, request.prisma)
      return reply.status(201).send(negociacao)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message })
      }
      throw error
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = listNegociacoesSchema.parse(request.query)
      const result = await this.service.findAll(filters)
      return reply.send(result)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message })
      }
      throw error
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const negociacao = await this.service.findById(id)
      return reply.send(negociacao)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message })
      }
      throw error
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const data = updateNegociacaoSchema.parse(request.body)
      const negociacao = await this.service.update(id, data)
      return reply.send(negociacao)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message })
      }
      throw error
    }
  }

  async changeStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const data = changeStatusSchema.parse(request.body)
      const negociacao = await this.service.changeStatus(id, data, request.prisma)
      return reply.send(negociacao)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message })
      }
      throw error
    }
  }

  async addComissao(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const data = addComissaoSchema.parse(request.body)
      const negociacao = await this.service.addComissao(id, data, request.prisma)
      return reply.send(negociacao)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message })
      }
      throw error
    }
  }

  async addDocumento(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const data = addDocumentoSchema.parse(request.body)
      const negociacao = await this.service.addDocumento(id, data)
      return reply.send(negociacao)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message })
      }
      throw error
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      await this.service.delete(id, request.prisma)
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message })
      }
      throw error
    }
  }

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { corretor_id, data_inicio, data_fim } = request.query as any
      
      const filters: any = {}
      if (corretor_id) filters.corretor_id = corretor_id
      if (data_inicio) filters.data_inicio = new Date(data_inicio)
      if (data_fim) filters.data_fim = new Date(data_fim)

      const stats = await this.service.getStats(filters)
      return reply.send(stats)
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message })
      }
      throw error
    }
  }
}
