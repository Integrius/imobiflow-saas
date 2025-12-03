import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { AuthService } from './auth.service'
import { registerSchema, loginSchema } from './auth.schema'

export class AuthController {
  private service: AuthService

  constructor(prisma: PrismaClient) {
    this.service = new AuthService(prisma)
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = request.tenantId || 'default-tenant-id'
      const data = registerSchema.parse(request.body)
      const result = await this.service.register(data, tenantId)
      return reply.status(201).send(result)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors
        })
      }
      return reply.status(error.statusCode || 400).send({
        error: error.message || 'Erro ao registrar usuário'
      })
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = request.tenantId || 'default-tenant-id'
      const data = loginSchema.parse(request.body)
      const result = await this.service.login(data, tenantId)
      return reply.status(200).send(result)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors
        })
      }
      return reply.status(error.statusCode || 401).send({
        error: error.message || 'Erro ao fazer login'
      })
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user.userId
      const result = await this.service.me(userId)
      return reply.send(result)
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({
        error: error.message || 'Erro ao buscar usuário'
      })
    }
  }

  async googleLogin(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = request.tenantId || 'default-tenant-id'
      const { credential } = request.body as { credential: string }

      if (!credential) {
        return reply.status(400).send({
          error: 'Credencial do Google não fornecida'
        })
      }

      const result = await this.service.googleLogin(credential, tenantId)
      return reply.status(200).send(result)
    } catch (error: any) {
      return reply.status(error.statusCode || 401).send({
        error: error.message || 'Erro ao fazer login com Google'
      })
    }
  }
}
