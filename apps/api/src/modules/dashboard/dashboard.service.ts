import { PrismaClient } from '@prisma/client'

export class DashboardService {
  constructor(private prisma: PrismaClient) {}

  async getOverview(tenant_id: string) {
    const [
      totalLeads,
      totalImoveis,
      totalNegociacoes,
      negociacoesFechadas,
      imoveisDisponiveis,
      leadsQuentes
    ] = await Promise.all([
      this.prisma.lead.count({ where: { tenant_id } }),
      this.prisma.imovel.count({ where: { tenant_id } }),
      this.prisma.negociacao.count({ where: { tenant_id } }),
      this.prisma.negociacao.count({ where: { tenant_id, status: 'FECHADO' } }),
      this.prisma.imovel.count({ where: { tenant_id, status: 'DISPONIVEL' } }),
      this.prisma.lead.count({ where: { tenant_id, temperatura: 'QUENTE' } })
    ])

    // Taxa de conversão
    const taxaConversao = totalNegociacoes > 0 
      ? ((negociacoesFechadas / totalNegociacoes) * 100).toFixed(2)
      : '0.00'

    return {
      leads: {
        total: totalLeads,
        quentes: leadsQuentes
      },
      imoveis: {
        total: totalImoveis,
        disponiveis: imoveisDisponiveis
      },
      negociacoes: {
        total: totalNegociacoes,
        fechadas: negociacoesFechadas,
        taxaConversao: parseFloat(taxaConversao)
      }
    }
  }

  async getLeadsByOrigem(tenant_id: string) {
    const leads = await this.prisma.lead.groupBy({
      by: ['origem'],
      where: { tenant_id },
      _count: true
    })

    return leads.map(item => ({
      origem: item.origem,
      total: item._count
    }))
  }

  async getLeadsByTemperatura(tenant_id: string) {
    const leads = await this.prisma.lead.groupBy({
      by: ['temperatura'],
      where: { tenant_id },
      _count: true
    })

    return leads.map(item => ({
      temperatura: item.temperatura,
      total: item._count
    }))
  }

  async getNegociacoesByStatus(tenant_id: string) {
    const negociacoes = await this.prisma.negociacao.groupBy({
      by: ['status'],
      where: { tenant_id },
      _count: true
    })

    return negociacoes.map(item => ({
      status: item.status,
      total: item._count
    }))
  }

  async getImoveisByTipo(tenant_id: string) {
    const imoveis = await this.prisma.imovel.groupBy({
      by: ['tipo'],
      where: { tenant_id },
      _count: true
    })

    return imoveis.map(item => ({
      tipo: item.tipo,
      total: item._count
    }))
  }

  async getImoveisByCategoria(tenant_id: string) {
    const imoveis = await this.prisma.imovel.groupBy({
      by: ['categoria'],
      where: { tenant_id },
      _count: true
    })

    return imoveis.map(item => ({
      categoria: item.categoria,
      total: item._count
    }))
  }

