import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { AuthController } from './auth.controller'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'

export async function authRoutes(server: FastifyInstance) {
  const prisma = new PrismaClient()
  const controller = new AuthController(prisma)

  server.post('/register', controller.register.bind(controller))
  server.post('/login', controller.login.bind(controller))
  server.post('/google', controller.googleLogin.bind(controller))

  server.get('/me', {
    preHandler: authMiddleware
  }, controller.me.bind(controller))
}
