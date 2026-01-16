import { FastifyInstance } from 'fastify'
import { AuthController } from './auth.controller'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { prisma } from '../../shared/database/prisma.service'
import { passwordResetRoutes } from './password-reset.routes'

export async function authRoutes(server: FastifyInstance) {
  const controller = new AuthController(prisma)

  // Rotas públicas (register precisa de tenant, login/google são opcionais)
  server.post('/register', {
    preHandler: tenantMiddleware
  }, controller.register.bind(controller))

  // Login e Google OAuth funcionam COM ou SEM tenant
  // Se tiver tenant (subdomínio), valida
  // Se não tiver, busca o tenant do usuário
  server.post('/login', controller.login.bind(controller))

  server.post('/google', controller.googleLogin.bind(controller))

  // Rota protegida (me) precisa de auth + tenant
  server.get('/me', {
    preHandler: authMiddleware
  }, controller.me.bind(controller))

  // Rota de logout (registra log de atividade)
  server.post('/logout', {
    preHandler: authMiddleware
  }, controller.logout.bind(controller))

  // Rota para definir senha no primeiro acesso
  server.post('/primeiro-acesso', {
    preHandler: authMiddleware
  }, controller.definirSenhaPrimeiroAcesso.bind(controller))

  // Alias para /primeiro-acesso (usado pelo frontend em /set-password)
  server.post('/set-password', {
    preHandler: authMiddleware
  }, controller.definirSenhaPrimeiroAcesso.bind(controller))

  // Rotas de recuperação de senha
  await passwordResetRoutes(server)
}
