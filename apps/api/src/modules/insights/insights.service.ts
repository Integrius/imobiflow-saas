import { PrismaClient, Temperatura } from '@prisma/client'

const prisma = new PrismaClient()

export interface Insight {
  tipo: 'ALERTA' | 'DICA' | 'INFO' | 'SUCESSO'
  icone: string
  titulo: string
  texto: string
  acao?: string
  prioridade: number // 1 = mais urgente, 5 = menos urgente
  dados?: {
    count?: number
    leads?: { id: string; nome: string; telefone: string; dias_sem_contato?: number }[]
  }
}

export class InsightsService {
  /**
   * Gera insights inteligentes para um corretor específico
   * Baseado nas regras da Sofia (IA)
   */
  async gerarInsightsCorretor(corretorId: string, tenantId: string): Promise<Insight[]> {
    const insights: Insight[] = []

    // Data de referência: 3 dias atrás
    const tresDiasAtras = new Date()
    tresDiasAtras.setDate(tresDiasAtras.getDate() - 3)

    // Data de referência: hoje (início do dia)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    // ============================================
    // REGRA 1: Leads QUENTES sem contato há 3+ dias
    // ============================================
    const leadsQuentesEsquecidos = await prisma.lead.findMany({
      where: {
        tenant_id: tenantId,
        corretor_id: corretorId,
        temperatura: Temperatura.QUENTE,
        OR: [
          { last_interaction_at: { lt: tresDiasAtras } },
          { last_interaction_at: null }
        ]
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        last_interaction_at: true,
        created_at: true
      },
      take: 10 // Limitar para não sobrecarregar
    })

    if (leadsQuentesEsquecidos.length > 0) {
      insights.push({
        tipo: 'ALERTA',
        icone: '🔥',
        titulo: 'Leads Quentes Esfriando!',
        texto: `Você tem ${leadsQuentesEsquecidos.length} lead${leadsQuentesEsquecidos.length > 1 ? 's' : ''} QUENTE${leadsQuentesEsquecidos.length > 1 ? 'S' : ''} sem contato há mais de 3 dias. Eles podem estar procurando outra imobiliária!`,
        acao: 'FILTRAR_QUENTES_ESQUECIDOS',
        prioridade: 1,
        dados: {
          count: leadsQuentesEsquecidos.length,
          leads: leadsQuentesEsquecidos.map(lead => ({
            id: lead.id,
            nome: lead.nome,
            telefone: lead.telefone,
            dias_sem_contato: lead.last_interaction_at
              ? Math.floor((Date.now() - lead.last_interaction_at.getTime()) / (1000 * 60 * 60 * 24))
              : Math.floor((Date.now() - lead.created_at.getTime()) / (1000 * 60 * 60 * 24))
          }))
        }
      })
    }

    // ============================================
    // REGRA 2: Leads MORNOS sem contato há 5+ dias
    // ============================================
    const cincoDiasAtras = new Date()
    cincoDiasAtras.setDate(cincoDiasAtras.getDate() - 5)

    const leadsMornosEsquecidos = await prisma.lead.findMany({
      where: {
        tenant_id: tenantId,
        corretor_id: corretorId,
        temperatura: Temperatura.MORNO,
        OR: [
          { last_interaction_at: { lt: cincoDiasAtras } },
          { last_interaction_at: null }
        ]
      },
      select: {
        id: true,
        nome: true,
        telefone: true
      },
      take: 10
    })

    if (leadsMornosEsquecidos.length > 0) {
      insights.push({
        tipo: 'ALERTA',
        icone: '🌡️',
        titulo: 'Leads Mornos Precisam de Atenção',
        texto: `${leadsMornosEsquecidos.length} lead${leadsMornosEsquecidos.length > 1 ? 's' : ''} MORNO${leadsMornosEsquecidos.length > 1 ? 'S' : ''} está${leadsMornosEsquecidos.length > 1 ? 'ão' : ''} sem contato há mais de 5 dias. Um follow-up pode reativá-los!`,
        acao: 'FILTRAR_MORNOS_ESQUECIDOS',
        prioridade: 2,
        dados: {
          count: leadsMornosEsquecidos.length,
          leads: leadsMornosEsquecidos.map(lead => ({
            id: lead.id,
            nome: lead.nome,
            telefone: lead.telefone
          }))
        }
      })
    }

    // ============================================
    // REGRA 3: Leads NOVOS sem primeiro contato
    // ============================================
    const leadsNovosSemContato = await prisma.lead.findMany({
      where: {
        tenant_id: tenantId,
        corretor_id: corretorId,
        created_at: { gte: hoje },
        last_interaction_at: null
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        created_at: true
      }
    })

    if (leadsNovosSemContato.length > 0) {
      insights.push({
        tipo: 'INFO',
        icone: '✨',
        titulo: 'Novos Leads Aguardando!',
        texto: `Você recebeu ${leadsNovosSemContato.length} lead${leadsNovosSemContato.length > 1 ? 's' : ''} novo${leadsNovosSemContato.length > 1 ? 's' : ''} hoje que ainda não foram contatados. O primeiro contato rápido aumenta muito a conversão!`,
        acao: 'FILTRAR_NOVOS',
        prioridade: 1,
        dados: {
          count: leadsNovosSemContato.length,
          leads: leadsNovosSemContato.map(lead => ({
            id: lead.id,
            nome: lead.nome,
            telefone: lead.telefone
          }))
        }
      })
    }

    // ============================================
    // REGRA 4: Leads de ontem sem contato
    // ============================================
    const ontem = new Date()
    ontem.setDate(ontem.getDate() - 1)
    ontem.setHours(0, 0, 0, 0)

    const fimOntem = new Date()
    fimOntem.setDate(fimOntem.getDate() - 1)
    fimOntem.setHours(23, 59, 59, 999)

    const leadsOntemSemContato = await prisma.lead.findMany({
      where: {
        tenant_id: tenantId,
        corretor_id: corretorId,
        created_at: {
          gte: ontem,
          lte: fimOntem
        },
        last_interaction_at: null
      },
      select: {
        id: true,
        nome: true,
        telefone: true
      }
    })

    if (leadsOntemSemContato.length > 0) {
      insights.push({
        tipo: 'ALERTA',
        icone: '⚠️',
        titulo: 'Leads de Ontem Sem Contato!',
        texto: `${leadsOntemSemContato.length} lead${leadsOntemSemContato.length > 1 ? 's' : ''} de ontem ainda não foi${leadsOntemSemContato.length > 1 ? 'ram' : ''} contatado${leadsOntemSemContato.length > 1 ? 's' : ''}. Não deixe escapar!`,
        acao: 'FILTRAR_ONTEM_SEM_CONTATO',
        prioridade: 1,
        dados: {
          count: leadsOntemSemContato.length,
          leads: leadsOntemSemContato.map(lead => ({
            id: lead.id,
            nome: lead.nome,
            telefone: lead.telefone
          }))
        }
      })
    }

    // ============================================
    // REGRA 5: Visitas agendadas para hoje
    // ============================================
    const fimHoje = new Date()
    fimHoje.setHours(23, 59, 59, 999)

    const visitasHoje = await prisma.agendamento.count({
      where: {
        tenant_id: tenantId,
        corretor_id: corretorId,
        data_visita: {
          gte: hoje,
          lte: fimHoje
        },
        status: {
          in: ['PENDENTE', 'CONFIRMADO']
        }
      }
    })

    if (visitasHoje > 0) {
      insights.push({
        tipo: 'INFO',
        icone: '📅',
        titulo: 'Visitas Agendadas Hoje',
        texto: `Você tem ${visitasHoje} visita${visitasHoje > 1 ? 's' : ''} agendada${visitasHoje > 1 ? 's' : ''} para hoje. Prepare-se para arrasar!`,
        acao: 'VER_AGENDA',
        prioridade: 3,
        dados: {
          count: visitasHoje
        }
      })
    }

    // ============================================
    // REGRA 6: Negociações em andamento
    // ============================================
    const negociacoesAtivas = await prisma.negociacao.count({
      where: {
        tenant_id: tenantId,
        corretor_id: corretorId,
        status: {
          in: ['PROPOSTA', 'ANALISE_CREDITO', 'CONTRATO']
        }
      }
    })

    if (negociacoesAtivas > 0) {
      insights.push({
        tipo: 'SUCESSO',
        icone: '💼',
        titulo: 'Negociações em Andamento',
        texto: `Você tem ${negociacoesAtivas} negociação${negociacoesAtivas > 1 ? 'ões' : ''} em fase avançada. Continue acompanhando de perto!`,
        acao: 'VER_NEGOCIACOES',
        prioridade: 4,
        dados: {
          count: negociacoesAtivas
        }
      })
    }

    // ============================================
    // REGRA 7: Elogio por performance (se não houver alertas críticos)
    // ============================================
    const temAlertaCritico = insights.some(i => i.prioridade === 1)

    if (!temAlertaCritico) {
      // Verifica se corretor contatou leads nos últimos 3 dias
      const contatosRecentes = await prisma.leadInteraction.count({
        where: {
          tenant_id: tenantId,
          corretor_id: corretorId,
          created_at: { gte: tresDiasAtras }
        }
      })

      if (contatosRecentes >= 5) {
        insights.push({
          tipo: 'SUCESSO',
          icone: '⭐',
          titulo: 'Ótimo Trabalho!',
          texto: `Você registrou ${contatosRecentes} interações nos últimos 3 dias. Continue assim, a consistência traz resultados!`,
          prioridade: 5
        })
      }
    }

    // Ordenar por prioridade (mais urgente primeiro)
    insights.sort((a, b) => a.prioridade - b.prioridade)

    return insights
  }

