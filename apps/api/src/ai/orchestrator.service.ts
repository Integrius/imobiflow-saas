import { PrismaClient } from '@prisma/client';
import { WhatsAppService } from '../messaging/services/whatsapp.service';
import { TelegramService } from '../messaging/services/telegram.service';
import { MessageProcessorService } from './services/message-processor.service';

const prisma = new PrismaClient();

export class AIOrchestrator {
  private whatsapp: WhatsAppService;
  private telegram: TelegramService;
  private messageProcessor: MessageProcessorService;
  private isInitialized = false;

  constructor() {
    this.whatsapp = new WhatsAppService();
    this.telegram = new TelegramService();
    this.messageProcessor = new MessageProcessorService();
  }

  /**
   * Inicializa todos os serviços
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ AIOrchestrator já está inicializado');
      return;
    }

    console.log('🚀 Inicializando AI Orchestrator...\n');

    try {
      // 1. Inicializa WhatsApp
      console.log('📱 Inicializando WhatsApp...');
      await this.whatsapp.initialize();

      // 2. Configura handlers de mensagens
      this.setupMessageHandlers();

      this.isInitialized = true;
      console.log('\n✅ AI Orchestrator inicializado com sucesso!');
      console.log('🤖 Sofia está pronta para atender!\n');

    } catch (error: any) {
      console.error('❌ Erro ao inicializar AI Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Configura handlers para mensagens recebidas
   */
  private setupMessageHandlers(): void {
    this.whatsapp.onMessage(async (message) => {
      try {
        const phone = message.from.replace('@c.us', '');
        console.log(`\n📩 Nova mensagem de ${phone}: "${message.body}"`);

        // 1. Busca ou cria lead
        const lead = await this.findOrCreateLead(phone, message);

        // 2. Processa mensagem com IA
        const result = await this.messageProcessor.processMessage(
          lead.id,
          message.body
        );

        console.log('📊 Score atualizado:', result.scoreUpdate);
        console.log('🎯 Urgência:', result.analysis.urgency);
        console.log('💡 Intenção:', result.analysis.intent);

        // 3. Envia resposta com efeito de digitação
        await this.whatsapp.sendMessageWithTyping(message.from, result.response);

        // 4. Notifica corretor se necessário
        if (result.shouldNotifyBroker) {
          await this.notifyBroker(lead, result);
        }

        console.log('✅ Mensagem processada com sucesso!\n');

      } catch (error: any) {
        console.error('❌ Erro ao processar mensagem:', error);

        // Envia mensagem de erro amigável para o lead
        try {
          await this.whatsapp.sendMessage(
            message.from,
            'Desculpe, tive um problema técnico. Vou conectar você com um corretor agora. Um momento! 😊'
          );
        } catch (sendError) {
          console.error('❌ Erro ao enviar mensagem de erro:', sendError);
        }
      }
    });
  }

  /**
   * Busca lead existente ou cria novo
   */
  private async findOrCreateLead(phone: string, message: any): Promise<any> {
    // Busca lead existente
    let lead = await prisma.lead.findUnique({
      where: { phone }
    });

    // Se não existe, cria novo lead
    if (!lead) {
      console.log('👤 Criando novo lead...');

      // Tenta obter nome do contato
      const contact = await this.whatsapp.getContact(message.from);
      const name = contact.name || contact.pushname || phone;

      lead = await prisma.lead.create({
        data: {
          name,
          phone,
          source: 'whatsapp',
          status: 'new',
          score: 50, // Score inicial
          urgency: 'média',
          sentiment: 'neutro'
        }
      });

      console.log(`✅ Lead criado: ${lead.name} (${lead.phone})`);
    } else {
      console.log(`✅ Lead existente: ${lead.name} (${lead.phone})`);
    }

    return lead;
  }

  /**
   * Notifica corretor sobre lead importante
   */
  private async notifyBroker(lead: any, result: any): Promise<void> {
    try {
      console.log('📢 Notificando corretor...');

      // Busca corretor responsável (por enquanto, pega o primeiro)
      const broker = await prisma.user.findFirst({
        where: { role: 'broker' }
      });

      if (!broker) {
        console.warn('⚠️ Nenhum corretor encontrado no sistema');
        return;
      }

      // Monta dados para notificação
      const notificationData = {
        name: lead.name,
        phone: lead.phone,
        message: result.analysis.intent === 'agendamento'
          ? 'Lead quer agendar visita!'
          : lead.messages?.[lead.messages.length - 1]?.content || 'Nova mensagem',
        score: result.scoreUpdate,
        urgency: result.analysis.urgency
      };

      // Envia notificação via Telegram
      await this.telegram.notifyNewLead(broker.id, notificationData);

      console.log('✅ Corretor notificado!');

    } catch (error) {
      console.error('❌ Erro ao notificar corretor:', error);
    }
  }

  /**
   * Envia mensagem proativa para um lead (follow-up)
   */
  async sendProactiveMessage(
    leadId: string,
    message: string
  ): Promise<void> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} não encontrado`);
    }

    await this.whatsapp.sendMessageWithTyping(
      `${lead.phone}@c.us`,
      message
    );

    // Salva mensagem no banco
    await prisma.message.create({
      data: {
        leadId,
        content: message,
        isFromLead: false,
        status: 'sent'
      }
    });

    console.log(`✅ Mensagem proativa enviada para ${lead.name}`);
  }

  /**
   * Retorna estatísticas gerais do sistema
   */
  async getSystemStats() {
    const [
      totalLeads,
      activeLeads,
      totalMessages,
      hotLeads
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({
        where: {
          lastContactAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
          }
        }
      }),
      prisma.message.count(),
      prisma.lead.count({
        where: {
          score: { gte: 80 }
        }
      })
    ]);

    const aiStats = this.messageProcessor.getStats();

    return {
      leads: {
        total: totalLeads,
        active: activeLeads,
        hot: hotLeads
      },
      messages: {
        total: totalMessages
      },
      ai: {
        requests: aiStats.requestCount,
        cost: aiStats.dailyCost
      },
      whatsapp: {
        ready: this.whatsapp.isClientReady()
      }
    };
  }

  /**
   * Para o orquestrador
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Desligando AI Orchestrator...');
    await this.whatsapp.destroy();
    await prisma.$disconnect();
    console.log('✅ AI Orchestrator desligado');
  }

  /**
   * Verifica se está pronto
   */
  isReady(): boolean {
    return this.isInitialized && this.whatsapp.isClientReady();
  }
}
