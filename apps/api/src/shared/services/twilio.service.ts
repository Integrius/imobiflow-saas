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

    console.log('🔍 Twilio - Verificando configuração...');
    console.log(`   TWILIO_ACCOUNT_SID presente: ${accountSid ? 'SIM' : 'NÃO'}`);
    console.log(`   TWILIO_AUTH_TOKEN presente: ${authToken ? 'SIM' : 'NÃO'}`);
    console.log(`   TWILIO_WHATSAPP_FROM: ${this.fromNumber}`);

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
      // Normalizar número de telefone
      let phoneNumber = data.to;

      // Remover whatsapp: se já tiver
      phoneNumber = phoneNumber.replace('whatsapp:', '');

      // Remover caracteres não numéricos
      phoneNumber = phoneNumber.replace(/\D/g, '');

      // Adicionar +55 se não tiver código do país
      if (!phoneNumber.startsWith('55') && phoneNumber.length === 11) {
        phoneNumber = `55${phoneNumber}`;
      }

      // Adicionar prefixo whatsapp:
      const toNumber = `whatsapp:+${phoneNumber}`;

      console.log(`📱 Twilio: Número normalizado de "${data.to}" para "${toNumber}"`);

      const message = await this.client.messages.create({
        body: data.message,
        from: this.fromNumber,
        to: toNumber
      });

      console.log(`✅ WhatsApp enviado para ${toNumber} (SID: ${message.sid})`);
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

    const message = `🏡 *Integrius - ${data.nomeTenant}*

Olá, ${primeiroNome}! 👋

Você foi cadastrado no sistema Integrius. Aqui estão suas credenciais de acesso:

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
Integrius - Gestão Imobiliária Inteligente`.trim();

    return this.sendWhatsApp({
      to: data.telefone,
      message
    });
  }

  /**
   * Envia sugestões de imóveis personalizadas via WhatsApp
   *
   * @param data Dados das sugestões
   * @returns Promise<boolean>
   */
  async enviarSugestoesImoveis(data: {
    telefone: string;
    nome: string;
    sugestoes: Array<{
      titulo: string;
      preco: number;
      endereco: string;
      quartos?: number;
      url: string;
    }>;
    mensagemPersonalizada: string;
    tenantNome: string;
  }): Promise<boolean> {
    const primeiroNome = data.nome.split(' ')[0];

    // Formatar lista de imóveis
    const imoveisTexto = data.sugestoes.map((imovel, index) => {
      const preco = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(imovel.preco);

      let texto = `\n*${index + 1}. ${imovel.titulo}*`;
      texto += `\n   💰 ${preco}`;
      texto += `\n   📍 ${imovel.endereco}`;
      if (imovel.quartos) texto += `\n   🛏️ ${imovel.quartos} quartos`;
      texto += `\n   🔗 ${imovel.url}`;

      return texto;
    }).join('\n');

    const message = `🏡 *${data.tenantNome}*

Olá, ${primeiroNome}! 👋

🎉 *Encontramos imóveis perfeitos para você!*

${data.mensagemPersonalizada}

📋 *Suas sugestões:*
${imoveisTexto}

---

💬 Gostou de algum? Responda esta mensagem ou acesse os links para mais detalhes!

Um de nossos corretores entrará em contato em breve.

_Powered by ImobiFlow + IA Sofia_`.trim();

    return this.sendWhatsApp({
      to: data.telefone,
      message
    });
  }
}

// Singleton
export const twilioService = new TwilioService();
