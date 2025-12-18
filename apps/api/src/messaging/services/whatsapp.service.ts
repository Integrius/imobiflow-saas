import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

export class WhatsAppService {
  private client: Client;
  private isReady = false;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: './whatsapp-sessions'
      }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // QR Code para autenticação
    this.client.on('qr', (qr) => {
      console.log('📱 Escaneie o QR Code com seu WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    // Cliente autenticado
    this.client.on('authenticated', () => {
      console.log('✅ WhatsApp autenticado!');
    });

    // Cliente pronto
    this.client.on('ready', () => {
      this.isReady = true;
      console.log('🚀 WhatsApp está pronto!');
    });

    // Erros
    this.client.on('auth_failure', (error) => {
      console.error('❌ Falha na autenticação:', error);
    });

    this.client.on('disconnected', (reason) => {
      console.log('⚠️ WhatsApp desconectado:', reason);
      this.isReady = false;
    });
  }

  async initialize() {
    console.log('🔄 Inicializando WhatsApp...');
    await this.client.initialize();
  }

  onMessage(callback: (message: Message) => void) {
    this.client.on('message', async (message) => {
      // Ignora mensagens de grupos e mensagens próprias
      if (message.from.includes('@g.us') || message.fromMe) {
        return;
      }

      console.log(`📩 Nova mensagem de ${message.from}:`, message.body);
      callback(message);
    });
  }

  async sendMessage(to: string, text: string): Promise<void> {
    if (!this.isReady) {
      throw new Error('WhatsApp não está pronto');
    }

    try {
      // Formata número se necessário
      const chatId = to.includes('@c.us') ? to : `${to}@c.us`;
      await this.client.sendMessage(chatId, text);
      console.log(`✅ Mensagem enviada para ${to}`);
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  async sendMessageWithTyping(to: string, text: string): Promise<void> {
    const chatId = to.includes('@c.us') ? to : `${to}@c.us`;
    const chat = await this.client.getChatById(chatId);

    // Simula digitação
    await chat.sendStateTyping();

    // Delay proporcional ao tamanho da mensagem (mais humano)
    const typingTime = Math.min(text.length * 50, 3000);
    await new Promise(resolve => setTimeout(resolve, typingTime));

    await this.sendMessage(to, text);
  }

  isClientReady(): boolean {
    return this.isReady;
  }

  async getContact(number: string) {
    const contactId = number.includes('@c.us') ? number : `${number}@c.us`;
    return await this.client.getContactById(contactId);
  }

  async destroy() {
    await this.client.destroy();
  }
}
