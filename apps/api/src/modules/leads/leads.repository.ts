import { PrismaClient, Lead, Prisma } from '@prisma/client'
import { CreateLeadDTO, UpdateLeadDTO, ListLeadsQuery } from './leads.schema'

export class LeadsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateLeadDTO, tenantId: string): Promise<Lead> {
    return await this.prisma.lead.create({
      data: {
        tenant_id: tenantId,
        nome: data.nome,
        email: data.email || null,
        telefone: data.telefone,
        cpf: data.cpf || null,
        origem: data.origem,
        interesse: data.interesse as Prisma.JsonObject || {},
        timeline: [],
        corretor_id: data.corretor_id || null,
        score: 0,
        temperatura: 'FRIO',
      },
      include: {
        corretor: {
          include: {
            user: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
      },
    })
  }

  async findAll(query: ListLeadsQuery, tenantId: string) {
    const { page, limit, temperatura, origem, corretor_id, search, score_min, score_max } = query

    const where: Prisma.LeadWhereInput = {
      tenant_id: tenantId
    }

    if (temperatura) where.temperatura = temperatura
    if (origem) where.origem = origem
    if (corretor_id) where.corretor_id = corretor_id
    if (score_min !== undefined) where.score = { gte: score_min }
    if (score_max !== undefined) {
      where.score = where.score && typeof where.score === 'object'
        ? { ...(where.score as { gte?: number }), lte: score_max }
        : { lte: score_max }
    }

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telefone: { contains: search } },
      ]
    }

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          corretor: {
            include: {
              user: {
                select: {
                  id: true,
                  nome: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.lead.count({ where }),
    ])

    return {
      data: leads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string, tenantId: string): Promise<Lead | null> {
    return await this.prisma.lead.findFirst({
      where: {
        id,
        tenant_id: tenantId
      },
      include: {
        corretor: {
          include: {
            user: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
        negociacoes: {
          select: {
            id: true,
            status: true,
            valor_proposta: true,
            created_at: true,
            imovel: {
              select: {
                id: true,
                codigo: true,
                tipo: true,
                endereco: true,
              },
            },
          },
        },
      },
    })
  }

  async update(id: string, data: UpdateLeadDTO, tenantId: string): Promise<Lead> {
    return await this.prisma.lead.update({
      where: { id },
      data: {
        ...(data.nome && { nome: data.nome }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.telefone && { telefone: data.telefone }),
        ...(data.cpf !== undefined && { cpf: data.cpf }),
        ...(data.origem && { origem: data.origem }),
        ...(data.score !== undefined && { score: data.score }),
        ...(data.temperatura && { temperatura: data.temperatura }),
        ...(data.interesse && { interesse: data.interesse as Prisma.JsonObject }),
        ...(data.corretor_id !== undefined && { corretor_id: data.corretor_id }),
      },
      include: {
        corretor: {
          include: {
            user: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
      },
    })
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.prisma.lead.deleteMany({
      where: {
        id,
        tenant_id: tenantId
      }
    })
  }

  async addTimelineEvent(id: string, event: any, tenantId: string): Promise<Lead> {
    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        tenant_id: tenantId
      }
    })
    if (!lead) throw new Error('Lead não encontrado')

    const timeline = (lead.timeline as any[]) || []
    timeline.push({
      ...event,
      timestamp: new Date().toISOString(),
    })

    return await this.prisma.lead.update({
      where: { id },
      data: { timeline },
    })
  }

  async getStats(tenantId: string, corretorId?: string) {
    const where: Prisma.LeadWhereInput = {
      tenant_id: tenantId,
      ...(corretorId && { corretor_id: corretorId }) // Filtrar por corretor se fornecido
    }

    const [total, quentes, mornos, frios, semCorretor] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.count({ where: { ...where, temperatura: 'QUENTE' } }),
      this.prisma.lead.count({ where: { ...where, temperatura: 'MORNO' } }),
      this.prisma.lead.count({ where: { ...where, temperatura: 'FRIO' } }),
      this.prisma.lead.count({ where: { ...where, corretor_id: null } }),
    ])

    return {
      total,
      por_temperatura: {
        quentes,
        mornos,
        frios,
      },
      sem_corretor: semCorretor,
    }
  }
}
