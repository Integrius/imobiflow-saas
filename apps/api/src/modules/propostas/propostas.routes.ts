import { FastifyInstance } from 'fastify';
import { propostasService } from './propostas.service';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { StatusProposta } from '@prisma/client';

export async function propostasRoutes(server: FastifyInstance) {
  // ============================================
  // CRIAR OU ATUALIZAR PROPOSTA
  // ============================================
  server.post(
    '/',
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      try {
        const { lead_id, imovel_id, corretor_id, valor, observacoes } = request.body as {
          lead_id: string;
          imovel_id: string;
          corretor_id?: string;
          valor: number;
          observacoes?: string;
        };

        const tenant_id = request.user!.tenantId;

        // Validações
        if (!lead_id || !imovel_id) {
          return reply.status(400).send({
            success: false,
            message: 'lead_id e imovel_id são obrigatórios',
          });
        }

        if (!valor || valor <= 0) {
          return reply.status(400).send({
            success: false,
            message: 'Valor da proposta deve ser maior que zero',
          });
        }

        const proposta = await propostasService.createOrUpdate({
          tenant_id,
          lead_id,
          imovel_id,
          corretor_id,
          valor,
          observacoes,
        });

        return reply.status(201).send({
          success: true,
          proposta,
        });
      } catch (error: any) {
        console.error('Erro ao criar/atualizar proposta:', error);
        return reply.status(500).send({
          success: false,
          message: 'Erro ao criar/atualizar proposta',
          error: error.message,
        });
      }
    }
  );

  // ============================================
  // BUSCAR MELHOR OFERTA PARA UM IMÓVEL
  // ============================================
  server.get(
    '/imovel/:imovel_id/best-offer',
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      try {
        const { imovel_id } = request.params as { imovel_id: string };
        const tenant_id = request.user!.tenantId;

        const bestOffer = await propostasService.getBestOfferForImovel(tenant_id, imovel_id);

        return reply.send({
          success: true,
          bestOffer,
        });
      } catch (error: any) {
        console.error('Erro ao buscar melhor oferta:', error);
        return reply.status(500).send({
          success: false,
          message: 'Erro ao buscar melhor oferta',
          error: error.message,
        });
      }
    }
  );

  // ============================================
  // BUSCAR PROPOSTA DO USUÁRIO PARA UM IMÓVEL
  // ============================================
  server.get(
    '/imovel/:imovel_id/my-offer',
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      try {
        const { imovel_id } = request.params as { imovel_id: string };
        const { lead_id } = request.query as { lead_id: string };
        const tenant_id = request.user!.tenantId;

        if (!lead_id) {
          return reply.status(400).send({
            success: false,
            message: 'lead_id é obrigatório',
          });
        }

        const myOffer = await propostasService.getUserOfferForImovel(
          tenant_id,
          lead_id,
          imovel_id
        );

        return reply.send({
          success: true,
          myOffer,
        });
      } catch (error: any) {
        console.error('Erro ao buscar proposta do usuário:', error);
        return reply.status(500).send({
          success: false,
          message: 'Erro ao buscar proposta do usuário',
          error: error.message,
        });
      }
    }
  );

  // ============================================
  // LISTAR TODAS AS PROPOSTAS DE UM IMÓVEL
  // ============================================
  server.get(
    '/imovel/:imovel_id',
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      try {
        const { imovel_id } = request.params as { imovel_id: string };
        const tenant_id = request.user!.tenantId;

        const propostas = await propostasService.listByImovel(tenant_id, imovel_id);

        return reply.send({
          success: true,
          total: propostas.length,
          propostas,
        });
      } catch (error: any) {
        console.error('Erro ao listar propostas do imóvel:', error);
        return reply.status(500).send({
          success: false,
          message: 'Erro ao listar propostas do imóvel',
          error: error.message,
        });
      }
    }
  );

  // ============================================
  // LISTAR TODAS AS PROPOSTAS DE UM LEAD
  // ============================================
  server.get(
    '/lead/:lead_id',
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      try {
        const { lead_id } = request.params as { lead_id: string };
        const tenant_id = request.user!.tenantId;

        const propostas = await propostasService.listByLead(tenant_id, lead_id);

        return reply.send({
          success: true,
          total: propostas.length,
          propostas,
        });
      } catch (error: any) {
        console.error('Erro ao listar propostas do lead:', error);
        return reply.status(500).send({
          success: false,
          message: 'Erro ao listar propostas do lead',
          error: error.message,
        });
      }
    }
  );

  // ============================================
  // ACEITAR PROPOSTA
  // ============================================
  server.post(
    '/:proposta_id/accept',
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      try {
        const { proposta_id } = request.params as { proposta_id: string };
        const { resposta } = request.body as { resposta?: string };
        const respondido_por_id = request.user!.userId;

        const proposta = await propostasService.accept(proposta_id, respondido_por_id, resposta);

        return reply.send({
          success: true,
          message: 'Proposta aceita com sucesso',
          proposta,
        });
      } catch (error: any) {
        console.error('Erro ao aceitar proposta:', error);
        return reply.status(500).send({
          success: false,
          message: 'Erro ao aceitar proposta',
          error: error.message,
        });
      }
    }
  );

  // ============================================
  // RECUSAR PROPOSTA
  // ============================================
  server.post(
    '/:proposta_id/reject',
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      try {
        const { proposta_id } = request.params as { proposta_id: string };
        const { resposta } = request.body as { resposta?: string };
        const respondido_por_id = request.user!.userId;

        const proposta = await propostasService.reject(proposta_id, respondido_por_id, resposta);

        return reply.send({
          success: true,
          message: 'Proposta recusada',
          proposta,
        });
      } catch (error: any) {
        console.error('Erro ao recusar proposta:', error);
        return reply.status(500).send({
          success: false,
          message: 'Erro ao recusar proposta',
          error: error.message,
        });
      }
    }
  );

  // ============================================
  // FAZER CONTRAPROPOSTA
  // ============================================
  server.post(
    '/:proposta_id/counter',
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      try {
        const { proposta_id } = request.params as { proposta_id: string };
        const { resposta } = request.body as { resposta: string };
        const respondido_por_id = request.user!.userId;

        if (!resposta) {
          return reply.status(400).send({
            success: false,
            message: 'Resposta é obrigatória para contraproposta',
          });
        }

        const proposta = await propostasService.counter(proposta_id, respondido_por_id, resposta);

        return reply.send({
          success: true,
          message: 'Contraproposta enviada',
          proposta,
        });
      } catch (error: any) {
        console.error('Erro ao fazer contraproposta:', error);
        return reply.status(500).send({
          success: false,
          message: 'Erro ao fazer contraproposta',
          error: error.message,
        });
      }
    }
  );

  // ============================================
  // CANCELAR PROPOSTA
  // ============================================
  server.post(
    '/:proposta_id/cancel',
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      try {
        const { proposta_id } = request.params as { proposta_id: string };

        const proposta = await propostasService.cancel(proposta_id);

        return reply.send({
          success: true,
          message: 'Proposta cancelada',
          proposta,
        });
      } catch (error: any) {
        console.error('Erro ao cancelar proposta:', error);
        return reply.status(500).send({
          success: false,
          message: 'Erro ao cancelar proposta',
          error: error.message,
        });
      }
    }
  );
}
