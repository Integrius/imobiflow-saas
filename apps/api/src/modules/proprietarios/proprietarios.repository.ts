import { PrismaClient } from '@prisma/client'
import { CreateProprietarioDTO, UpdateProprietarioDTO, FilterProprietariosDTO } from './proprietarios.schema'

export class ProprietariosRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateProprietarioDTO, tenantId: string) {
    return await this.prisma.proprietario.create({
      data: {
        tenant_id: tenantId,
        nome: data.nome,
        cpf_cnpj: data.cpf_cnpj,
        tipo_pessoa: data.tipo_pessoa,
        email: data.contato.email,
        telefone: data.contato.telefone_principal,
        telefone_secundario: data.contato.telefone_secundario,
        contato: data.contato,
        forma_pagamento: data.forma_pagamento,
        percentual_comissao: data.percentual_comissao,
        banco: data.dados_bancarios || {},
      },
    })
  }

  async findAll(filters: FilterProprietariosDTO, tenantId: string) {
    const { page = 1, limit = 20, nome, cpf_cnpj, tipo_pessoa } = filters

    const where: any = {
      tenant_id: tenantId
    }

    if (nome) {
      where.nome = { contains: nome, mode: 'insensitive' }
    }

    if (cpf_cnpj) {
      where.cpf_cnpj = cpf_cnpj
    }

    if (tipo_pessoa) {
      where.tipo_pessoa = tipo_pessoa
    }

    const [proprietarios, total] = await Promise.all([
      this.prisma.proprietario.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          imoveis: {
            select: {
              id: true,
              codigo: true,
              titulo: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.proprietario.count({ where }),
    ])

    return {
      data: proprietarios,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string, tenantId: string) {
    return await this.prisma.proprietario.findFirst({
      where: {
        id,
        tenant_id: tenantId
      },
      include: {
        imoveis: {
          orderBy: { created_at: 'desc' },
        },
      },
    })
  }

  async findByCpfCnpj(cpf_cnpj: string, tenantId: string) {
    return await this.prisma.proprietario.findUnique({
      where: {
        tenant_id_cpf_cnpj: {
          tenant_id: tenantId,
          cpf_cnpj: cpf_cnpj
        }
      }
    })
  }

  async findByNomeAndTelefone(nome: string, telefone: string, tenantId: string) {
    return await this.prisma.proprietario.findFirst({
      where: {
        tenant_id: tenantId,
        nome: {
          equals: nome,
          mode: 'insensitive'
        },
        telefone: telefone
      }
    })
  }

  async update(id: string, data: UpdateProprietarioDTO, tenantId: string) {
    const updateData: any = {}

    if (data.nome) updateData.nome = data.nome
    if (data.cpf_cnpj) updateData.cpf_cnpj = data.cpf_cnpj
    if (data.tipo_pessoa) updateData.tipo_pessoa = data.tipo_pessoa
    if (data.forma_pagamento) updateData.forma_pagamento = data.forma_pagamento
    if (data.percentual_comissao !== undefined) updateData.percentual_comissao = data.percentual_comissao

    if (data.contato) {
      updateData.email = data.contato.email
      updateData.telefone = data.contato.telefone_principal
      updateData.telefone_secundario = data.contato.telefone_secundario
      updateData.contato = data.contato
    }

    if (data.dados_bancarios) {
      updateData.banco = data.dados_bancarios
    }

    return await this.prisma.proprietario.update({
      where: { id },
      data: updateData,
    })
  }

  async delete(id: string, tenantId: string) {
    return await this.prisma.proprietario.deleteMany({
      where: {
        id,
        tenant_id: tenantId
      }
    })
  }
}
