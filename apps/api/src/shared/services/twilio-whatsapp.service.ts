import Twilio from 'twilio'

interface TwilioConfig {
  accountSid: string
  authToken: string
  whatsappNumber: string // formato: whatsapp:+5511999999999
}

interface SendMessageParams {
  to: string // número do destinatário (formato: +5511999999999)
  body: string
  mediaUrl?: string // URL de mídia (imagem, documento)
}

interface IncomingMessage {
  From: string // whatsapp:+5511999999999
  To: string // whatsapp:+5511888888888
  Body: string
  MessageSid: string
  AccountSid: string
  NumMedia?: string
  MediaContentType0?: string
  MediaUrl0?: string
  ProfileName?: string // Nome do perfil do WhatsApp
  WaId?: string // WhatsApp ID (número sem formatação)
}

interface MessageResponse {
  success: boolean
  messageSid?: string
  error?: string
}

class TwilioWhatsAppService {
  private client: Twilio.Twilio | null = null
  private config: TwilioConfig | null = null

  /**
   * Inicializa o cliente Twilio com as credenciais
   */
  initialize(config: TwilioConfig) {
    this.config = config
    this.client = Twilio(config.accountSid, config.authToken)
    console.log('✅ Twilio WhatsApp Service inicializado')
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return this.client !== null && this.config !== null
  }

  /**
   * Configura o serviço com variáveis de ambiente
   */
  initializeFromEnv() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER

    if (!accountSid || !authToken || !whatsappNumber) {
      console.warn('⚠️ Twilio WhatsApp: Variáveis de ambiente não configuradas')
      return false
    }

    this.initialize({
      accountSid,
      authToken,
      whatsappNumber: whatsappNumber.startsWith('whatsapp:')
        ? whatsappNumber
        : `whatsapp:${whatsappNumber}`
    })

    return true
  }

  /**
   * Formata número para o padrão WhatsApp do Twilio
   */
  formatWhatsAppNumber(phone: string): string {
    // Remove caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '')

    // Adiciona código do país se não tiver
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned
    }

    // Adiciona o prefixo whatsapp:
    return `whatsapp:+${cleaned}`
  }

  /**
   * Extrai número de telefone do formato WhatsApp
   */
  extractPhoneNumber(whatsappNumber: string): string {
    // Remove "whatsapp:+" e retorna apenas os números
    return whatsappNumber.replace('whatsapp:+', '').replace('whatsapp:', '')
  }

  /**
   * Formata número para exibição brasileira
   */
  formatPhoneForDisplay(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')

    if (cleaned.length === 13) {
      // 55 + DDD + 9 dígitos
      return `(${cleaned.slice(2, 4)}) ${cleaned.slice(4, 5)} ${cleaned.slice(5, 9)}-${cleaned.slice(9)}`
    } else if (cleaned.length === 12) {
      // 55 + DDD + 8 dígitos
      return `(${cleaned.slice(2, 4)}) ${cleaned.slice(4, 8)}-${cleaned.slice(8)}`
    } else if (cleaned.length === 11) {
      // DDD + 9 dígitos
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
    } else if (cleaned.length === 10) {
      // DDD + 8 dígitos
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }

    return phone
  }

  /**
   * Envia mensagem de WhatsApp
   */
  async sendMessage(params: SendMessageParams): Promise<MessageResponse> {
    if (!this.client || !this.config) {
      return { success: false, error: 'Twilio não configurado' }
    }

    try {
      const toNumber = this.formatWhatsAppNumber(params.to)

      const messageOptions: any = {
        from: this.config.whatsappNumber,
        to: toNumber,
        body: params.body
      }

      // Adiciona mídia se fornecida
      if (params.mediaUrl) {
        messageOptions.mediaUrl = [params.mediaUrl]
      }

      const message = await this.client.messages.create(messageOptions)

      console.log(`📤 WhatsApp enviado para ${toNumber}: ${message.sid}`)

      return {
        success: true,
        messageSid: message.sid
      }
    } catch (error: any) {
      console.error('❌ Erro ao enviar WhatsApp:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Envia mensagem de boas-vindas para novo lead
   */
  async sendWelcomeMessage(phone: string, leadName: string, tenantName: string): Promise<MessageResponse> {
    const message = `Olá ${leadName}! 👋

Sou a *Sofia*, assistente virtual da *${tenantName}*.

Recebi sua mensagem e vou te ajudar a encontrar o imóvel ideal! 🏠

Para começar, me conte:
1️⃣ Você está procurando para *comprar* ou *alugar*?
2️⃣ Qual região você prefere?
3️⃣ Qual seu orçamento aproximado?

Estou aqui para ajudar! 💚`

    return this.sendMessage({ to: phone, body: message })
  }

  /**
   * Envia notificação para corretor sobre novo lead
   */
  async notifyBrokerNewLead(
    brokerPhone: string,
    leadName: string,
    leadPhone: string,
    source: string = 'WhatsApp'
  ): Promise<MessageResponse> {
    const message = `🎯 *NOVO LEAD VIA ${source.toUpperCase()}*

👤 *Cliente:* ${leadName}
📱 *WhatsApp:* ${this.formatPhoneForDisplay(leadPhone)}

⚡ Entre em contato o mais rápido possível!

_Lead capturado automaticamente pelo ImobiFlow_`

    return this.sendMessage({ to: brokerPhone, body: message })
  }

  /**
   * Envia resposta automática da IA Sofia
   */
  async sendSofiaResponse(phone: string, response: string): Promise<MessageResponse> {
    return this.sendMessage({ to: phone, body: response })
  }

  /**
   * Processa mensagem recebida do webhook
   */
  parseIncomingMessage(body: any): IncomingMessage {
    return {
      From: body.From || '',
      To: body.To || '',
      Body: body.Body || '',
      MessageSid: body.MessageSid || '',
      AccountSid: body.AccountSid || '',
      NumMedia: body.NumMedia,
      MediaContentType0: body.MediaContentType0,
      MediaUrl0: body.MediaUrl0,
      ProfileName: body.ProfileName,
      WaId: body.WaId
    }
  }

  /**
   * Valida assinatura do webhook do Twilio
   */
  validateWebhookSignature(
    signature: string,
    url: string,
    params: Record<string, string>
  ): boolean {
    if (!this.config) return false

    const twilio = require('twilio')
    return twilio.validateRequest(
      this.config.authToken,
      signature,
      url,
      params
    )
  }

  /**
   * Gera resposta TwiML vazia (para confirmar recebimento)
   */
  generateEmptyTwiML(): string {
    return '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
  }

  /**
   * Gera resposta TwiML com mensagem
   */
  generateMessageTwiML(message: string): string {
    // Escapa caracteres especiais XML
    const escaped = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')

    return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`
  }
}

// Exporta instância singleton
export const twilioWhatsAppService = new TwilioWhatsAppService()

// Exporta tipos
export type { TwilioConfig, SendMessageParams, IncomingMessage, MessageResponse }
