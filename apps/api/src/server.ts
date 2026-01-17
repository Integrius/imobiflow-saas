import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import multipart from '@fastify/multipart'
import { authRoutes } from './modules/auth/auth.routes'
import { tenantRoutes } from './modules/tenants/tenant.routes'
import { dataExportRoutes } from './modules/tenants/data-export.routes'
import { leadsRoutes } from './modules/leads/leads.routes'
import { corretoresRoutes } from './modules/corretores/corretores.routes'
import { proprietariosRoutes } from './modules/proprietarios/proprietarios.routes'
import { imoveisRoutes } from './modules/imoveis/imoveis.routes'
import { negociacoesRoutes } from './modules/negociacoes/negociacoes.routes'
import { dashboardRoutes } from './modules/dashboard/dashboard.routes'
import { aiRoutes } from './modules/ai/ai.routes'
import { whatsAppRoutes } from './modules/whatsapp/whatsapp.routes'
import { localidadesRoutes } from './modules/localidades/localidades.routes'
import { leadsCapturaRoutes } from './modules/leads/leads-captura.routes'
import { telegramRoutes } from './modules/telegram/telegram.routes'
import { agendamentosRoutes } from './modules/agendamentos/agendamentos.routes'
import { usersRoutes } from './modules/users/users.routes'
import { setupRoutes } from './modules/setup/setup.routes'
import { propostasRoutes } from './modules/propostas/propostas.routes'
import { adminRoutes } from './modules/admin/admin.routes'
import { activityLogsRoutes } from './modules/activity-logs/activity-logs.routes'
import { comissoesRoutes } from './modules/comissoes/comissoes.routes'
import { testRoutes } from './modules/test/test.routes'
import { insightsRoutes } from './modules/insights/insights.routes'
import { temperaturaAutoRoutes } from './modules/admin/temperatura-auto.routes'
import { dashboardGerencialRoutes } from './modules/dashboard/dashboard-gerencial.routes'
import { metasRoutes } from './modules/metas/metas.routes'
import { notificationsRoutes } from './modules/notifications/notifications.routes'

const server = Fastify({
  logger: true
})

server.register(cors, {
  origin: (origin, cb) => {
    // Permite qualquer origem em produção (temporário)
    cb(null, true)
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  credentials: true,
  exposedHeaders: ['Authorization']
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
server.register(tenantRoutes, { prefix: '/api/v1/tenants' })
server.register(dataExportRoutes, { prefix: '/api/v1' }) // Rotas de exportação de dados
server.register(leadsRoutes, { prefix: '/api/v1/leads' })
server.register(leadsCapturaRoutes, { prefix: '/api/v1/leads' }) // Rotas públicas de captura
server.register(corretoresRoutes, { prefix: '/api/v1/corretores' })
server.register(proprietariosRoutes, { prefix: '/api/v1/proprietarios' })
server.register(imoveisRoutes, { prefix: '/api/v1/imoveis' })
server.register(negociacoesRoutes, { prefix: '/api/v1/negociacoes' })
server.register(dashboardRoutes, { prefix: '/api/v1/dashboard' })
server.register(dashboardGerencialRoutes, { prefix: '/api/v1/dashboard-gerencial' }) // Dashboard gerencial (ADMIN/GESTOR)
server.register(aiRoutes, { prefix: '/api/v1/ai' })
server.register(whatsAppRoutes, { prefix: '/api/v1/whatsapp' })
server.register(localidadesRoutes, { prefix: '/api/v1/localidades' }) // Rotas públicas IBGE
server.register(telegramRoutes, { prefix: '/api/v1/telegram' }) // Rotas de notificações Telegram
server.register(agendamentosRoutes, { prefix: '/api/v1/agendamentos' }) // Rotas de agendamentos de visitas
server.register(propostasRoutes, { prefix: '/api/v1/propostas' }) // Rotas de propostas/ofertas
server.register(usersRoutes, { prefix: '/api/v1/users' }) // Rotas de gerenciamento de usuários
server.register(activityLogsRoutes, { prefix: '/api/v1/activity-logs' }) // Rotas de logs de atividades (apenas ADMIN)
server.register(adminRoutes, { prefix: '/api/v1/admin' }) // Rotas de administração geral (Vivoly)
server.register(comissoesRoutes, { prefix: '/api/v1/comissoes' }) // Rotas de cálculo de comissões
server.register(insightsRoutes, { prefix: '/api/v1/insights' }) // Rotas de insights Sofia IA e interações
server.register(temperaturaAutoRoutes, { prefix: '/api/v1/temperatura-auto' }) // Rotas de atualização automática de temperatura
server.register(metasRoutes, { prefix: '/api/v1/metas' }) // Rotas de metas de corretores
server.register(notificationsRoutes, { prefix: '/api/v1/notifications' }) // Rotas de notificações in-app
server.register(setupRoutes, { prefix: '/api/v1/setup' }) // ⚠️ SETUP INICIAL - Remover em produção!
server.register(testRoutes, { prefix: '/api/v1/test' }) // 🧪 ROTAS DE TESTE - Debug

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
