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
        especializacoes: data.especializacoes || [],
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
      especializacoes: corretor.especializacoes,
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
      especializacoes: corretor.especializacoes,
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
      especializacoes: corretor.especializacoes,
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
        ...(data.especializacoes !== undefined && { especializacoes: data.especializacoes }),
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

  /**
   * Busca ranking do corretor comparado com a equipe
   */
  async getCorretorRanking(corretorId: string, tenantId: string) {
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
    const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0, 23, 59, 59)

    // Buscar todos os corretores do tenant com métricas
    const corretores = await this.prisma.corretor.findMany({
      where: {
        tenant_id: tenantId,
        user: { ativo: true }
      },
      include: {
        user: { select: { nome: true } }
      }
    })

    // Calcular métricas para cada corretor
    const corretoresComMetricas = await Promise.all(
      corretores.map(async (corretor) => {
        // Fechamentos do mês
        const fechamentosMes = await this.prisma.negociacao.count({
          where: {
            corretor_id: corretor.id,
            tenant_id: tenantId,
            status: 'FECHADO',
            data_fechamento: { gte: inicioMes }
          }
        })

        // Valor fechado no mês
        const valorMes = await this.prisma.negociacao.aggregate({
          where: {
            corretor_id: corretor.id,
            tenant_id: tenantId,
            status: 'FECHADO',
            data_fechamento: { gte: inicioMes }
          },
          _sum: { valor_final: true }
        })

        // Leads captados no mês
        const leadsMes = await this.prisma.lead.count({
          where: {
            corretor_id: corretor.id,
            tenant_id: tenantId,
            created_at: { gte: inicioMes }
          }
        })

        // Visitas realizadas no mês
        const visitasMes = await this.prisma.agendamento.count({
          where: {
            corretor_id: corretor.id,
            tenant_id: tenantId,
            status: 'REALIZADO',
            data_visita: { gte: inicioMes }
          }
        })

        // Total de leads para taxa de conversão
        const totalLeads = await this.prisma.lead.count({
          where: { corretor_id: corretor.id, tenant_id: tenantId }
        })

        const totalFechamentos = await this.prisma.negociacao.count({
          where: { corretor_id: corretor.id, tenant_id: tenantId, status: 'FECHADO' }
        })

        const taxaConversao = totalLeads > 0 ? (totalFechamentos / totalLeads) * 100 : 0

        return {
          id: corretor.id,
          nome: corretor.user.nome,
          fechamentosMes,
          valorMes: Number(valorMes._sum.valor_final || 0),
          leadsMes,
          visitasMes,
          taxaConversao
        }
      })
    )

    // Ordenar por fechamentos (principal), depois por valor
    const rankingFechamentos = [...corretoresComMetricas].sort((a, b) => {
      if (b.fechamentosMes !== a.fechamentosMes) return b.fechamentosMes - a.fechamentosMes
      return b.valorMes - a.valorMes
    })

    const rankingValor = [...corretoresComMetricas].sort((a, b) => b.valorMes - a.valorMes)
    const rankingLeads = [...corretoresComMetricas].sort((a, b) => b.leadsMes - a.leadsMes)
    const rankingConversao = [...corretoresComMetricas].sort((a, b) => b.taxaConversao - a.taxaConversao)

    // Encontrar posição do corretor atual
    const posicaoFechamentos = rankingFechamentos.findIndex(c => c.id === corretorId) + 1
    const posicaoValor = rankingValor.findIndex(c => c.id === corretorId) + 1
    const posicaoLeads = rankingLeads.findIndex(c => c.id === corretorId) + 1
    const posicaoConversao = rankingConversao.findIndex(c => c.id === corretorId) + 1

    // Dados do corretor atual
    const corretorAtual = corretoresComMetricas.find(c => c.id === corretorId)

    // Médias da equipe
    const totalCorretores = corretoresComMetricas.length
    const mediaFechamentos = totalCorretores > 0
      ? corretoresComMetricas.reduce((acc, c) => acc + c.fechamentosMes, 0) / totalCorretores
      : 0
    const mediaValor = totalCorretores > 0
      ? corretoresComMetricas.reduce((acc, c) => acc + c.valorMes, 0) / totalCorretores
      : 0
    const mediaLeads = totalCorretores > 0
      ? corretoresComMetricas.reduce((acc, c) => acc + c.leadsMes, 0) / totalCorretores
      : 0
    const mediaConversao = totalCorretores > 0
      ? corretoresComMetricas.reduce((acc, c) => acc + c.taxaConversao, 0) / totalCorretores
      : 0

    // Buscar métricas do mês anterior para comparativo
    const fechamentosMesAnterior = await this.prisma.negociacao.count({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        status: 'FECHADO',
        data_fechamento: { gte: inicioMesAnterior, lte: fimMesAnterior }
      }
    })

    const valorMesAnterior = await this.prisma.negociacao.aggregate({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        status: 'FECHADO',
        data_fechamento: { gte: inicioMesAnterior, lte: fimMesAnterior }
      },
      _sum: { valor_final: true }
    })

    const leadsMesAnterior = await this.prisma.lead.count({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        created_at: { gte: inicioMesAnterior, lt: inicioMes }
      }
    })

    return {
      posicao: {
        fechamentos: posicaoFechamentos,
        valor: posicaoValor,
        leads: posicaoLeads,
        conversao: posicaoConversao
      },
      totalCorretores,
      meuDesempenho: corretorAtual,
      mediaEquipe: {
        fechamentos: Math.round(mediaFechamentos * 10) / 10,
        valor: Math.round(mediaValor),
        leads: Math.round(mediaLeads * 10) / 10,
        conversao: Math.round(mediaConversao * 10) / 10
      },
      comparativoMesAnterior: {
        fechamentos: fechamentosMesAnterior,
        valor: Number(valorMesAnterior._sum.valor_final || 0),
        leads: leadsMesAnterior
      },
      top3: {
        fechamentos: rankingFechamentos.slice(0, 3).map(c => ({
          nome: c.nome.split(' ')[0], // Apenas primeiro nome
          valor: c.fechamentosMes
        })),
        valor: rankingValor.slice(0, 3).map(c => ({
          nome: c.nome.split(' ')[0],
          valor: c.valorMes
        }))
      }
    }
  }

  /**
   * Busca métricas detalhadas do corretor
   */
  async getCorretorMetricasDetalhadas(corretorId: string, tenantId: string) {
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    // Leads sem contato há mais de 3 dias
    const tresDiasAtras = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const leadsSemContato = await this.prisma.lead.findMany({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        temperatura: { in: ['QUENTE', 'MORNO'] },
        OR: [
          { ultimo_contato: null },
          { ultimo_contato: { lt: tresDiasAtras } }
        ]
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        temperatura: true,
        ultimo_contato: true,
        created_at: true
      },
      orderBy: { temperatura: 'asc' }, // QUENTE primeiro
      take: 10
    })

    // Tempo médio de fechamento (dias desde criação até fechamento)
    const negociacoesFechadas = await this.prisma.negociacao.findMany({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        status: 'FECHADO',
        data_fechamento: { not: null }
      },
      select: {
        created_at: true,
        data_fechamento: true
      }
    })

    let tempoMedioFechamento = 0
    if (negociacoesFechadas.length > 0) {
      const totalDias = negociacoesFechadas.reduce((acc, neg) => {
        const criacao = new Date(neg.created_at).getTime()
        const fechamento = new Date(neg.data_fechamento!).getTime()
        return acc + (fechamento - criacao) / (1000 * 60 * 60 * 24)
      }, 0)
      tempoMedioFechamento = Math.round(totalDias / negociacoesFechadas.length)
    }

    // Tempo médio de primeiro contato (tempo entre criação do lead e primeiro contato registrado)
    // Usando ultimo_contato como proxy para primeiro contato (quando é o único)
    const leadsComContato = await this.prisma.lead.findMany({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        ultimo_contato: { not: null }
      },
      select: {
        created_at: true,
        ultimo_contato: true
      }
    })

    let tempoMedioPrimeiroContato = 0
    if (leadsComContato.length > 0) {
      const totalHoras = leadsComContato.reduce((acc, lead) => {
        const criacao = new Date(lead.created_at).getTime()
        const contato = new Date(lead.ultimo_contato!).getTime()
        // Só considerar se o contato foi depois da criação (evitar dados inconsistentes)
        if (contato > criacao) {
          return acc + (contato - criacao) / (1000 * 60 * 60)
        }
        return acc
      }, 0)
      tempoMedioPrimeiroContato = Math.round(totalHoras / leadsComContato.length)
    }

    // Negociações por status (funil detalhado)
    const negociacoesPorStatus = await this.prisma.negociacao.groupBy({
      by: ['status'],
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId
      },
      _count: { id: true }
    })

    // Visitas realizadas vs agendadas no mês
    const visitasAgendadasMes = await this.prisma.agendamento.count({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        data_visita: { gte: inicioMes }
      }
    })

    const visitasRealizadasMes = await this.prisma.agendamento.count({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        status: 'REALIZADO',
        data_visita: { gte: inicioMes }
      }
    })

    // Leads por origem
    const leadsPorOrigem = await this.prisma.lead.groupBy({
      by: ['origem'],
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId
      },
      _count: { id: true }
    })

    // Propostas recebidas no mês
    const propostasMes = await this.prisma.proposta.count({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        created_at: { gte: inicioMes }
      }
    })

    // Tarefas pendentes
    const tarefasPendentes = await this.prisma.tarefa.count({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        status: { in: ['PENDENTE', 'EM_ANDAMENTO'] }
      }
    })

    const tarefasAtrasadas = await this.prisma.tarefa.count({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId,
        status: { in: ['PENDENTE', 'EM_ANDAMENTO'] },
        data_vencimento: { lt: hoje }
      }
    })

    return {
      leadsSemContato: leadsSemContato.map(lead => ({
        id: lead.id,
        nome: lead.nome,
        telefone: lead.telefone,
        temperatura: lead.temperatura,
        diasSemContato: lead.ultimo_contato
          ? Math.floor((Date.now() - new Date(lead.ultimo_contato).getTime()) / (1000 * 60 * 60 * 24))
          : Math.floor((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24))
      })),
      tempoMedioFechamento, // em dias
      tempoMedioPrimeiroContato, // em horas
      funilDetalhado: negociacoesPorStatus.map(s => ({
        status: s.status,
        quantidade: s._count.id
      })),
      visitas: {
        agendadas: visitasAgendadasMes,
        realizadas: visitasRealizadasMes,
        taxaRealizacao: visitasAgendadasMes > 0
          ? Math.round((visitasRealizadasMes / visitasAgendadasMes) * 100)
          : 0
      },
      leadsPorOrigem: leadsPorOrigem.map(o => ({
        origem: o.origem,
        quantidade: o._count.id
      })),
      propostasMes,
      tarefas: {
        pendentes: tarefasPendentes,
        atrasadas: tarefasAtrasadas
      }
    }
  }
}
