import { PrismaClient } from '@prisma/client'
import { CreateTenantDTO } from './tenant.schema'

export class TenantRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: {
        assinaturas: {
          where: { status: 'ATIVA' },
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    })
  }

  async findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({
      where: { slug }
    })
  }

  async findBySubdominio(subdominio: string) {
    return this.prisma.tenant.findUnique({
      where: { subdominio }
    })
  }

  async findByEmail(email: string) {
    return this.prisma.tenant.findFirst({
      where: { email }
    })
  }

  async create(data: {
    nome: string
    slug: string
    email: string
    telefone?: string
    plano: 'BASICO' | 'PRO' | 'ENTERPRISE' | 'CUSTOM'
    subdominio?: string
  }) {
    // Definir limites baseado no plano
    const limites = this.getPlanLimits(data.plano)

    return this.prisma.tenant.create({
      data: {
        ...data,
        ...limites,
        status: 'TRIAL',
        data_expiracao: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 dias
      }
    })
  }

  async update(id: string, data: any) {
    return this.prisma.tenant.update({
      where: { id },
      data
    })
  }

  async incrementUsuarios(tenantId: string) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        total_usuarios: {
          increment: 1
        }
      }
    })
  }

  async decrementUsuarios(tenantId: string) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        total_usuarios: {
          decrement: 1
        }
      }
    })
  }

  async incrementImoveis(tenantId: string) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        total_imoveis: {
          increment: 1
        }
      }
    })
  }

  async decrementImoveis(tenantId: string) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        total_imoveis: {
          decrement: 1
        }
      }
    })
  }

  async list(filters?: {
    status?: string
    plano?: string
    search?: string
  }) {
    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.plano) {
      where.plano = filters.plano
    }

    if (filters?.search) {
      where.OR = [
        { nome: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    return this.prisma.tenant.findMany({
      where,
      orderBy: { created_at: 'desc' }
    })
  }

  private getPlanLimits(plano: string) {
    switch (plano) {
      case 'BASICO':
        return {
          limite_usuarios: 3,
          limite_imoveis: 100,
          limite_storage_mb: 1000
        }
      case 'PRO':
        return {
          limite_usuarios: 10,
          limite_imoveis: 500,
          limite_storage_mb: 5000
        }
      case 'ENTERPRISE':
        return {
          limite_usuarios: 999,
          limite_imoveis: 99999,
          limite_storage_mb: 50000
        }
      case 'CUSTOM':
        return {
          limite_usuarios: 999,
          limite_imoveis: 99999,
          limite_storage_mb: 100000
        }
      default:
        return {
          limite_usuarios: 3,
          limite_imoveis: 100,
          limite_storage_mb: 1000
        }
    }
  }
}
