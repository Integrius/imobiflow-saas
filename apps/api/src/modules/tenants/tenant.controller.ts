import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { TenantService } from './tenant.service'
import { createTenantSchema, updateTenantSchema } from './tenant.schema'
import { AppError } from '../../shared/errors/AppError'

export class TenantController {
  private service: TenantService

  constructor(private prisma: PrismaClient) {
    this.service = new TenantService(prisma)
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createTenantSchema.parse(request.body)
      const tenant = await this.service.create(data)

      return reply.status(201).send(tenant)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors
        })
      }

      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao criar tenant'
      })
    }
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const tenant = await this.service.findById(id)

      return reply.send(tenant)
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao buscar tenant'
      })
    }
  }

  async findBySlug(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { slug } = request.params as { slug: string }
      const tenant = await this.service.findBySlug(slug)

      return reply.send(tenant)
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao buscar tenant'
      })
    }
  }

  async findBySubdominio(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { subdomain } = request.params as { subdomain: string }
      const tenant = await this.service.findBySubdominio(subdomain)

      return reply.send(tenant)
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao buscar tenant por subdomínio'
      })
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const data = updateTenantSchema.parse(request.body)
      const tenant = await this.service.update(id, data)

      return reply.send(tenant)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors
        })
      }

      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao atualizar tenant'
      })
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { status, plano, search } = request.query as {
        status?: string
        plano?: string
        search?: string
      }

      const tenants = await this.service.list({ status, plano, search })

      return reply.send(tenants)
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao listar tenants'
      })
    }
  }

  async current(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = request.tenantId

      if (!tenantId) {
        throw new AppError('Tenant não identificado', 401)
      }

      const tenant = await this.service.findById(tenantId)

      return reply.send(tenant)
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao buscar tenant atual'
      })
    }
  }

  async cancelAssinatura(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user
      const { motivo } = request.body as { motivo: string }

      // Verificar se é ADMIN
      if (user.tipo !== 'ADMIN') {
        throw new AppError('Apenas administradores podem cancelar a assinatura', 403)
      }

      if (!motivo || !motivo.trim()) {
        throw new AppError('Motivo do cancelamento é obrigatório', 400)
      }

      const result = await this.service.cancelAssinatura(user.tenantId, user.userId, motivo.trim(), request)

      return reply.send({
        success: true,
        message: 'Assinatura cancelada com sucesso',
        ...result
      })
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao cancelar assinatura'
      })
    }
  }
}
