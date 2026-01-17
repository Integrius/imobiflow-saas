/**
 * Dashboard Gerencial - Serviço
 *
 * Visão consolidada para ADMIN e GESTOR com métricas de todos os corretores.
 *
 * Funcionalidades:
 * - Ranking de corretores por performance
 * - Métricas consolidadas do time
 * - Comparativos período a período
 * - Análise de conversão por corretor
 * - Tempo médio de resposta e fechamento
 */

import { PrismaClient, Temperatura } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

interface CorretorPerformance {
  id: string
  nome: string
  email: string
  creci: string
  foto_url?: string
  metricas: {
    totalLeads: number
    leadsQuentes: number
    leadsMornos: number
    leadsFrios: number
    totalNegociacoes: number
    negociacoesFechadas: number
    negociacoesEmAndamento: number
    taxaConversao: number
    valorTotalFechado: number
    valorMedioFechado: number
    totalVisitas: number
    visitasRealizadas: number
  }
  tempoMedio: {
    primeiroContato: number | null
    fechamento: number | null
  }
  ultimaAtividade: Date | null
  ranking: {
    posicao: number
    pontuacao: number
  }
}

interface MetricasTime {
  totalCorretores: number
  corretoresAtivos: number
  totalLeads: number
  leadsNovos30Dias: number
  totalNegociacoes: number
  negociacoesFechadas30Dias: number
  valorTotalFechado: number
  taxaConversaoGeral: number
  mediaPorCorretor: {
    leads: number
    negociacoes: number
    valorFechado: number
  }
}

interface ComparativoPeriodo {
  periodo: string
  leads: number
  negociacoes: number
  fechamentos: number
  valorFechado: number
}

// Tipos auxiliares para as queries do Prisma
interface LeadData {
  id: string
  temperatura: Temperatura
  created_at: Date
  last_interaction_at: Date | null
}

interface NegociacaoData {
  id: string
  status: string
  valor_proposta: Decimal | null
  valor_final: Decimal | null
  created_at: Date
  updated_at: Date
}

interface AgendamentoData {
  id: string
  status: string
  realizado: boolean
}

interface CorretorComRelacoes {
  id: string
  creci: string
  user: {
    nome: string
    email: string
    ultimo_login: Date | null
  }
  leads: LeadData[]
  negociacoes: NegociacaoData[]
  agendamentos: AgendamentoData[]
}

