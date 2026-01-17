import { prisma } from '../../shared/database/prisma'
import { twilioWhatsAppService, IncomingMessage } from '../../shared/services/twilio-whatsapp.service'
import { telegramService } from '../../shared/services/telegram.service'
import { ClaudeService } from '../../ai/services/claude.service'

interface ProcessMessageResult {
  success: boolean
  isNewLead: boolean
  leadId?: string
  response?: string
  error?: string
}

interface WhatsAppConfigData {
  twilio_account_sid?: string
  twilio_auth_token?: string
  twilio_phone_number?: string
  auto_response_enabled?: boolean
  welcome_message?: string
  business_hours_start?: string
  business_hours_end?: string
  out_of_hours_message?: string
  auto_assign_corretor?: boolean
  default_corretor_id?: string
  is_active?: boolean
}

class WhatsAppService {
  /**
   * Processa mensagem recebida do webhook
   */
  async processIncomingMessage(
    message: IncomingMessage,
    tenantId: string
  ): Promise<ProcessMessageResult> {
    try {
      // Extrair número de telefone
      const phoneNumber = twilioWhatsAppService.extractPhoneNumber(message.From)
      const profileName = message.ProfileName || 'Contato WhatsApp'

      console.log(`📩 WhatsApp recebido de ${phoneNumber} (${profileName}): ${message.Body.substring(0, 50)}...`)

      // Buscar configuração do WhatsApp do tenant
      const config = await prisma.whatsAppConfig.findUnique({
        where: { tenant_id: tenantId }
      })

      if (!config || !config.is_active) {
        console.log(`⚠️ WhatsApp não configurado ou inativo para tenant ${tenantId}`)
        return { success: false, isNewLead: false, error: 'WhatsApp não configurado' }
      }

      // Buscar lead existente pelo telefone
      let lead = await prisma.lead.findFirst({
        where: {
          tenant_id: tenantId,
          telefone: {
            contains: phoneNumber.slice(-9) // Últimos 9 dígitos para matching
          }
        },
        include: {
          corretor: {
            include: {
              user: { select: { nome: true } }
            }
          }
        }
      })

      let isNewLead = false

      // Se não encontrou lead, criar novo
      if (!lead) {
        isNewLead = true
        lead = await this.createLeadFromWhatsApp(
          tenantId,
          phoneNumber,
          profileName,
          config.default_corretor_id || undefined,
          message.Body
        )

        console.log(`✅ Novo lead criado via WhatsApp: ${lead.id}`)

        // Notificar corretor via Telegram (se atribuído)
        if (lead.corretor_id) {
          await this.notifyBrokerViaTelegram(lead, phoneNumber)
        }
      }

      // Salvar mensagem recebida
      await prisma.message.create({
        data: {
          tenant_id: tenantId,
          lead_id: lead.id,
          content: message.Body,
          is_from_lead: true,
          platform: 'WHATSAPP',
          status: 'DELIVERED',
          external_id: message.MessageSid,
          external_from: message.From,
          external_to: message.To,
          media_url: message.MediaUrl0 || null,
          media_type: message.MediaContentType0 || null,
          profile_name: profileName
        }
      })

      // Atualizar last_message_at na config
      await prisma.whatsAppConfig.update({
        where: { tenant_id: tenantId },
        data: { last_message_at: new Date() }
      })

      // Gerar resposta automática se habilitado
      let responseText: string | undefined

      if (config.auto_response_enabled) {
        // Verificar horário comercial
        if (this.isOutsideBusinessHours(config.business_hours_start, config.business_hours_end)) {
          responseText = config.out_of_hours_message ||
            'Olá! Estamos fora do horário comercial. Retornaremos seu contato assim que possível. 😊'
        } else if (isNewLead) {
          // Mensagem de boas-vindas para novo lead
          const tenantInfo = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { nome: true }
          })

          responseText = config.welcome_message ||
            `Olá ${profileName}! 👋\n\nSou a *Sofia*, assistente virtual da *${tenantInfo?.nome || 'nossa imobiliária'}*.\n\nRecebi sua mensagem e vou te ajudar a encontrar o imóvel ideal! 🏠\n\nPara começar, me conte:\n1️⃣ Você está procurando para *comprar* ou *alugar*?\n2️⃣ Qual região você prefere?\n3️⃣ Qual seu orçamento aproximado?\n\nEstou aqui para ajudar! 💚`
        } else {
          // Resposta da IA Sofia para leads existentes
          responseText = await this.generateSofiaResponse(lead.id, message.Body, tenantId)
        }

        // Enviar resposta
        if (responseText) {
          await this.sendAndSaveMessage(tenantId, lead.id, phoneNumber, responseText, message.To)
        }
      }

