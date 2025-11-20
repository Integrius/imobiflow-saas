import { PrismaClient, StatusNegociacao } from '@prisma/client'
import { ListNegociacoesDTO } from './negociacoes.schema'

export class NegociacoesRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    lead_id: string
    imovel_id: string
    corretor_id: string
    valor_proposta?: number | null
    observacoes?: string | null
  }) {
    const timeline = [
      {
        timestamp: new Date().toISOString(),
        evento: 'CRIACAO',
        status: 'CONTATO',
        descricao: 'Negociação criada',
      },
    ]

    return this.prisma.negociacao.create({
      data: {
        ...data,
        status: 'CONTATO',
        timeline,
        comissoes: [],
        documentos: [],
      },
      include: {
        lead: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        imovel: {
          select: {
            id: true,
            codigo: true,
            tipo: true,
            endereco: true,
          },
        },
        corretor: {
          select: {
            id: true,
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
  }

  async findAll(filters: ListNegociacoesDTO) {
    const { page, limit, sort, order, ...where } = filters
    const skip = (page - 1) * limit
    const whereClause: any = {}

    if (where.status) whereClause.status = where.status
    if (where.corretor_id) whereClause.corretor_id = where.corretor_id
    if (where.lead_id) whereClause.lead_id = where.lead_id
    if (where.imovel_id) whereClause.imovel_id = where.imovel_id

    if (where.data_inicio || where.data_fim) {
      whereClause.created_at = {}
      if (where.data_inicio) whereClause.created_at.gte = new Date(where.data_inicio)
      if (where.data_fim) whereClause.created_at.lte = new Date(where.data_fim)
    }

    const [negociacoes, total] = await Promise.all([
      this.prisma.negociacao.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          lead: { 
            select: { 
              id: true, 
              nome: true, 
              email: true, 
              telefone: true 
            } 
          },
          imovel: { 
            select: { 
              id: true, 
              codigo: true, 
              tipo: true, 
              endereco: true 
            } 
          },
          corretor: { 
            select: { 
              id: true, 
              creci: true,
              user: {
                select: {
                  nome: true,
                },
              },
            } 
          },
        },
      }),
      this.prisma.negociacao.count({ where: whereClause }),
    ])

    return {
      data: negociacoes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string) {
    return this.prisma.negociacao.findUnique({
      where: { id },
      include: {
        lead: true,
        imovel: true,
        corretor: {
          include: {
            user: true,
          },
        },
      },
    })
  }

  async update(id: string, data: any) {
    return this.prisma.negociacao.update({
      where: { id },
      data,
      include: {
        lead: true,
        imovel: true,
        corretor: {
          include: {
            user: true,
          },
        },
      },
    })
  }

  async changeStatus(
    id: string,
    status: StatusNegociacao,
    motivo_perda?: string,
    valor_fechamento?: number
  ) {
    const negociacao = await this.findById(id)
    if (!negociacao) return null

    const timeline = [
      ...(negociacao.timeline as any[]),
      {
        timestamp: new Date().toISOString(),
        evento: 'MUDANCA_STATUS',
        status_anterior: negociacao.status,
        status_novo: status,
        descricao: `Status alterado de ${negociacao.status} para ${status}`,
        motivo_perda: motivo_perda || null,
        valor_fechamento: valor_fechamento || null,
      },
    ]

    const updateData: any = { status, timeline }
    if (motivo_perda) updateData.motivo_perda = motivo_perda
    if (valor_fechamento) updateData.valor_proposta = valor_fechamento

    return this.update(id, updateData)
  }

  async addComissao(id: string, comissao: any) {
    const negociacao = await this.findById(id)
    if (!negociacao) return null

    const comissoes = [
      ...(negociacao.comissoes as any[]),
      {
        id: crypto.randomUUID(),
        ...comissao,
        created_at: new Date().toISOString(),
      },
    ]

    const timeline = [
      ...(negociacao.timeline as any[]),
      {
        timestamp: new Date().toISOString(),
        evento: 'COMISSAO_ADICIONADA',
        descricao: `Comissão de ${comissao.tipo}: ${comissao.percentual}% (R$ ${comissao.valor})`,
      },
    ]

    return this.prisma.negociacao.update({
      where: { id },
      data: { comissoes, timeline },
      include: { 
        lead: true, 
        imovel: true, 
        corretor: {
          include: {
            user: true,
          },
        },
      },
    })
  }

  async addDocumento(id: string, documento: any) {
    const negociacao = await this.findById(id)
    if (!negociacao) return null

    const documentos = [
      ...(negociacao.documentos as any[]),
      {
        id: crypto.randomUUID(),
        ...documento,
        created_at: new Date().toISOString(),
      },
    ]

    const timeline = [
      ...(negociacao.timeline as any[]),
      {
        timestamp: new Date().toISOString(),
        evento: 'DOCUMENTO_ADICIONADO',
        descricao: `Documento ${documento.tipo}: ${documento.nome}`,
      },
    ]

    return this.prisma.negociacao.update({
      where: { id },
      data: { documentos, timeline },
      include: { 
        lead: true, 
        imovel: true, 
        corretor: {
          include: {
            user: true,
          },
        },
      },
    })
  }

  async delete(id: string) {
    return this.prisma.negociacao.delete({ where: { id } })
  }

  async getStats(filters?: any) {
    const whereClause: any = {}
    if (filters?.corretor_id) whereClause.corretor_id = filters.corretor_id
    if (filters?.data_inicio || filters?.data_fim) {
      whereClause.created_at = {}
      if (filters.data_inicio) whereClause.created_at.gte = filters.data_inicio
      if (filters.data_fim) whereClause.created_at.lte = filters.data_fim
    }

    const [total, porStatus, valorTotal, ticketMedio] = await Promise.all([
      this.prisma.negociacao.count({ where: whereClause }),
      this.prisma.negociacao.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true,
      }),
      this.prisma.negociacao.aggregate({
        where: {
          ...whereClause,
          status: { in: ['PROPOSTA', 'CONTRATO', 'FECHADO'] },
          valor_proposta: { not: null },
        },
        _sum: { valor_proposta: true },
      }),
      this.prisma.negociacao.aggregate({
        where: { ...whereClause, valor_proposta: { not: null } },
        _avg: { valor_proposta: true },
      }),
    ])

    const fechadas = porStatus.find(s => s.status === 'FECHADO')?._count || 0
    const taxaConversao = total > 0 ? (fechadas / total) * 100 : 0

    return {
      total,
      fechadas,
      taxaConversao: Number(taxaConversao.toFixed(2)),
      valorTotal: valorTotal._sum.valor_proposta || 0,
      ticketMedio: ticketMedio._avg.valor_proposta || 0,
      porStatus: porStatus.map(s => ({
        status: s.status,
        quantidade: s._count,
      })),
    }
  }
}
