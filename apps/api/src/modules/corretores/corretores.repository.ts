import { PrismaClient, Corretor, Prisma } from '@prisma/client'
import { CreateCorretorDTO, UpdateCorretorDTO, ListCorretoresQuery } from './corretores.schema'

export class CorretoresRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateCorretorDTO): Promise<Corretor> {
    return await this.prisma.corretor.create({
      data: {
        user_id: data.user_id,
        creci: data.creci,
        telefone: data.telefone,
        foto_url: data.foto_url || null,
        especializacoes: data.especializacoes || [],
        meta_mensal: data.meta_mensal || null,
        meta_anual: data.meta_anual || null,
        comissao_padrao: data.comissao_padrao,
        performance_score: 0,
        disponibilidade: data.disponibilidade as Prisma.JsonObject || {},
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            ativo: true,
          },
        },
      },
    })
  }

  async findAll(query: ListCorretoresQuery) {
    const { page, limit, especializacao, search, ativo } = query

    const where: Prisma.CorretorWhereInput = {}

    if (especializacao) {
      where.especializacoes = {
        has: especializacao,
      }
    }

    if (ativo !== undefined) {
      where.user = {
        ativo: ativo,
      }
    }

    if (search) {
      where.OR = [
        { user: { nome: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { creci: { contains: search } },
        { telefone: { contains: search } },
      ]
    }

    const [corretores, total] = await Promise.all([
      this.prisma.corretor.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              nome: true,
              email: true,
              tipo: true,
              ativo: true,
            },
          },
          _count: {
            select: {
              leads: true,
              negociacoes: true,
            },
          },
        },
      }),
      this.prisma.corretor.count({ where }),
    ])

    return {
      data: corretores,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string): Promise<Corretor | null> {
    return await this.prisma.corretor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            ativo: true,
            created_at: true,
          },
        },
        leads: {
          select: {
            id: true,
            nome: true,
            telefone: true,
            temperatura: true,
            score: true,
            created_at: true,
          },
          take: 10,
          orderBy: { created_at: 'desc' },
        },
        negociacoes: {
          select: {
            id: true,
            status: true,
            valor_proposta: true,
            created_at: true,
            lead: {
              select: {
                id: true,
                nome: true,
              },
            },
            imovel: {
              select: {
                id: true,
                codigo: true,
                tipo: true,
              },
            },
          },
          take: 10,
          orderBy: { created_at: 'desc' },
        },
        _count: {
          select: {
            leads: true,
            negociacoes: true,
          },
        },
      },
    })
  }

  async update(id: string, data: UpdateCorretorDTO): Promise<Corretor> {
    return await this.prisma.corretor.update({
      where: { id },
      data: {
        ...(data.creci && { creci: data.creci }),
        ...(data.telefone && { telefone: data.telefone }),
        ...(data.foto_url !== undefined && { foto_url: data.foto_url }),
        ...(data.especializacoes && { especializacoes: data.especializacoes }),
        ...(data.meta_mensal !== undefined && { meta_mensal: data.meta_mensal }),
        ...(data.meta_anual !== undefined && { meta_anual: data.meta_anual }),
        ...(data.comissao_padrao !== undefined && { comissao_padrao: data.comissao_padrao }),
        ...(data.performance_score !== undefined && { performance_score: data.performance_score }),
        ...(data.disponibilidade && { disponibilidade: data.disponibilidade as Prisma.JsonObject }),
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            ativo: true,
          },
        },
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.corretor.delete({
      where: { id },
    })
  }

  async getStats(corretorId: string) {
    const [totalLeads, leadsQuentes, totalNegociacoes, negociacoesFechadas] = await Promise.all([
      this.prisma.lead.count({ where: { corretor_id: corretorId } }),
      this.prisma.lead.count({ where: { corretor_id: corretorId, temperatura: 'QUENTE' } }),
      this.prisma.negociacao.count({ where: { corretor_id: corretorId } }),
      this.prisma.negociacao.count({ where: { corretor_id: corretorId, status: 'FECHADO' } }),
    ])

    return {
      total_leads: totalLeads,
      leads_quentes: leadsQuentes,
      total_negociacoes: totalNegociacoes,
      negociacoes_fechadas: negociacoesFechadas,
      taxa_conversao: totalLeads > 0 ? (negociacoesFechadas / totalLeads) * 100 : 0,
    }
  }
}
