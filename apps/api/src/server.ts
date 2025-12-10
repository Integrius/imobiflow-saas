import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import multipart from '@fastify/multipart'
import { authRoutes } from './modules/auth/auth.routes'
import { tenantRoutes } from './modules/tenants/tenant.routes'
import { leadsRoutes } from './modules/leads/leads.routes'
import { corretoresRoutes } from './modules/corretores/corretores.routes'
import { proprietariosRoutes } from './modules/proprietarios/proprietarios.routes'
import { imoveisRoutes } from './modules/imoveis/imoveis.routes'
import { negociacoesRoutes } from './modules/negociacoes/negociacoes.routes'
import { dashboardRoutes } from './modules/dashboard/dashboard.routes'

const server = Fastify({
  logger: true
})

server.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
})

server.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
})

// Multipart para upload de arquivos
server.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
})

// Health check
server.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ImobiFlow API',
    version: '1.0.0'
  }
})

// Rotas da API
server.register(authRoutes, { prefix: '/api/v1/auth' })
server.register(tenantRoutes, { prefix: '/api/v1' })
server.register(leadsRoutes, { prefix: '/api/v1/leads' })
server.register(corretoresRoutes, { prefix: '/api/v1/corretores' })
server.register(proprietariosRoutes, { prefix: '/api/v1/proprietarios' })
server.register(imoveisRoutes, { prefix: '/api/v1/imoveis' })
server.register(negociacoesRoutes, { prefix: '/api/v1/negociacoes' })
server.register(dashboardRoutes, { prefix: '/api/v1/dashboard' })

const start = async () => {
  try {
    const PORT = Number(process.env.PORT) || 3333
    await server.listen({ port: PORT, host: '0.0.0.0' })
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📊 Dashboard API: http://localhost:${PORT}/api/v1/dashboard`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
