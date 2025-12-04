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

    if (existingUser) {
      throw new Error('Já existe um usuário com este email')
    }

    // Criar usuário primeiro
    const hashedPassword = await bcrypt.hash('123456', 10) // Senha padrão

    const user = await this.prisma.user.create({
      data: {
        tenant_id: tenantId,
        nome: data.nome,
        email: data.email,
        senha_hash: hashedPassword,
        tipo: 'CORRETOR',
        ativo: true,
      },
    })

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
    }
  }

  async update(id: string, data: UpdateCorretorDTO, tenantId: string): Promise<any> {
    const corretor = await this.prisma.corretor.findFirst({
      where: { id, tenant_id: tenantId },
      include: { user: true }
    })

    if (!corretor) throw new Error('Corretor não encontrado')

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
}
