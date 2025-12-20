import { FastifyInstance } from 'fastify';
import { whatsappService } from '../../messaging/whatsapp/whatsapp.service';
import { whatsappHandler } from '../../messaging/whatsapp/whatsapp-handler.service';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware';

export async function whatsappRoutes(server: FastifyInstance) {
  // 🔒 SEGURANÇA: Adiciona autenticação em TODAS as rotas
  server.addHook('onRequest', authMiddleware);
  server.addHook('onRequest', tenantMiddleware);

  /**
   * GET /api/v1/whatsapp/status
   * Retorna status da conexão WhatsApp
   */
  server.get('/status', async (request, reply) => {
    try {
      const status = whatsappService.getStatus();

      return {
        success: true,
        data: {
          isReady: status.isReady,
          queueLength: status.queueLength,
          messagesSentLastHour: status.messagesSentLastHour,
          maxMessagesPerHour: status.maxMessagesPerHour,
          isWorkingHours: status.isWorkingHours,
          hasQRCode: !!status.qrCode
        }
      };

    } catch (error: any) {
      server.log.error('Erro ao buscar status WhatsApp:', error);
      return reply.status(500).send({
        error: 'Erro ao buscar status',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/whatsapp/qr
   * Retorna QR Code para autenticação
   */
  server.get('/qr', async (request, reply) => {
    try {
      const qrCode = whatsappService.getQRCode();

      if (!qrCode) {
        return reply.status(404).send({
          error: 'QR Code não disponível',
          message: 'WhatsApp já está conectado ou ainda não gerou QR Code'
        });
      }

      return {
        success: true,
        data: {
          qrCode,
          instructions: 'Abra o WhatsApp no celular > Aparelhos conectados > Conectar aparelho > Escaneie este QR Code'
        }
      };

    } catch (error: any) {
      server.log.error('Erro ao buscar QR Code:', error);
      return reply.status(500).send({
        error: 'Erro ao buscar QR Code',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/whatsapp/send
   * Envia mensagem manual para um lead
   */
  server.post('/send', async (request, reply) => {
    try {
      const { leadId, message } = request.body as any;
      const tenantId = request.tenantId;

      // Validação
      if (!leadId || !message) {
        return reply.status(400).send({
          error: 'Campos obrigatórios: leadId, message'
        });
      }

      // Verifica se lead pertence ao tenant
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const lead = await prisma.lead.findFirst({
        where: {
          id: leadId,
          tenant_id: tenantId
        }
      });

      if (!lead) {
        return reply.status(404).send({
          error: 'Lead não encontrado'
        });
      }

      // Envia mensagem
      const sent = await whatsappHandler.sendManualMessage(leadId, message);

      if (sent) {
        return {
          success: true,
          data: {
            leadId,
            message,
            status: 'queued'
          }
        };
      } else {
        return reply.status(503).send({
          error: 'WhatsApp não disponível',
          message: 'Mensagem enfileirada para envio posterior'
        });
      }

    } catch (error: any) {
      server.log.error('Erro ao enviar mensagem:', error);
      return reply.status(500).send({
        error: 'Erro ao enviar mensagem',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/whatsapp/initialize
   * Inicializa conexão WhatsApp
   */
  server.post('/initialize', async (request, reply) => {
    try {
      if (whatsappService.ready()) {
        return {
          success: true,
          message: 'WhatsApp já está conectado'
        };
      }

      // Inicializa em background
      whatsappService.initialize().catch(error => {
        server.log.error('Erro ao inicializar WhatsApp:', error);
      });

      return {
        success: true,
        message: 'WhatsApp inicializando... Verifique o QR Code em /api/v1/whatsapp/qr'
      };

    } catch (error: any) {
      server.log.error('Erro ao inicializar WhatsApp:', error);
      return reply.status(500).send({
        error: 'Erro ao inicializar',
        message: error.message
      });
    }
  });

  /**
   * POST /api/v1/whatsapp/disconnect
   * Desconecta WhatsApp
   */
  server.post('/disconnect', async (request, reply) => {
    try {
      await whatsappService.disconnect();

      return {
        success: true,
        message: 'WhatsApp desconectado com sucesso'
      };

    } catch (error: any) {
      server.log.error('Erro ao desconectar WhatsApp:', error);
      return reply.status(500).send({
        error: 'Erro ao desconectar',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/whatsapp/queue
   * Retorna informações sobre a fila de mensagens
   */
  server.get('/queue', async (request, reply) => {
    try {
      const status = whatsappService.getStatus();

      return {
        success: true,
        data: {
          queueLength: status.queueLength,
          messagesSentLastHour: status.messagesSentLastHour,
          remainingCapacity: status.maxMessagesPerHour - status.messagesSentLastHour,
          estimatedWaitTime: calculateWaitTime(status.queueLength)
        }
      };

    } catch (error: any) {
      server.log.error('Erro ao buscar fila:', error);
      return reply.status(500).send({
        error: 'Erro ao buscar fila',
        message: error.message
      });
    }
  });

}

/**
 * Calcula tempo estimado de espera
 */
function calculateWaitTime(queueLength: number): string {
  const avgDelaySeconds = 5; // Média de 5 segundos entre mensagens
  const totalSeconds = queueLength * avgDelaySeconds;

  if (totalSeconds < 60) {
    return `${totalSeconds} segundos`;
  } else if (totalSeconds < 3600) {
    return `${Math.ceil(totalSeconds / 60)} minutos`;
  } else {
    return `${Math.ceil(totalSeconds / 3600)} horas`;
  }
}
