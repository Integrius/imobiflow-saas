import { prisma } from '../../shared/database/prisma'
import { notificationsService } from '../notifications/notifications.service'

export interface CreateTarefaDTO {
  user_id: string
  lead_id?: string
  corretor_id?: string
  titulo: string
  descricao?: string
  tipo?: 'FOLLOW_UP' | 'LIGACAO' | 'EMAIL' | 'WHATSAPP' | 'VISITA' | 'DOCUMENTO' | 'REUNIAO' | 'OUTRO'
  prioridade?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'
  data_vencimento?: Date
  data_lembrete?: Date
  recorrente?: boolean
  tipo_recorrencia?: 'DIARIA' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL'
}

export interface UpdateTarefaDTO {
  titulo?: string
  descricao?: string
  tipo?: 'FOLLOW_UP' | 'LIGACAO' | 'EMAIL' | 'WHATSAPP' | 'VISITA' | 'DOCUMENTO' | 'REUNIAO' | 'OUTRO'
  prioridade?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'
  status?: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA' | 'ATRASADA'
  data_vencimento?: Date
  data_lembrete?: Date
  data_conclusao?: Date
  observacao_conclusao?: string
  lead_id?: string | null
  corretor_id?: string | null
}

export interface ListTarefasQuery {
  page?: number
  limit?: number
  status?: string
  tipo?: string
  prioridade?: string
  user_id?: string
  lead_id?: string
  corretor_id?: string
  data_inicio?: Date
  data_fim?: Date
}

class TarefasService {
  /**
   * Criar nova tarefa
   */
  async create(data: CreateTarefaDTO, tenantId: string) {
    const tarefa = await prisma.tarefa.create({
      data: {
        tenant_id: tenantId,
        user_id: data.user_id,
        lead_id: data.lead_id,
        corretor_id: data.corretor_id,
        titulo: data.titulo,
        descricao: data.descricao,
        tipo: data.tipo || 'FOLLOW_UP',
        prioridade: data.prioridade || 'MEDIA',
        data_vencimento: data.data_vencimento,
        data_lembrete: data.data_lembrete,
        recorrente: data.recorrente || false,
        tipo_recorrencia: data.tipo_recorrencia
      },
      include: {
        user: { select: { id: true, nome: true, email: true } },
        lead: { select: { id: true, nome: true, telefone: true } },
        corretor: {
          select: {
            id: true,
            user: { select: { nome: true } }
          }
        }
      }
    })

    return tarefa
  }