export class DashboardGerencialService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Retorna métricas consolidadas do time
   */
  async getMetricasTime(tenantId: string): Promise<MetricasTime> {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalCorretores,
      corretoresAtivos,
      totalLeads,
      leadsNovos30Dias,
      totalNegociacoes,
      negociacoesFechadas,
      negociacoesFechadas30Dias,
      valorFechado
    ] = await Promise.all([
      // Total de corretores
      this.prisma.corretor.count({
        where: { tenant_id: tenantId }
      }),
      // Corretores ativos (com atividade nos últimos 30 dias)
      this.prisma.corretor.count({
        where: {
          tenant_id: tenantId,
          OR: [
            { leads: { some: { updated_at: { gte: thirtyDaysAgo } } } },
            { negociacoes: { some: { updated_at: { gte: thirtyDaysAgo } } } }
          ]
        }
      }),
      // Total de leads
      this.prisma.lead.count({
        where: { tenant_id: tenantId }
      }),
      // Leads novos nos últimos 30 dias
      this.prisma.lead.count({
        where: {
          tenant_id: tenantId,
          created_at: { gte: thirtyDaysAgo }
        }
      }),
      // Total de negociações
      this.prisma.negociacao.count({
        where: { tenant_id: tenantId }
      }),
      // Negociações fechadas (total)
      this.prisma.negociacao.count({
        where: { tenant_id: tenantId, status: 'FECHADO' }
      }),
      // Negociações fechadas nos últimos 30 dias
      this.prisma.negociacao.count({
        where: {
          tenant_id: tenantId,
          status: 'FECHADO',
          updated_at: { gte: thirtyDaysAgo }
        }
      }),
      // Valor total fechado
      this.prisma.negociacao.aggregate({
        where: {
          tenant_id: tenantId,
          status: 'FECHADO'
        },
        _sum: {
          valor_final: true
        }
      })
    ])

    const valorTotalFechado = valorFechado._sum.valor_final?.toNumber() || 0
    const taxaConversaoGeral = totalNegociacoes > 0
      ? (negociacoesFechadas / totalNegociacoes) * 100
      : 0

    return {
      totalCorretores,
      corretoresAtivos,
      totalLeads,
      leadsNovos30Dias,
      totalNegociacoes,
      negociacoesFechadas30Dias,
      valorTotalFechado,
      taxaConversaoGeral: parseFloat(taxaConversaoGeral.toFixed(2)),
      mediaPorCorretor: {
        leads: totalCorretores > 0 ? Math.round(totalLeads / totalCorretores) : 0,
        negociacoes: totalCorretores > 0 ? Math.round(totalNegociacoes / totalCorretores) : 0,
        valorFechado: totalCorretores > 0 ? Math.round(valorTotalFechado / totalCorretores) : 0
      }
    }
  }

  /**
   * Retorna ranking completo de corretores com métricas detalhadas
   */
  async getRankingCorretores(tenantId: string): Promise<CorretorPerformance[]> {
    const corretores = await this.prisma.corretor.findMany({
      where: { tenant_id: tenantId },
      include: {
        user: {
          select: {
            nome: true,
            email: true,
            ultimo_login: true
          }
        },
        leads: {
          select: {
            id: true,
            temperatura: true,
            created_at: true,
            last_interaction_at: true
          }
        },
        negociacoes: {
          select: {
            id: true,
            status: true,
            valor_proposta: true,
            valor_final: true,
            created_at: true,
            updated_at: true
          }
        },
        agendamentos: {
          select: {
            id: true,
            status: true,
            realizado: true
          }
        }
      }
    }) as unknown as CorretorComRelacoes[]

    const corretoresComMetricas = corretores.map((corretor) => {
      const leads = corretor.leads
      const negociacoes = corretor.negociacoes
      const agendamentos = corretor.agendamentos

      // Contagens de leads por temperatura
      const leadsQuentes = leads.filter((l) => l.temperatura === 'QUENTE').length
      const leadsMornos = leads.filter((l) => l.temperatura === 'MORNO').length
      const leadsFrios = leads.filter((l) => l.temperatura === 'FRIO').length

      // Contagens de negociações
      const negociacoesFechadas = negociacoes.filter((n) => n.status === 'FECHADO')
      const negociacoesEmAndamento = negociacoes.filter((n) =>
        !['FECHADO', 'CANCELADO', 'PERDIDO'].includes(n.status)
      ).length

      // Valores
      const valorTotalFechado = negociacoesFechadas.reduce(
        (acc: number, n) => acc + (n.valor_final?.toNumber() || n.valor_proposta?.toNumber() || 0),
        0
      )
      const valorMedioFechado = negociacoesFechadas.length > 0
        ? valorTotalFechado / negociacoesFechadas.length
        : 0

      // Taxa de conversão
      const taxaConversao = negociacoes.length > 0
        ? (negociacoesFechadas.length / negociacoes.length) * 100
        : 0

      // Visitas
      const totalVisitas = agendamentos.length
      const visitasRealizadas = agendamentos.filter((a) => a.realizado).length

      // Tempo médio de primeiro contato (baseado em last_interaction_at)
      const leadsComInteracao = leads.filter((l) => l.last_interaction_at)
      let tempoMedioPrimeiroContato: number | null = null
      if (leadsComInteracao.length > 0) {
        const somaHoras = leadsComInteracao.reduce((acc: number, l) => {
          const diff = new Date(l.last_interaction_at!).getTime() - new Date(l.created_at).getTime()
          return acc + (diff / (1000 * 60 * 60)) // Converte para horas
        }, 0)
        tempoMedioPrimeiroContato = parseFloat((somaHoras / leadsComInteracao.length).toFixed(1))
      }

      // Tempo médio de fechamento
      let tempoMedioFechamento: number | null = null
      if (negociacoesFechadas.length > 0) {
        const somaDias = negociacoesFechadas.reduce((acc: number, n) => {
          const diff = new Date(n.updated_at).getTime() - new Date(n.created_at).getTime()
          return acc + (diff / (1000 * 60 * 60 * 24)) // Converte para dias
        }, 0)
        tempoMedioFechamento = parseFloat((somaDias / negociacoesFechadas.length).toFixed(1))
      }

      // Última atividade
      const ultimaAtividadeLead = leads.length > 0
        ? Math.max(...leads.map((l) => new Date(l.last_interaction_at || l.created_at).getTime()))
        : 0
      const ultimaAtividadeNegociacao = negociacoes.length > 0
        ? Math.max(...negociacoes.map((n) => new Date(n.updated_at).getTime()))
        : 0
      const ultimaAtividade = Math.max(ultimaAtividadeLead, ultimaAtividadeNegociacao)

      // Calcular pontuação para ranking
      // Pesos: Fechamentos (40%), Taxa Conversão (20%), Leads Quentes (15%), Visitas (15%), Atividade (10%)
      const pontuacao =
        (negociacoesFechadas.length * 100) * 0.4 +
        (taxaConversao) * 0.2 +
        (leadsQuentes * 10) * 0.15 +
        (visitasRealizadas * 10) * 0.15 +
        (ultimaAtividade > 0 ? 50 : 0) * 0.1

      return {
        id: corretor.id,
        nome: corretor.user.nome,
        email: corretor.user.email,
        creci: corretor.creci,
        foto_url: undefined,
        metricas: {
          totalLeads: leads.length,
          leadsQuentes,
          leadsMornos,
          leadsFrios,
          totalNegociacoes: negociacoes.length,
          negociacoesFechadas: negociacoesFechadas.length,
          negociacoesEmAndamento,
          taxaConversao: parseFloat(taxaConversao.toFixed(2)),
          valorTotalFechado,
          valorMedioFechado: parseFloat(valorMedioFechado.toFixed(2)),
          totalVisitas,
          visitasRealizadas
        },
        tempoMedio: {
          primeiroContato: tempoMedioPrimeiroContato,
          fechamento: tempoMedioFechamento
        },
        ultimaAtividade: ultimaAtividade > 0 ? new Date(ultimaAtividade) : null,
        ranking: {
          posicao: 0, // Será preenchido depois de ordenar
          pontuacao: parseFloat(pontuacao.toFixed(2))
        }
      }
    })

    // Ordenar por pontuação e atribuir posições
    corretoresComMetricas.sort((a, b) => b.ranking.pontuacao - a.ranking.pontuacao)
    corretoresComMetricas.forEach((c, index) => {
      c.ranking.posicao = index + 1
    })

    return corretoresComMetricas
  }

  /**
   * Retorna comparativo de períodos (últimos 3 meses)
   */
  async getComparativoPeriodos(tenantId: string): Promise<ComparativoPeriodo[]> {
    const now = new Date()
    const periodos: ComparativoPeriodo[] = []

    for (let i = 0; i < 3; i++) {
      const inicioMes = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const fimMes = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const [leads, negociacoes, fechamentos, valorFechado] = await Promise.all([
        this.prisma.lead.count({
          where: {
            tenant_id: tenantId,
            created_at: { gte: inicioMes, lte: fimMes }
          }
        }),
        this.prisma.negociacao.count({
          where: {
            tenant_id: tenantId,
            created_at: { gte: inicioMes, lte: fimMes }
          }
        }),
        this.prisma.negociacao.count({
          where: {
            tenant_id: tenantId,
            status: 'FECHADO',
            updated_at: { gte: inicioMes, lte: fimMes }
          }
        }),
        this.prisma.negociacao.aggregate({
          where: {
            tenant_id: tenantId,
            status: 'FECHADO',
            updated_at: { gte: inicioMes, lte: fimMes }
          },
          _sum: { valor_final: true }
        })
      ])

      const nomeMes = inicioMes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

      periodos.push({
        periodo: nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1),
        leads,
        negociacoes,
        fechamentos,
        valorFechado: valorFechado._sum.valor_final?.toNumber() || 0
      })
    }

    return periodos.reverse() // Ordem cronológica
  }

  /**
   * Retorna top 5 corretores por métrica específica
   */
  async getTopCorretores(
    tenantId: string,
    metrica: 'fechamentos' | 'leads' | 'valor' | 'conversao' = 'fechamentos',
    limit: number = 5
  ) {
    const ranking = await this.getRankingCorretores(tenantId)

    let sorted: CorretorPerformance[]
    switch (metrica) {
      case 'fechamentos':
        sorted = [...ranking].sort((a, b) => b.metricas.negociacoesFechadas - a.metricas.negociacoesFechadas)
        break
      case 'leads':
        sorted = [...ranking].sort((a, b) => b.metricas.totalLeads - a.metricas.totalLeads)
        break
      case 'valor':
        sorted = [...ranking].sort((a, b) => b.metricas.valorTotalFechado - a.metricas.valorTotalFechado)
        break
      case 'conversao':
        sorted = [...ranking].sort((a, b) => b.metricas.taxaConversao - a.metricas.taxaConversao)
        break
      default:
        sorted = ranking
    }

    return sorted.slice(0, limit).map((c, index) => ({
      posicao: index + 1,
      id: c.id,
      nome: c.nome,
      foto_url: c.foto_url,
      valor: metrica === 'fechamentos' ? c.metricas.negociacoesFechadas
        : metrica === 'leads' ? c.metricas.totalLeads
        : metrica === 'valor' ? c.metricas.valorTotalFechado
        : c.metricas.taxaConversao
    }))
  }

  /**
   * Retorna distribuição de leads por temperatura no time
   */
  async getDistribuicaoTemperaturaTime(tenantId: string) {
    const distribuicao = await this.prisma.lead.groupBy({
      by: ['temperatura'],
      where: { tenant_id: tenantId },
      _count: true
    })

    const total = distribuicao.reduce((acc, d) => acc + d._count, 0)

    return {
      total,
      distribuicao: distribuicao.map(d => ({
        temperatura: d.temperatura,
        quantidade: d._count,
        percentual: total > 0 ? parseFloat(((d._count / total) * 100).toFixed(2)) : 0
      }))
    }
  }

  /**
   * Retorna alertas gerenciais
   */
  async getAlertasGerenciais(tenantId: string) {
    const now = new Date()
    const seteDiasAtras = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      leadsQuentesSemContato,
      corretoresInativos,
      negociacoesParadas,
      agendamentosHoje
    ] = await Promise.all([
      // Leads quentes sem contato há mais de 3 dias
      this.prisma.lead.count({
        where: {
          tenant_id: tenantId,
          temperatura: 'QUENTE',
          OR: [
            { last_interaction_at: null },
            { last_interaction_at: { lt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) } }
          ]
        }
      }),
      // Corretores sem atividade há mais de 7 dias
      this.prisma.corretor.count({
        where: {
          tenant_id: tenantId,
          AND: [
            { leads: { none: { updated_at: { gte: seteDiasAtras } } } },
            { negociacoes: { none: { updated_at: { gte: seteDiasAtras } } } }
          ]
        }
      }),
      // Negociações sem atualização há mais de 15 dias
      this.prisma.negociacao.count({
        where: {
          tenant_id: tenantId,
          status: { notIn: ['FECHADO', 'CANCELADO', 'PERDIDO'] },
          updated_at: { lt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) }
        }
      }),
      // Agendamentos para hoje
      this.prisma.agendamento.count({
        where: {
          tenant_id: tenantId,
          data_visita: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          },
          status: { in: ['PENDENTE', 'CONFIRMADO'] }
        }
      })
    ])

    const alertas = []

    if (leadsQuentesSemContato > 0) {
      alertas.push({
        tipo: 'URGENTE',
        icone: '🔥',
        titulo: 'Leads quentes sem contato',
        mensagem: `${leadsQuentesSemContato} lead(s) quente(s) sem contato há mais de 3 dias`,
        quantidade: leadsQuentesSemContato
      })
    }

    if (corretoresInativos > 0) {
      alertas.push({
        tipo: 'ATENCAO',
        icone: '⚠️',
        titulo: 'Corretores inativos',
        mensagem: `${corretoresInativos} corretor(es) sem atividade há mais de 7 dias`,
        quantidade: corretoresInativos
      })
    }

    if (negociacoesParadas > 0) {
      alertas.push({
        tipo: 'ATENCAO',
        icone: '⏸️',
        titulo: 'Negociações paradas',
        mensagem: `${negociacoesParadas} negociação(ões) sem atualização há mais de 15 dias`,
        quantidade: negociacoesParadas
      })
    }

    if (agendamentosHoje > 0) {
      alertas.push({
        tipo: 'INFO',
        icone: '📅',
        titulo: 'Visitas hoje',
        mensagem: `${agendamentosHoje} visita(s) agendada(s) para hoje`,
        quantidade: agendamentosHoje
      })
    }

    return alertas
  }

  /**
   * Retorna dados completos do dashboard gerencial
   */
  async getDashboardCompleto(tenantId: string) {
    const [
      metricas,
      ranking,
      comparativo,
      distribuicaoTemperatura,
      alertas,
      topFechamentos,
      topValor
    ] = await Promise.all([
      this.getMetricasTime(tenantId),
      this.getRankingCorretores(tenantId),
      this.getComparativoPeriodos(tenantId),
      this.getDistribuicaoTemperaturaTime(tenantId),
      this.getAlertasGerenciais(tenantId),
      this.getTopCorretores(tenantId, 'fechamentos', 5),
      this.getTopCorretores(tenantId, 'valor', 5)
    ])

    return {
      metricas,
      ranking,
      comparativo,
      distribuicaoTemperatura,
      alertas,
      tops: {
        fechamentos: topFechamentos,
        valor: topValor
      }
    }
  }
}
