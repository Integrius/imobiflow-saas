import { PrismaClient } from '@prisma/client'
import { TenantRepository } from './tenant.repository'
import { CreateTenantDTO, UpdateTenantDTO } from './tenant.schema'
import { AppError } from '../../shared/errors/AppError'
import bcrypt from 'bcryptjs'
import { ActivityLogService } from '../../shared/services/activity-log.service'

export class TenantService {
  private repository: TenantRepository

  constructor(private prisma: PrismaClient) {
    this.repository = new TenantRepository(prisma)
  }

  async create(data: CreateTenantDTO) {
    // DEBUG: Log dos dados recebidos
    console.log('🔍 TenantService.create - Dados recebidos:', {
      nome: data.nome,
      slug: data.slug,
      adminNome: data.adminNome,
      adminEmail: data.adminEmail,
      adminSenhaPresente: !!data.adminSenha,
      hasAdminData: !!(data.adminNome && data.adminEmail && data.adminSenha)
    })

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

    // Se dados do admin foram fornecidos, criar tenant + admin em uma transação
    if (data.adminNome && data.adminEmail && data.adminSenha) {
      console.log('✅ Iniciando transação para criar tenant + admin')
      const adminNome = data.adminNome
      const adminEmail = data.adminEmail
      const adminSenha = data.adminSenha

      return await this.prisma.$transaction(async (tx) => {
        // 1. Criar tenant
        const tenant = await tx.tenant.create({
          data: {
            nome: data.nome,
            slug: data.slug,
            subdominio,
            email: data.email,
            telefone: data.telefone,
            plano: data.plano,
            status: 'TRIAL',
            data_expiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
            limite_usuarios: 3,
            limite_imoveis: 100,
            limite_storage_mb: 1000
          }
        })

        // 2. Hash da senha
        const senha_hash = bcrypt.hashSync(adminSenha, 10)

        // 3. Criar usuário admin
        const user = await tx.user.create({
          data: {
            nome: adminNome,
            email: adminEmail,
            senha_hash,
            tipo: 'ADMIN',
            ativo: true,
            tenant_id: tenant.id
          }
        })

        // 4. Criar registro Corretor (obrigatório para ADMIN/GESTOR/CORRETOR)
        await tx.corretor.create({
          data: {
            user_id: user.id,
            tenant_id: tenant.id,
            creci: 'ADMIN-' + tenant.id.substring(0, 8), // CRECI temporário para admin
            telefone: data.telefone || '(00) 00000-0000' // Telefone padrão se não fornecido
          }
        })

        // 5. Atualizar contador de usuários do tenant
        await tx.tenant.update({
          where: { id: tenant.id },
          data: { total_usuarios: 1 }
        })

        // 6. ✅ Log de criação do tenant
        await ActivityLogService.logTenantCriado(tenant.id)

        return tenant
      })
    }

    // Criar apenas tenant (compatibilidade com código antigo)
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

  async findBySubdominio(subdominio: string) {
    const tenant = await this.repository.findBySubdominio(subdominio)

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
