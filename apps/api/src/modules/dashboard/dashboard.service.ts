import { PrismaClient } from '@prisma/client'

export class DashboardService {
  constructor(private prisma: PrismaClient) {}

  async getOverview(filters?: {
    corretor_id?: string
    data_inicio?: Date
    data_fim?: Date
  }) {
    const whereClause: any = {}
    
    if (filters?.corretor_id) {
      whereClause.corretor_id = filters.corretor_id
    }

    if (filters?.data_inicio || filters?.data_fim) {
      whereClause.created_at = {}
      if (filters.data_inicio) whereClause.created_at.gte = filters.data_inicio
      if (filters.data_fim) whereClause.created_at.lte = filters.data_fim
    }

    const [
      totalLeads,
      leadsHoje,
      totalImoveis,
      imoveisDisponiveis,
      totalNegociacoes,
      negociacoesAbertas,
      negociacoesFechadas,
      valorTotalFechamentos,
      ticketMedio,
      leadsPorTemperatura,
      negociacoesPorStatus,
      topCorretores,
    ] = await Promise.all([
      this.prisma.lead.count({
        where: filters?.corretor_id ? { corretor_id: filters.corretor_id } : undefined,
      }),
      this.prisma.lead.count({
        where: {
          ...whereClause,
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.imovel.count(),
      this.prisma.imovel.count({
        where: { status: 'DISPONIVEL' },
      }),
      this.prisma.negociacao.count({ where: whereClause }),
      this.prisma.negociacao.count({
        where: {
          ...whereClause,
          status: { notIn: ['FECHADO', 'PERDIDO', 'CANCELADO'] },
        },
      }),
      this.prisma.negociacao.count({
        where: {
          ...whereClause,
          status: 'FECHADO',
        },
      }),
      this.prisma.negociacao.aggregate({
        where: {
          ...whereClause,
          status: 'FECHADO',
          valor_proposta: { not: null },
        },
        _sum: {
          valor_proposta: true,
        },
      }),
      this.prisma.negociacao.aggregate({
        where: {
          ...whereClause,
          status: 'FECHADO',
          valor_proposta: { not: null },
        },
        _avg: {
          valor_proposta: true,
        },
      }),
      this.prisma.lead.groupBy({
        by: ['temperatura'],
        where: filters?.corretor_id ? { corretor_id: filters.corretor_id } : undefined,
        _count: true,
      }),
      this.prisma.negociacao.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true,
      }),
      this.prisma.negociacao.groupBy({
        by: ['corretor_id'],
        where: {
          ...whereClause,
          status: 'FECHADO',
        },
        _count: true,
        orderBy: {
          _count: {
            corretor_id: 'desc',
          },
        },
        take: 5,
      }),
    ])

    const taxaConversao = totalNegociacoes > 0 
      ? (negociacoesFechadas / totalNegociacoes) * 100 
      : 0

    const topCorretoresComDados = await Promise.all(
      topCorretores.map(async (item) => {
        const corretor = await this.prisma.corretor.findUnique({
          where: { id: item.corretor_id },
          select: {
            id: true,
            creci: true,
            user: {
              select: {
                nome: true,
              },
            },
          },
        })
        return {
          id: corretor?.id,
          nome: corretor?.user?.nome,
          creci: corretor?.creci,
          totalFechamentos: item._count,
        }
      })
    )

    return {
      resumo: {
        totalLeads,
        leadsHoje,
        totalImoveis,
        imoveisDisponiveis,
        totalNegociacoes,
        negociacoesAbertas,
        negociacoesFechadas,
        taxaConversao: Number(taxaConversao.toFixed(2)),
      },
      financeiro: {
        valorTotalFechamentos: Number(valorTotalFechamentos._sum.valor_proposta || 0),
        ticketMedio: Number(ticketMedio._avg.valor_proposta || 0),
      },
      distribuicao: {
        leadsPorTemperatura: leadsPorTemperatura.map((item) => ({
          temperatura: item.temperatura,
          quantidade: item._count,
        })),
        negociacoesPorStatus: negociacoesPorStatus.map((item) => ({
          status: item.status,
          quantidade: item._count,
        })),
      },
      topCorretores: topCorretoresComDados,
    }
  }

  async getFunil(filters?: {
    corretor_id?: string
    data_inicio?: Date
    data_fim?: Date
  }) {
    const whereClause: any = {}
    
    if (filters?.corretor_id) {
      whereClause.corretor_id = filters.corretor_id
    }

    if (filters?.data_inicio || filters?.data_fim) {
      whereClause.created_at = {}
      if (filters.data_inicio) whereClause.created_at.gte = filters.data_inicio
      if (filters.data_fim) whereClause.created_at.lte = filters.data_fim
    }

    const [
      contato,
      visitaAgendada,
      visitaRealizada,
      proposta,
      analiseCredito,
      contrato,
      fechado,
      perdido,
      cancelado,
    ] = await Promise.all([
      this.prisma.negociacao.count({
        where: { ...whereClause, status: 'CONTATO' },
      }),
      this.prisma.negociacao.count({
        where: { ...whereClause, status: 'VISITA_AGENDADA' },
      }),
      this.prisma.negociacao.count({
        where: { ...whereClause, status: 'VISITA_REALIZADA' },
      }),
      this.prisma.negociacao.count({
        where: { ...whereClause, status: 'PROPOSTA' },
      }),
      this.prisma.negociacao.count({
        where: { ...whereClause, status: 'ANALISE_CREDITO' },
      }),
      this.prisma.negociacao.count({
        where: { ...whereClause, status: 'CONTRATO' },
      }),
      this.prisma.negociacao.count({
        where: { ...whereClause, status: 'FECHADO' },
      }),
      this.prisma.negociacao.count({
        where: { ...whereClause, status: 'PERDIDO' },
      }),
      this.prisma.negociacao.count({
        where: { ...whereClause, status: 'CANCELADO' },
      }),
    ])

    const total = contato + visitaAgendada + visitaRealizada + proposta + analiseCredito + contrato + fechado + perdido + cancelado

    return {
      etapas: [
        {
          status: 'CONTATO',
          quantidade: contato,
          percentual: total > 0 ? Number(((contato / total) * 100).toFixed(2)) : 0,
        },
        {
          status: 'VISITA_AGENDADA',
          quantidade: visitaAgendada,
          percentual: total > 0 ? Number(((visitaAgendada / total) * 100).toFixed(2)) : 0,
        },
        {
          status: 'VISITA_REALIZADA',
          quantidade: visitaRealizada,
          percentual: total > 0 ? Number(((visitaRealizada / total) * 100).toFixed(2)) : 0,
        },
        {
          status: 'PROPOSTA',
          quantidade: proposta,
          percentual: total > 0 ? Number(((proposta / total) * 100).toFixed(2)) : 0,
        },
        {
          status: 'ANALISE_CREDITO',
          quantidade: analiseCredito,
          percentual: total > 0 ? Number(((analiseCredito / total) * 100).toFixed(2)) : 0,
        },
        {
          status: 'CONTRATO',
          quantidade: contrato,
          percentual: total > 0 ? Number(((contrato / total) * 100).toFixed(2)) : 0,
        },
        {
          status: 'FECHADO',
          quantidade: fechado,
          percentual: total > 0 ? Number(((fechado / total) * 100).toFixed(2)) : 0,
        },
        {
          status: 'PERDIDO',
          quantidade: perdido,
          percentual: total > 0 ? Number(((perdido / total) * 100).toFixed(2)) : 0,
        },
        {
          status: 'CANCELADO',
          quantidade: cancelado,
          percentual: total > 0 ? Number(((cancelado / total) * 100).toFixed(2)) : 0,
        },
      ],
      total,
      taxaConversao: total > 0 ? Number(((fechado / total) * 100).toFixed(2)) : 0,
    }
  }

  async getAtividades(limit: number = 10) {
    const negociacoes = await this.prisma.negociacao.findMany({
      take: limit,
      orderBy: { updated_at: 'desc' },
      include: {
        lead: {
          select: {
            nome: true,
          },
        },
        imovel: {
          select: {
            codigo: true,
          },
        },
        corretor: {
          select: {
            creci: true,
            user: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
    })

    return negociacoes.map((neg) => ({
      id: neg.id,
      tipo: 'negociacao',
      descricao: `${neg.corretor.user.nome} - ${neg.lead.nome} - Imóvel ${neg.imovel.codigo}`,
      status: neg.status,
      data: neg.updated_at,
    }))
  }

  async getPerformanceCorretores(filters?: {
    data_inicio?: Date
    data_fim?: Date
  }) {
    const whereClause: any = {}
    
    if (filters?.data_inicio || filters?.data_fim) {
      whereClause.created_at = {}
      if (filters.data_inicio) whereClause.created_at.gte = filters.data_inicio
      if (filters.data_fim) whereClause.created_at.lte = filters.data_fim
    }

    const corretores = await this.prisma.corretor.findMany({
      select: {
        id: true,
        creci: true,
        user: {
          select: {
            nome: true,
          },
        },
      },
    })

    const performance = await Promise.all(
      corretores.map(async (corretor) => {
        const [
          totalLeads,
          totalNegociacoes,
          negociacoesFechadas,
          valorFechamentos,
        ] = await Promise.all([
          this.prisma.lead.count({
            where: { corretor_id: corretor.id },
          }),
          this.prisma.negociacao.count({
            where: { ...whereClause, corretor_id: corretor.id },
          }),
          this.prisma.negociacao.count({
            where: {
              ...whereClause,
              corretor_id: corretor.id,
              status: 'FECHADO',
            },
          }),
          this.prisma.negociacao.aggregate({
            where: {
              ...whereClause,
              corretor_id: corretor.id,
              status: 'FECHADO',
              valor_proposta: { not: null },
            },
            _sum: {
              valor_proposta: true,
            },
          }),
        ])

        const taxaConversao = totalNegociacoes > 0
          ? (negociacoesFechadas / totalNegociacoes) * 100
          : 0

        return {
          corretor: {
            id: corretor.id,
            nome: corretor.user.nome,
            creci: corretor.creci,
          },
          metricas: {
            totalLeads,
            totalNegociacoes,
            negociacoesFechadas,
            taxaConversao: Number(taxaConversao.toFixed(2)),
            valorTotal: Number(valorFechamentos._sum.valor_proposta || 0),
          },
        }
      })
    )

    return performance.sort(
      (a, b) => b.metricas.valorTotal - a.metricas.valorTotal
    )
  }
}
