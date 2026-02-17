import { FastifyInstance } from 'fastify'
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { prisma } from '../../shared/database/prisma.service'
import { TenantController } from './tenant.controller'

export async function tenantRoutes(server: FastifyInstance) {
  const tenantController = new TenantController(prisma)

  /**
   * POST /api/v1/tenants
   * Cria um novo tenant (público - para registro)
   */
  server.post('/', async (request, reply) => {
    return tenantController.create(request, reply)
  })

  /**
   * GET /api/v1/tenants/slug/:slug
   * Verifica disponibilidade de slug (público)
   */
  server.get('/slug/:slug', async (request, reply) => {
    return tenantController.findBySlug(request, reply)
  })

  /**
   * GET /api/v1/tenants/by-subdomain/:subdomain
   *
   * Valida se um tenant existe pelo subdomínio
   * Endpoint público (sem autenticação) para validação de login
   */
  server.get(
    '/by-subdomain/:subdomain',
    async (request, reply) => {
      try {
        const { subdomain } = request.params as { subdomain: string }

        const tenant = await prisma.tenant.findUnique({
          where: { subdominio: subdomain },
          select: {
            id: true,
            nome: true,
            slug: true,
            subdominio: true,
            status: true
          }
        })

        if (!tenant) {
          return reply.status(404).send({
            error: 'Tenant não encontrado',
            message: `Imobiliária "${subdomain}" não foi encontrada`
          })
        }

        if (tenant.status !== 'ATIVO' && tenant.status !== 'TRIAL') {
          return reply.status(403).send({
            error: 'Tenant inativo',
            message: 'Esta imobiliária está temporariamente indisponível'
          })
        }

        return reply.send({
          id: tenant.id,
          nome: tenant.nome,
          slug: tenant.slug,
          subdominio: tenant.subdominio,
          status: tenant.status
        })
      } catch (error) {
        server.log.error({ error }, 'Erro ao validar tenant')
        return reply.status(500).send({ error: 'Erro ao validar tenant' })
      }
    }
  )

  /**
   * GET /api/v1/tenants/campanha-lancamento
   * Status da campanha de lançamento (público - para landing page)
   */
  server.get(
    '/campanha-lancamento',
    async (request, reply) => {
      try {
        // Campanha válida até 15/04/2026
        const CAMPANHA_FIM = new Date('2026-04-15T00:00:00-03:00')
        const campanhaExpirada = new Date() >= CAMPANHA_FIM

        const totalTenants = await prisma.tenant.count()
        const vagasTotal = 20
        const vagasRestantes = Math.max(0, vagasTotal - totalTenants)

        return reply.send({
          success: true,
          data: {
            ativa: vagasRestantes > 0 && !campanhaExpirada,
            vagas_total: vagasTotal,
            vagas_restantes: vagasRestantes,
            dias_gratis: 60,
            data_fim: CAMPANHA_FIM.toISOString()
          }
        })
      } catch (error) {
        server.log.error({ error }, 'Erro ao buscar status da campanha')
        return reply.status(500).send({ error: 'Erro ao buscar status da campanha' })
      }
    }
  )

  /**
   * GET /api/v1/tenants/trial-info
   * Informações do trial do tenant atual (requer autenticação)
   */
  server.get(
    '/trial-info',
    {
      preHandler: [tenantMiddleware, authMiddleware]
    },
    async (request, reply) => {
      try {
        const tenantId = (request as any).tenantId

        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: {
            status: true,
            data_expiracao: true,
            plano: true,
            configuracoes: true
          }
        })

        if (!tenant) {
          return reply.status(404).send({ error: 'Tenant não encontrado' })
        }

        const config = tenant.configuracoes as Record<string, any> | null
        const isCampanha = config?.campanha_lancamento === true

        // Se não está em trial, retornar sem informações
        if (tenant.status !== 'TRIAL') {
          return reply.send({
            isTrial: false,
            status: tenant.status,
            plano: tenant.plano,
            campanha_lancamento: isCampanha
          })
        }

        // Calcular dias restantes
        const now = new Date()
        const expirationDate = tenant.data_expiracao ? new Date(tenant.data_expiracao) : null

        let diasRestantes = 0
        if (expirationDate) {
          const diffTime = expirationDate.getTime() - now.getTime()
          diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        return reply.send({
          isTrial: true,
          status: tenant.status,
          plano: tenant.plano,
          data_expiracao: expirationDate,
          dias_restantes: diasRestantes > 0 ? diasRestantes : 0,
          expirado: diasRestantes <= 0,
          campanha_lancamento: isCampanha,
          trial_days: isCampanha ? 60 : 14
        })
      } catch (error) {
        server.log.error({ error }, 'Erro ao buscar informações do trial')
        return reply.status(500).send({ error: 'Erro ao buscar informações do trial' })
      }
    }
  )

  /**
   * GET /api/v1/tenants/:id
   * Busca tenant por ID (requer autenticação)
   */
  server.get('/:id', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    return tenantController.findById(request, reply)
  })

  /**
   * PATCH /api/v1/tenants/:id
   * Atualiza tenant (requer autenticação)
   */
  server.patch('/:id', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    return tenantController.update(request, reply)
  })

  /**
   * POST /api/v1/tenants/cancel
   * Cancela assinatura do tenant atual (requer autenticação de ADMIN)
   */
  server.post('/cancel', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    return tenantController.cancelAssinatura(request, reply)
  })
}
