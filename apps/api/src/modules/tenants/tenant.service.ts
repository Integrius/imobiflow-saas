import { PrismaClient } from '@prisma/client'
import { TenantRepository } from './tenant.repository'
import { CreateTenantDTO, UpdateTenantDTO } from './tenant.schema'
import { AppError } from '../../shared/errors/AppError'

export class TenantService {
  private repository: TenantRepository

  constructor(private prisma: PrismaClient) {
    this.repository = new TenantRepository(prisma)
  }

  async create(data: CreateTenantDTO) {
    // Verificar se slug já existe
    const slugExists = await this.repository.findBySlug(data.slug)
    if (slugExists) {
      throw new AppError('Slug já está em uso', 400)
    }

    // Verificar se email já existe
    const emailExists = await this.repository.findByEmail(data.email)
    if (emailExists) {
      throw new AppError('Email já está em uso', 400)
    }

    // Criar subdomínio baseado no slug
    const subdominio = data.slug

    // Criar tenant
    const tenant = await this.repository.create({
      ...data,
      subdominio
    })

    return tenant
  }

  async findById(id: string) {
    const tenant = await this.repository.findById(id)

    if (!tenant) {
      throw new AppError('Tenant não encontrado', 404)
    }

    return tenant
  }

  async findBySlug(slug: string) {
    const tenant = await this.repository.findBySlug(slug)

    if (!tenant) {
      throw new AppError('Tenant não encontrado', 404)
    }

    return tenant
  }

  async update(id: string, data: UpdateTenantDTO) {
    // Verificar se tenant existe
    await this.findById(id)

    // Se está atualizando o plano, atualizar os limites também
    if (data.plano) {
      const limites = this.getPlanLimits(data.plano)
      Object.assign(data, limites)
    }

    const tenant = await this.repository.update(id, data)

    return tenant
  }

  async list(filters?: {
    status?: string
    plano?: string
    search?: string
  }) {
    return this.repository.list(filters)
  }

  async checkLimits(tenantId: string, type: 'usuarios' | 'imoveis') {
    const tenant = await this.findById(tenantId)

    if (type === 'usuarios') {
      if (tenant.total_usuarios >= tenant.limite_usuarios) {
        throw new AppError(
          `Limite de usuários atingido (${tenant.limite_usuarios}). Faça upgrade do seu plano.`,
          403
        )
      }
    }

    if (type === 'imoveis') {
      if (tenant.total_imoveis >= tenant.limite_imoveis) {
        throw new AppError(
          `Limite de imóveis atingido (${tenant.limite_imoveis}). Faça upgrade do seu plano.`,
          403
        )
      }
    }

    return true
  }

  async suspendTenant(tenantId: string, reason?: string) {
    return this.repository.update(tenantId, {
      status: 'SUSPENSO'
    })
  }

  async activateTenant(tenantId: string) {
    return this.repository.update(tenantId, {
      status: 'ATIVO'
    })
  }

  async cancelTenant(tenantId: string) {
    return this.repository.update(tenantId, {
      status: 'CANCELADO'
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
