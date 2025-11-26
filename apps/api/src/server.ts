import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { authRoutes } from './modules/auth/auth.routes'
import { leadsRoutes } from './modules/leads/leads.routes'
import { corretoresRoutes } from './modules/corretores/corretores.routes'
import { proprietariosRoutes } from './modules/proprietarios/proprietarios.routes'
import { imoveisRoutes } from './modules/imoveis/imoveis.routes'
import { negociacoesRoutes } from './modules/negociacoes/negociacoes.routes'
import { dashboardRoutes } from './modules/dashboard/dashboard.routes'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const server = Fastify({
  logger: true
})

server.register(cors, {
  origin: true
})

server.register(helmet)

// Health check
server.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ImobiFlow API',
    version: '1.0.0'
  }
})

// TEMPORARY: Seed endpoint - REMOVER APÓS USO
server.post('/seed', async (request, reply) => {
  try {
    // Criar usuário admin
    const senhaHashAdmin = await hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@imobiflow.com' },
      update: {},
      create: {
        nome: 'Administrador',
        email: 'admin@imobiflow.com',
        senha_hash: senhaHashAdmin,
        tipo: 'ADMIN',
      },
    })

    // Criar corretor 1
    const senhaHashCorretor1 = await hash('corretor123', 10)
    const userCorretor1 = await prisma.user.upsert({
      where: { email: 'joao@imobiflow.com' },
      update: {},
      create: {
        nome: 'João Silva',
        email: 'joao@imobiflow.com',
        senha_hash: senhaHashCorretor1,
        tipo: 'CORRETOR',
        corretor: {
          create: {
            creci: 'CRECI-12345',
            telefone: '11999999999',
            especializacoes: ['APARTAMENTO', 'CASA'],
            meta_mensal: 50000,
            comissao_padrao: 3.5,
          },
        },
      },
    })

    // Criar corretor 2
    const senhaHashCorretor2 = await hash('corretor123', 10)
    const userCorretor2 = await prisma.user.upsert({
      where: { email: 'maria@imobiflow.com' },
      update: {},
      create: {
        nome: 'Maria Santos',
        email: 'maria@imobiflow.com',
        senha_hash: senhaHashCorretor2,
        tipo: 'CORRETOR',
        corretor: {
          create: {
            creci: 'CRECI-67890',
            telefone: '11988888888',
            especializacoes: ['COMERCIAL', 'TERRENO'],
            meta_mensal: 75000,
            comissao_padrao: 4.0,
          },
        },
      },
    })

    return {
      success: true,
      message: 'Banco de dados populado com sucesso!',
      users: [
        { email: admin.email, tipo: 'ADMIN' },
        { email: userCorretor1.email, tipo: 'CORRETOR' },
        { email: userCorretor2.email, tipo: 'CORRETOR' },
      ]
    }
  } catch (error: any) {
    reply.status(500)
    return {
      success: false,
      message: 'Erro ao popular banco de dados',
      error: error.message
    }
  }
})

// Rotas da API
server.register(authRoutes, { prefix: '/api/v1/auth' })
server.register(leadsRoutes, { prefix: '/api/v1/leads' })
server.register(corretoresRoutes, { prefix: '/api/v1/corretores' })
server.register(proprietariosRoutes, { prefix: '/api/v1/proprietarios' })
server.register(imoveisRoutes, { prefix: '/api/v1/imoveis' })
server.register(negociacoesRoutes, { prefix: '/api/v1/negociacoes' })
server.register(dashboardRoutes, { prefix: '/api/v1/dashboard' })

const start = async () => {
  try {
    await server.listen({ port: 3333, host: '0.0.0.0' })
    console.log('🚀 Server running on http://localhost:3333')
    console.log('📊 Dashboard API: http://localhost:3333/api/v1/dashboard')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