      return {
        success: true,
        isNewLead,
        leadId: lead.id,
        response: responseText
      }
    } catch (error: any) {
      console.error('❌ Erro ao processar mensagem WhatsApp:', error)
      return {
        success: false,
        isNewLead: false,
        error: error.message
      }
    }
  }

  /**
   * Cria novo lead a partir de mensagem WhatsApp
   */
  private async createLeadFromWhatsApp(
    tenantId: string,
    phone: string,
    name: string,
    corretorId?: string,
    firstMessage?: string
  ) {
    // Formatar telefone para exibição
    const formattedPhone = twilioWhatsAppService.formatPhoneForDisplay(phone)

    const lead = await prisma.lead.create({
      data: {
        tenant_id: tenantId,
        nome: name,
        telefone: formattedPhone,
        origem: 'WHATSAPP',
        temperatura: 'MORNO',
        score: 50,
        ai_enabled: true,
        corretor_id: corretorId,
        observacoes: firstMessage ? `Primeira mensagem: "${firstMessage.substring(0, 200)}${firstMessage.length > 200 ? '...' : ''}"` : undefined
      },
      include: {
        corretor: {
          include: {
            user: { select: { nome: true } }
          }
        }
      }
    })

    // Qualificação será feita posteriormente pelo sistema existente

    return lead
  }

  /**
   * Notifica corretor via Telegram sobre novo lead
   */
  private async notifyBrokerViaTelegram(lead: any, phone: string) {
    try {
      // Buscar corretor com telegram_chat_id
      const corretor = await prisma.corretor.findUnique({
        where: { id: lead.corretor_id },
        include: {
          user: { select: { nome: true } }
        }
      })

      if (corretor?.telegram_chat_id) {
        const message = `🎯 *NOVO LEAD VIA WHATSAPP*

👤 *Cliente:* ${lead.nome}
📱 *WhatsApp:* ${lead.telefone}

📝 *Observações:*
${lead.observacoes || 'Nenhuma observação'}

━━━━━━━━━━━━━━━━━━━━

✅ Atribuído para: ${corretor.user.nome}
🆔 ID do Lead: ${lead.id}
⏰ Entre em contato o quanto antes!`

        await telegramService.sendMessage(corretor.telegram_chat_id, message)
      }
    } catch (error) {
      console.warn('⚠️ Não foi possível notificar corretor via Telegram:', error)
    }
  }

  /**
   * Gera resposta da IA Sofia
   */
  private async generateSofiaResponse(
    leadId: string,
    userMessage: string,
    tenantId: string
  ): Promise<string> {
    try {
      // Buscar histórico de mensagens
      const messages = await prisma.message.findMany({
        where: {
          lead_id: leadId,
          platform: 'WHATSAPP'
        },
        orderBy: { created_at: 'desc' },
        take: 10
      })

      // Buscar dados do lead
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
          tenant: { select: { nome: true } }
        }
      })

      if (!lead) {
        return 'Desculpe, ocorreu um erro. Por favor, tente novamente.'
      }

      // Montar contexto para a IA
      const context = {
        leadName: lead.nome,
        tenantName: lead.tenant.nome,
        messageHistory: messages.reverse().map(m => ({
          role: m.is_from_lead ? 'user' : 'assistant',
          content: m.content
        })),
        leadPreferences: {
          tipo_negocio: lead.tipo_negocio,
          tipo_imovel: lead.tipo_imovel_desejado,
          valor_min: lead.valor_minimo,
          valor_max: lead.valor_maximo,
          estado: lead.estado,
          municipio: lead.municipio,
          bairro: lead.bairro
        }
      }

      // Gerar resposta com Claude
      const claudeService = new ClaudeService()

      const prompt = `Nova mensagem do cliente: ${userMessage}

Responda de forma amigável, profissional e útil. Use emojis moderadamente. Tente entender as necessidades do cliente e ofereça ajuda. Se o cliente mencionar preferências específicas, agradeça e confirme o entendimento.`

      const contextStr = `Você é a Sofia, assistente virtual da imobiliária ${context.tenantName}. Você ajuda leads a encontrar imóveis.

Contexto do lead:
- Nome: ${context.leadName}
- Preferências: ${JSON.stringify(context.leadPreferences)}

Histórico da conversa:
${context.messageHistory.map(m => `${m.role === 'user' ? 'Cliente' : 'Sofia'}: ${m.content}`).join('\n')}`

      const response = await claudeService.generateResponse(prompt, contextStr, { maxTokens: 500 })

      return response || 'Entendi! Vou verificar as opções disponíveis para você. 😊'
    } catch (error) {
      console.error('❌ Erro ao gerar resposta da Sofia:', error)
      return 'Obrigado pela mensagem! Um de nossos corretores entrará em contato em breve. 😊'
    }
  }

  /**
   * Envia e salva mensagem
   */
  async sendAndSaveMessage(
    tenantId: string,
    leadId: string,
    toPhone: string,
    content: string,
    fromNumber?: string
  ) {
    try {
      // Buscar config para inicializar Twilio se necessário
      const config = await prisma.whatsAppConfig.findUnique({
        where: { tenant_id: tenantId }
      })

      if (config?.twilio_account_sid && config?.twilio_auth_token && config?.twilio_phone_number) {
        twilioWhatsAppService.initialize({
          accountSid: config.twilio_account_sid,
          authToken: config.twilio_auth_token,
          whatsappNumber: config.twilio_phone_number
        })
      }

      // Enviar mensagem
      const result = await twilioWhatsAppService.sendMessage({
        to: toPhone,
        body: content
      })

      // Salvar mensagem enviada
      await prisma.message.create({
        data: {
          tenant_id: tenantId,
          lead_id: leadId,
          content,
          is_from_lead: false,
          platform: 'WHATSAPP',
          status: result.success ? 'SENT' : 'FAILED',
          external_id: result.messageSid,
          external_from: fromNumber,
          external_to: twilioWhatsAppService.formatWhatsAppNumber(toPhone)
        }
      })

      return result
    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Verifica se está fora do horário comercial
   */
  private isOutsideBusinessHours(start?: string | null, end?: string | null): boolean {
    if (!start || !end) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)

    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    return currentTime < startTime || currentTime > endTime
  }

  /**
   * Buscar configuração do WhatsApp do tenant
   */
  async getConfig(tenantId: string) {
    const config = await prisma.whatsAppConfig.findUnique({
      where: { tenant_id: tenantId },
      include: {
        tenant: { select: { nome: true } }
      }
    })

    if (!config) {
      return null
    }

    // Não retornar auth_token completo por segurança
    return {
      ...config,
      twilio_auth_token: config.twilio_auth_token ? '***configurado***' : null
    }
  }

  /**
   * Criar ou atualizar configuração do WhatsApp
   */
  async upsertConfig(tenantId: string, data: WhatsAppConfigData) {
    const existing = await prisma.whatsAppConfig.findUnique({
      where: { tenant_id: tenantId }
    })

    if (existing) {
      return prisma.whatsAppConfig.update({
        where: { tenant_id: tenantId },
        data: {
          ...data,
          // Só atualiza auth_token se fornecido e não for o placeholder
          twilio_auth_token: data.twilio_auth_token && data.twilio_auth_token !== '***configurado***'
            ? data.twilio_auth_token
            : existing.twilio_auth_token
        }
      })
    }

    return prisma.whatsAppConfig.create({
      data: {
        tenant_id: tenantId,
        ...data
      }
    })
  }

  /**
   * Buscar histórico de mensagens de um lead
   */
  async getMessageHistory(leadId: string, tenantId: string, limit: number = 50) {
    return prisma.message.findMany({
      where: {
        lead_id: leadId,
        tenant_id: tenantId,
        platform: 'WHATSAPP'
      },
      orderBy: { created_at: 'desc' },
      take: limit
    })
  }

  /**
   * Testar conexão com Twilio
   */
  async testConnection(tenantId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const config = await prisma.whatsAppConfig.findUnique({
        where: { tenant_id: tenantId }
      })

      if (!config?.twilio_account_sid || !config?.twilio_auth_token) {
        return { success: false, error: 'Credenciais Twilio não configuradas' }
      }

      // Tentar inicializar e verificar conta
      twilioWhatsAppService.initialize({
        accountSid: config.twilio_account_sid,
        authToken: config.twilio_auth_token,
        whatsappNumber: config.twilio_phone_number || ''
      })

      // Se inicializar sem erro, conexão OK
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

export const whatsAppService = new WhatsAppService()
