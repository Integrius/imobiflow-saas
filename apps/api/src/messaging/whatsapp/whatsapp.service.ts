import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { EventEmitter } from 'events';

/**
 * WhatsApp Service com Anti-Ban Controls
 *
 * Implementa estratégias para evitar banimento:
 * 1. Delays humanizados entre mensagens
 * 2. Variação de tempo de resposta
 * 3. Limite de mensagens por hora
 * 4. Horário de funcionamento
 * 5. Digitação simulada
 */
export class WhatsAppService extends EventEmitter {
  private client: Client | null = null;
  private isReady: boolean = false;
  private qrCode: string = '';

  // Anti-ban controls
  private messageQueue: Array<{
    to: string;
    message: string;
    timestamp: number;
  }> = [];
  private messagesSentLastHour: number = 0;
  private lastMessageTime: number = 0;

  // Configurações anti-ban
  private readonly MAX_MESSAGES_PER_HOUR = 50; // Limite conservador
  private readonly MIN_DELAY_MS = 3000; // 3 segundos mínimo
  private readonly MAX_DELAY_MS = 8000; // 8 segundos máximo
  private readonly TYPING_DELAY_MS = 2000; // 2 segundos de "digitando..."
  private readonly WORK_START_HOUR = 8; // 8h da manhã
  private readonly WORK_END_HOUR = 22; // 22h da noite

  constructor() {
    super();

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: process.env.WHATSAPP_SESSION_PATH || './whatsapp-session'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    this.setupEventHandlers();

    // Limpa contador de mensagens a cada hora
    setInterval(() => {
      this.messagesSentLastHour = 0;
    }, 60 * 60 * 1000);

    // Processa fila de mensagens
    setInterval(() => {
      this.processMessageQueue();
    }, 5000);
  }

