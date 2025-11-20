import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import { authRoutes } from './modules/auth/auth.routes'
import { leadsRoutes } from './modules/leads/leads.routes'
import { corretoresRoutes } from './modules/corretores/corretores.routes'
import { imoveisRoutes } from './modules/imoveis/imoveis.routes'
import { proprietariosRoutes } from './modules/proprietarios/proprietarios.routes'
import { errorHandler } from './shared/middlewares/error.middleware'

const server = Fastify({
  logger: true
})

server.register(cors, {
  origin: true
})

server.register(helmet)

server.register(jwt, {
  secret: process.env.JWT_SECRET || 'seu-secret-super-seguro-aqui'
})

server.get('/health', async () => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }
})

server.register(authRoutes, { prefix: '/api/v1' })
server.register(leadsRoutes, { prefix: '/api/v1' })
server.register(corretoresRoutes, { prefix: '/api/v1' })
server.register(imoveisRoutes, { prefix: '/api/v1' })
server.register(proprietariosRoutes, { prefix: '/api/v1' })

server.setErrorHandler(errorHandler)

const start = async () => {
  try {
    await server.listen({ port: 3333, host: '0.0.0.0' })
    console.log('🚀 Server running on http://localhost:3333')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
