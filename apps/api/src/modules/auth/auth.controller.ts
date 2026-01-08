import { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { AuthService } from './auth.service'
import { registerSchema, loginSchema } from './auth.schema'
import { ActivityLogService } from '../../shared/services/activity-log.service'

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

      // ✅ Log de login bem-sucedido
      await ActivityLogService.logLogin(
        result.user.tenant_id,
        result.user.id,
        request,
        true
      )

      return reply.status(200).send(result)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors
        })
      }

      // ❌ Log de tentativa de login falha (se tiver tenant_id)
      if (tenantId && (error.statusCode === 401 || error.statusCode === 403)) {
        try {
          // Tentar logar falha mesmo sem user_id (não temos pois login falhou)
          await ActivityLogService.log({
            tenant_id: tenantId,
            tipo: 'LOGIN_FALHOU' as any,
            acao: `Tentativa de login falhou para email: ${data.email}`,
            detalhes: { email: data.email },
            request,
          })
        } catch {
          // Ignorar erro ao logar
        }
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

      // ✅ Log de login via Google bem-sucedido
      await ActivityLogService.logLogin(
        result.user.tenant_id,
        result.user.id,
        request,
        true
      )

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

      const result = await this.service.definirSenhaPrimeiroAcesso(user.userId, senha)

      // ✅ Log de definição de senha no primeiro acesso
      await ActivityLogService.logSenhaAlterada(
        user.tenantId,
        user.userId,
        'Primeiro acesso',
        request
      )

      return reply.status(200).send(result)
    } catch (error: any) {
      return reply.status(error.statusCode || 400).send({
        error: error.message || 'Erro ao definir senha'
      })
    }
  }
}
