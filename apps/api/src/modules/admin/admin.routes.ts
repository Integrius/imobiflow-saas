import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { prisma } from '../../shared/database/prisma.service'
import { ActivityLogService } from '../../shared/services/activity-log.service'
import { TipoAtividade } from '@prisma/client'

/**
 * Rotas de Administração Geral
 *
 * Acesso restrito ao tenant "vivoly" (admin geral do sistema)
 * Permite visualizar todos os tenants cadastrados e seus administradores
 */

export async function adminRoutes(server: FastifyInstance) {
  /**
   * Middleware para verificar se é o tenant admin (Vivoly)
   */
  const requireVivolyAdmin = async (request: any, reply: any) => {
    const user = request.user

    if (!user) {
      return reply.status(401).send({ error: 'Não autenticado' })
    }

    // Buscar o tenant do usuário
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenant_id },
      select: { slug: true }
    })

    // Verificar se é o tenant Vivoly E se o usuário é ADMIN
    if (tenant?.slug !== 'vivoly' || user.tipo !== 'ADMIN') {
      return reply.status(403).send({
        error: 'Acesso negado',
        message: 'Apenas administradores do tenant Vivoly podem acessar este recurso'
      })
    }
  }

  /**
   * GET /api/v1/admin/tenants
   *
   * Lista todos os tenants cadastrados no sistema
   * Retorna: nome, email, status, plano, data de criação, admin principal
   *
   * Acesso: Apenas ADMIN do tenant Vivoly
   */
  server.get(
    '/tenants',
    {
      preHandler: [authMiddleware, requireVivolyAdmin]
    },
    async (request, reply) => {
      try {
        // Buscar todos os tenants com seus admins
        const tenants = await prisma.tenant.findMany({
          select: {
            id: true,
            nome: true,
            slug: true,
            subdominio: true,
            email: true,
            telefone: true,
            plano: true,
            status: true,
            data_expiracao: true,
            created_at: true,
            updated_at: true,

            // Limites e uso
            limite_usuarios: true,
            limite_imoveis: true,
            limite_storage_mb: true,
            total_usuarios: true,
            total_imoveis: true,
            storage_usado_mb: true,

            // Buscar admin do tenant
            users: {
              where: {
                tipo: 'ADMIN',
                ativo: true
              },
              select: {
                id: true,
                nome: true,
                email: true,
                created_at: true,
                ultimo_login: true
              },
              orderBy: {
                created_at: 'asc'
              },
              take: 1 // Pegar o primeiro admin (mais antigo)
            }
          },
          orderBy: {
            created_at: 'desc' // Mais recentes primeiro
          }
        })

        // Formatar resposta
        const tenantsFormatted = tenants.map(tenant => {
          const admin = tenant.users[0] || null

          // Calcular dias restantes do trial
          let diasRestantes = null
          if (tenant.status === 'TRIAL' && tenant.data_expiracao) {
            const now = new Date()
            const expiracao = new Date(tenant.data_expiracao)
            const diffTime = expiracao.getTime() - now.getTime()
            diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          }

          return {
            id: tenant.id,
            nome: tenant.nome,
            slug: tenant.slug,
            subdominio: tenant.subdominio || `${tenant.slug}.integrius.com.br`,
            email: tenant.email,
            telefone: tenant.telefone,
            plano: tenant.plano,
            status: tenant.status,
            data_expiracao: tenant.data_expiracao,
            dias_restantes: diasRestantes,
            created_at: tenant.created_at,
            updated_at: tenant.updated_at,

            // Limites e uso
            limites: {
              usuarios: tenant.limite_usuarios,
              imoveis: tenant.limite_imoveis,
              storage_mb: tenant.limite_storage_mb
            },
            uso: {
              usuarios: tenant.total_usuarios,
              imoveis: tenant.total_imoveis,
              storage_mb: tenant.storage_usado_mb
            },

            // Admin do tenant
            admin: admin ? {
              id: admin.id,
              nome: admin.nome,
              email: admin.email,
              created_at: admin.created_at,
              ultimo_login: admin.ultimo_login
            } : null
          }
        })

        return reply.send({
          success: true,
          total: tenantsFormatted.length,
          tenants: tenantsFormatted
        })
      } catch (error) {
        server.log.error({ error }, 'Erro ao listar tenants')
        return reply.status(500).send({
          error: 'Erro ao listar tenants',
          message: 'Ocorreu um erro ao buscar a lista de tenants'
        })
      }
    }
  )

  /**
   * GET /api/v1/admin/tenants/:id
   *
   * Busca detalhes de um tenant específico
   * Retorna: informações completas + todos os admins
   *
   * Acesso: Apenas ADMIN do tenant Vivoly
   */
  server.get(
    '/tenants/:id',
    {
      preHandler: [authMiddleware, requireVivolyAdmin]
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string }

        const tenant = await prisma.tenant.findUnique({
          where: { id },
          include: {
            users: {
              where: {
                tipo: 'ADMIN',
                ativo: true
              },
              select: {
                id: true,
                nome: true,
                email: true,
                tipo: true,
                created_at: true,
                ultimo_login: true
              },
              orderBy: {
                created_at: 'asc'
              }
            },
            _count: {
              select: {
                users: true,
                leads: true,
                imoveis: true,
                negociacoes: true,
                proprietarios: true
              }
            }
          }
        })

        if (!tenant) {
          return reply.status(404).send({
            error: 'Tenant não encontrado'
          })
        }

        // Calcular dias restantes do trial
        let diasRestantes = null
        if (tenant.status === 'TRIAL' && tenant.data_expiracao) {
          const now = new Date()
          const expiracao = new Date(tenant.data_expiracao)
          const diffTime = expiracao.getTime() - now.getTime()
          diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        return reply.send({
          success: true,
          tenant: {
            ...tenant,
            dias_restantes: diasRestantes,
            estatisticas: tenant._count
          }
        })
      } catch (error) {
        server.log.error({ error }, 'Erro ao buscar tenant')
        return reply.status(500).send({
          error: 'Erro ao buscar tenant'
        })
      }
    }
  )

  /**
   * GET /api/v1/admin/stats
   *
   * Estatísticas gerais do sistema
   *
   * Acesso: Apenas ADMIN do tenant Vivoly
   */
  server.get(
    '/stats',
    {
      preHandler: [authMiddleware, requireVivolyAdmin]
    },
    async (request, reply) => {
      try {
        // Contar tenants por status
        const tenantsByStatus = await prisma.tenant.groupBy({
          by: ['status'],
          _count: true
        })

        // Contar tenants por plano
        const tenantsByPlan = await prisma.tenant.groupBy({
          by: ['plano'],
          _count: true
        })

        // Total de tenants
        const totalTenants = await prisma.tenant.count()

        // Tenants criados nos últimos 30 dias
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const newTenantsLast30Days = await prisma.tenant.count({
          where: {
            created_at: {
              gte: thirtyDaysAgo
            }
          }
        })

        // Tenants em trial próximos de expirar (5 dias)
        const fiveDaysFromNow = new Date()
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5)

        const expiringTrials = await prisma.tenant.count({
          where: {
            status: 'TRIAL',
            data_expiracao: {
              lte: fiveDaysFromNow,
              gte: new Date()
            }
          }
        })

        return reply.send({
          success: true,
          stats: {
            total_tenants: totalTenants,
            novos_ultimos_30_dias: newTenantsLast30Days,
            trials_expirando_5_dias: expiringTrials,
            por_status: tenantsByStatus.reduce((acc, item) => {
              acc[item.status] = item._count
              return acc
            }, {} as Record<string, number>),
            por_plano: tenantsByPlan.reduce((acc, item) => {
              acc[item.plano] = item._count
              return acc
            }, {} as Record<string, number>)
          }
        })
      } catch (error) {
        server.log.error({ error }, 'Erro ao buscar estatísticas')
        return reply.status(500).send({
          error: 'Erro ao buscar estatísticas'
        })
      }
    }
  )

  /**
   * PATCH /api/v1/admin/tenants/bulk-update-status
   *
   * Atualiza status de múltiplos tenants em lote
   *
   * Body: { tenant_ids: string[], novo_status: string }
   *
   * Acesso: Apenas ADMIN do tenant Vivoly
   */
  server.patch(
    '/tenants/bulk-update-status',
    {
      preHandler: [authMiddleware, requireVivolyAdmin]
    },
    async (request, reply) => {
      try {
        const { tenant_ids, novo_status } = request.body as {
          tenant_ids: string[]
          novo_status: string
        }

        // Validar input
        if (!Array.isArray(tenant_ids) || tenant_ids.length === 0) {
          return reply.status(400).send({
            error: 'tenant_ids deve ser um array não vazio'
          })
        }

        const statusValidos = ['TRIAL', 'ATIVO', 'INATIVO', 'SUSPENSO', 'CANCELADO']
        if (!statusValidos.includes(novo_status)) {
          return reply.status(400).send({
            error: `Status inválido. Use: ${statusValidos.join(', ')}`
          })
        }

        // Atualizar status em lote
        const result = await prisma.tenant.updateMany({
          where: {
            id: {
              in: tenant_ids
            }
          },
          data: {
            status: novo_status as any, // Cast para enum StatusTenant
            updated_at: new Date()
          }
        })

        server.log.info({
          tenant_ids,
          novo_status,
          count: result.count
        }, 'Atualização em lote de status de tenants')

        return reply.send({
          success: true,
          message: `${result.count} tenant(s) atualizado(s) para status ${novo_status}`,
          updated_count: result.count
        })
      } catch (error) {
        server.log.error({ error }, 'Erro ao atualizar status em lote')
        return reply.status(500).send({
          error: 'Erro ao atualizar status dos tenants'
        })
      }
    }
  )

  /**
   * GET /api/v1/admin/activity-logs
   *
   * Lista logs de atividades de TODOS os tenants do sistema
   * Permite filtros por tenant, tipo, data, usuário
   *
   * Acesso: Apenas ADMIN do tenant Vivoly
   */
  server.get(
    '/activity-logs',
    {
      preHandler: [authMiddleware, requireVivolyAdmin]
    },
    async (request, reply) => {
      try {
        const query = request.query as any

        // Parâmetros de busca
        const params: any = {
          limit: query.limit ? parseInt(query.limit) : 50,
          offset: query.offset ? parseInt(query.offset) : 0,
        }

        // Filtros opcionais
        if (query.tenant_id) params.tenant_id = query.tenant_id
        if (query.user_id) params.user_id = query.user_id
        if (query.tipo) params.tipo = query.tipo as TipoAtividade
        if (query.entidade_tipo) params.entidade_tipo = query.entidade_tipo
        if (query.entidade_id) params.entidade_id = query.entidade_id
        if (query.data_inicio) params.data_inicio = new Date(query.data_inicio)
        if (query.data_fim) params.data_fim = new Date(query.data_fim)

        // Buscar logs usando o service
        // Como é admin geral, vamos buscar diretamente do Prisma sem filtro de tenant
        const where: any = {}

        if (params.tenant_id) where.tenant_id = params.tenant_id
        if (params.user_id) where.user_id = params.user_id
        if (params.tipo) where.tipo = params.tipo
        if (params.entidade_tipo) where.entidade_tipo = params.entidade_tipo
        if (params.entidade_id) where.entidade_id = params.entidade_id

        if (params.data_inicio || params.data_fim) {
          where.created_at = {}
          if (params.data_inicio) where.created_at.gte = params.data_inicio
          if (params.data_fim) where.created_at.lte = params.data_fim
        }

        const [logs, total] = await Promise.all([
          prisma.activityLog.findMany({
            where,
            include: {
              user: {
                select: {
                  id: true,
                  nome: true,
                  email: true,
                  tipo: true,
                },
              },
              tenant: {
                select: {
                  id: true,
                  nome: true,
                  slug: true,
                  email: true,
                },
              },
            },
            orderBy: { created_at: 'desc' },
            take: params.limit,
            skip: params.offset,
          }),
          prisma.activityLog.count({ where }),
        ])

        return reply.send({
          success: true,
          logs,
          total,
          limit: params.limit,
          offset: params.offset,
        })
      } catch (error) {
        server.log.error({ error }, 'Erro ao buscar logs de atividades')
        return reply.status(500).send({
          error: 'Erro ao buscar logs de atividades',
        })
      }
    }
  )

  /**
   * GET /api/v1/admin/activity-logs/stats
   *
   * Estatísticas de logs do sistema inteiro
   *
   * Acesso: Apenas ADMIN do tenant Vivoly
   */
  server.get(
    '/activity-logs/stats',
    {
      preHandler: [authMiddleware, requireVivolyAdmin]
    },
    async (request, reply) => {
      try {
        const query = request.query as any

        const data_inicio = query.data_inicio ? new Date(query.data_inicio) : undefined
        const data_fim = query.data_fim ? new Date(query.data_fim) : undefined

        // Buscar logs para estatísticas
        const where: any = {}
        if (data_inicio || data_fim) {
          where.created_at = {}
          if (data_inicio) where.created_at.gte = data_inicio
          if (data_fim) where.created_at.lte = data_fim
        }

        const logs = await prisma.activityLog.findMany({
          where,
          select: {
            tipo: true,
            created_at: true,
            tenant_id: true,
          },
        })

        // Agrupar por tipo
        const porTipo: Record<string, number> = {}
        logs.forEach((log) => {
          porTipo[log.tipo] = (porTipo[log.tipo] || 0) + 1
        })

        // Agrupar por tenant
        const porTenant: Record<string, number> = {}
        logs.forEach((log) => {
          porTenant[log.tenant_id] = (porTenant[log.tenant_id] || 0) + 1
        })

        // Top 5 tenants com mais atividades
        const topTenants = await prisma.tenant.findMany({
          where: {
            id: {
              in: Object.keys(porTenant),
            },
          },
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        })

        const topTenantsComCount = topTenants
          .map((tenant) => ({
            ...tenant,
            count: porTenant[tenant.id],
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        // Últimas 24 horas
        const ultimas24h = logs.filter((log) => {
          const diff = Date.now() - new Date(log.created_at).getTime()
          return diff < 24 * 60 * 60 * 1000
        }).length

        // Últimos 7 dias
        const ultimos7dias = logs.filter((log) => {
          const diff = Date.now() - new Date(log.created_at).getTime()
          return diff < 7 * 24 * 60 * 60 * 1000
        }).length

        return reply.send({
          success: true,
          stats: {
            total: logs.length,
            ultimas24h,
            ultimos7dias,
            porTipo,
            topTenants: topTenantsComCount,
          },
        })
      } catch (error) {
        server.log.error({ error }, 'Erro ao buscar estatísticas de logs')
        return reply.status(500).send({
          error: 'Erro ao buscar estatísticas',
        })
      }
    }
  )
}
