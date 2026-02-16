import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { PagamentosService } from './pagamentos.service';
import { prisma } from '../../shared/database/prisma.service';
import { mercadoPagoService } from '../../shared/services/mercadopago.service';

const PLANOS_VALIDOS = ['BASICO', 'PRO', 'ENTERPRISE'];

export async function pagamentosRoutes(server: FastifyInstance) {
  const service = new PagamentosService();

  /**
   * POST /api/v1/pagamentos/webhook
   * Webhook publico para receber notificacoes do Mercado Pago
   * NAO requer autenticacao (chamado pelo Mercado Pago)
   * SEMPRE retorna 200 para evitar retries infinitos do MP
   */
  server.post(
    '/webhook',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const signature = request.headers['x-signature'] as string;

        if (!signature || !mercadoPagoService.validateWebhookSignature(signature)) {
          console.log('[Pagamentos Webhook] Assinatura invalida ou ausente');
          return reply.status(200).send({ received: true });
        }

        const { type, data } = request.body as { type: string; data: { id: string } };

        if (!type || !data?.id) {
          console.log('[Pagamentos Webhook] Payload invalido:', JSON.stringify(request.body));
          return reply.status(200).send({ received: true });
        }

        console.log(`[Pagamentos Webhook] Processando: type=${type}, data.id=${data.id}`);

        await service.processarWebhook(type, data.id);

        console.log(`[Pagamentos Webhook] Processado com sucesso: type=${type}, data.id=${data.id}`);
      } catch (error: any) {
        console.error('[Pagamentos Webhook] Erro ao processar webhook:', error.message || error);
      }

      return reply.status(200).send({ received: true });
    }
  );

  /**
   * POST /api/v1/pagamentos/assinar
   * Cria uma nova assinatura para o tenant
   * Requer autenticacao e permissao ADMIN
   */
  server.post(
    '/assinar',
    {
      preHandler: [tenantMiddleware, authMiddleware]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const tenantId = (request as any).tenantId;
        const user = (request as any).user;

        if (user.tipo !== 'ADMIN') {
          return reply.status(403).send({ error: 'Apenas administradores podem gerenciar assinaturas' });
        }

        const { plano } = request.body as { plano: string };

        if (!plano || !PLANOS_VALIDOS.includes(plano)) {
          return reply.status(400).send({
            error: `Plano invalido. Planos disponiveis: ${PLANOS_VALIDOS.join(', ')}`
          });
        }

        const resultado = await service.criarAssinatura(tenantId, plano, user.email);

        return reply.status(201).send({
          checkoutUrl: resultado.checkoutUrl,
          assinaturaId: resultado.assinaturaId
        });
      } catch (error: any) {
        console.error('[Pagamentos] Erro ao criar assinatura:', error.message || error);
        return reply.status(error.statusCode || 500).send({
          error: error.message || 'Erro ao criar assinatura'
        });
      }
    }
  );

  /**
   * GET /api/v1/pagamentos/assinatura
   * Retorna dados da assinatura do tenant
   * Requer autenticacao
   */
  server.get(
    '/assinatura',
    {
      preHandler: [tenantMiddleware, authMiddleware]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const tenantId = (request as any).tenantId;

        const assinatura = await service.getAssinatura(tenantId);

        return reply.send(assinatura);
      } catch (error: any) {
        console.error('[Pagamentos] Erro ao buscar assinatura:', error.message || error);
        return reply.status(error.statusCode || 500).send({
          error: error.message || 'Erro ao buscar assinatura'
        });
      }
    }
  );

  /**
   * POST /api/v1/pagamentos/cancelar
   * Cancela a assinatura do tenant
   * Requer autenticacao e permissao ADMIN
   */
  server.post(
    '/cancelar',
    {
      preHandler: [tenantMiddleware, authMiddleware]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const tenantId = (request as any).tenantId;
        const user = (request as any).user;

        if (user.tipo !== 'ADMIN') {
          return reply.status(403).send({ error: 'Apenas administradores podem gerenciar assinaturas' });
        }

        const { motivo } = request.body as { motivo: string };

        if (!motivo) {
          return reply.status(400).send({ error: 'Motivo do cancelamento e obrigatorio' });
        }

        await service.cancelarAssinatura(tenantId, motivo);

        return reply.send({ success: true, message: 'Assinatura cancelada' });
      } catch (error: any) {
        console.error('[Pagamentos] Erro ao cancelar assinatura:', error.message || error);
        return reply.status(error.statusCode || 500).send({
          error: error.message || 'Erro ao cancelar assinatura'
        });
      }
    }
  );

  /**
   * GET /api/v1/pagamentos/historico
   * Retorna historico de eventos de pagamento do tenant
   * Requer autenticacao
   */
  server.get(
    '/historico',
    {
      preHandler: [tenantMiddleware, authMiddleware]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const tenantId = (request as any).tenantId;

        const historico = await service.getHistorico(tenantId);

        return reply.send(historico);
      } catch (error: any) {
        console.error('[Pagamentos] Erro ao buscar historico:', error.message || error);
        return reply.status(error.statusCode || 500).send({
          error: error.message || 'Erro ao buscar historico'
        });
      }
    }
  );
}
