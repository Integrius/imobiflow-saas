/**
 * Serviço de integração com Twilio
 *
 * Envia mensagens WhatsApp para corretores
 */

import twilio from 'twilio';

export interface WhatsAppMessage {
  to: string; // Número com código do país (ex: +5511999999999)
  message: string;
}

class TwilioService {
  private client: any;
  private fromNumber: string;
  private isConfigured: boolean = false;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Sandbox padrão

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
      this.isConfigured = true;
      console.log('✅ Twilio configurado com sucesso');
    } else {
      console.warn('⚠️  Twilio não configurado - WhatsApp desabilitado');
      console.warn('Configure TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN nas variáveis de ambiente');
    }
  }

  /**
   * Verifica se o serviço está configurado
   */
  isEnabled(): boolean {
    return this.isConfigured;
  }

  /**
   * Envia mensagem WhatsApp
   *
   * @param data Dados da mensagem
   * @returns Promise<boolean> - true se enviado com sucesso
   */
  async sendWhatsApp(data: WhatsAppMessage): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('Twilio não configurado - mensagem WhatsApp não enviada');
      return false;
    }

    try {
      // Garantir que número tenha prefixo whatsapp:
      const toNumber = data.to.startsWith('whatsapp:')
        ? data.to
        : `whatsapp:${data.to}`;

      const message = await this.client.messages.create({
        body: data.message,
        from: this.fromNumber,
        to: toNumber
      });

      console.log(`✅ WhatsApp enviado para ${data.to} (SID: ${message.sid})`);
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao enviar WhatsApp:', error.message);
      throw new Error(`Erro ao enviar WhatsApp: ${error.message}`);
    }
  }

  /**
   * Envia senha temporária de primeiro acesso via WhatsApp
   *
   * @param data Dados do corretor e senha
   * @returns Promise<boolean>
   */
  async enviarSenhaTemporaria(data: {
    telefone: string; // +5511999999999
    nome: string;
    email: string;
    senhaTemporaria: string;
    tenantUrl: string; // vivoly.integrius.com.br
    nomeTenant: string;
  }): Promise<boolean> {
    const primeiroNome = data.nome.split(' ')[0];

    const message = `🏡 *ImobiFlow - ${data.nomeTenant}*

Olá, ${primeiroNome}! 👋

Você foi cadastrado no sistema ImobiFlow. Aqui estão suas credenciais de acesso:

📧 *Email:* ${data.email}
🔐 *Senha temporária:* ${data.senhaTemporaria}

⏰ *IMPORTANTE:* Esta senha expira em 12 horas!

🌐 *Acesse:* https://${data.tenantUrl}/login

📝 *Primeiro acesso:*
1. Faça login com email e senha acima
2. Você será redirecionado para definir sua nova senha
3. Escolha uma senha segura e pessoal

Qualquer dúvida, entre em contato com o administrador.

---
ImobiFlow - Gestão Imobiliária Inteligente`.trim();

    return this.sendWhatsApp({
      to: data.telefone,
      message
    });
  }
}

// Singleton
export const twilioService = new TwilioService();
