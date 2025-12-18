import TelegramBot from 'node-telegram-bot-api';

export class TelegramService {
  private bot: TelegramBot;
  private brokerChats: Map<string, string> = new Map(); // userId -> chatId

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN!;
    this.bot = new TelegramBot(token, { polling: true });
    this.setupCommands();
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
      // TODO: Buscar stats reais do banco
      await this.bot.sendMessage(msg.chat.id,
        `📊 *Estatísticas de Hoje:*\n\n` +
        `📩 Mensagens recebidas: 47\n` +
        `👤 Novos leads: 12\n` +
        `🔥 Leads quentes: 5\n` +
        `⭐ Score médio: 67/100\n` +
        `✅ Taxa de resposta IA: 100%`,
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
