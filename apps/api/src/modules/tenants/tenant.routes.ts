import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { TenantController } from './tenant.controller'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'

export async function tenantRoutes(server: FastifyInstance) {
  const prisma = new PrismaClient()
  const controller = new TenantController(prisma)

  // Rota pública para criar tenant (signup)
  server.post('/tenants', controller.create.bind(controller))

  // Rota pública para buscar tenant por slug
  server.get('/tenants/slug/:slug', controller.findBySlug.bind(controller))

  // Rota pública para buscar tenant por subdomínio (usada pelo middleware Next.js)
  server.get('/tenants/by-subdomain/:subdomain', controller.findBySubdominio.bind(controller))

  // Rotas protegidas (requerem autenticação)
  server.get('/tenants/current', {
    preHandler: [authMiddleware, tenantMiddleware]
  }, controller.current.bind(controller))

  server.get('/tenants/:id', {
    preHandler: [authMiddleware]
  }, controller.findById.bind(controller))

  server.put('/tenants/:id', {
    preHandler: [authMiddleware]
  }, controller.update.bind(controller))

  server.get('/tenants', {
    preHandler: [authMiddleware]
  }, controller.list.bind(controller))
}
