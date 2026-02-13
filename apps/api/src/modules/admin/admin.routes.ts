import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { prisma } from '../../shared/database/prisma.service'
import { TipoAtividade } from '@prisma/client'

/**
 * Rotas de Administração Geral
 *
 * CONFORMIDADE LGPD (Lei 13.709/2018):
 *
 * O ImobiFlow atua como OPERADOR de dados, enquanto cada tenant (imobiliária)
 * é o CONTROLADOR dos dados de seus clientes.
 *
 * Conforme Art. 39 da LGPD: "O operador deverá realizar o tratamento segundo
 * as instruções fornecidas pelo controlador"
 *
 * Por isso, o operador (Vivoly) NÃO tem acesso aos dados operacionais dos
 * outros tenants (leads, negociações, etc.), apenas a:
 * - Dados administrativos mínimos (nome, status, plano)
 * - Seus próprios dados (tenant Vivoly)
 *
 * Acesso restrito ao tenant "vivoly" (admin geral do sistema)
 */

export async function adminRoutes(server: FastifyInstance) {

  // Cache do ID do tenant Vivoly para evitar consultas repetidas
  let vivolyTenantId: string | null = null

  /**
   * Helper para obter o ID do tenant Vivoly
   */
  const getVivolyTenantId = async (): Promise<string | null> => {
    if (vivolyTenantId) return vivolyTenantId

    const vivoly = await prisma.tenant.findFirst({
      where: { slug: 'vivoly' },
      select: { id: true }
    })

    if (vivoly) {
      vivolyTenantId = vivoly.id
    }

    return vivolyTenantId
  }

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
   *
   * LGPD: Retorna apenas dados administrativos mínimos necessários
   * para gestão da plataforma (nome, email, status, plano).
   * NÃO retorna dados operacionais (leads, negociações, etc.)
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
        // Buscar todos os tenants - APENAS dados administrativos
        // LGPD: Não incluímos contagens de leads/negociações (dados operacionais)
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

            // Limites contratuais (não são dados pessoais)
            limite_usuarios: true,
            limite_imoveis: true,
            limite_storage_mb: true,

            // Uso atual - apenas métricas de capacidade (não dados pessoais)
            total_usuarios: true,
            total_imoveis: true,
            storage_usado_mb: true,

            // Buscar admin do tenant (necessário para contato comercial)
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
              take: 1
            }
          },
          orderBy: {
            created_at: 'desc'
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

            // Limites contratuais
            limites: {
              usuarios: tenant.limite_usuarios,
              imoveis: tenant.limite_imoveis,
              storage_mb: tenant.limite_storage_mb
            },

            // Uso de capacidade (sem dados sensíveis)
            uso: {
              usuarios: tenant.total_usuarios,
              imoveis: tenant.total_imoveis,
              storage_mb: tenant.storage_usado_mb
            },

            // Admin do tenant (contato comercial)
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
   *
   * LGPD: Para tenants que NÃO são Vivoly, retorna apenas dados administrativos.
   * Para o próprio tenant Vivoly, retorna dados completos (é o próprio controlador).
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
        const vivolyId = await getVivolyTenantId()

        // Verificar se está consultando o próprio tenant (Vivoly)
        const isOwnTenant = id === vivolyId

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
            // LGPD: Só incluir contagens se for o próprio tenant
            ...(isOwnTenant ? {
              _count: {
                select: {
                  users: true,
                  leads: true,
                  imoveis: true,
                  negociacoes: true,
                  proprietarios: true
                }
              }
            } : {})
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

        // LGPD: Montar resposta baseada em se é o próprio tenant ou não
        const response: any = {
          success: true,
          tenant: {
            id: tenant.id,
            nome: tenant.nome,
            slug: tenant.slug,
            subdominio: tenant.subdominio,
            email: tenant.email,
            telefone: tenant.telefone,
            plano: tenant.plano,
            status: tenant.status,
            data_expiracao: tenant.data_expiracao,
            dias_restantes: diasRestantes,
            created_at: tenant.created_at,
            updated_at: tenant.updated_at,
            limite_usuarios: tenant.limite_usuarios,
            limite_imoveis: tenant.limite_imoveis,
            limite_storage_mb: tenant.limite_storage_mb,
            total_usuarios: tenant.total_usuarios,
            total_imoveis: tenant.total_imoveis,
            storage_usado_mb: tenant.storage_usado_mb,
            users: tenant.users
          }
        }

        // Só incluir estatísticas detalhadas se for o próprio tenant
        if (isOwnTenant && (tenant as any)._count) {
          response.tenant.estatisticas = (tenant as any)._count
        }

        return reply.send(response)
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
   * LGPD: Retorna apenas estatísticas agregadas e anonimizadas.
   * Não expõe dados individuais de nenhum tenant.
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
        // Contar tenants por status (dados agregados, não pessoais)
        const tenantsByStatus = await prisma.tenant.groupBy({
          by: ['status'],
          _count: true
        })

        // Contar tenants por plano (dados agregados)
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
   * LGPD: Operação administrativa que não acessa dados pessoais dos tenants.
   * Apenas altera o status do contrato (TRIAL, ATIVO, SUSPENSO, etc.)
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
            status: novo_status as any,
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
   * Lista logs de atividades APENAS do tenant Vivoly
   *
   * LGPD COMPLIANCE:
   * Conforme Art. 39 da LGPD, o operador não deve acessar dados
   * operacionais de outros controladores (tenants).
   *
   * Este endpoint agora retorna APENAS os logs do próprio tenant Vivoly,
   * garantindo que o operador não tenha acesso às atividades de outros tenants.
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

        // LGPD: Obter ID do tenant Vivoly para filtrar apenas seus logs
        const vivolyId = await getVivolyTenantId()

        if (!vivolyId) {
          return reply.status(500).send({
            error: 'Configuração inválida',
            message: 'Tenant Vivoly não encontrado no sistema'
          })
        }

        // Parâmetros de busca
        const params: any = {
          limit: query.limit ? parseInt(query.limit) : 50,
          offset: query.offset ? parseInt(query.offset) : 0,
        }

        // LGPD: Filtro obrigatório pelo tenant Vivoly
        const where: any = {
          tenant_id: vivolyId  // SEMPRE filtrar pelo tenant Vivoly
        }

        // Filtros opcionais (dentro do tenant Vivoly)
        if (query.user_id) where.user_id = query.user_id
        if (query.tipo) where.tipo = query.tipo as TipoAtividade
        if (query.entidade_tipo) where.entidade_tipo = query.entidade_tipo
        if (query.entidade_id) where.entidade_id = query.entidade_id

        if (query.data_inicio || query.data_fim) {
          where.created_at = {}
          if (query.data_inicio) where.created_at.gte = new Date(query.data_inicio)
          if (query.data_fim) where.created_at.lte = new Date(query.data_fim)
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
          // Informar que os logs são apenas do tenant Vivoly
          _lgpd_notice: 'Logs restritos ao tenant Vivoly conforme Art. 39 da LGPD'
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
   * Estatísticas de logs APENAS do tenant Vivoly
   *
   * LGPD COMPLIANCE:
   * Estatísticas restritas ao próprio tenant, não expondo
   * informações de atividades de outros controladores.
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

        // LGPD: Obter ID do tenant Vivoly
        const vivolyId = await getVivolyTenantId()

        if (!vivolyId) {
          return reply.status(500).send({
            error: 'Configuração inválida',
            message: 'Tenant Vivoly não encontrado no sistema'
          })
        }

        const data_inicio = query.data_inicio ? new Date(query.data_inicio) : undefined
        const data_fim = query.data_fim ? new Date(query.data_fim) : undefined

        // LGPD: Filtro obrigatório pelo tenant Vivoly
        const where: any = {
          tenant_id: vivolyId  // SEMPRE filtrar pelo tenant Vivoly
        }

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
          },
        })

        // Agrupar por tipo
        const porTipo: Record<string, number> = {}
        logs.forEach((log) => {
          porTipo[log.tipo] = (porTipo[log.tipo] || 0) + 1
        })

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
          },
          // Informar que as estatísticas são apenas do tenant Vivoly
          _lgpd_notice: 'Estatísticas restritas ao tenant Vivoly conforme Art. 39 da LGPD'
        })
      } catch (error) {
        server.log.error({ error }, 'Erro ao buscar estatísticas de logs')
        return reply.status(500).send({
          error: 'Erro ao buscar estatísticas',
        })
      }
    }
  )

  /**
   * POST /api/v1/admin/landing/hero-image
   *
   * Upload de imagem hero da landing page
   *
   * Faz upload da imagem para Cloudinary e armazena a URL
   * em variável de ambiente LANDING_HERO_IMAGE_URL
   *
   * Validações:
   * - Formato: PNG, JPG, JPEG, WebP
   * - Tamanho máximo: 2MB
   * - Otimização automática pelo Cloudinary
   *
   * Acesso: Apenas ADMIN do tenant Vivoly
   */
  server.post(
    '/landing/hero-image',
    {
      preHandler: [authMiddleware, requireVivolyAdmin]
    },
    async (request, reply) => {
      try {
        const data = await request.file()

        if (!data) {
          return reply.status(400).send({
            error: 'Nenhum arquivo enviado'
          })
        }

        // Validar tipo de arquivo
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        if (!allowedMimeTypes.includes(data.mimetype)) {
          return reply.status(400).send({
            error: 'Formato inválido',
            message: 'Apenas PNG, JPG, JPEG e WebP são aceitos'
          })
        }

        // Converter stream para buffer
        const chunks: Buffer[] = []
        for await (const chunk of data.file) {
          chunks.push(chunk)
        }
        const buffer = Buffer.concat(chunks)

        // Validar tamanho (máx 2MB)
        const MAX_SIZE = 2 * 1024 * 1024 // 2MB
        if (buffer.length > MAX_SIZE) {
          return reply.status(400).send({
            error: 'Arquivo muito grande',
            message: 'Tamanho máximo: 2MB'
          })
        }

        // Upload para Cloudinary
        const cloudinary = (await import('../../config/cloudinary')).default
        // @ts-ignore - stream é módulo nativo do Node
        const { Readable } = await import('stream')

        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'vivoly/landing',
              public_id: 'hero-image',
              resource_type: 'image',
              overwrite: true, // Sobrescrever imagem anterior
              transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
                { width: 1200, crop: 'limit' } // Limitar largura máxima
              ]
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          )

          const readableStream = Readable.from(buffer)
          readableStream.pipe(uploadStream)
        })

        // Armazenar URL no banco (criar tabela de config se não existir)
        // Por enquanto, retornar a URL para ser configurada manualmente
        const imageUrl = uploadResult.secure_url

        server.log.info({
          imageUrl,
          uploadedBy: request.user?.id
        }, 'Hero image da landing page atualizada')

        return reply.send({
          success: true,
          message: 'Imagem atualizada com sucesso',
          data: {
            url: imageUrl,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            size: uploadResult.bytes
          },
          instructions: {
            step1: 'Imagem enviada para Cloudinary com sucesso',
            step2: 'Atualize a variável de ambiente LANDING_HERO_IMAGE_URL no Render',
            step3: `Valor: ${imageUrl}`,
            step4: 'Ou acesse via API pública: GET /api/v1/public/landing/config'
          }
        })
      } catch (error: any) {
        server.log.error({ error }, 'Erro ao fazer upload da hero image')
        return reply.status(500).send({
          error: 'Erro ao fazer upload',
          message: error.message
        })
      }
    }
  )

  /**
   * GET /api/v1/admin/landing/hero-image
   *
   * Retorna a URL atual da hero image
   *
   * Acesso: Apenas ADMIN do tenant Vivoly
   */
  server.get(
    '/landing/hero-image',
    {
      preHandler: [authMiddleware, requireVivolyAdmin]
    },
    async (request, reply) => {
      try {
        // Buscar a URL mais recente do Cloudinary
        const cloudinary = (await import('../../config/cloudinary')).default

        try {
          const result = await cloudinary.api.resource('vivoly/landing/hero-image', {
            resource_type: 'image'
          })

          return reply.send({
            success: true,
            data: {
              url: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              size: result.bytes,
              created_at: result.created_at,
              updated_at: result.created_at
            }
          })
        } catch (cloudinaryError: any) {
          // Imagem não existe ainda
          if (cloudinaryError.error?.http_code === 404) {
            return reply.send({
              success: true,
              data: null,
              message: 'Nenhuma imagem hero configurada ainda. Use POST /api/v1/admin/landing/hero-image para fazer upload.'
            })
          }
          throw cloudinaryError
        }
      } catch (error: any) {
        server.log.error({ error }, 'Erro ao buscar hero image')
        return reply.status(500).send({
          error: 'Erro ao buscar imagem',
          message: error.message
        })
      }
    }
  )
}