  /**
   * Listar tarefas com filtros
   */
  async findAll(query: ListTarefasQuery, tenantId: string, userId?: string, userType?: string) {
    const {
      page = 1,
      limit = 20,
      status,
      tipo,
      prioridade,
      user_id,
      lead_id,
      corretor_id,
      data_inicio,
      data_fim
    } = query

    const where: any = {
      tenant_id: tenantId
    }

    // Se for corretor, filtra apenas as tarefas dele
    if (userType === 'CORRETOR' && userId) {
      where.user_id = userId
    } else if (user_id) {
      where.user_id = user_id
    }

    if (status) {
      where.status = status
    }

    if (tipo) {
      where.tipo = tipo
    }

    if (prioridade) {
      where.prioridade = prioridade
    }

    if (lead_id) {
      where.lead_id = lead_id
    }

    if (corretor_id) {
      where.corretor_id = corretor_id
    }

    if (data_inicio || data_fim) {
      where.data_vencimento = {}
      if (data_inicio) {
        where.data_vencimento.gte = data_inicio
      }
      if (data_fim) {
        where.data_vencimento.lte = data_fim
      }
    }

    const [tarefas, total] = await Promise.all([
      prisma.tarefa.findMany({
        where,
        include: {
          user: { select: { id: true, nome: true, email: true } },
          lead: { select: { id: true, nome: true, telefone: true } },
          corretor: {
            select: {
              id: true,
              user: { select: { nome: true } }
            }
          }
        },
        orderBy: [
          { prioridade: 'desc' },
          { data_vencimento: 'asc' },
          { created_at: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.tarefa.count({ where })
    ])

    return {
      data: tarefas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Buscar tarefa por ID
   */
  async findById(id: string, tenantId: string) {
    const tarefa = await prisma.tarefa.findFirst({
      where: {
        id,
        tenant_id: tenantId
      },
      include: {
        user: { select: { id: true, nome: true, email: true } },
        lead: { select: { id: true, nome: true, telefone: true, email: true } },
        corretor: {
          select: {
            id: true,
            user: { select: { nome: true, email: true } }
          }
        }
      }
    })

    return tarefa
  }

  /**
   * Atualizar tarefa
   */
  async update(id: string, data: UpdateTarefaDTO, tenantId: string) {
    const tarefa = await prisma.tarefa.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date()
      },
      include: {
        user: { select: { id: true, nome: true, email: true } },
        lead: { select: { id: true, nome: true, telefone: true } },
        corretor: {
          select: {
            id: true,
            user: { select: { nome: true } }
          }
        }
      }
    })

    return tarefa
  }

  /**
   * Concluir tarefa
   */
  async concluir(id: string, observacao: string | undefined, tenantId: string) {
    const tarefa = await prisma.tarefa.update({
      where: { id },
      data: {
        status: 'CONCLUIDA',
        data_conclusao: new Date(),
        observacao_conclusao: observacao,
        updated_at: new Date()
      },
      include: {
        user: { select: { id: true, nome: true, email: true } },
        lead: { select: { id: true, nome: true, telefone: true } }
      }
    })

    // Se for recorrente, criar proxima tarefa
    if (tarefa.recorrente && tarefa.tipo_recorrencia) {
      await this.criarProximaTarefaRecorrente(tarefa, tenantId)
    }

    return tarefa
  }

  /**
   * Cancelar tarefa
   */
  async cancelar(id: string, tenantId: string) {
    const tarefa = await prisma.tarefa.update({
      where: { id },
      data: {
        status: 'CANCELADA',
        updated_at: new Date()
      }
    })

    return tarefa
  }

  /**
   * Deletar tarefa
   */
  async delete(id: string, tenantId: string) {
    await prisma.tarefa.delete({
      where: { id }
    })
  }

  /**
   * Buscar tarefas pendentes do usuario (para widget)
   */
  async findPendentes(userId: string, tenantId: string, limit: number = 5) {
    const tarefas = await prisma.tarefa.findMany({
      where: {
        tenant_id: tenantId,
        user_id: userId,
        status: { in: ['PENDENTE', 'EM_ANDAMENTO', 'ATRASADA'] }
      },
      include: {
        lead: { select: { id: true, nome: true } }
      },
      orderBy: [
        { prioridade: 'desc' },
        { data_vencimento: 'asc' }
      ],
      take: limit
    })

    return tarefas
  }

  /**
   * Buscar tarefas do dia (vencendo hoje)
   */
  async findVencendoHoje(userId: string, tenantId: string) {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    const tarefas = await prisma.tarefa.findMany({
      where: {
        tenant_id: tenantId,
        user_id: userId,
        status: { in: ['PENDENTE', 'EM_ANDAMENTO'] },
        data_vencimento: {
          gte: hoje,
          lt: amanha
        }
      },
      include: {
        lead: { select: { id: true, nome: true } }
      },
      orderBy: { data_vencimento: 'asc' }
    })

    return tarefas
  }

  /**
   * Buscar tarefas atrasadas
   */
  async findAtrasadas(userId: string, tenantId: string) {
    const agora = new Date()

    const tarefas = await prisma.tarefa.findMany({
      where: {
        tenant_id: tenantId,
        user_id: userId,
        status: { in: ['PENDENTE', 'EM_ANDAMENTO'] },
        data_vencimento: { lt: agora }
      },
      include: {
        lead: { select: { id: true, nome: true } }
      },
      orderBy: { data_vencimento: 'asc' }
    })

    // Atualizar status para ATRASADA
    if (tarefas.length > 0) {
      await prisma.tarefa.updateMany({
        where: {
          id: { in: tarefas.map(t => t.id) }
        },
        data: { status: 'ATRASADA' }
      })
    }

    return tarefas
  }

  /**
   * Estatisticas de tarefas
   */
  async getStats(userId: string, tenantId: string) {
    const [
      total,
      pendentes,
      emAndamento,
      concluidas,
      atrasadas,
      canceladas
    ] = await Promise.all([
      prisma.tarefa.count({ where: { tenant_id: tenantId, user_id: userId } }),
      prisma.tarefa.count({ where: { tenant_id: tenantId, user_id: userId, status: 'PENDENTE' } }),
      prisma.tarefa.count({ where: { tenant_id: tenantId, user_id: userId, status: 'EM_ANDAMENTO' } }),
      prisma.tarefa.count({ where: { tenant_id: tenantId, user_id: userId, status: 'CONCLUIDA' } }),
      prisma.tarefa.count({ where: { tenant_id: tenantId, user_id: userId, status: 'ATRASADA' } }),
      prisma.tarefa.count({ where: { tenant_id: tenantId, user_id: userId, status: 'CANCELADA' } })
    ])

    return {
      total,
      pendentes,
      emAndamento,
      concluidas,
      atrasadas,
      canceladas,
      taxaConclusao: total > 0 ? Math.round((concluidas / total) * 100) : 0
    }
  }

  /**
   * Processar lembretes de tarefas (para job)
   */
  async processarLembretes() {
    const agora = new Date()
    const daquiA30min = new Date(agora.getTime() + 30 * 60 * 1000)

    // Buscar tarefas com lembrete pendente
    const tarefas = await prisma.tarefa.findMany({
      where: {
        status: { in: ['PENDENTE', 'EM_ANDAMENTO'] },
        lembrete_enviado: false,
        data_lembrete: {
          lte: daquiA30min,
          gte: agora
        }
      },
      include: {
        user: { select: { id: true, nome: true } },
        lead: { select: { nome: true } },
        tenant: { select: { id: true } }
      }
    })

    let enviados = 0

    for (const tarefa of tarefas) {
      try {
        // Criar notificacao in-app
        await notificationsService.create({
          tenantId: tarefa.tenant_id,
          userId: tarefa.user_id,
          title: `Lembrete: ${tarefa.titulo}`,
          message: tarefa.lead
            ? `Lembrete de tarefa relacionada ao lead ${tarefa.lead.nome}`
            : `Lembrete da tarefa: ${tarefa.titulo}`,
          type: 'TAREFA',
          entityType: 'Tarefa',
          entityId: tarefa.id,
          actionUrl: `/dashboard/tarefas/${tarefa.id}`
        })

        // Marcar lembrete como enviado
        await prisma.tarefa.update({
          where: { id: tarefa.id },
          data: { lembrete_enviado: true }
        })

        enviados++
      } catch (error) {
        console.error(`Erro ao enviar lembrete da tarefa ${tarefa.id}:`, error)
      }
    }

    return { processadas: tarefas.length, enviados }
  }

  /**
   * Criar proxima tarefa recorrente
   */
  private async criarProximaTarefaRecorrente(tarefaOriginal: any, tenantId: string) {
    const proximaData = this.calcularProximaRecorrencia(
      tarefaOriginal.data_vencimento || new Date(),
      tarefaOriginal.tipo_recorrencia
    )

    await prisma.tarefa.create({
      data: {
        tenant_id: tenantId,
        user_id: tarefaOriginal.user_id,
        lead_id: tarefaOriginal.lead_id,
        corretor_id: tarefaOriginal.corretor_id,
        titulo: tarefaOriginal.titulo,
        descricao: tarefaOriginal.descricao,
        tipo: tarefaOriginal.tipo,
        prioridade: tarefaOriginal.prioridade,
        data_vencimento: proximaData,
        data_lembrete: tarefaOriginal.data_lembrete
          ? this.calcularProximaRecorrencia(tarefaOriginal.data_lembrete, tarefaOriginal.tipo_recorrencia)
          : null,
        recorrente: true,
        tipo_recorrencia: tarefaOriginal.tipo_recorrencia
      }
    })
  }

  /**
   * Calcular proxima data de recorrencia
   */
  private calcularProximaRecorrencia(dataBase: Date, tipo: string): Date {
    const novaData = new Date(dataBase)

    switch (tipo) {
      case 'DIARIA':
        novaData.setDate(novaData.getDate() + 1)
        break
      case 'SEMANAL':
        novaData.setDate(novaData.getDate() + 7)
        break
      case 'QUINZENAL':
        novaData.setDate(novaData.getDate() + 15)
        break
      case 'MENSAL':
        novaData.setMonth(novaData.getMonth() + 1)
        break
    }

    return novaData
  }
}

export const tarefasService = new TarefasService()
