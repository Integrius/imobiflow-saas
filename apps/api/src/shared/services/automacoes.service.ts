import { prisma } from '../database/prisma.service';
import { telegramService } from './telegram.service';
import { whatsAppService } from '../../modules/whatsapp/whatsapp.service';

interface AutomacaoResult {
  tenantId: string;
  tenantNome: string;
  automacao: string;
  executadas: number;
  erros: string[];
}

export class AutomacoesService {
  /**
   * Executa todas as automações para todos os tenants
   */
  async executarTodasAutomacoes(): Promise<AutomacaoResult[]> {
    const tenants = await prisma.tenant.findMany({
      where: { status: { in: ['ATIVO', 'TRIAL'] } },
      select: { id: true, nome: true }
    });

    const resultados: AutomacaoResult[] = [];

    for (const tenant of tenants) {
      // Executa cada automação
      resultados.push(await this.automacao1FollowUp(tenant.id, tenant.nome));
      resultados.push(await this.automacao2TemperaturaDecrescente(tenant.id, tenant.nome));
      resultados.push(await this.automacao3LembreteVisita(tenant.id, tenant.nome));
      resultados.push(await this.automacao4LeadAbandonado(tenant.id, tenant.nome));
      resultados.push(await this.automacao5AtribuicaoPorArea(tenant.id, tenant.nome));
    }

    return resultados;
  }

  /**
   * AUTOMAÇÃO #1: Follow-up automático
   * Lead sem resposta há 3 dias → enviar WhatsApp
   */
  private async automacao1FollowUp(tenantId: string, tenantNome: string): Promise<AutomacaoResult> {
    const erros: string[] = [];
    let executadas = 0;

    try {
      const tresDiasAtras = new Date();
      tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);

      // Buscar leads com última interação há 3 dias
      const leads = await prisma.lead.findMany({
        where: {
          tenant_id: tenantId,
          temperatura: { in: ['QUENTE', 'MORNO'] },
          ai_enabled: true,
        },
        include: {
          interactions: {
            orderBy: { created_at: 'desc' },
            take: 1
          },
          corretor: {
            include: {
              user: { select: { nome: true } }
            }
          }
        }
      });

      for (const lead of leads) {
        try {
          // Verifica última interação
          const ultimaInteracao = lead.interactions[0];
          if (!ultimaInteracao || ultimaInteracao.created_at >= tresDiasAtras) {
            continue;
          }

          // Envia WhatsApp de follow-up
          const mensagem = `Olá ${lead.nome}! Estou retomando nosso contato sobre imóveis. Como posso ajudá-lo hoje?`;

          const config = await prisma.whatsAppConfig.findUnique({
            where: { tenant_id: tenantId }
          });

          if (config?.is_active && config.twilio_phone_number) {
            await whatsAppService.sendAndSaveMessage(
              tenantId,
              lead.id,
              lead.telefone,
              mensagem,
              config.twilio_phone_number
            );

            // Registra interação
            await prisma.leadInteraction.create({
              data: {
                lead_id: lead.id,
                tenant_id: tenantId,
                tipo: 'WHATSAPP',
                descricao: 'Follow-up automático (3 dias sem resposta)',
                user_id: lead.corretor?.user_id
              }
            });

            executadas++;
          }
        } catch (error: any) {
          erros.push(`Lead ${lead.id}: ${error.message}`);
        }
      }
    } catch (error: any) {
      erros.push(`Erro geral: ${error.message}`);
    }

