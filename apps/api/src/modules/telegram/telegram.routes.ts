/**
 * Rotas para gerenciamento do Telegram
 *
 * Endpoints para testar conexão, obter chat_id e enviar notificações
 */

import { FastifyInstance } from 'fastify';
import { telegramService } from '../../shared/services/telegram.service';
import { prisma } from '../../shared/database/prisma';

export async function telegramRoutes(server: FastifyInstance) {
  /**
   * GET /api/v1/telegram/status
   * Verifica status da integração Telegram
   */
  server.get('/status', async (request, reply) => {
    try {
      const isConfigured = telegramService.isConfigured();

      if (!isConfigured) {
        return {
          success: false,
          configured: false,
          message: 'TELEGRAM_BOT_TOKEN não configurado'
        };
      }

      const test = await telegramService.testConnection();

      return {
        success: test.success,
        configured: true,
        botInfo: test.botInfo,
        error: test.error
      };
    } catch (error: any) {
      server.log.error('Erro ao verificar status Telegram:', error);
      return reply.status(500).send({
        error: 'Erro ao verificar status',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/telegram/updates
   * Obtém últimas atualizações (útil para descobrir chat_id)
   */
  server.get('/updates', async (request, reply) => {
    try {
      const updates = await telegramService.getUpdates();

      // Extrair chat_ids únicos
      const chatIds = new Set<string>();
      const chatsInfo: any[] = [];

      updates.forEach((update: any) => {
        if (update.message?.chat) {
          const chat = update.message.chat;
          const chatId = chat.id.toString();

          if (!chatIds.has(chatId)) {
            chatIds.add(chatId);
            chatsInfo.push({
              chat_id: chatId,
              type: chat.type,
              username: chat.username,
              first_name: chat.first_name,
              last_name: chat.last_name,
              last_message: update.message.text
            });
          }
        }
      });

      return {
        success: true,
        total: updates.length,
        unique_chats: chatsInfo.length,
        chats: chatsInfo,
        raw_updates: updates
      };
    } catch (error: any) {
      server.log.error('Erro ao obter updates:', error);
      return reply.status(500).send({
        error: 'Erro ao obter updates',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/telegram/test
   * Envia mensagem de teste
   */
  server.post<{
    Body: {
      chat_id: string;
      message?: string;
    };
  }>('/test', async (request, reply) => {
    try {
      const { chat_id, message } = request.body;

      if (!chat_id) {
        return reply.status(400).send({
          error: 'chat_id é obrigatório'
        });
      }

      const testMessage = message || `
🤖 <b>Teste de Integração Telegram</b>

✅ Bot configurado com sucesso!

Este é um teste do sistema de notificações ImobiFlow.

<i>Data/Hora: ${new Date().toLocaleString('pt-BR')}</i>
      `.trim();

      const success = await telegramService.sendMessage(chat_id, testMessage);

      return {
        success,
        message: success ? 'Mensagem enviada com sucesso!' : 'Falha ao enviar mensagem',
        chat_id
      };
    } catch (error: any) {
      server.log.error('Erro ao enviar mensagem de teste:', error);
      return reply.status(500).send({
        error: 'Erro ao enviar mensagem',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/telegram/notify-lead
   * Envia notificação de lead atribuído
   */
  server.post<{
    Body: {
      lead_id: string;
      chat_id?: string;
    };
  }>('/notify-lead', async (request, reply) => {
    try {
      const { lead_id, chat_id } = request.body;

      if (!lead_id) {
        return reply.status(400).send({
          error: 'lead_id é obrigatório'
        });
      }

      // Buscar lead com informações do corretor
      const lead = await prisma.lead.findUnique({
        where: { id: lead_id },
        include: {
          corretor: true
        }
      });

      if (!lead) {
        return reply.status(404).send({
          error: 'Lead não encontrado'
        });
      }

      if (!lead.corretor_id && !chat_id) {
        return reply.status(400).send({
          error: 'Lead não possui corretor atribuído e chat_id não foi fornecido'
        });
      }

      // Usar chat_id do corretor ou o fornecido manualmente
      const targetChatId = chat_id || lead.corretor?.telegram_chat_id;

      if (!targetChatId) {
        return reply.status(400).send({
          error: 'Corretor não possui telegram_chat_id configurado'
        });
      }

      // Formatar localização
      const localizacaoParts: string[] = [];
      if (lead.bairro) localizacaoParts.push(lead.bairro);
      if (lead.municipio) localizacaoParts.push(lead.municipio);
      if (lead.estado) localizacaoParts.push(lead.estado);
      const localizacao = localizacaoParts.length > 0 ? localizacaoParts.join(', ') : undefined;

      // Formatar quartos
      let quartos: string | undefined;
      if (lead.quartos_min || lead.quartos_max) {
        if (lead.quartos_min && lead.quartos_max) {
          quartos = `${lead.quartos_min} - ${lead.quartos_max}`;
        } else if (lead.quartos_min) {
          quartos = `Mínimo ${lead.quartos_min}`;
        } else {
          quartos = `Máximo ${lead.quartos_max}`;
        }
      }

      // Formatar vagas
      let vagas: string | undefined;
      if (lead.vagas_min || lead.vagas_max) {
        if (lead.vagas_min && lead.vagas_max) {
          vagas = `${lead.vagas_min} - ${lead.vagas_max}`;
        } else if (lead.vagas_min) {
          vagas = `Mínimo ${lead.vagas_min}`;
        } else {
          vagas = `Máximo ${lead.vagas_max}`;
        }
      }

      // Enviar notificação
      const success = await telegramService.notificarNovoLead(targetChatId, {
        leadId: lead.id,
        leadNome: lead.nome,
        leadTelefone: lead.telefone,
        leadEmail: lead.email,
        tipoNegocio: lead.tipo_negocio || undefined,
        tipoImovel: lead.tipo_imovel_desejado || undefined,
        valorMinimo: lead.valor_minimo ? parseFloat(lead.valor_minimo.toString()) : undefined,
        valorMaximo: lead.valor_maximo ? parseFloat(lead.valor_maximo.toString()) : undefined,
        localizacao,
        quartos,
        vagas,
        areaminima: lead.area_minima ? parseFloat(lead.area_minima.toString()) : undefined,
        aceitaPets: lead.aceita_pets || undefined,
        observacoes: lead.observacoes || undefined,
        corretorNome: lead.corretor?.nome || 'Você'
      });

      return {
        success,
        message: success ? 'Notificação enviada com sucesso!' : 'Falha ao enviar notificação',
        lead_id,
        chat_id: targetChatId
      };
    } catch (error: any) {
      server.log.error('Erro ao notificar lead:', error);
      return reply.status(500).send({
        error: 'Erro ao notificar lead',
        message: error.message
      });
    }
  });
}