  /**
   * Gera insights gerais para o tenant (visão admin/gestor)
   */
  async gerarInsightsTenant(tenantId: string): Promise<Insight[]> {
    const insights: Insight[] = []

    const tresDiasAtras = new Date()
    tresDiasAtras.setDate(tresDiasAtras.getDate() - 3)

    // Total de leads quentes esquecidos no tenant
    const totalQuentesEsquecidos = await prisma.lead.count({
      where: {
        tenant_id: tenantId,
        temperatura: Temperatura.QUENTE,
        OR: [
          { last_interaction_at: { lt: tresDiasAtras } },
          { last_interaction_at: null }
        ]
      }
    })

    if (totalQuentesEsquecidos > 0) {
      insights.push({
        tipo: 'ALERTA',
        icone: '🚨',
        titulo: 'Leads Quentes Sem Atenção',
        texto: `A equipe tem ${totalQuentesEsquecidos} lead${totalQuentesEsquecidos > 1 ? 's' : ''} QUENTE${totalQuentesEsquecidos > 1 ? 'S' : ''} sem contato há mais de 3 dias. Isso pode estar custando vendas!`,
        acao: 'VER_LEADS_ESQUECIDOS',
        prioridade: 1,
        dados: { count: totalQuentesEsquecidos }
      })
    }

    // Leads não atribuídos
    const leadsNaoAtribuidos = await prisma.lead.count({
      where: {
        tenant_id: tenantId,
        corretor_id: null
      }
    })

    if (leadsNaoAtribuidos > 0) {
      insights.push({
        tipo: 'ALERTA',
        icone: '👤',
        titulo: 'Leads Sem Corretor',
        texto: `Existem ${leadsNaoAtribuidos} lead${leadsNaoAtribuidos > 1 ? 's' : ''} sem corretor atribuído. Distribua-os para não perder oportunidades!`,
        acao: 'ATRIBUIR_LEADS',
        prioridade: 2,
        dados: { count: leadsNaoAtribuidos }
      })
    }

    insights.sort((a, b) => a.prioridade - b.prioridade)
    return insights
  }
}

export const insightsService = new InsightsService()
