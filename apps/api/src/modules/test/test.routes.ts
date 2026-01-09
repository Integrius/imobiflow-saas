import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { sendGridService } from '../../shared/services/sendgrid.service';
import { twilioService } from '../../shared/services/twilio.service';

export async function testRoutes(server: FastifyInstance) {
  /**
   * GET /api/v1/test/config
   * Verifica configuração de variáveis de ambiente
   */
  server.get('/config', async (request: FastifyRequest, reply: FastifyReply) => {
    const apiKey = process.env.SENDGRID_API_KEY;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;

    const config = {
      sendgrid: {
        configured: !!apiKey,
        apiKeyPreview: apiKey ? apiKey.substring(0, 10) + '...' : 'NÃO CONFIGURADO',
        fromEmail: process.env.SENDGRID_FROM_EMAIL || 'NÃO CONFIGURADO',
        fromName: process.env.SENDGRID_FROM_NAME || 'NÃO CONFIGURADO',
        isEnabled: sendGridService.isEnabled()
      },
      twilio: {
        configured: !!(accountSid && process.env.TWILIO_AUTH_TOKEN),
        accountSidPreview: accountSid ? accountSid.substring(0, 10) + '...' : 'NÃO CONFIGURADO',
        authTokenPreview: process.env.TWILIO_AUTH_TOKEN ? 'CONFIGURADO (oculto)' : 'NÃO CONFIGURADO',
        whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || 'NÃO CONFIGURADO',
        isEnabled: twilioService.isEnabled()
      },
      environment: process.env.NODE_ENV || 'development'
    };

    return reply.send({
      success: true,
      config
    });
  });

  /**
   * POST /api/v1/test/send-email
   * Envia email de teste
   */
  server.post('/send-email', async (request: FastifyRequest, reply: FastifyReply) => {
    const { email } = request.body as { email: string };

    if (!email) {
      return reply.status(400).send({
        error: 'Email é obrigatório no body: { "email": "seu@email.com" }'
      });
    }

    try {
      await sendGridService.enviarSenhaTemporariaCorretor({
        nome: 'Teste Corretor',
        email,
        senhaTemporaria: 'TESTE123',
        tenantUrl: 'teste.integrius.com.br',
        nomeTenant: 'Teste ImobiFlow',
        horasValidade: 12
      });

      return reply.send({
        success: true,
        message: `Email de teste enviado para ${email}. Verifique sua caixa de entrada e SPAM!`
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message || 'Erro ao enviar email'
      });
    }
  });

  /**
   * POST /api/v1/test/send-whatsapp
   * Envia WhatsApp de teste
   */
  server.post('/send-whatsapp', async (request: FastifyRequest, reply: FastifyReply) => {
    const { telefone } = request.body as { telefone: string };

    if (!telefone) {
      return reply.status(400).send({
        error: 'Telefone é obrigatório no body: { "telefone": "+5511999999999" }'
      });
    }

    try {
      await twilioService.enviarSenhaTemporaria({
        telefone,
        nome: 'Teste Corretor',
        email: 'teste@teste.com',
        senhaTemporaria: 'TESTE123',
        tenantUrl: 'teste.integrius.com.br',
        nomeTenant: 'Teste ImobiFlow'
      });

      return reply.send({
        success: true,
        message: `WhatsApp de teste enviado para ${telefone}`
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message || 'Erro ao enviar WhatsApp'
      });
    }
  });
}