  async getPerformanceCorretores(tenant_id: string) {
    const corretores = await this.prisma.corretor.findMany({
      where: { tenant_id },
      include: {
        user: {
          select: {
            nome: true,
            email: true
          }
        },
        leads: {
          select: { id: true }
        },
        negociacoes: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    return corretores.map(corretor => ({
      id: corretor.id,
      nome: corretor.user.nome,
      email: corretor.user.email,
      creci: corretor.creci,
      totalLeads: corretor.leads.length,
      totalNegociacoes: corretor.negociacoes.length,
      negociacoesFechadas: corretor.negociacoes.filter(n => n.status === 'FECHADO').length,
      performanceScore: corretor.performance_score
    }))
  }

  async getFunilVendas(tenant_id: string) {
    const pipeline = await this.prisma.negociacao.groupBy({
      by: ['status'],
      where: { tenant_id },
      _count: true
    })

    const statusOrder = ['CONTATO', 'VISITA', 'PROPOSTA', 'CONTRATO', 'FECHADO']
    const funil = statusOrder.map(status => {
      const item = pipeline.find(p => p.status === status)
      return {
        status,
        total: item?._count || 0
      }
    })

    return funil
  }

  async getRecentActivity(tenant_id: string, limit: number = 10) {
    const [recentLeads, recentNegociacoes] = await Promise.all([
      this.prisma.lead.findMany({
        where: { tenant_id },
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          nome: true,
          telefone: true,
          origem: true,
          temperatura: true,
          created_at: true
        }
      }),
      this.prisma.negociacao.findMany({
        where: { tenant_id },
        take: limit,
        orderBy: { updated_at: 'desc' },
        select: {
          id: true,
          status: true,
          updated_at: true,
          lead: {
            select: {
              nome: true
            }
          },
          imovel: {
            select: {
              codigo: true,
              tipo: true
            }
          },
          corretor: {
            select: {
              user: {
                select: {
                  nome: true
                }
              }
            }
          }
        }
      })
    ])

    return {
      recentLeads,
      recentNegociacoes
    }
  }

  async getValorMedioNegociacoes(tenant_id: string) {
    const negociacoes = await this.prisma.negociacao.findMany({
      where: {
        tenant_id,
        valor_proposta: {
          not: null
        }
      },
      select: {
        valor_proposta: true,
        status: true
      }
    })

    if (negociacoes.length === 0) {
      return {
        valorMedio: 0,
        valorMedioFechadas: 0,
        totalComValor: 0
      }
    }

    const soma = negociacoes.reduce((acc, neg) => acc + (neg.valor_proposta?.toNumber() || 0), 0)
    const valorMedio = soma / negociacoes.length

    const fechadas = negociacoes.filter(n => n.status === 'FECHADO')
    const somaFechadas = fechadas.reduce((acc, neg) => acc + (neg.valor_proposta?.toNumber() || 0), 0)
    const valorMedioFechadas = fechadas.length > 0 ? somaFechadas / fechadas.length : 0

    return {
      valorMedio: parseFloat(valorMedio.toFixed(2)),
      valorMedioFechadas: parseFloat(valorMedioFechadas.toFixed(2)),
      totalComValor: negociacoes.length
    }
  }

  // ==================== DADOS HISTÓRICOS ====================

  /**
   * Retorna contagem mensal de Leads, Imóveis e Negociações
   * nos últimos X meses
   */
  async getHistoricalData(tenant_id: string, months: number) {
    const now = new Date()
    const startDate = new Date()
    startDate.setMonth(now.getMonth() - months)

    // Busca todos os registros dentro do período
    const [leads, imoveis, negociacoes] = await Promise.all([
      this.prisma.lead.findMany({
        where: {
          tenant_id,
          created_at: {
            gte: startDate
          }
        },
        select: {
          created_at: true
        }
      }),
      this.prisma.imovel.findMany({
        where: {
          tenant_id,
          created_at: {
            gte: startDate
          }
        },
        select: {
          created_at: true
        }
      }),
      this.prisma.negociacao.findMany({
        where: {
          tenant_id,
          created_at: {
            gte: startDate
          }
        },
        select: {
          created_at: true
        }
      })
    ])

    // Agrupa por mês
    const groupByMonth = (items: { created_at: Date }[]) => {
      const grouped: { [key: string]: number } = {}

      items.forEach(item => {
        const date = new Date(item.created_at)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        grouped[key] = (grouped[key] || 0) + 1
      })

      return grouped
    }

    const leadsGrouped = groupByMonth(leads)
    const imoveisGrouped = groupByMonth(imoveis)
    const negociacoesGrouped = groupByMonth(negociacoes)

    // Gera array com todos os meses no período
    const result = []
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(now.getMonth() - i)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })

      result.push({
        month: key,
        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        leads: leadsGrouped[key] || 0,
        imoveis: imoveisGrouped[key] || 0,
        negociacoes: negociacoesGrouped[key] || 0
      })
    }

    return result
  }

  /**
   * Retorna dados históricos para 3, 6 e 12 meses
   */
  async getChartsData(tenant_id: string) {
    const [data3months, data6months, data12months] = await Promise.all([
      this.getHistoricalData(tenant_id, 3),
      this.getHistoricalData(tenant_id, 6),
      this.getHistoricalData(tenant_id, 12)
    ])

    return {
      last3Months: data3months,
      last6Months: data6months,
      last12Months: data12months
    }
  }
}
