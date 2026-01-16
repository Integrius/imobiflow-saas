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

  /**
   * Busca métricas de dashboard para um corretor específico
   */
  async getCorretorDashboard(corretorId: string, tenantId: string) {
    // Buscar corretor com informações do usuário
    const corretor = await this.prisma.corretor.findFirst({
      where: {
        id: corretorId,
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

    if (!corretor) {
      throw new Error('Corretor não encontrado')
    }

    // Datas para filtros
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const inicioAno = new Date(hoje.getFullYear(), 0, 1)

    // Buscar estatísticas de leads
    const [
      totalLeads,
      leadsNovosMes,
      leadsQuentes,
      leadsMornos,
      leadsFrios
    ] = await Promise.all([
      this.prisma.lead.count({
        where: { corretor_id: corretorId, tenant_id: tenantId }
      }),
      this.prisma.lead.count({
        where: {
          corretor_id: corretorId,
          tenant_id: tenantId,
          created_at: { gte: inicioMes }
        }
      }),
      this.prisma.lead.count({
        where: { corretor_id: corretorId, tenant_id: tenantId, temperatura: 'QUENTE' }
      }),
      this.prisma.lead.count({
        where: { corretor_id: corretorId, tenant_id: tenantId, temperatura: 'MORNO' }
      }),
      this.prisma.lead.count({
        where: { corretor_id: corretorId, tenant_id: tenantId, temperatura: 'FRIO' }
      })
    ])

    // Buscar estatísticas de negociações
    const [
      totalNegociacoes,
      negociacoesAtivas,
      negociacoesFechadas,
      negociacoesFechadasMes,
      negociacoesFechadasAno,
      negociacoesPerdidas
    ] = await Promise.all([
      this.prisma.negociacao.count({
        where: { corretor_id: corretorId, tenant_id: tenantId }
      }),
      this.prisma.negociacao.count({
        where: {
          corretor_id: corretorId,
          tenant_id: tenantId,
          status: { notIn: ['FECHADO', 'PERDIDO', 'CANCELADO'] }
        }
      }),
      this.prisma.negociacao.count({
        where: { corretor_id: corretorId, tenant_id: tenantId, status: 'FECHADO' }
      }),
      this.prisma.negociacao.count({
        where: {
          corretor_id: corretorId,
          tenant_id: tenantId,
          status: 'FECHADO',
          data_fechamento: { gte: inicioMes }
        }
      }),
      this.prisma.negociacao.count({
        where: {
          corretor_id: corretorId,
          tenant_id: tenantId,
          status: 'FECHADO',
          data_fechamento: { gte: inicioAno }
        }
      }),
      this.prisma.negociacao.count({
        where: { corretor_id: corretorId, tenant_id: tenantId, status: 'PERDIDO' }
      })
    ])

    // Calcular valor total de vendas (negociações fechadas)
    const vendasFechadas = await this.prisma.negociacao.aggregate({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        status: 'FECHADO'
      },
      _sum: {
        valor_final: true
      }
    })

    const vendasFechadasMes = await this.prisma.negociacao.aggregate({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        status: 'FECHADO',
        data_fechamento: { gte: inicioMes }
      },
      _sum: {
        valor_final: true
      }
    })

    const vendasFechadasAno = await this.prisma.negociacao.aggregate({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        status: 'FECHADO',
        data_fechamento: { gte: inicioAno }
      },
      _sum: {
        valor_final: true
      }
    })

    // Calcular comissões
    const comissoesMes = await this.prisma.negociacao.aggregate({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        status: 'FECHADO',
        data_fechamento: { gte: inicioMes }
      },
      _sum: {
        valor_comissao: true
      }
    })

    const comissoesAno = await this.prisma.negociacao.aggregate({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        status: 'FECHADO',
        data_fechamento: { gte: inicioAno }
      },
      _sum: {
        valor_comissao: true
      }
    })

    // Buscar agendamentos
    const [
      agendamentosPendentes,
      agendamentosHoje,
      agendamentosSemana
    ] = await Promise.all([
      this.prisma.agendamento.count({
        where: {
          corretor_id: corretorId,
          tenant_id: tenantId,
          status: 'PENDENTE',
          data_visita: { gte: hoje }
        }
      }),
      this.prisma.agendamento.count({
        where: {
          corretor_id: corretorId,
          tenant_id: tenantId,
          data_visita: {
            gte: new Date(hoje.setHours(0, 0, 0, 0)),
            lt: new Date(hoje.setHours(23, 59, 59, 999))
          }
        }
      }),
      this.prisma.agendamento.count({
        where: {
          corretor_id: corretorId,
          tenant_id: tenantId,
          data_visita: {
            gte: new Date(),
            lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Buscar imóveis sob responsabilidade
    const totalImoveis = await this.prisma.imovel.count({
      where: {
        corretor_responsavel_id: corretorId,
        tenant_id: tenantId
      }
    })

    // Calcular taxa de conversão
    const taxaConversao = totalLeads > 0
      ? ((negociacoesFechadas / totalLeads) * 100).toFixed(1)
      : '0.0'

    // Buscar últimas negociações
    const ultimasNegociacoes = await this.prisma.negociacao.findMany({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId
      },
      orderBy: { updated_at: 'desc' },
      take: 5,
      include: {
        lead: { select: { nome: true } },
        imovel: { select: { titulo: true, codigo: true } }
      }
    })

    // Buscar próximos agendamentos
    const proximosAgendamentos = await this.prisma.agendamento.findMany({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        data_visita: { gte: new Date() }
      },
      orderBy: { data_visita: 'asc' },
      take: 5,
      include: {
        lead: { select: { nome: true, telefone: true } },
        imovel: { select: { titulo: true, codigo: true } }
      }
    })

    // Buscar evolução mensal (últimos 6 meses)
    const evolucaoMensal = []
    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 1)

      const [leads, fechados, valor] = await Promise.all([
        this.prisma.lead.count({
          where: {
            corretor_id: corretorId,
            tenant_id: tenantId,
            created_at: { gte: mes, lt: proximoMes }
          }
        }),
        this.prisma.negociacao.count({
          where: {
            corretor_id: corretorId,
            tenant_id: tenantId,
            status: 'FECHADO',
            data_fechamento: { gte: mes, lt: proximoMes }
          }
        }),
        this.prisma.negociacao.aggregate({
          where: {
            corretor_id: corretorId,
            tenant_id: tenantId,
            status: 'FECHADO',
            data_fechamento: { gte: mes, lt: proximoMes }
          },
          _sum: { valor_final: true }
        })
      ])

      evolucaoMensal.push({
        mes: mes.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        leads,
        fechados,
        valor: Number(valor._sum.valor_final || 0)
      })
    }

    return {
      corretor: {
        id: corretor.id,
        nome: corretor.user.nome,
        email: corretor.user.email,
        creci: corretor.creci,
        telefone: corretor.telefone,
        metaMensal: Number(corretor.meta_mensal || 0),
        metaAnual: Number(corretor.meta_anual || 0),
        comissaoPadrao: Number(corretor.comissao_padrao)
      },
      leads: {
        total: totalLeads,
        novosMes: leadsNovosMes,
        quentes: leadsQuentes,
        mornos: leadsMornos,
        frios: leadsFrios
      },
      negociacoes: {
        total: totalNegociacoes,
        ativas: negociacoesAtivas,
        fechadas: negociacoesFechadas,
        fechadasMes: negociacoesFechadasMes,
        fechadasAno: negociacoesFechadasAno,
        perdidas: negociacoesPerdidas
      },
      vendas: {
        totalGeral: Number(vendasFechadas._sum.valor_final || 0),
        totalMes: Number(vendasFechadasMes._sum.valor_final || 0),
        totalAno: Number(vendasFechadasAno._sum.valor_final || 0)
      },
      comissoes: {
        totalMes: Number(comissoesMes._sum.valor_comissao || 0),
        totalAno: Number(comissoesAno._sum.valor_comissao || 0)
      },
      agendamentos: {
        pendentes: agendamentosPendentes,
        hoje: agendamentosHoje,
        semana: agendamentosSemana
      },
      imoveis: {
        total: totalImoveis
      },
      metricas: {
        taxaConversao: parseFloat(taxaConversao)
      },
      ultimasNegociacoes: ultimasNegociacoes.map(n => ({
        id: n.id,
        codigo: n.codigo,
        leadNome: n.lead.nome,
        imovelTitulo: n.imovel.titulo,
        imovelCodigo: n.imovel.codigo,
        status: n.status,
        valorProposta: Number(n.valor_proposta || 0),
        updatedAt: n.updated_at
      })),
      proximosAgendamentos: proximosAgendamentos.map(a => ({
        id: a.id,
        leadNome: a.lead.nome,
        leadTelefone: a.lead.telefone,
        imovelTitulo: a.imovel.titulo,
        imovelCodigo: a.imovel.codigo,
        dataVisita: a.data_visita,
        tipoVisita: a.tipo_visita,
        status: a.status
      })),
      evolucaoMensal
    }
  }

  /**
   * Busca o ID do corretor vinculado a um usuário
   */
  async findCorretorIdByUserId(userId: string, tenantId: string): Promise<string | null> {
    const corretor = await this.prisma.corretor.findFirst({
      where: {
        user_id: userId,
        tenant_id: tenantId
      },
      select: { id: true }
    })
    return corretor?.id || null
  }
}
