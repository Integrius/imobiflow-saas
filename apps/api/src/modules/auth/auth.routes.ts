import { FastifyInstance } from 'fastify'
import { AuthController } from './auth.controller'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { prisma } from '../../shared/database/prisma.service'

export async function authRoutes(server: FastifyInstance) {
  const controller = new AuthController(prisma)

  // Rotas públicas (register, login, google) precisam do tenantMiddleware
  server.post('/register', {
    preHandler: tenantMiddleware
  }, controller.register.bind(controller))

  server.post('/login', {
    preHandler: tenantMiddleware
  }, controller.login.bind(controller))

  server.post('/google', {
    preHandler: tenantMiddleware
  }, controller.googleLogin.bind(controller))

  // Rota protegida (me) precisa de auth + tenant
  server.get('/me', {
    preHandler: authMiddleware
  }, controller.me.bind(controller))
}
