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
    // Extrair tenantId fora do try/catch
    const tenantId = (request.headers['x-tenant-id'] as string) || null
    let data: any

    try {
      // Parse dos dados dentro do try/catch para capturar erros de validação
      data = loginSchema.parse(request.body)

      const result = await this.service.login(data, tenantId)

      // ✅ Setar cookie httpOnly com o token JWT
      reply.setCookie('token', result.token, {
        httpOnly: true,    // Não acessível por JavaScript (proteção XSS)
        secure: process.env.NODE_ENV === 'production',  // HTTPS apenas em produção
        sameSite: 'lax',   // Proteção CSRF
        path: '/',
        maxAge: 7 * 24 * 60 * 60  // 7 dias (mesmo tempo do JWT)
      })

      // ✅ Log de login bem-sucedido
      await ActivityLogService.logLogin(
        result.user.tenant_id,
        result.user.id,
        request,
        true
      )

      // Retornar dados do usuário (token ainda incluído para compatibilidade inicial)
      return reply.status(200).send(result)
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Dados inválidos',
          details: error.errors
        })
      }

      // ❌ Log de tentativa de login falha (se tiver tenant_id e dados parseados)
      if (tenantId && data && (error.statusCode === 401 || error.statusCode === 403)) {
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
      const userId = (request as any).user.id
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

      // ✅ Setar cookie httpOnly com o token JWT
      reply.setCookie('token', result.token, {
        httpOnly: true,    // Não acessível por JavaScript (proteção XSS)
        secure: process.env.NODE_ENV === 'production',  // HTTPS apenas em produção
        sameSite: 'lax',   // Proteção CSRF
        path: '/',
        maxAge: 7 * 24 * 60 * 60  // 7 dias (mesmo tempo do JWT)
      })

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

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user

      // ✅ Registrar log de logout
      await ActivityLogService.logLogout(
        user.tenant_id,
        user.id,
        request
      )

      // ✅ Limpar cookie httpOnly
      reply.clearCookie('token', { path: '/' })

      return reply.status(200).send({
        success: true,
        message: 'Logout realizado com sucesso'
      })
    } catch (error: any) {
      // Mesmo com erro, retorna sucesso (logout não deve falhar)
      console.error('Erro ao registrar logout:', error)

      // ✅ Limpar cookie mesmo em caso de erro
      reply.clearCookie('token', { path: '/' })

      return reply.status(200).send({
        success: true,
        message: 'Logout realizado'
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

      // ✅ Log de definição de senha no primeiro acesso
      await ActivityLogService.logSenhaAlterada(
        user.tenant_id,
        user.id,
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

  async alterarSenha(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user
      const { senha_atual, nova_senha } = request.body as { senha_atual: string; nova_senha: string }

      if (!senha_atual) {
        return reply.status(400).send({
          error: 'Senha atual é obrigatória'
        })
      }

      if (!nova_senha || nova_senha.length < 6) {
        return reply.status(400).send({
          error: 'Nova senha deve ter no mínimo 6 caracteres'
        })
      }

      const result = await this.service.alterarSenha(user.id, senha_atual, nova_senha)

      // ✅ Log de alteração de senha
      await ActivityLogService.logSenhaAlterada(
        user.tenant_id,
        user.id,
        'Alteração pelo usuário',
        request
      )

      return reply.status(200).send(result)
    } catch (error: any) {
      return reply.status(error.statusCode || 400).send({
        error: error.message || 'Erro ao alterar senha'
      })
    }
  }
}
