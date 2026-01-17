import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { whatsAppService } from './whatsapp.service'
import { twilioWhatsAppService } from '../../shared/services/twilio-whatsapp.service'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { requireManager } from '../../shared/middlewares/permissions.middleware'
import { prisma } from '../../shared/database/prisma'

const configSchema = z.object({
  twilio_account_sid: z.string().optional(),
  twilio_auth_token: z.string().optional(),
  twilio_phone_number: z.string().optional(),
  auto_response_enabled: z.boolean().optional(),
  welcome_message: z.string().nullish().transform(v => v ?? undefined),
  business_hours_start: z.string().nullish().transform(v => v ?? undefined),
  business_hours_end: z.string().nullish().transform(v => v ?? undefined),
  out_of_hours_message: z.string().nullish().transform(v => v ?? undefined),
  auto_assign_corretor: z.boolean().optional(),
  default_corretor_id: z.string().uuid().nullish().transform(v => v ?? undefined),
  is_active: z.boolean().optional()
})

const sendMessageSchema = z.object({
  lead_id: z.string().uuid(),
  message: z.string().min(1)
})

export async function whatsAppRoutes(server: FastifyInstance) {
  /**
   * POST /api/v1/whatsapp/webhook
   * Webhook público para receber mensagens do Twilio
   * NÃO requer autenticação (chamado pelo Twilio)
   */
  server.post(
    '/webhook',
    async (request, reply) => {
      try {
        const body = request.body as Record<string, any>

        console.log('📨 Webhook Twilio recebido:', JSON.stringify(body, null, 2))

        // Parse da mensagem
        const message = twilioWhatsAppService.parseIncomingMessage(body)

        if (!message.From || !message.Body) {
          console.warn('⚠️ Mensagem inválida recebida')
          return reply
            .header('Content-Type', 'text/xml')
            .send(twilioWhatsAppService.generateEmptyTwiML())
        }

        // Identificar tenant pelo número de destino (To)
        // O número de destino deve estar configurado em algum tenant
        const config = await prisma.whatsAppConfig.findFirst({
          where: {
            twilio_phone_number: {
              contains: message.To.replace('whatsapp:', '').replace('+', '')
            },
            is_active: true
          }
        })

        if (!config) {
          console.warn(`⚠️ Nenhum tenant encontrado para o número ${message.To}`)
          return reply
            .header('Content-Type', 'text/xml')
            .send(twilioWhatsAppService.generateEmptyTwiML())
        }

        // Processar mensagem
        const result = await whatsAppService.processIncomingMessage(message, config.tenant_id)

        console.log(`✅ Mensagem processada: ${JSON.stringify(result)}`)

        // Responder com TwiML vazio (resposta será enviada via API)
        return reply
          .header('Content-Type', 'text/xml')
          .send(twilioWhatsAppService.generateEmptyTwiML())
      } catch (error: any) {
        console.error('❌ Erro no webhook WhatsApp:', error)

        // Sempre retornar TwiML válido mesmo em erro
        return reply
          .header('Content-Type', 'text/xml')
          .send(twilioWhatsAppService.generateEmptyTwiML())
      }
    }
  )

  /**
   * POST /api/v1/whatsapp/webhook/status
   * Webhook para status de entrega de mensagens
   */
  server.post(
    '/webhook/status',
    async (request, reply) => {
      try {
        const body = request.body as Record<string, any>

        console.log('📊 Status update recebido:', JSON.stringify(body, null, 2))

        const messageSid = body.MessageSid
        const status = body.MessageStatus // queued, sent, delivered, read, failed

        if (messageSid && status) {
          // Atualizar status da mensagem
          const message = await prisma.message.findFirst({
            where: { external_id: messageSid }
          })

          if (message) {
            switch (status) {
              case 'delivered':
                await prisma.message.update({
                  where: { id: message.id },
                  data: { status: 'DELIVERED', delivered_at: new Date() }
                })
                break
              case 'read':
                await prisma.message.update({
                  where: { id: message.id },
                  data: { status: 'READ', read_at: new Date() }
                })
                break
              case 'failed':
                await prisma.message.update({
                  where: { id: message.id },
                  data: { status: 'FAILED' }
                })
                break
              case 'sent':
                await prisma.message.update({
                  where: { id: message.id },
                  data: { status: 'SENT' }
                })
                break
            }
          }
        }

        return reply.status(200).send({ success: true })
      } catch (error: any) {
        console.error('❌ Erro no status webhook:', error)
        return reply.status(200).send({ success: false })
      }
    }
  )

  /**
   * GET /api/v1/whatsapp/config
   * Buscar configuração do WhatsApp do tenant (ADMIN/GESTOR)
   */
  server.get(
    '/config',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id

        const config = await whatsAppService.getConfig(tenantId)

        return reply.send({
          success: true,
          data: config
        })
      } catch (error: any) {
        console.error('Erro ao buscar config WhatsApp:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao buscar configuração'
        })
      }
    }
  )

  /**
   * PUT /api/v1/whatsapp/config
   * Criar/atualizar configuração do WhatsApp (ADMIN/GESTOR)
   */
  server.put(
    '/config',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const data = configSchema.parse(request.body)

        const config = await whatsAppService.upsertConfig(tenantId, data)

        return reply.send({
          success: true,
          message: 'Configuração salva com sucesso',
          data: {
            ...config,
            twilio_auth_token: config.twilio_auth_token ? '***configurado***' : null
          }
        })
      } catch (error: any) {
        console.error('Erro ao salvar config WhatsApp:', error)

        if (error.name === 'ZodError') {
          return reply.status(400).send({
            success: false,
            error: 'Dados inválidos',
            details: error.errors
          })
        }

        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao salvar configuração'
        })
      }
    }
  )

  /**
   * POST /api/v1/whatsapp/test
   * Testar conexão com Twilio (ADMIN/GESTOR)
   */
  server.post(
    '/test',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id

        const result = await whatsAppService.testConnection(tenantId)

        return reply.send({
          success: result.success,
          message: result.success ? 'Conexão com Twilio OK!' : 'Falha na conexão',
          error: result.error
        })
      } catch (error: any) {
        console.error('Erro ao testar conexão:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao testar conexão'
        })
      }
    }
  )

  /**
   * POST /api/v1/whatsapp/send
   * Enviar mensagem para um lead (ADMIN/GESTOR)
   */
  server.post(
    '/send',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const data = sendMessageSchema.parse(request.body)

        // Buscar lead
        const lead = await prisma.lead.findFirst({
          where: {
            id: data.lead_id,
            tenant_id: tenantId
          }
        })

        if (!lead) {
          return reply.status(404).send({
            success: false,
            error: 'Lead não encontrado'
          })
        }

        if (!lead.telefone) {
          return reply.status(400).send({
            success: false,
            error: 'Lead não possui telefone cadastrado'
          })
        }

        // Enviar mensagem
        const result = await whatsAppService.sendAndSaveMessage(
          tenantId,
          lead.id,
          lead.telefone,
          data.message
        )

        if (result.success) {
          return reply.send({
            success: true,
            message: 'Mensagem enviada com sucesso',
            messageSid: 'messageSid' in result ? result.messageSid : undefined
          })
        } else {
          return reply.status(500).send({
            success: false,
            error: 'error' in result ? result.error : 'Erro ao enviar mensagem'
          })
        }
      } catch (error: any) {
        console.error('Erro ao enviar mensagem:', error)

        if (error.name === 'ZodError') {
          return reply.status(400).send({
            success: false,
            error: 'Dados inválidos',
            details: error.errors
          })
        }

        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao enviar mensagem'
        })
      }
    }
  )

  /**
   * GET /api/v1/whatsapp/messages/:leadId
   * Buscar histórico de mensagens de um lead (ADMIN/GESTOR)
   */
  server.get(
    '/messages/:leadId',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id
        const { leadId } = request.params as { leadId: string }
        const query = request.query as { limit?: string }

        const limit = query.limit ? parseInt(query.limit) : 50

        // Verificar se lead pertence ao tenant
        const lead = await prisma.lead.findFirst({
          where: {
            id: leadId,
            tenant_id: tenantId
          }
        })

        if (!lead) {
          return reply.status(404).send({
            success: false,
            error: 'Lead não encontrado'
          })
        }

        const messages = await whatsAppService.getMessageHistory(leadId, tenantId, limit)

        return reply.send({
          success: true,
          total: messages.length,
          data: messages
        })
      } catch (error: any) {
        console.error('Erro ao buscar mensagens:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao buscar mensagens'
        })
      }
    }
  )

  /**
   * GET /api/v1/whatsapp/stats
   * Estatísticas de mensagens (ADMIN/GESTOR)
   */
  server.get(
    '/stats',
    {
      preHandler: [authMiddleware, requireManager]
    },
    async (request, reply) => {
      try {
        const tenantId = request.user!.tenant_id

        // Total de mensagens
        const totalMessages = await prisma.message.count({
          where: {
            tenant_id: tenantId,
            platform: 'WHATSAPP'
          }
        })

        // Mensagens recebidas (de leads)
        const receivedMessages = await prisma.message.count({
          where: {
            tenant_id: tenantId,
            platform: 'WHATSAPP',
            is_from_lead: true
          }
        })

        // Mensagens enviadas (da Sofia/corretor)
        const sentMessages = await prisma.message.count({
          where: {
            tenant_id: tenantId,
            platform: 'WHATSAPP',
            is_from_lead: false
          }
        })

        // Leads criados via WhatsApp
        const leadsFromWhatsApp = await prisma.lead.count({
          where: {
            tenant_id: tenantId,
            origem: 'WHATSAPP'
          }
        })

        // Mensagens hoje
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const messagesToday = await prisma.message.count({
          where: {
            tenant_id: tenantId,
            platform: 'WHATSAPP',
            created_at: { gte: today }
          }
        })

        // Configuração
        const config = await prisma.whatsAppConfig.findUnique({
          where: { tenant_id: tenantId },
          select: {
            is_active: true,
            auto_response_enabled: true,
            last_message_at: true
          }
        })

        return reply.send({
          success: true,
          data: {
            total_messages: totalMessages,
            received_messages: receivedMessages,
            sent_messages: sentMessages,
            leads_from_whatsapp: leadsFromWhatsApp,
            messages_today: messagesToday,
            config_status: {
              is_active: config?.is_active || false,
              auto_response: config?.auto_response_enabled || false,
              last_message: config?.last_message_at || null
            }
          }
        })
      } catch (error: any) {
        console.error('Erro ao buscar stats:', error)
        return reply.status(500).send({
          success: false,
          error: error.message || 'Erro ao buscar estatísticas'
        })
      }
    }
  )
}
