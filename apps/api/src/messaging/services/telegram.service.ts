import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../../shared/database/prisma.service';

export class TelegramService {
  private bot: TelegramBot;
  private brokerChats: Map<string, string> = new Map(); // userId -> chatId

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN!;
    this.bot = new TelegramBot(token, { polling: true });
    this.setupCommands();
  }

  /**
   * Busca o corretor e tenant_id pelo chat_id do Telegram
   */
  private async findCorretorByChatId(chatId: string) {
    return prisma.corretor.findFirst({
      where: { telegram_chat_id: chatId },
      select: { id: true, tenant_id: true }
    });
  }

  private setupCommands() {
    // Comando /start
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id.toString();

      if (userId) {
        this.brokerChats.set(userId, chatId.toString());
      }

      await this.bot.sendMessage(chatId,
        `🏠 *Bem-vindo ao Vivoly BI Assistant!*\n\n` +
        `Você receberá notificações sobre:\n` +
        `✅ Novos leads qualificados\n` +
        `✅ Oportunidades urgentes\n` +
        `✅ Leads com alta probabilidade de conversão\n` +
        `✅ Agendamentos confirmados\n\n` +
        `Use /help para ver todos os comandos disponíveis.`,
        { parse_mode: 'Markdown' }
      );
    });

    // Comando /help
    this.bot.onText(/\/help/, async (msg) => {
      await this.bot.sendMessage(msg.chat.id,
        `📚 *Comandos Disponíveis:*\n\n` +
        `/start - Iniciar o bot\n` +
        `/help - Mostrar ajuda\n` +
        `/stats - Ver estatísticas do dia\n` +
        `/leads - Listar leads recentes\n` +
        `/hot - Ver leads quentes agora`,
        { parse_mode: 'Markdown' }
      );
    });

    // Comando /stats
    this.bot.onText(/\/stats/, async (msg) => {
      const chatId = msg.chat.id.toString();
      const corretor = await this.findCorretorByChatId(chatId);

      if (!corretor) {
        await this.bot.sendMessage(msg.chat.id,
          `⚠️ Seu chat não está vinculado a nenhum corretor.\nPeça ao administrador para configurar seu Telegram no painel.`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalLeadsHoje, leadsQuentes, scoreResult, mensagensHoje] = await Promise.all([
        prisma.lead.count({
          where: { tenant_id: corretor.tenant_id, created_at: { gte: today } }
        }),
        prisma.lead.count({
          where: { tenant_id: corretor.tenant_id, temperatura: 'QUENTE' }
        }),
        prisma.lead.aggregate({
          where: { tenant_id: corretor.tenant_id, created_at: { gte: today }, score: { gt: 0 } },
          _avg: { score: true }
        }),
        prisma.message.count({
          where: { tenant_id: corretor.tenant_id, created_at: { gte: today }, is_from_lead: true }
        })
      ]);

      const scoreMedio = Math.round(scoreResult._avg.score || 0);

      await this.bot.sendMessage(msg.chat.id,
        `📊 *Estatísticas de Hoje:*\n\n` +
        `📩 Mensagens recebidas: ${mensagensHoje}\n` +
        `👤 Novos leads: ${totalLeadsHoje}\n` +
        `🔥 Leads quentes: ${leadsQuentes}\n` +
        `⭐ Score médio: ${scoreMedio}/100`,
        { parse_mode: 'Markdown' }
      );
    });

    // Comando /leads
    this.bot.onText(/\/leads/, async (msg) => {
      const chatId = msg.chat.id.toString();
      const corretor = await this.findCorretorByChatId(chatId);

      if (!corretor) {
        await this.bot.sendMessage(msg.chat.id,
          `⚠️ Seu chat não está vinculado a nenhum corretor.`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      const leadsRecentes = await prisma.lead.findMany({
        where: { tenant_id: corretor.tenant_id },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: { nome: true, telefone: true, temperatura: true, score: true, created_at: true }
      });

      if (leadsRecentes.length === 0) {
        await this.bot.sendMessage(msg.chat.id,
          `📭 Nenhum lead cadastrado ainda.`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      const tempIcon: Record<string, string> = { QUENTE: '🔥', MORNO: '🌡️', FRIO: '❄️' };

      const lista = leadsRecentes.map((l, i) => {
        const icon = tempIcon[l.temperatura] || '🎯';
        return `${i + 1}. ${icon} *${l.nome}* (${l.score}/100)\n   📱 ${l.telefone}`;
      }).join('\n\n');

      await this.bot.sendMessage(msg.chat.id,
        `👥 *Últimos 5 Leads:*\n\n${lista}`,
        { parse_mode: 'Markdown' }
      );
    });

    // Comando /hot
    this.bot.onText(/\/hot/, async (msg) => {
      const chatId = msg.chat.id.toString();
      const corretor = await this.findCorretorByChatId(chatId);

      if (!corretor) {
        await this.bot.sendMessage(msg.chat.id,
          `⚠️ Seu chat não está vinculado a nenhum corretor.`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      const leadsQuentes = await prisma.lead.findMany({
        where: { tenant_id: corretor.tenant_id, temperatura: 'QUENTE' },
        orderBy: { score: 'desc' },
        take: 5,
        select: { nome: true, telefone: true, score: true }
      });

      if (leadsQuentes.length === 0) {
        await this.bot.sendMessage(msg.chat.id,
          `❄️ Nenhum lead quente no momento.`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      const lista = leadsQuentes.map((l, i) => {
        return `${i + 1}. 🔥 *${l.nome}* (${l.score}/100)\n   📱 ${l.telefone}`;
      }).join('\n\n');

      await this.bot.sendMessage(msg.chat.id,
        `🔥 *Leads Quentes Agora:*\n\n${lista}\n\n⚡ *Entre em contato o quanto antes!*`,
        { parse_mode: 'Markdown' }
      );
    });
  }

  async notifyNewLead(brokerId: string, leadData: {
    name: string;
    phone: string;
    message: string;
    score: number;
    urgency: 'baixa' | 'média' | 'alta';
  }) {
    const chatId = this.brokerChats.get(brokerId);
    if (!chatId) {
      console.warn(`⚠️ Broker ${brokerId} não tem chat Telegram configurado`);
      return;
    }

    const urgencyEmoji = {
      'baixa': '🟢',
      'média': '🟡',
      'alta': '🔴'
    }[leadData.urgency];

    const message =
      `${urgencyEmoji} *Novo Lead!*\n\n` +
      `👤 *Nome:* ${leadData.name}\n` +
      `📱 *Telefone:* ${leadData.phone}\n` +
      `⭐ *Score:* ${leadData.score}/100\n` +
      `🎯 *Urgência:* ${leadData.urgency.toUpperCase()}\n\n` +
      `💬 *Primeira mensagem:*\n_"${leadData.message}"_\n\n` +
      `🤖 A IA já iniciou a conversa!`;

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '📞 Ligar Agora', callback_data: `call_${leadData.phone}` },
          { text: '💬 Ver Conversa', callback_data: `chat_${leadData.phone}` }
        ]]
      }
    });
  }

  async notifyHighScore(brokerId: string, leadData: {
    name: string;
    phone: string;
    score: number;
    reason: string;
  }) {
    const chatId = this.brokerChats.get(brokerId);
    if (!chatId) return;

    const message =
      `🔥 *LEAD QUENTE DETECTADO!*\n\n` +
      `👤 ${leadData.name}\n` +
      `📱 ${leadData.phone}\n` +
      `⭐ *Score: ${leadData.score}/100*\n\n` +
      `🎯 *Por quê?*\n${leadData.reason}\n\n` +
      `⚡ *AÇÃO RECOMENDADA:* Contato imediato!`;

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });
  }

  async sendMessage(chatId: string, text: string) {
    await this.bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown'
    });
  }

  registerBrokerChat(userId: string, chatId: string) {
    this.brokerChats.set(userId, chatId);
  }
}
