import { PrismaClient, Corretor, Prisma } from '@prisma/client'
import { CreateCorretorDTO, UpdateCorretorDTO, ListCorretoresQuery } from './corretores.schema'
import * as bcrypt from 'bcryptjs'
import { PasswordGeneratorService } from '../../shared/utils/password-generator.service'

export class CorretoresRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateCorretorDTO, tenantId: string): Promise<any> {
    // Verificar se já existe um usuário com esse email no tenant
    const existingUser = await this.prisma.user.findFirst({
      where: {
        tenant_id: tenantId,
        email: data.email
      }
    })

    let user = existingUser
    let senhaTemporaria: string | null = null

    // Se o usuário não existe, criar um novo com senha temporária
    if (!existingUser) {
      // Gerar senha temporária de 6 caracteres
      senhaTemporaria = PasswordGeneratorService.generate(6)
      const senhaExpiraEm = PasswordGeneratorService.getExpirationDate()

      // Hash da senha temporária para senha_hash (backup)
      const hashedPassword = await bcrypt.hash(senhaTemporaria, 10)

      user = await this.prisma.user.create({
        data: {
          tenant_id: tenantId,
          nome: data.nome,
          email: data.email,
          senha_hash: hashedPassword,
          tipo: data.tipo || 'CORRETOR',
          ativo: true,
          // Campos para primeiro acesso com senha temporária
          primeiro_acesso: true,
          senha_temporaria: senhaTemporaria,
          senha_temp_expira_em: senhaExpiraEm,
          senha_temp_usada: false,
        },
      })
    } else {
      // Se o usuário já existe, verificar se já é um corretor
      const existingCorretor = await this.prisma.corretor.findFirst({
        where: {
          tenant_id: tenantId,
          user_id: existingUser.id
        }
      })

      if (existingCorretor) {
        throw new Error('Este usuário já está cadastrado como corretor')
      }
    }

    // Garantir que user não é null
    if (!user) {
      throw new Error('Erro ao criar ou encontrar usuário')
    }

    // Criar corretor vinculado ao usuário
    const corretor = await this.prisma.corretor.create({
      data: {
        tenant_id: tenantId,
        user_id: user.id,
        creci: data.creci,
        telefone: data.telefone,
        especializacoes: data.especialidade ? [data.especialidade] : [],
        comissao_padrao: data.comissao || 3.0,
        performance_score: 0,
        disponibilidade: {} as Prisma.JsonObject,
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

    // Buscar informações do tenant para URL
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true, nome: true }
    })

