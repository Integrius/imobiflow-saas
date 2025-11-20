import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { PrismaClient } from '@prisma/client'
import { authRoutes } from './modules/auth/auth.routes'
import { leadsRoutes } from './modules/leads/leads.routes'
import { corretoresRoutes } from './modules/corretores/corretores.routes'
import { imoveisRoutes } from './modules/imoveis/imoveis.routes'
import { proprietariosRoutes } from './modules/proprietarios/proprietarios.routes'
import { negociacoesRoutes } from './modules/negociacoes/negociacoes.routes'
import { dashboardRoutes } from './modules/dashboard/dashboard.routes'
import { errorHandler } from './shared/middlewares/error.middleware'

const prisma = new PrismaClient()

const server = Fastify({
  logger: true
})

// Adicionar Prisma ao contexto do Fastify
server.decorate('prisma', prisma)

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
  interface FastifyRequest {
    prisma: PrismaClient
    user?: {
      userId: string
      email: string
    }
  }
}

// Adicionar Prisma ao request
server.addHook('preHandler', async (request) => {
  request.prisma = prisma
})

// Plugins
server.register(cors)
server.register(helmet)

// Health check
server.get('/health', async () => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  }
})

// Rotas
server.register(authRoutes, { prefix: '/api/v1/auth' })
server.register(leadsRoutes, { prefix: '/api/v1/leads' })
server.register(corretoresRoutes, { prefix: '/api/v1/corretores' })
server.register(imoveisRoutes, { prefix: '/api/v1/imoveis' })
server.register(proprietariosRoutes, { prefix: '/api/v1/proprietarios' })
server.register(negociacoesRoutes, { prefix: '/api/v1/negociacoes' })
server.register(dashboardRoutes, { prefix: '/api/v1/dashboard' })

// Error handler
server.setErrorHandler(errorHandler)

const start = async () => {
  try {
    await server.listen({ port: 3333, host: '0.0.0.0' })
    console.log('🚀 Server running on http://localhost:3333')
    console.log('📊 Health check: http://localhost:3333/health')
    console.log('')
    console.log('📍 Available endpoints:')
    console.log('   POST   /api/v1/auth/login')
    console.log('   POST   /api/v1/auth/register')
    console.log('   GET    /api/v1/leads')
    console.log('   GET    /api/v1/corretores')
    console.log('   GET    /api/v1/imoveis')
    console.log('   GET    /api/v1/proprietarios')
    console.log('   GET    /api/v1/negociacoes')
    console.log('   GET    /api/v1/dashboard/overview')
    console.log('   GET    /api/v1/dashboard/funil')
  } catch (err) {
    server.log.error(err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

start()
