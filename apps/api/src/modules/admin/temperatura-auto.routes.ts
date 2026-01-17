/**
 * Rotas de Atualização Automática de Temperatura de Leads
 *
 * Endpoints para execução manual e monitoramento do sistema
 * de degradação automática de temperatura de leads.
 *
 * Regras:
 * - QUENTE sem contato há 5+ dias → MORNO
 * - MORNO sem contato há 10+ dias → FRIO
 *
 * Acesso: ADMIN ou GESTOR do tenant
 */

import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { temperaturaAutoService } from '../../shared/services/temperatura-auto.service'
import { prisma } from '../../shared/database/prisma.service'

export async function temperaturaAutoRoutes(server: FastifyInstance) {

  /**
   * Middleware para verificar se é ADMIN ou GESTOR
   */
  const requireManagerOrAdmin = async (request: any, reply: any) => {
    const user = request.user

    if (!user) {
      return reply.status(401).send({ error: 'Não autenticado' })
    }

    if (!['ADMIN', 'GESTOR'].includes(user.tipo)) {
      return reply.status(403).send({
        error: 'Acesso negado',
        message: 'Apenas ADMIN ou GESTOR podem acessar este recurso'
      })
    }
  }

  /**
   * GET /api/v1/temperatura-auto/estatisticas
   *
   * Retorna estatísticas de leads que serão afetados pela próxima execução
   */
  server.get(
    '/estatisticas',
    {
      preHandler: [authMiddleware, requireManagerOrAdmin]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user.tenant_id

        const estatisticas = await temperaturaAutoService.getEstatisticas(tenantId)

        return reply.send({
          success: true,
          data: {
            ...estatisticas,
            resumo: {
              leadsQueSeraoRebaixados: estatisticas.quentesSemContato5Dias + estatisticas.mornosSemContato10Dias,
              detalhes: [
                {
                  de: 'QUENTE',
                  para: 'MORNO',
                  quantidade: estatisticas.quentesSemContato5Dias,
                  motivo: 'Sem contato há 5+ dias'
                },
                {
                  de: 'MORNO',
                  para: 'FRIO',
                  quantidade: estatisticas.mornosSemContato10Dias,
                  motivo: 'Sem contato há 10+ dias'
                }
              ]
            }
          }
        })
      } catch (error: any) {
        server.log.error({ error }, 'Erro ao buscar estatísticas de temperatura')
        return reply.status(500).send({
          error: 'Erro ao buscar estatísticas',
          message: error.message
        })
      }
    }
  )

  /**
   * POST /api/v1/temperatura-auto/executar
   *
   * Executa a atualização de temperatura para o tenant do usuário logado
   */
  server.post(
    '/executar',
    {
      preHandler: [authMiddleware, requireManagerOrAdmin]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user.tenant_id

        // Buscar nome do tenant para log
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { nome: true }
        })

        const resultado = await temperaturaAutoService.executarParaTenant(tenantId, tenant?.nome)

        return reply.send({
          success: true,
          message: `Atualização concluída: ${resultado.leadsAtualizados.length} lead(s) atualizado(s)`,
          data: {
            tenantNome: resultado.tenantNome,
            totalAnalisados: resultado.totalLeadsAnalisados,
            totalAtualizados: resultado.leadsAtualizados.length,
            notificacoesEnviadas: resultado.notificacoesEnviadas,
            leadsAtualizados: resultado.leadsAtualizados.map(lead => ({
              id: lead.id,
              nome: lead.nome,
              telefone: lead.telefone,
              de: lead.temperaturaAnterior,
              para: lead.temperaturaNova,
              diasSemContato: lead.diasSemContato,
              corretor: lead.corretorNome || 'Não atribuído'
            })),
            erros: resultado.erros
          }
        })
      } catch (error: any) {
        server.log.error({ error }, 'Erro ao executar atualização de temperatura')
        return reply.status(500).send({
          error: 'Erro ao executar atualização',
          message: error.message
        })
      }
    }
  )

  /**
   * POST /api/v1/temperatura-auto/executar-preview
   *
   * Mostra quais leads seriam afetados SEM executar a atualização (dry-run)
   */
  server.post(
    '/executar-preview',
    {
      preHandler: [authMiddleware, requireManagerOrAdmin]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user.tenant_id

        const estatisticas = await temperaturaAutoService.getEstatisticas(tenantId)

        // Buscar leads que seriam afetados
        const agora = new Date()
        const limite5Dias = new Date(agora)
        limite5Dias.setDate(limite5Dias.getDate() - 5)
        const limite10Dias = new Date(agora)
        limite10Dias.setDate(limite10Dias.getDate() - 10)

        const leadsQuentesParaMorno = await prisma.lead.findMany({
          where: {
            tenant_id: tenantId,
            temperatura: 'QUENTE',
            OR: [
              { last_interaction_at: null },
              { last_interaction_at: { lt: limite5Dias } }
            ]
          },
          select: {
            id: true,
            nome: true,
            telefone: true,
            last_interaction_at: true,
            created_at: true,
            corretor: {
              include: {
                user: { select: { nome: true } }
              }
            }
          },
          take: 50 // Limitar para não sobrecarregar
        })

        const leadsMornosParaFrio = await prisma.lead.findMany({
          where: {
            tenant_id: tenantId,
            temperatura: 'MORNO',
            OR: [
              { last_interaction_at: null },
              { last_interaction_at: { lt: limite10Dias } }
            ]
          },
          select: {
            id: true,
            nome: true,
            telefone: true,
            last_interaction_at: true,
            created_at: true,
            corretor: {
              include: {
                user: { select: { nome: true } }
              }
            }
          },
          take: 50
        })

        const calcularDiasSemContato = (lead: any): number => {
          if (lead.last_interaction_at) {
            return Math.floor((agora.getTime() - new Date(lead.last_interaction_at).getTime()) / (1000 * 60 * 60 * 24))
          }
          return Math.floor((agora.getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24))
        }

        return reply.send({
          success: true,
          message: 'Preview da execução (nenhuma alteração foi feita)',
          data: {
            estatisticas,
            preview: {
              quenteParaMorno: leadsQuentesParaMorno.map(lead => ({
                id: lead.id,
                nome: lead.nome,
                telefone: lead.telefone,
                diasSemContato: calcularDiasSemContato(lead),
                ultimoContato: lead.last_interaction_at || lead.created_at,
                corretor: lead.corretor?.user?.nome || 'Não atribuído',
                de: 'QUENTE',
                para: 'MORNO'
              })),
              mornoParaFrio: leadsMornosParaFrio.map(lead => ({
                id: lead.id,
                nome: lead.nome,
                telefone: lead.telefone,
                diasSemContato: calcularDiasSemContato(lead),
                ultimoContato: lead.last_interaction_at || lead.created_at,
                corretor: lead.corretor?.user?.nome || 'Não atribuído',
                de: 'MORNO',
                para: 'FRIO'
              }))
            },
            totalQueSeraoAfetados: leadsQuentesParaMorno.length + leadsMornosParaFrio.length
          }
        })
      } catch (error: any) {
        server.log.error({ error }, 'Erro ao gerar preview')
        return reply.status(500).send({
          error: 'Erro ao gerar preview',
          message: error.message
        })
      }
    }
  )

  /**
   * GET /api/v1/temperatura-auto/config
   *
   * Retorna a configuração atual do sistema de temperatura automática
   */
  server.get(
    '/config',
    {
      preHandler: [authMiddleware, requireManagerOrAdmin]
    },
    async (request, reply) => {
      return reply.send({
        success: true,
        config: {
          regras: [
            {
              de: 'QUENTE',
              para: 'MORNO',
              diasSemContato: 5,
              descricao: 'Lead QUENTE sem contato há 5+ dias é rebaixado para MORNO'
            },
            {
              de: 'MORNO',
              para: 'FRIO',
              diasSemContato: 10,
              descricao: 'Lead MORNO sem contato há 10+ dias é rebaixado para FRIO'
            }
          ],
          notificacoes: {
            telegram: true,
            descricao: 'Corretor recebe notificação no Telegram quando lead é rebaixado (se tiver chat_id configurado)'
          },
          execucaoAutomatica: {
            habilitada: true,
            frequencia: 'Diária (via cron job)',
            horario: '08:00 (sugerido)'
          }
        }
      })
    }
  )
}
