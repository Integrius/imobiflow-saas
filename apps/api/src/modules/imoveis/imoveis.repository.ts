import { PrismaClient } from '@prisma/client'
import { CreateImovelDTO, UpdateImovelDTO, FilterImoveisDTO, ProximidadeDTO } from './imoveis.schema'

export class ImoveisRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateImovelDTO, tenantId: string) {
    return await this.prisma.imovel.create({
      data: {
        tenant_id: tenantId,
        codigo: data.codigo || this.generateCodigo(),
        tipo: data.tipo,
        categoria: data.categoria,
        titulo: data.titulo,
        descricao: data.descricao,
        endereco: data.endereco,
        caracteristicas: data.caracteristicas,
        preco: data.preco,
        condominio: data.condominio,
        iptu: data.iptu,
        proprietario_id: data.proprietario_id,
        fotos: data.fotos,
        documentos: data.documentos,
        status: data.status || 'DISPONIVEL',
        ultima_validacao: new Date(),
      },
      include: {
        proprietario: true,
      },
    })
  }

  async findAll(filters: FilterImoveisDTO, tenantId: string) {
    const {
      page = 1,
      limit = 20,
      tipo,
      categoria,
      status,
      preco_min,
      preco_max,
      cidade,
      bairro,
      proprietario_id,
      orderBy = 'data_desc'
    } = filters

    const where: any = {
      tenant_id: tenantId
    }

    if (tipo) where.tipo = tipo
    if (categoria) where.categoria = categoria
    if (status) where.status = status
    if (proprietario_id) where.proprietario_id = proprietario_id

    if (preco_min || preco_max) {
      where.preco = {}
      if (preco_min) where.preco.gte = preco_min
      if (preco_max) where.preco.lte = preco_max
    }

    const orderByClause = this.getOrderBy(orderBy)

    const [imoveis, total] = await Promise.all([
      this.prisma.imovel.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderByClause,
        include: {
          proprietario: {
            select: {
              id: true,
              nome: true,
              contato: true,
            },
          },
        },
      }),
      this.prisma.imovel.count({ where }),
    ])

    return {
      data: imoveis,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string, tenantId: string) {
    return await this.prisma.imovel.findFirst({
      where: {
        id,
        tenant_id: tenantId
      },
      include: {
        proprietario: true,
        corretor_responsavel: {
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
          include: {
            lead: true,
            corretor: {
              include: {
                user: {
                  select: {
                    nome: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })
  }

  async findByCodigo(codigo: string, tenantId: string) {
    return await this.prisma.imovel.findUnique({
      where: {
        tenant_id_codigo: {
          tenant_id: tenantId,
          codigo: codigo
        }
      }
    })
  }

  async findByProximidade(data: ProximidadeDTO, tenantId: string) {
    const { latitude, longitude, raio_km, limit = 20 } = data

    const imoveis = await this.prisma.$queryRaw`
      SELECT * FROM (
        SELECT
          i.*,
          (
            6371 * acos(
              cos(radians(${latitude}))
              * cos(radians((i.endereco->>'latitude')::float))
              * cos(radians((i.endereco->>'longitude')::float) - radians(${longitude}))
              + sin(radians(${latitude}))
              * sin(radians((i.endereco->>'latitude')::float))
            )
          ) AS distancia_km
        FROM imoveis i
        WHERE
          i.tenant_id = ${tenantId}
          AND i.endereco->>'latitude' IS NOT NULL
          AND i.endereco->>'longitude' IS NOT NULL
          AND i.status = 'DISPONIVEL'
      ) AS imoveis_com_distancia
      WHERE distancia_km <= ${raio_km}
      ORDER BY distancia_km
      LIMIT ${limit}
    `

    return imoveis
  }

  async update(id: string, data: UpdateImovelDTO, tenantId: string) {
    // Buscar o imóvel antes do update para ver o estado das fotos
    const imovelAntes = await this.prisma.imovel.findUnique({
      where: { id },
      select: { id: true, fotos: true }
    })
    console.log('=== FOTOS ANTES DO UPDATE ===', JSON.stringify(imovelAntes, null, 2))

    const updateData: any = {}

    if (data.codigo) updateData.codigo = data.codigo
    if (data.tipo) updateData.tipo = data.tipo
    if (data.categoria) updateData.categoria = data.categoria
    if (data.titulo) updateData.titulo = data.titulo
    if (data.descricao) updateData.descricao = data.descricao
    if (data.endereco) updateData.endereco = data.endereco
    if (data.caracteristicas) updateData.caracteristicas = data.caracteristicas
    if (data.preco) updateData.preco = data.preco
    if (data.condominio !== undefined) updateData.condominio = data.condominio
    if (data.iptu !== undefined) updateData.iptu = data.iptu
    // Fotos são gerenciadas exclusivamente pelos endpoints de upload/delete
    // if (data.fotos) updateData.fotos = data.fotos
    if (data.documentos) updateData.documentos = data.documentos
    if (data.status) updateData.status = data.status

    console.log('=== UPDATE DATA (PRISMA) ===', JSON.stringify(updateData, null, 2))

    return await this.prisma.imovel.update({
      where: { id },
      data: updateData,
      include: {
        proprietario: true,
      },
    })
  }

  async delete(id: string, tenantId: string) {
    return await this.prisma.imovel.deleteMany({
      where: {
        id,
        tenant_id: tenantId
      }
    })
  }

  async updateFotos(id: string, fotos: string[], tenantId: string) {
    return await this.prisma.imovel.update({
      where: {
        id,
        tenant_id: tenantId
      },
      data: {
        fotos
      },
      include: {
        proprietario: true
      }
    })
  }

  async changeCorretor(id: string, corretorId: string, tenantId: string, userId: string) {
    const imovel = await this.prisma.imovel.findFirst({
      where: {
        id,
        tenant_id: tenantId
      },
      include: {
        corretor_responsavel: {
          include: {
            user: {
              select: {
                nome: true
              }
            }
          }
        }
      }
    })

    if (!imovel) {
      throw new Error('Imóvel não encontrado')
    }

    const novoCorretor = await this.prisma.corretor.findFirst({
      where: {
        id: corretorId,
        tenant_id: tenantId
      },
      include: {
        user: {
          select: {
            nome: true
          }
        }
      }
    })

    if (!novoCorretor) {
      throw new Error('Corretor não encontrado')
    }

    const historicoEntry = {
      data_troca: new Date().toISOString(),
      corretor_anterior_id: imovel.corretor_responsavel_id,
      corretor_anterior_nome: imovel.corretor_responsavel?.user.nome || null,
      corretor_novo_id: corretorId,
      corretor_novo_nome: novoCorretor.user.nome,
      alterado_por: userId
    }

    const historicoAtual = (imovel.historico_corretores as any[]) || []
    const novoHistorico = [...historicoAtual, historicoEntry]

    return await this.prisma.imovel.update({
      where: { id },
      data: {
        corretor_responsavel_id: corretorId,
        historico_corretores: novoHistorico
      },
      include: {
        proprietario: true,
        corretor_responsavel: {
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

  private generateCodigo(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 6)
    return `IMO-${timestamp}-${random}`.toUpperCase()
  }

  private getOrderBy(orderBy: string) {
    switch (orderBy) {
      case 'preco_asc':
        return { preco: 'asc' as const }
      case 'preco_desc':
        return { preco: 'desc' as const }
      case 'data_asc':
        return { created_at: 'asc' as const }
      case 'data_desc':
      default:
        return { created_at: 'desc' as const }
    }
  }
}
