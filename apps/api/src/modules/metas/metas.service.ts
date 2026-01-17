import { prisma } from '../../shared/database/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { Meta } from '@prisma/client'

// Tipo genérico para meta com corretor incluído
type MetaComCorretor = Meta & {
  corretor: {
    id: string
    creci: string
    user: {
      nome: string
      email?: string
    }
  }
}

// Tipo para meta com percentuais calculados
type MetaComProgresso = MetaComCorretor & {
  percentuais: {
    leads: number
    visitas: number
    propostas: number
    fechamentos: number
    valor: number
    geral: number
  }
}

interface CreateMetaDTO {
  tenant_id: string
  corretor_id: string
  mes: number
  ano: number
  meta_leads?: number
  meta_visitas?: number
  meta_propostas?: number
  meta_fechamentos?: number
  meta_valor?: number
  observacoes?: string
  criado_por_id?: string
}

interface UpdateMetaDTO {
  meta_leads?: number
  meta_visitas?: number
  meta_propostas?: number
  meta_fechamentos?: number
  meta_valor?: number
  observacoes?: string
  status?: 'EM_ANDAMENTO' | 'ATINGIDA' | 'NAO_ATINGIDA' | 'CANCELADA'
}


class MetasService {
  /**
   * Criar nova meta para um corretor
   */
  async criar(data: CreateMetaDTO) {
    // Verificar se já existe meta para este corretor/mês/ano
    const existente = await prisma.meta.findUnique({
      where: {
        tenant_id_corretor_id_mes_ano: {
          tenant_id: data.tenant_id,
          corretor_id: data.corretor_id,
          mes: data.mes,
          ano: data.ano
        }
      }
    })

    if (existente) {
      throw new Error(`Já existe uma meta para este corretor em ${data.mes}/${data.ano}`)
    }

    // Verificar se corretor existe e pertence ao tenant
    const corretor = await prisma.corretor.findFirst({
      where: {
        id: data.corretor_id,
        tenant_id: data.tenant_id
      }
    })

    if (!corretor) {
      throw new Error('Corretor não encontrado')
    }

    const meta = await prisma.meta.create({
      data: {
        tenant_id: data.tenant_id,
        corretor_id: data.corretor_id,
        mes: data.mes,
        ano: data.ano,
        meta_leads: data.meta_leads,
        meta_visitas: data.meta_visitas,
        meta_propostas: data.meta_propostas,
        meta_fechamentos: data.meta_fechamentos,
        meta_valor: data.meta_valor,
        observacoes: data.observacoes,
        criado_por_id: data.criado_por_id
      },
      include: {
        corretor: {
          include: {
            user: {
              select: { nome: true, email: true }
            }
          }
        }
      }
    })

    return meta
  }

  /**
   * Atualizar meta existente
   */
  async atualizar(id: string, tenantId: string, data: UpdateMetaDTO) {
    const meta = await prisma.meta.findFirst({
      where: { id, tenant_id: tenantId }
    })

    if (!meta) {
      throw new Error('Meta não encontrada')
    }

    return prisma.meta.update({
      where: { id },
      data: {
        meta_leads: data.meta_leads,
        meta_visitas: data.meta_visitas,
        meta_propostas: data.meta_propostas,
        meta_fechamentos: data.meta_fechamentos,
        meta_valor: data.meta_valor,
        observacoes: data.observacoes,
        status: data.status
      },
      include: {
        corretor: {
          include: {
            user: {
              select: { nome: true, email: true }
            }
          }
        }
      }
    })
  }

  /**
   * Deletar meta
   */
  async deletar(id: string, tenantId: string) {
    const meta = await prisma.meta.findFirst({
      where: { id, tenant_id: tenantId }
    })

    if (!meta) {
      throw new Error('Meta não encontrada')
    }

    await prisma.meta.delete({ where: { id } })
    return { success: true }
  }

