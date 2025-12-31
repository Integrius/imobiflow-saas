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
      const data = loginSchema.parse(request.body)

      // Extrair tenant_id do header X-Tenant-ID (opcional)
      const tenantId = (request.headers['x-tenant-id'] as string) || null

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
      const { credential } = request.body as { credential: string }

      if (!credential) {
        return reply.status(400).send({
          error: 'Credencial do Google não fornecida'
        })
      }

      // Extrair tenant_id do header X-Tenant-ID (opcional)
      const tenantId = (request.headers['x-tenant-id'] as string) || null

      const result = await this.service.googleLogin(credential, tenantId)
      return reply.status(200).send(result)
    } catch (error: any) {
      return reply.status(error.statusCode || 401).send({
        error: error.message || 'Erro ao fazer login com Google'
      })
    }
  }

  async definirSenhaPrimeiroAcesso(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user
      const { senha } = request.body as { senha: string }

      if (!senha || senha.length < 6) {
        return reply.status(400).send({
          error: 'Senha deve ter no mínimo 6 caracteres'
        })
      }

      const result = await this.service.definirSenhaPrimeiroAcesso(user.id, senha)
      return reply.status(200).send(result)
    } catch (error: any) {
      return reply.status(error.statusCode || 400).send({
        error: error.message || 'Erro ao definir senha'
      })
    }
  }
}
