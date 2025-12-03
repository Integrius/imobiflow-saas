import { PrismaClient } from '@prisma/client'
import { CreateNegociacaoDTO, UpdateNegociacaoDTO, QueryNegociacoesDTO } from './negociacoes.schema'

export class NegociacoesRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateNegociacaoDTO, tenantId: string) {
    return await this.prisma.negociacao.create({
      data: {
        tenant_id: tenantId,
        lead_id: data.lead_id,
        imovel_id: data.imovel_id,
        corretor_id: data.corretor_id,
        valor_proposta: data.valor_proposta || null,
        codigo: `NEG-${Date.now()}`,
        status: 'CONTATO',
        timeline: [
          {
            tipo: 'CONTATO',
            descricao: 'Negociação iniciada',
            data: new Date().toISOString(),
            usuario: data.corretor_id
          }
        ],
        comissoes: []
      },
      include: {
        lead: true,
        imovel: {
          include: {
            proprietario: true
          }
        },
        corretor: {
          include: {
            user: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        }
      }
    })
  }

  async findAll(query: QueryNegociacoesDTO, tenantId: string) {
    const { page, limit, status, corretor_id, lead_id, imovel_id } = query
    const skip = (page - 1) * limit

    const where: any = {
      tenant_id: tenantId
    }
    if (status) where.status = status
    if (corretor_id) where.corretor_id = corretor_id
    if (lead_id) where.lead_id = lead_id
    if (imovel_id) where.imovel_id = imovel_id

    const [negociacoes, total] = await Promise.all([
      this.prisma.negociacao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          lead: true,
          imovel: {
            select: {
              id: true,
              codigo: true,
              tipo: true,
              categoria: true,
              endereco: true,
              preco: true
            }
          },
          corretor: {
            include: {
              user: {
                select: {
                  id: true,
                  nome: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      this.prisma.negociacao.count({ where })
    ])

    return {
      data: negociacoes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async findById(id: string, tenantId: string) {
    return await this.prisma.negociacao.findFirst({
      where: {
        id,
        tenant_id: tenantId
      },
      include: {
        lead: true,
        imovel: {
          include: {
            proprietario: true
          }
        },
        corretor: {
          include: {
            user: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        }
      }
    })
  }

  async update(id: string, data: UpdateNegociacaoDTO, tenantId: string) {
    return await this.prisma.negociacao.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.valor_proposta !== undefined && { valor_proposta: data.valor_proposta }),
      },
      include: {
        lead: true,
        imovel: true,
        corretor: {
          include: {
            user: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        }
      }
    })
  }

  async delete(id: string, tenantId: string) {
    return await this.prisma.negociacao.deleteMany({
      where: {
        id,
        tenant_id: tenantId
      }
    })
  }

  async addTimelineEvent(id: string, evento: any, tenantId: string) {
    const negociacao = await this.prisma.negociacao.findFirst({
      where: {
        id,
        tenant_id: tenantId
      },
      select: { timeline: true }
    })

    if (!negociacao) return null

    const timeline = negociacao.timeline as any[]
    timeline.push({
      ...evento,
      data: new Date().toISOString()
    })

    return await this.prisma.negociacao.update({
      where: { id },
      data: { timeline },
      include: {
        lead: true,
        imovel: true,
        corretor: true
      }
    })
  }

  async addComissao(id: string, comissao: any, tenantId: string) {
    const negociacao = await this.prisma.negociacao.findFirst({
      where: {
        id,
        tenant_id: tenantId
      },
      select: { comissoes: true }
    })

    if (!negociacao) return null

    const comissoes = negociacao.comissoes as any[]
    comissoes.push(comissao)

    return await this.prisma.negociacao.update({
      where: { id },
      data: { comissoes },
      include: {
        lead: true,
        imovel: true,
        corretor: true
      }
    })
  }

  async countByStatus(tenantId: string) {
    const negociacoes = await this.prisma.negociacao.groupBy({
      by: ['status'],
      where: { tenant_id: tenantId },
      _count: true
    })

    return negociacoes.reduce((acc, item) => {
      acc[item.status] = item._count
      return acc
    }, {} as Record<string, number>)
  }

  async findByCorretor(corretor_id: string, tenantId: string, limit: number = 10) {
    return await this.prisma.negociacao.findMany({
      where: {
        corretor_id,
        tenant_id: tenantId
      },
      take: limit,
      orderBy: { updated_at: 'desc' },
      include: {
        lead: true,
        imovel: {
          select: {
            id: true,
            codigo: true,
            tipo: true,
            endereco: true
          }
        }
      }
    })
  }
}
