/**
 * Serviço de Atualização Automática de Temperatura de Leads
 *
 * Regras:
 * - QUENTE sem contato há 5+ dias → MORNO
 * - MORNO sem contato há 10+ dias → FRIO
 * - Notifica corretor via Telegram quando temperatura cai
 *
 * Uso:
 * - Executar diariamente via cron job
 * - Pode ser executado manualmente via endpoint admin
 */

import { PrismaClient, Temperatura } from '@prisma/client'
import { telegramService } from './telegram.service'

interface LeadTemperaturaUpdate {
  id: string
  nome: string
  telefone: string
  temperaturaAnterior: Temperatura
  temperaturaNova: Temperatura
  diasSemContato: number
  corretorId?: string
  corretorNome?: string
  corretorTelegramChatId?: string
}

interface ResultadoAtualizacao {
  tenantId: string
  tenantNome: string
  totalLeadsAnalisados: number
  leadsAtualizados: LeadTemperaturaUpdate[]
  notificacoesEnviadas: number
  erros: string[]
}

class TemperaturaAutoService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Configurações de dias para degradação de temperatura
   */
  private readonly CONFIG = {
    QUENTE_PARA_MORNO_DIAS: 5,  // Lead QUENTE sem contato há X dias → MORNO
    MORNO_PARA_FRIO_DIAS: 10,  // Lead MORNO sem contato há X dias → FRIO
  }

  /**
   * Executa atualização de temperatura para TODOS os tenants ativos
   */
  async executarParaTodosOsTenants(): Promise<ResultadoAtualizacao[]> {
    console.log('🌡️  [TemperaturaAuto] Iniciando atualização de temperatura para todos os tenants...')

    const tenants = await this.prisma.tenant.findMany({
      where: {
        status: { in: ['ATIVO', 'TRIAL'] }
      },
      select: {
        id: true,
        nome: true,
        slug: true
      }
    })

    console.log(`📊 [TemperaturaAuto] ${tenants.length} tenant(s) ativo(s) encontrado(s)`)

    const resultados: ResultadoAtualizacao[] = []

    for (const tenant of tenants) {
      try {
        const resultado = await this.executarParaTenant(tenant.id, tenant.nome)
        resultados.push(resultado)
      } catch (error: any) {
        console.error(`❌ [TemperaturaAuto] Erro no tenant ${tenant.nome}:`, error.message)
        resultados.push({
          tenantId: tenant.id,
          tenantNome: tenant.nome,
          totalLeadsAnalisados: 0,
          leadsAtualizados: [],
          notificacoesEnviadas: 0,
          erros: [error.message]
        })
      }
    }

    // Resumo final
    const totalAtualizados = resultados.reduce((acc, r) => acc + r.leadsAtualizados.length, 0)
    const totalNotificacoes = resultados.reduce((acc, r) => acc + r.notificacoesEnviadas, 0)

    console.log('\n📊 [TemperaturaAuto] ========== RESUMO FINAL ==========')
    console.log(`   Tenants processados: ${tenants.length}`)
    console.log(`   Total de leads atualizados: ${totalAtualizados}`)
    console.log(`   Notificações enviadas: ${totalNotificacoes}`)
    console.log('================================================\n')

    return resultados
  }

  /**
   * Executa atualização de temperatura para um tenant específico
   */
  async executarParaTenant(tenantId: string, tenantNome?: string): Promise<ResultadoAtualizacao> {
    const nome = tenantNome || tenantId
    console.log(`\n🏢 [TemperaturaAuto] Processando tenant: ${nome}`)

    const resultado: ResultadoAtualizacao = {
      tenantId,
      tenantNome: nome,
      totalLeadsAnalisados: 0,
      leadsAtualizados: [],
      notificacoesEnviadas: 0,
      erros: []
    }

    const agora = new Date()

    // 1. Buscar leads QUENTES que precisam ser rebaixados para MORNO
    const leadsQuentesParaMorno = await this.buscarLeadsParaRebaixar(
      tenantId,
      'QUENTE',
      'MORNO',
      this.CONFIG.QUENTE_PARA_MORNO_DIAS,
      agora
    )

    // 2. Buscar leads MORNOS que precisam ser rebaixados para FRIO
    const leadsMornosParaFrio = await this.buscarLeadsParaRebaixar(
      tenantId,
      'MORNO',
      'FRIO',
      this.CONFIG.MORNO_PARA_FRIO_DIAS,
      agora
    )

    resultado.totalLeadsAnalisados = leadsQuentesParaMorno.length + leadsMornosParaFrio.length

    // 3. Atualizar temperaturas
    const todosLeads = [...leadsQuentesParaMorno, ...leadsMornosParaFrio]

    for (const lead of todosLeads) {
      try {
        // Atualizar temperatura no banco
        await this.prisma.lead.update({
          where: { id: lead.id },
          data: {
            temperatura: lead.temperaturaNova,
            updated_at: new Date()
          }
        })

        // Registrar na timeline do lead
        await this.registrarNaTimeline(lead)

        resultado.leadsAtualizados.push(lead)

        console.log(`   ✅ ${lead.nome}: ${lead.temperaturaAnterior} → ${lead.temperaturaNova} (${lead.diasSemContato} dias sem contato)`)

        // Enviar notificação Telegram se corretor tiver chat_id configurado
        if (lead.corretorTelegramChatId) {
          try {
            await this.enviarNotificacaoTelegram(lead)
            resultado.notificacoesEnviadas++
          } catch (err: any) {
            resultado.erros.push(`Telegram para ${lead.corretorNome}: ${err.message}`)
          }
        }

      } catch (error: any) {
        console.error(`   ❌ Erro ao atualizar ${lead.nome}:`, error.message)
        resultado.erros.push(`Lead ${lead.nome}: ${error.message}`)
      }
    }

    console.log(`   📊 Resumo: ${resultado.leadsAtualizados.length} leads atualizados, ${resultado.notificacoesEnviadas} notificações`)

    return resultado
  }

  /**
   * Busca leads que precisam ter a temperatura rebaixada
   */
  private async buscarLeadsParaRebaixar(
    tenantId: string,
    temperaturaAtual: Temperatura,
    temperaturaNova: Temperatura,
    diasLimite: number,
    dataReferencia: Date
  ): Promise<LeadTemperaturaUpdate[]> {
    const dataLimite = new Date(dataReferencia)
    dataLimite.setDate(dataLimite.getDate() - diasLimite)

    const leads = await this.prisma.lead.findMany({
      where: {
        tenant_id: tenantId,
        temperatura: temperaturaAtual,
        OR: [
          // Nunca teve contato
          { last_interaction_at: null },
          // Último contato antes do limite
          { last_interaction_at: { lt: dataLimite } }
        ]
      },
      include: {
        corretor: {
          include: {
            user: {
              select: {
                nome: true
              }
            }
          }
        }
      }
    })

    return leads.map(lead => {
      // Calcular dias sem contato
      let diasSemContato = diasLimite
      if (lead.last_interaction_at) {
        diasSemContato = Math.floor(
          (dataReferencia.getTime() - lead.last_interaction_at.getTime()) / (1000 * 60 * 60 * 24)
        )
      } else if (lead.created_at) {
        diasSemContato = Math.floor(
          (dataReferencia.getTime() - lead.created_at.getTime()) / (1000 * 60 * 60 * 24)
        )
      }

      return {
        id: lead.id,
        nome: lead.nome,
        telefone: lead.telefone,
        temperaturaAnterior: temperaturaAtual,
        temperaturaNova: temperaturaNova,
        diasSemContato,
        corretorId: lead.corretor_id || undefined,
        corretorNome: lead.corretor?.user?.nome,
        corretorTelegramChatId: lead.corretor?.telegram_chat_id || undefined
      }
    })
  }

  /**
   * Registra a mudança de temperatura na timeline do lead
   */
  private async registrarNaTimeline(lead: LeadTemperaturaUpdate): Promise<void> {
    const leadAtual = await this.prisma.lead.findUnique({
      where: { id: lead.id },
      select: { timeline: true }
    })

    const timelineAtual = (leadAtual?.timeline as any[]) || []

    const novoEvento = {
      tipo: 'TEMPERATURA_ALTERADA_AUTO',
      data: new Date().toISOString(),
      de: lead.temperaturaAnterior,
      para: lead.temperaturaNova,
      motivo: `Sem contato há ${lead.diasSemContato} dias`,
      automatico: true
    }

    await this.prisma.lead.update({
      where: { id: lead.id },
      data: {
        timeline: [...timelineAtual, novoEvento]
      }
    })
  }

  /**
   * Envia notificação via Telegram para o corretor
   */
  private async enviarNotificacaoTelegram(lead: LeadTemperaturaUpdate): Promise<void> {
    if (!lead.corretorTelegramChatId) return

    const iconeAnterior = this.getIconeTemperatura(lead.temperaturaAnterior)
    const iconeNovo = this.getIconeTemperatura(lead.temperaturaNova)

    const mensagem = `
⚠️ <b>ALERTA: Lead Esfriando!</b>

👤 <b>Cliente:</b> ${lead.nome}
📱 <b>Telefone:</b> ${lead.telefone}

🌡️ <b>Temperatura:</b> ${iconeAnterior} ${lead.temperaturaAnterior} → ${iconeNovo} ${lead.temperaturaNova}

⏰ <b>Motivo:</b> Sem contato há ${lead.diasSemContato} dias

━━━━━━━━━━━━━━━━━━━━

💡 <i>Dica da Sofia: Entre em contato o quanto antes para não perder este lead!</i>

🤖 <i>Mensagem automática - ImobiFlow</i>
`.trim()

    await telegramService.sendMessage(lead.corretorTelegramChatId, mensagem, 'HTML')
  }

  /**
   * Retorna ícone da temperatura
   */
  private getIconeTemperatura(temperatura: Temperatura): string {
    switch (temperatura) {
      case 'QUENTE': return '🔥'
      case 'MORNO': return '⚡'
      case 'FRIO': return '❄️'
      default: return '🌡️'
    }
  }

  /**
   * Retorna estatísticas de leads por temperatura para um tenant
   */
  async getEstatisticas(tenantId: string): Promise<{
    quentes: number
    quentesSemContato5Dias: number
    mornos: number
    mornosSemContato10Dias: number
    frios: number
  }> {
    const agora = new Date()
    const limite5Dias = new Date(agora)
    limite5Dias.setDate(limite5Dias.getDate() - 5)
    const limite10Dias = new Date(agora)
    limite10Dias.setDate(limite10Dias.getDate() - 10)

    const [quentes, quentesSemContato, mornos, mornosSemContato, frios] = await Promise.all([
      this.prisma.lead.count({
        where: { tenant_id: tenantId, temperatura: 'QUENTE' }
      }),
      this.prisma.lead.count({
        where: {
          tenant_id: tenantId,
          temperatura: 'QUENTE',
          OR: [
            { last_interaction_at: null },
            { last_interaction_at: { lt: limite5Dias } }
          ]
        }
      }),
      this.prisma.lead.count({
        where: { tenant_id: tenantId, temperatura: 'MORNO' }
      }),
      this.prisma.lead.count({
        where: {
          tenant_id: tenantId,
          temperatura: 'MORNO',
          OR: [
            { last_interaction_at: null },
            { last_interaction_at: { lt: limite10Dias } }
          ]
        }
      }),
      this.prisma.lead.count({
        where: { tenant_id: tenantId, temperatura: 'FRIO' }
      })
    ])

    return {
      quentes,
      quentesSemContato5Dias: quentesSemContato,
      mornos,
      mornosSemContato10Dias: mornosSemContato,
      frios
    }
  }
}

// Exportar instância singleton
export const temperaturaAutoService = new TemperaturaAutoService()