    return {
      id: corretor.id,
      nome: corretor.user.nome,
      email: corretor.user.email,
      telefone: corretor.telefone,
      creci: corretor.creci,
      especialidade: corretor.especializacoes[0] || null,
      comissao: Number(corretor.comissao_padrao),
      // Dados para envio de notificações (apenas quando novo usuário criado)
      senhaTemporaria,
      tenantSlug: tenant?.slug,
      tenantNome: tenant?.nome,
    }
  }

  async findAll(query: ListCorretoresQuery, tenantId: string) {
    const { page, limit, search } = query

    const where: Prisma.CorretorWhereInput = {
      tenant_id: tenantId
    }

    if (search) {
      where.OR = [
        { user: { nome: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { creci: { contains: search } },
        { telefone: { contains: search } },
      ]
    }

    const corretores = await this.prisma.corretor.findMany({
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
            primeiro_acesso: true,
            status_conta: true,
          },
        },
      },
    })

    return corretores.map(corretor => ({
      id: corretor.id,
      nome: corretor.user.nome,
      email: corretor.user.email,
      telefone: corretor.telefone,
      creci: corretor.creci,
      especialidade: corretor.especializacoes[0] || null,
      comissao: Number(corretor.comissao_padrao),
      ativo: corretor.user.ativo,
      primeiro_acesso: corretor.user.primeiro_acesso,
      status_conta: corretor.user.status_conta,
      tipo: corretor.user.tipo,
    }))
  }

  async findById(id: string, tenantId: string): Promise<any | null> {
    const corretor = await this.prisma.corretor.findFirst({
      where: {
        id,
        tenant_id: tenantId
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            ativo: true,
            primeiro_acesso: true,
            status_conta: true,
          },
        },
      },
    })

    if (!corretor) return null

    return {
      id: corretor.id,
      nome: corretor.user.nome,
      email: corretor.user.email,
      telefone: corretor.telefone,
      creci: corretor.creci,
      especialidade: corretor.especializacoes[0] || null,
      comissao: Number(corretor.comissao_padrao),
      ativo: corretor.user.ativo,
      primeiro_acesso: corretor.user.primeiro_acesso,
      tipo: corretor.user.tipo,
    }
  }

  async update(id: string, data: UpdateCorretorDTO, tenantId: string): Promise<any> {
    const corretor = await this.prisma.corretor.findFirst({
      where: { id, tenant_id: tenantId },
      include: { user: true }
    })

    if (!corretor) throw new Error('Corretor não encontrado')

    // Se email está sendo alterado, verificar se já existe
    if (data.email && data.email !== corretor.user.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: {
          tenant_id: tenantId,
          email: data.email,
          id: { not: corretor.user_id } // Excluir o próprio usuário
        }
      })

      if (existingEmail) {
        throw new Error('Já existe um usuário com este email')
      }
    }

    // Atualizar usuário se nome, email ou tipo foram alterados
    if (data.nome || data.email || data.tipo) {
      await this.prisma.user.update({
        where: { id: corretor.user_id },
        data: {
          ...(data.nome && { nome: data.nome }),
          ...(data.email && { email: data.email }),
          ...(data.tipo && { tipo: data.tipo }),
        },
      })
    }

    // Atualizar corretor
    const updatedCorretor = await this.prisma.corretor.update({
      where: { id },
      data: {
        ...(data.telefone && { telefone: data.telefone }),
        ...(data.creci && { creci: data.creci }),
        ...(data.especialidade && { especializacoes: [data.especialidade] }),
        ...(data.comissao !== undefined && { comissao_padrao: data.comissao }),
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

    return {
      id: updatedCorretor.id,
      nome: updatedCorretor.user.nome,
      email: updatedCorretor.user.email,
      telefone: updatedCorretor.telefone,
      creci: updatedCorretor.creci,
      especialidade: updatedCorretor.especializacoes[0] || null,
      comissao: Number(updatedCorretor.comissao_padrao),
    }
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const corretor = await this.prisma.corretor.findFirst({
      where: { id, tenant_id: tenantId }
    })

    if (!corretor) throw new Error('Corretor não encontrado')

    // Deletar corretor primeiro
    await this.prisma.corretor.delete({
      where: { id }
    })

    // Deletar usuário
    await this.prisma.user.delete({
      where: { id: corretor.user_id }
    })
  }

  async getImoveis(id: string, tenantId: string) {
    const imoveis = await this.prisma.imovel.findMany({
      where: {
        tenant_id: tenantId,
        corretor_responsavel_id: id
      },
      select: {
        id: true,
        codigo: true,
        titulo: true,
        tipo: true,
        status: true,
        preco: true,
        fotos: true,
        endereco: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return imoveis.map(imovel => ({
      id: imovel.id,
      codigo: imovel.codigo,
      titulo: imovel.titulo,
      tipo: imovel.tipo,
      status: imovel.status,
      preco: Number(imovel.preco),
      fotoPrincipal: imovel.fotos[0] || null,
      endereco: imovel.endereco
    }))
  }

  async bulkUpdateStatus(
    corretorIds: string[],
    status: 'ATIVO' | 'SUSPENSO' | 'CANCELADO',
    ativo: boolean,
    tenantId: string
  ): Promise<number> {
    // Buscar os user_ids dos corretores
    const corretores = await this.prisma.corretor.findMany({
      where: {
        id: { in: corretorIds },
        tenant_id: tenantId
      },
      select: {
        user_id: true
      }
    })

    const userIds = corretores.map(c => c.user_id)

    // Atualizar status dos usuários
    const result = await this.prisma.user.updateMany({
      where: {
        id: { in: userIds },
        tenant_id: tenantId
      },
      data: {
        ativo,
        status_conta: status
      }
    })

    return result.count
  }

  async findByIds(corretorIds: string[], tenantId: string): Promise<any[]> {
    const corretores = await this.prisma.corretor.findMany({
      where: {
        id: { in: corretorIds },
        tenant_id: tenantId
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    })

    return corretores.map(corretor => ({
      id: corretor.id,
      userId: corretor.user_id,
      nome: corretor.user.nome,
      email: corretor.user.email,
      telefone: corretor.telefone
    }))
  }

  async getTenantInfo(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        slug: true,
        nome: true
      }
    })

    if (!tenant) {
      throw new Error('Tenant não encontrado')
    }

    return tenant
  }

  async updateUserPassword(userId: string, senhaTemporaria: string) {
    const hashedPassword = await bcrypt.hash(senhaTemporaria, 10)
    const senhaExpiraEm = PasswordGeneratorService.getExpirationDate()

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        senha_hash: hashedPassword,
        // Campos necessários para o fluxo de primeiro acesso
        senha_temporaria: senhaTemporaria,
        senha_temp_expira_em: senhaExpiraEm,
        senha_temp_usada: false,
        primeiro_acesso: true
      }
    })
  }

  async resetPrimeiroAcesso(userId: string) {
    // Método mantido para compatibilidade, mas agora o updateUserPassword já faz tudo
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        primeiro_acesso: true
      }
    })
  }
}
