import { PrismaClient, Corretor, Prisma } from '@prisma/client'
import { CreateCorretorDTO, UpdateCorretorDTO, ListCorretoresQuery } from './corretores.schema'
import * as bcrypt from 'bcryptjs'

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

    // Se o usuário não existe, criar um novo
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('123456', 10) // Senha padrão

      user = await this.prisma.user.create({
        data: {
          tenant_id: tenantId,
          nome: data.nome,
          email: data.email,
          senha_hash: hashedPassword,
          tipo: 'CORRETOR',
          ativo: true,
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

    return {
      id: corretor.id,
      nome: corretor.user.nome,
      email: corretor.user.email,
      telefone: corretor.telefone,
      creci: corretor.creci,
      especialidade: corretor.especializacoes[0] || null,
      comissao: Number(corretor.comissao_padrao),
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

    // Atualizar usuário se nome ou email foram alterados
    if (data.nome || data.email) {
      await this.prisma.user.update({
        where: { id: corretor.user_id },
        data: {
          ...(data.nome && { nome: data.nome }),
          ...(data.email && { email: data.email }),
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
}
