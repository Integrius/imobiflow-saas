import { PrismaClient, TipoInteracao, DirecaoInteracao, SentimentoInteracao } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateInteractionDTO {
  lead_id: string
  tipo: TipoInteracao
  direcao: DirecaoInteracao
  conteudo?: string
  sentimento?: SentimentoInteracao
  duracao_minutos?: number
  corretor_id?: string
  automatico?: boolean
}

export class InteractionsService {
  /**
   * Registra uma nova interação com um lead
   * Atualiza automaticamente o last_interaction_at do lead
   */
  async registrar(data: CreateInteractionDTO, tenantId: string) {
    // Verifica se o lead existe e pertence ao tenant
    const lead = await prisma.lead.findFirst({
      where: {
        id: data.lead_id,
        tenant_id: tenantId
      }
    })

    if (!lead) {
      throw new Error('Lead não encontrado')
    }

    // Cria a interação
    const interaction = await prisma.leadInteraction.create({
      data: {
        tenant_id: tenantId,
        lead_id: data.lead_id,
        tipo: data.tipo,
        direcao: data.direcao,
        conteudo: data.conteudo,
        sentimento: data.sentimento || SentimentoInteracao.NEUTRO,
        duracao_minutos: data.duracao_minutos,
        corretor_id: data.corretor_id,
        automatico: data.automatico || false
      }
    })

    // Atualiza o last_interaction_at do lead
    await prisma.lead.update({
      where: { id: data.lead_id },
      data: {
        last_interaction_at: new Date(),
        ultimo_contato: new Date() // Manter compatibilidade com campo antigo
      }
    })

    return interaction
  }

  /**
   * Lista interações de um lead específico
   */
  async listarPorLead(leadId: string, tenantId: string, limit = 50) {
    return prisma.leadInteraction.findMany({
      where: {
        lead_id: leadId,
        tenant_id: tenantId
      },
      orderBy: { created_at: 'desc' },
      take: limit
    })
  }

  /**
   * Lista interações recentes de um corretor
   */
  async listarPorCorretor(corretorId: string, tenantId: string, limit = 50) {
    return prisma.leadInteraction.findMany({
      where: {
        corretor_id: corretorId,
        tenant_id: tenantId
      },
      include: {
        lead: {
          select: {
            id: true,
            nome: true,
            telefone: true,
            temperatura: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit
    })
  }

  /**
   * Conta interações por tipo em um período
   */
  async estatisticas(corretorId: string, tenantId: string, diasAtras = 30) {
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - diasAtras)

    const interacoes = await prisma.leadInteraction.groupBy({
      by: ['tipo'],
      where: {
        tenant_id: tenantId,
        corretor_id: corretorId,
        created_at: { gte: dataInicio }
      },
      _count: { id: true }
    })

    const total = await prisma.leadInteraction.count({
      where: {
        tenant_id: tenantId,
        corretor_id: corretorId,
        created_at: { gte: dataInicio }
      }
    })

    return {
      total,
      por_tipo: interacoes.map(i => ({
        tipo: i.tipo,
        quantidade: i._count.id
      })),
      periodo_dias: diasAtras
    }
  }

  /**
   * Registra interação de forma simples (atalho para uso comum)
   */
  async registrarLigacao(leadId: string, tenantId: string, corretorId: string, duracao?: number, observacao?: string) {
    return this.registrar({
      lead_id: leadId,
      tipo: TipoInteracao.LIGACAO,
      direcao: DirecaoInteracao.SAIDA,
      duracao_minutos: duracao,
      conteudo: observacao,
      corretor_id: corretorId
    }, tenantId)
  }

  async registrarWhatsApp(leadId: string, tenantId: string, corretorId: string, mensagem?: string, direcao: DirecaoInteracao = DirecaoInteracao.SAIDA) {
    return this.registrar({
      lead_id: leadId,
      tipo: TipoInteracao.WHATSAPP,
      direcao,
      conteudo: mensagem,
      corretor_id: corretorId
    }, tenantId)
  }

  async registrarNota(leadId: string, tenantId: string, corretorId: string, nota: string) {
    return this.registrar({
      lead_id: leadId,
      tipo: TipoInteracao.NOTA,
      direcao: DirecaoInteracao.SAIDA,
      conteudo: nota,
      corretor_id: corretorId
    }, tenantId)
  }

  async registrarVisita(leadId: string, tenantId: string, corretorId: string, observacao?: string) {
    return this.registrar({
      lead_id: leadId,
      tipo: TipoInteracao.VISITA,
      direcao: DirecaoInteracao.SAIDA,
      conteudo: observacao,
      corretor_id: corretorId
    }, tenantId)
  }
}

export const interactionsService = new InteractionsService()