  /**
   * Configura event handlers do WhatsApp
   */
  private setupEventHandlers() {
    if (!this.client) return;

    // QR Code para autenticação
    this.client.on('qr', (qr) => {
      console.log('📱 QR Code recebido. Escaneie com WhatsApp:');
      qrcode.generate(qr, { small: true });
      this.qrCode = qr;
      this.emit('qr', qr);
    });

    // Cliente pronto
    this.client.on('ready', () => {
      console.log('✅ WhatsApp conectado com sucesso!');
      this.isReady = true;
      this.emit('ready');
    });

    // Mensagens recebidas
    this.client.on('message', async (message: Message) => {
      try {
        // Ignora mensagens de grupos
        const chat = await message.getChat();
        if (chat.isGroup) return;

        // Ignora mensagens próprias
        if (message.fromMe) return;

        console.log(`📩 Nova mensagem de ${message.from}:`, message.body);

        // Extrai nome do contato
        const contact = await message.getContact();

        this.emit('message', {
          from: message.from,
          name: contact.pushname || contact.name || 'Desconhecido',
          body: message.body,
          timestamp: message.timestamp,
          isForwarded: message.isForwarded
        });

      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    });

    // Desconexão
    this.client.on('disconnected', (reason) => {
      console.log('❌ WhatsApp desconectado:', reason);
      this.isReady = false;
      this.emit('disconnected', reason);
    });

    // Autenticação falhou
    this.client.on('auth_failure', (msg) => {
      console.error('❌ Falha na autenticação:', msg);
      this.emit('auth_failure', msg);
    });
  }

  /**
   * Inicializa o cliente WhatsApp
   */
  async initialize(): Promise<void> {
    if (!this.client) {
      throw new Error('Cliente WhatsApp não inicializado');
    }

    try {
      console.log('🔄 Inicializando WhatsApp...');
      await this.client.initialize();
    } catch (error) {
      console.error('❌ Erro ao inicializar WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Envia mensagem com controles anti-ban
   */
  async sendMessage(to: string, message: string, priority: 'high' | 'normal' = 'normal'): Promise<boolean> {
    if (!this.isReady) {
      console.warn('⚠️  WhatsApp não está pronto. Mensagem adicionada à fila.');
      this.messageQueue.push({ to, message, timestamp: Date.now() });
      return false;
    }

    // Verifica se está no horário de funcionamento
    if (!this.isWorkingHours()) {
      console.warn('⚠️  Fora do horário de funcionamento. Mensagem agendada para amanhã.');
      this.messageQueue.push({ to, message, timestamp: Date.now() });
      return false;
    }

    // Verifica limite de mensagens por hora
    if (this.messagesSentLastHour >= this.MAX_MESSAGES_PER_HOUR) {
      console.warn('⚠️  Limite de mensagens/hora atingido. Mensagem enfileirada.');
      this.messageQueue.push({ to, message, timestamp: Date.now() });
      return false;
    }

    // Adiciona à fila (mesmo se prioridade alta, para controle de delay)
    if (priority === 'high') {
      this.messageQueue.unshift({ to, message, timestamp: Date.now() });
    } else {
      this.messageQueue.push({ to, message, timestamp: Date.now() });
    }

    return true;
  }

  /**
   * Processa fila de mensagens com delays humanizados
   */
  private async processMessageQueue() {
    if (this.messageQueue.length === 0) return;
    if (!this.isReady) return;
    if (!this.isWorkingHours()) return;
    if (this.messagesSentLastHour >= this.MAX_MESSAGES_PER_HOUR) return;

    // Calcula delay desde última mensagem
    const timeSinceLastMessage = Date.now() - this.lastMessageTime;
    const requiredDelay = this.getRandomDelay();

    if (timeSinceLastMessage < requiredDelay) {
      // Ainda não passou o delay mínimo
      return;
    }

    // Pega próxima mensagem da fila
    const nextMessage = this.messageQueue.shift();
    if (!nextMessage) return;

    try {
      // Simula "digitando..."
      await this.simulateTyping(nextMessage.to);

      // Envia mensagem
      const chatId = nextMessage.to.includes('@c.us')
        ? nextMessage.to
        : `${nextMessage.to}@c.us`;

      await this.client!.sendMessage(chatId, nextMessage.message);

      this.messagesSentLastHour++;
      this.lastMessageTime = Date.now();

      console.log(`✅ Mensagem enviada para ${nextMessage.to}`);
      this.emit('message_sent', { to: nextMessage.to, success: true });

    } catch (error: any) {
      console.error(`❌ Erro ao enviar mensagem para ${nextMessage.to}:`, error.message);

      // Se falhou, recoloca no final da fila (máximo 3 tentativas)
      const attempts = (nextMessage as any).attempts || 0;
      if (attempts < 3) {
        this.messageQueue.push({
          ...nextMessage,
          timestamp: Date.now(),
          attempts: attempts + 1
        } as any);
      }

      this.emit('message_sent', { to: nextMessage.to, success: false, error: error.message });
    }
  }

  /**
   * Simula digitação antes de enviar mensagem
   */
  private async simulateTyping(chatId: string): Promise<void> {
    try {
      const formattedChatId = chatId.includes('@c.us') ? chatId : `${chatId}@c.us`;
      const chat = await this.client!.getChatById(formattedChatId);

      // Envia estado de "digitando..."
      await chat.sendStateTyping();

      // Aguarda tempo de digitação
      await this.sleep(this.TYPING_DELAY_MS);

      // Limpa estado
      await chat.clearState();

    } catch (error) {
      // Se falhar, apenas loga mas não interrompe envio
      console.warn('⚠️  Não foi possível simular digitação');
    }
  }

  /**
   * Gera delay aleatório entre mensagens (humanizado)
   */
  private getRandomDelay(): number {
    return Math.floor(
      Math.random() * (this.MAX_DELAY_MS - this.MIN_DELAY_MS) + this.MIN_DELAY_MS
    );
  }

  /**
   * Verifica se está no horário de funcionamento
   */
  private isWorkingHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    return hour >= this.WORK_START_HOUR && hour < this.WORK_END_HOUR;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retorna informações de status
   */
  getStatus() {
    return {
      isReady: this.isReady,
      qrCode: this.qrCode,
      queueLength: this.messageQueue.length,
      messagesSentLastHour: this.messagesSentLastHour,
      maxMessagesPerHour: this.MAX_MESSAGES_PER_HOUR,
      isWorkingHours: this.isWorkingHours(),
      lastMessageTime: this.lastMessageTime
    };
  }

  /**
   * Retorna QR Code atual
   */
  getQRCode(): string {
    return this.qrCode;
  }

  /**
   * Verifica se está pronto
   */
  ready(): boolean {
    return this.isReady;
  }

  /**
   * Desconecta cliente
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      console.log('🔌 WhatsApp desconectado');
    }
  }

  /**
   * Formata número de telefone brasileiro
   */
  static formatPhoneNumber(phone: string): string {
    // Remove caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');

    // Adiciona código do país se não tiver
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }

    // Remove 9 extra se tiver (alguns números vem com 9 duplicado)
    if (cleaned.length === 14 && cleaned[4] === '9') {
      // Mantém apenas um 9
    }

    return cleaned + '@c.us';
  }
}

// Exporta instância singleton
export const whatsappService = new WhatsAppService();