    return {
      tenantId,
      tenantNome,
      automacao: 'Follow-up Automático (3 dias)',
      executadas,
      erros
    };
  }

  /**
   * AUTOMAÇÃO #2: Temperatura decrescente
   * Lead QUENTE→MORNO após 5 dias, MORNO→FRIO após 10 dias
   */
  private async automacao2TemperaturaDecrescente(tenantId: string, tenantNome: string): Promise<AutomacaoResult> {
    const erros: string[] = [];
    let executadas = 0;

    try {
      const cincoDiasAtras = new Date();
      cincoDiasAtras.setDate(cincoDiasAtras.getDate() - 5);

      const dezDiasAtras = new Date();
      dezDiasAtras.setDate(dezDiasAtras.getDate() - 10);

      // QUENTE → MORNO (5 dias)
      const leadsQuentes = await prisma.lead.findMany({
        where: {
          tenant_id: tenantId,
          temperatura: 'QUENTE',
          updated_at: { lte: cincoDiasAtras }
        },
        include: {
          corretor: { select: { telegram_chat_id: true } }
        }
      });

      for (const lead of leadsQuentes) {
        try {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { temperatura: 'MORNO' }
          });

          // Notifica corretor via Telegram
          if (lead.corretor?.telegram_chat_id) {
            const mensagem = `🌡️ *Temperatura Atualizada*\n\nLead: ${lead.nome}\n🔥 QUENTE → 🌡️ MORNO\n\nMotivo: 5 dias sem atividade`;
            await telegramService.sendMessage(lead.corretor.telegram_chat_id, mensagem);
          }

          executadas++;
        } catch (error: any) {
          erros.push(`Lead ${lead.id}: ${error.message}`);
        }
      }

      // MORNO → FRIO (10 dias)
      const leadsMornos = await prisma.lead.findMany({
        where: {
          tenant_id: tenantId,
          temperatura: 'MORNO',
          updated_at: { lte: dezDiasAtras }
        },
        include: {
          corretor: { select: { telegram_chat_id: true } }
        }
      });

      for (const lead of leadsMornos) {
        try {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { temperatura: 'FRIO' }
          });

          // Notifica corretor via Telegram
          if (lead.corretor?.telegram_chat_id) {
            const mensagem = `❄️ *Temperatura Atualizada*\n\nLead: ${lead.nome}\n🌡️ MORNO → ❄️ FRIO\n\nMotivo: 10 dias sem atividade`;
            await telegramService.sendMessage(lead.corretor.telegram_chat_id, mensagem);
          }

          executadas++;
        } catch (error: any) {
          erros.push(`Lead ${lead.id}: ${error.message}`);
        }
      }
    } catch (error: any) {
      erros.push(`Erro geral: ${error.message}`);
    }

    return {
      tenantId,
      tenantNome,
      automacao: 'Temperatura Decrescente',
      executadas,
      erros
    };
  }

  /**
   * AUTOMAÇÃO #3: Lembrete de visita
   * 24h antes da visita → WhatsApp para lead + corretor
   */
  private async automacao3LembreteVisita(tenantId: string, tenantNome: string): Promise<AutomacaoResult> {
    const erros: string[] = [];
    let executadas = 0;

    try {
      const amanha = new Date();
      amanha.setDate(amanha.getDate() + 1);
      amanha.setHours(0, 0, 0, 0);

      const depoisDeAmanha = new Date(amanha);
      depoisDeAmanha.setDate(depoisDeAmanha.getDate() + 1);

      const agendamentos = await prisma.agendamento.findMany({
        where: {
          tenant_id: tenantId,
          data_visita: {
            gte: amanha,
            lt: depoisDeAmanha
          },
          status: 'CONFIRMADO',
          lembrete_24h_enviado: false
        },
        include: {
          lead: true,
          imovel: true,
          corretor: {
            include: {
              user: { select: { nome: true, telefone: true } }
            }
          }
        }
      });

      const config = await prisma.whatsAppConfig.findUnique({
        where: { tenant_id: tenantId }
      });

      for (const agendamento of agendamentos) {
        try {
          const dataFormatada = agendamento.data_visita.toLocaleDateString('pt-BR');
          const horaFormatada = agendamento.data_visita.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          });

          // Mensagem para o lead
          const mensagemLead = `🏠 *Lembrete de Visita*\n\nOlá ${agendamento.lead.nome}!\n\nLembrando da visita amanhã:\n📅 ${dataFormatada} às ${horaFormatada}\n🏢 ${agendamento.imovel.titulo}\n📍 ${agendamento.imovel.endereco_completo}\n\nNos vemos lá!`;

          // Mensagem para o corretor
          const mensagemCorretor = `🏠 *Lembrete de Visita*\n\nVisita agendada amanhã:\n📅 ${dataFormatada} às ${horaFormatada}\n👤 Cliente: ${agendamento.lead.nome}\n📱 ${agendamento.lead.telefone}\n🏢 ${agendamento.imovel.titulo}`;

          if (config?.is_active && config.twilio_phone_number) {
            // Envia para o lead
            await whatsAppService.sendAndSaveMessage(
              tenantId,
              agendamento.lead.id,
              agendamento.lead.telefone,
              mensagemLead,
              config.twilio_phone_number
            );

            // Envia para o corretor via Telegram
            if (agendamento.corretor?.telegram_chat_id) {
              await telegramService.sendMessage(
                agendamento.corretor.telegram_chat_id,
                mensagemCorretor
              );
            }

            // Marca lembrete como enviado
            await prisma.agendamento.update({
              where: { id: agendamento.id },
              data: { lembrete_24h_enviado: true }
            });

            executadas++;
          }
        } catch (error: any) {
          erros.push(`Agendamento ${agendamento.id}: ${error.message}`);
        }
      }
    } catch (error: any) {
      erros.push(`Erro geral: ${error.message}`);
    }

    return {
      tenantId,
      tenantNome,
      automacao: 'Lembrete de Visita (24h)',
      executadas,
      erros
    };
  }

  /**
   * AUTOMAÇÃO #4: Lead abandonado
   * Lead sem resposta há 7 dias → marcar como FRIO
   */
  private async automacao4LeadAbandonado(tenantId: string, tenantNome: string): Promise<AutomacaoResult> {
    const erros: string[] = [];
    let executadas = 0;

    try {
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

      const leads = await prisma.lead.findMany({
        where: {
          tenant_id: tenantId,
          temperatura: { not: 'FRIO' },
          updated_at: { lte: seteDiasAtras }
        },
        include: {
          interactions: {
            orderBy: { created_at: 'desc' },
            take: 1
          },
          corretor: { select: { telegram_chat_id: true } }
        }
      });

      for (const lead of leads) {
        try {
          const ultimaInteracao = lead.interactions[0];
          if (ultimaInteracao && ultimaInteracao.created_at >= seteDiasAtras) {
            continue;
          }

          await prisma.lead.update({
            where: { id: lead.id },
            data: { temperatura: 'FRIO' }
          });

          // Notifica corretor
          if (lead.corretor?.telegram_chat_id) {
            const mensagem = `❄️ *Lead Abandonado*\n\nLead: ${lead.nome}\nStatus: FRIO (7 dias sem resposta)\n\nConsidere reativar o contato.`;
            await telegramService.sendMessage(lead.corretor.telegram_chat_id, mensagem);
          }

          executadas++;
        } catch (error: any) {
          erros.push(`Lead ${lead.id}: ${error.message}`);
        }
      }
    } catch (error: any) {
      erros.push(`Erro geral: ${error.message}`);
    }

    return {
      tenantId,
      tenantNome,
      automacao: 'Lead Abandonado (7 dias)',
      executadas,
      erros
    };
  }

  /**
   * AUTOMAÇÃO #5: Atribuição inteligente por área
   * Novo lead em área X → atribuir para corretor especializado
   */
  private async automacao5AtribuicaoPorArea(tenantId: string, tenantNome: string): Promise<AutomacaoResult> {
    const erros: string[] = [];
    let executadas = 0;

    try {
      // Buscar leads sem corretor atribuído
      const leadsSemCorretor = await prisma.lead.findMany({
        where: {
          tenant_id: tenantId,
          corretor_id: null,
          localizacao: { not: null }
        }
      });

      for (const lead of leadsSemCorretor) {
        try {
          if (!lead.localizacao) continue;

          // Busca corretores com especialização na área
          const corretores = await prisma.corretor.findMany({
            where: {
              tenant_id: tenantId,
              especializacoes: { has: lead.localizacao }
            },
            orderBy: { performance_score: 'desc' },
            take: 1
          });

          if (corretores.length > 0) {
            await prisma.lead.update({
              where: { id: lead.id },
              data: { corretor_id: corretores[0].id }
            });

            // Notifica corretor via Telegram
            if (corretores[0].telegram_chat_id) {
              const mensagem = `🎯 *Novo Lead Atribuído*\n\n👤 ${lead.nome}\n📱 ${lead.telefone}\n📍 ${lead.localizacao}\n\nLead atribuído automaticamente por especialização na área.`;
              await telegramService.sendMessage(corretores[0].telegram_chat_id, mensagem);
            }

            executadas++;
          }
        } catch (error: any) {
          erros.push(`Lead ${lead.id}: ${error.message}`);
        }
      }
    } catch (error: any) {
      erros.push(`Erro geral: ${error.message}`);
    }

    return {
      tenantId,
      tenantNome,
      automacao: 'Atribuição por Área',
      executadas,
      erros
    };
  }
}

export const automacoesService = new AutomacoesService();
