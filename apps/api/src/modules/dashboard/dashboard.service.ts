import { PrismaClient } from '@prisma/client'

export class DashboardService {
  constructor(private prisma: PrismaClient) {}

  async getOverview() {
    const [
      totalLeads,
      totalImoveis,
      totalNegociacoes,
      negociacoesFechadas,
      imoveisDisponiveis,
      leadsQuentes
    ] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.imovel.count(),
      this.prisma.negociacao.count(),
      this.prisma.negociacao.count({ where: { status: 'FECHADO' } }),
      this.prisma.imovel.count({ where: { status: 'DISPONIVEL' } }),
      this.prisma.lead.count({ where: { temperatura: 'QUENTE' } })
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

  async getLeadsByOrigem() {
    const leads = await this.prisma.lead.groupBy({
      by: ['origem'],
      _count: true
    })

    return leads.map(item => ({
      origem: item.origem,
      total: item._count
    }))
  }

  async getLeadsByTemperatura() {
    const leads = await this.prisma.lead.groupBy({
      by: ['temperatura'],
      _count: true
    })

    return leads.map(item => ({
      temperatura: item.temperatura,
      total: item._count
    }))
  }

  async getNegociacoesByStatus() {
    const negociacoes = await this.prisma.negociacao.groupBy({
      by: ['status'],
      _count: true
    })

    return negociacoes.map(item => ({
      status: item.status,
      total: item._count
    }))
  }

  async getImoveisByTipo() {
    const imoveis = await this.prisma.imovel.groupBy({
      by: ['tipo'],
      _count: true
    })

    return imoveis.map(item => ({
      tipo: item.tipo,
      total: item._count
    }))
  }

  async getImoveisByCategoria() {
    const imoveis = await this.prisma.imovel.groupBy({
      by: ['categoria'],
      _count: true
    })

    return imoveis.map(item => ({
      categoria: item.categoria,
      total: item._count
    }))
  }

  async getPerformanceCorretores() {
    const corretores = await this.prisma.corretor.findMany({
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

  async getFunilVendas() {
    const pipeline = await this.prisma.negociacao.groupBy({
      by: ['status'],
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

  async getRecentActivity(limit: number = 10) {
    const [recentLeads, recentNegociacoes] = await Promise.all([
      this.prisma.lead.findMany({
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

  async getValorMedioNegociacoes() {
    const negociacoes = await this.prisma.negociacao.findMany({
      where: {
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
}