  /**
   * Buscar meta por ID
   */
  async buscarPorId(id: string, tenantId: string) {
    const meta = await prisma.meta.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        corretor: {
          include: {
            user: {
              select: { nome: true, email: true }
            }
          }
        }
      }
    })

    if (!meta) {
      throw new Error('Meta não encontrada')
    }

    return this.calcularPercentuais(meta)
  }

  /**
   * Listar metas do tenant com filtros
   */
  async listar(
    tenantId: string,
    filtros?: {
      corretor_id?: string
      mes?: number
      ano?: number
      status?: string
    }
  ) {
    const where: any = { tenant_id: tenantId }

    if (filtros?.corretor_id) where.corretor_id = filtros.corretor_id
    if (filtros?.mes) where.mes = filtros.mes
    if (filtros?.ano) where.ano = filtros.ano
    if (filtros?.status) where.status = filtros.status

    const metas = await prisma.meta.findMany({
      where,
      include: {
        corretor: {
          include: {
            user: {
              select: { nome: true, email: true }
            }
          }
        }
      },
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }]
    })

    return metas.map((meta: MetaComCorretor) => this.calcularPercentuais(meta))
  }

  /**
   * Buscar meta atual de um corretor (mês/ano corrente)
   */
  async buscarMetaAtual(corretorId: string, tenantId: string) {
    const agora = new Date()
    const mes = agora.getMonth() + 1
    const ano = agora.getFullYear()

    const meta = await prisma.meta.findUnique({
      where: {
        tenant_id_corretor_id_mes_ano: {
          tenant_id: tenantId,
          corretor_id: corretorId,
          mes,
          ano
        }
      },
      include: {
        corretor: {
          include: {
            user: {
              select: { nome: true, email: true }
            }
          }
        }
      }
    })

    if (!meta) return null

    return this.calcularPercentuais(meta)
  }

  /**
   * Atualizar progresso de uma meta (calcular a partir dos dados reais)
   */
  async atualizarProgresso(metaId: string, tenantId: string) {
    const meta = await prisma.meta.findFirst({
      where: { id: metaId, tenant_id: tenantId }
    })

    if (!meta) {
      throw new Error('Meta não encontrada')
    }

    // Definir período da meta
    const inicioMes = new Date(meta.ano, meta.mes - 1, 1)
    const fimMes = new Date(meta.ano, meta.mes, 0, 23, 59, 59)

    // Calcular progresso de leads
    const leadsCount = await prisma.lead.count({
      where: {
        tenant_id: tenantId,
        corretor_id: meta.corretor_id,
        created_at: {
          gte: inicioMes,
          lte: fimMes
        }
      }
    })

    // Calcular progresso de visitas
    const visitasCount = await prisma.agendamento.count({
      where: {
        tenant_id: tenantId,
        corretor_id: meta.corretor_id,
        status: 'REALIZADO',
        data_visita: {
          gte: inicioMes,
          lte: fimMes
        }
      }
    })

    // Calcular progresso de propostas
    const propostasCount = await prisma.proposta.count({
      where: {
        tenant_id: tenantId,
        corretor_id: meta.corretor_id,
        created_at: {
          gte: inicioMes,
          lte: fimMes
        }
      }
    })

    // Calcular fechamentos e valor
    const negociacoesFechadas = await prisma.negociacao.findMany({
      where: {
        tenant_id: tenantId,
        corretor_id: meta.corretor_id,
        status: 'FECHADO',
        data_fechamento: {
          gte: inicioMes,
          lte: fimMes
        }
      },
      select: {
        valor_final: true
      }
    })

    const fechamentosCount = negociacoesFechadas.length
    const valorTotal = negociacoesFechadas.reduce(
      (acc: number, neg: { valor_final: Decimal | null }) => acc + (neg.valor_final ? Number(neg.valor_final) : 0),
      0
    )

    // Atualizar meta com progresso
    const metaAtualizada = await prisma.meta.update({
      where: { id: metaId },
      data: {
        progresso_leads: leadsCount,
        progresso_visitas: visitasCount,
        progresso_propostas: propostasCount,
        progresso_fechamentos: fechamentosCount,
        progresso_valor: valorTotal
      },
      include: {
        corretor: {
          include: {
            user: {
              select: { nome: true, email: true }
            }
          }
        }
      }
    })

    // Verificar se meta foi atingida
    const percentuais = this.calcularPercentuais(metaAtualizada)

    // Se progresso geral >= 100%, marcar como atingida
    if (percentuais.percentuais.geral >= 100 && meta.status === 'EM_ANDAMENTO') {
      await prisma.meta.update({
        where: { id: metaId },
        data: { status: 'ATINGIDA' }
      })
    }

    return percentuais
  }

  /**
   * Atualizar progresso de todas as metas do mês atual
   */
  async atualizarProgressoMensal(tenantId: string) {
    const agora = new Date()
    const mes = agora.getMonth() + 1
    const ano = agora.getFullYear()

    const metas = await prisma.meta.findMany({
      where: {
        tenant_id: tenantId,
        mes,
        ano,
        status: 'EM_ANDAMENTO'
      }
    })

    const resultados = []
    for (const meta of metas) {
      const resultado = await this.atualizarProgresso(meta.id, tenantId)
      resultados.push(resultado)
    }

    return resultados
  }

  /**
   * Criar metas em lote para todos os corretores
   */
  async criarMetasEmLote(
    tenantId: string,
    mes: number,
    ano: number,
    metaPadrao: {
      meta_leads?: number
      meta_visitas?: number
      meta_propostas?: number
      meta_fechamentos?: number
      meta_valor?: number
    },
    criado_por_id?: string
  ) {
    // Buscar todos os corretores do tenant
    const corretores = await prisma.corretor.findMany({
      where: { tenant_id: tenantId },
      include: {
        user: { select: { ativo: true } }
      }
    })

    // Filtrar apenas corretores ativos
    const corretoresAtivos = corretores.filter((c: { user: { ativo: boolean } }) => c.user.ativo)

    const resultados = {
      criadas: 0,
      ignoradas: 0,
      erros: [] as string[]
    }

    for (const corretor of corretoresAtivos) {
      try {
        // Verificar se já existe meta
        const existente = await prisma.meta.findUnique({
          where: {
            tenant_id_corretor_id_mes_ano: {
              tenant_id: tenantId,
              corretor_id: corretor.id,
              mes,
              ano
            }
          }
        })

        if (existente) {
          resultados.ignoradas++
          continue
        }

        await prisma.meta.create({
          data: {
            tenant_id: tenantId,
            corretor_id: corretor.id,
            mes,
            ano,
            ...metaPadrao,
            criado_por_id
          }
        })

        resultados.criadas++
      } catch (error: any) {
        resultados.erros.push(`Corretor ${corretor.id}: ${error.message}`)
      }
    }

    return resultados
  }

  /**
   * Resumo de metas do mês para o dashboard gerencial
   */
  async resumoMensal(tenantId: string, mes?: number, ano?: number) {
    const agora = new Date()
    const mesAtual = mes || agora.getMonth() + 1
    const anoAtual = ano || agora.getFullYear()

    const metas = await prisma.meta.findMany({
      where: {
        tenant_id: tenantId,
        mes: mesAtual,
        ano: anoAtual
      },
      include: {
        corretor: {
          include: {
            user: {
              select: { nome: true }
            }
          }
        }
      }
    })

    const metasComPercentuais = metas.map((m: MetaComCorretor) => this.calcularPercentuais(m))

    // Calcular estatísticas
    const totalCorretoresComMeta = metas.length
    const metasAtingidas = metas.filter((m: Meta) => m.status === 'ATINGIDA').length
    const mediaProgresso = totalCorretoresComMeta > 0
      ? metasComPercentuais.reduce((acc: number, m: MetaComProgresso) => acc + m.percentuais.geral, 0) / totalCorretoresComMeta
      : 0

    // Top performers
    const ranking = metasComPercentuais
      .sort((a: MetaComProgresso, b: MetaComProgresso) => b.percentuais.geral - a.percentuais.geral)
      .slice(0, 5)

    return {
      periodo: { mes: mesAtual, ano: anoAtual },
      estatisticas: {
        totalCorretoresComMeta,
        metasAtingidas,
        percentualAtingimento: totalCorretoresComMeta > 0
          ? Math.round((metasAtingidas / totalCorretoresComMeta) * 100)
          : 0,
        mediaProgresso: Math.round(mediaProgresso)
      },
      ranking,
      todas: metasComPercentuais
    }
  }

  /**
   * Calcular percentuais de progresso
   */
  private calcularPercentuais(meta: MetaComCorretor): MetaComProgresso {
    const calcPercent = (progresso: number, metaVal: number | null) => {
      if (!metaVal || metaVal === 0) return 0
      return Math.min(Math.round((progresso / metaVal) * 100), 100)
    }

    const percentLeads = calcPercent(meta.progresso_leads, meta.meta_leads)
    const percentVisitas = calcPercent(meta.progresso_visitas, meta.meta_visitas)
    const percentPropostas = calcPercent(meta.progresso_propostas, meta.meta_propostas)
    const percentFechamentos = calcPercent(meta.progresso_fechamentos, meta.meta_fechamentos)
    const percentValor = calcPercent(
      Number(meta.progresso_valor),
      meta.meta_valor ? Number(meta.meta_valor) : null
    )

    // Calcular média ponderada (apenas das metas definidas)
    const metasDefinidas: number[] = []
    const pesos: number[] = []

    if (meta.meta_leads) { metasDefinidas.push(percentLeads); pesos.push(1) }
    if (meta.meta_visitas) { metasDefinidas.push(percentVisitas); pesos.push(1) }
    if (meta.meta_propostas) { metasDefinidas.push(percentPropostas); pesos.push(1) }
    if (meta.meta_fechamentos) { metasDefinidas.push(percentFechamentos); pesos.push(2) } // Peso maior
    if (meta.meta_valor) { metasDefinidas.push(percentValor); pesos.push(2) } // Peso maior

    const somaPercentuais = metasDefinidas.reduce((acc: number, p: number, i: number) => acc + p * pesos[i], 0)
    const somaPesos = pesos.reduce((acc: number, p: number) => acc + p, 0)
    const percentGeral = somaPesos > 0 ? Math.round(somaPercentuais / somaPesos) : 0

    return {
      ...meta,
      percentuais: {
        leads: percentLeads,
        visitas: percentVisitas,
        propostas: percentPropostas,
        fechamentos: percentFechamentos,
        valor: percentValor,
        geral: percentGeral
      }
    }
  }
}

export const metasService = new MetasService()
